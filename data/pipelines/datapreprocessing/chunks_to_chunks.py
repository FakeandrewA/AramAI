import re
from langchain.schema import Document
from langchain.prompts import PromptTemplate
from typing import List
from tqdm import tqdm
from rake_nltk import Rake
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import word_tokenize
from joblib import Parallel, delayed
import nltk
from nltk.data import find


def ensure_nltk_resource(resource, download_name=None):
    """
    Check if an NLTK resource exists, otherwise download it.
    :param resource: path used by nltk.data.find()
    :param download_name: name used in nltk.download(), defaults to resource
    """
    try:
        find(resource)
    except LookupError:
        nltk.download(download_name or resource.split("/")[-1])

# punkt tokenizer
ensure_nltk_resource("tokenizers/punkt", "punkt")

# stopwords corpus
ensure_nltk_resource("corpora/stopwords", "stopwords")

# wordnet (optional)
ensure_nltk_resource("corpora/wordnet", "wordnet")



rake = Rake(min_length=1, max_length=3)
lemmatizer = WordNetLemmatizer()

metadata_template = PromptTemplate.from_template("""
This chunk is extracted from the legal document: {title}, cited by {cited_by}.
Source: {source} | Jurisdiction: {jurisdiction} | Type: {doctype}
Document link: {link}
tags: {tags}
keywords:{keywords} 
""")

def lemmatize_keywords(phrases):
    lemmatized = []
    for phrase in phrases:
        tokens = word_tokenize(phrase)
        lemmatized_phrase = " ".join([lemmatizer.lemmatize(token) for token in tokens])
        lemmatized.append(lemmatized_phrase)
    return list(set(lemmatized))

def extract_tags(title: str, text: str):
    combined = (title + " " + text).lower()

    rake.extract_keywords_from_text(combined)
    keywords = rake.get_ranked_phrases()
    keywords = set(
        kw for kw in keywords
        if not re.search(r"\b(?!1[2-9][0-9]{2}|20[0-1][0-9]|202[0-5])\d+\b", kw)
    )

    clean_keywords = lemmatize_keywords(keywords)
    return ", ".join(clean_keywords)


def merge_shorter_chunks(chunks:List[Document],chunk_overlap:int,threshold:int=1000)->List[Document]:
    """
    Merges document chunks that fall below a specified character length threshold
    with an adjacent chunk from the same original document.

    This function is designed to prevent very short chunks from being processed
    in isolation, as they may lack sufficient context. It identifies chunks
    shorter than the `threshold`, and if an adjacent chunk exists from the
    same original document, it merges them. The merging process combines the
    content and updates the chunk's metadata. Finally, it reassigns sequential
    chunk IDs to all documents in the updated list.

    Args:
        chunks (list): A list of `Document` objects, where each object has
                       `page_content` and `metadata` containing a "chunk_id" and
                       "doc_id".
        threshold (int): The minimum character length for a chunk. Any chunk
                         shorter than this threshold will be a candidate for
                         merging.

    Returns:
        list: The updated list of `Document` objects with shorter chunks
              merged and new sequential `chunk_id`s assigned.
    """
    idx_of_threshold_chunks = [doc.metadata["chunk_id"] for doc in chunks if len(doc.page_content)<threshold]
    idx_of_threshold_chunks = [
    j for j in idx_of_threshold_chunks 
    if (j-1 >= 0 and chunks[j-1].metadata["doc_id"] == chunks[j].metadata["doc_id"])
    or (j+1 < len(chunks) and chunks[j+1].metadata["doc_id"] == chunks[j].metadata["doc_id"])
    ]
    print("Before Processing docs: ",idx_of_threshold_chunks)
    for i in tqdm(sorted(idx_of_threshold_chunks, reverse=True),total=len(idx_of_threshold_chunks),desc="Merging"):
        new_chunk_metadata = chunks[i].metadata.copy()
        new_chunk_page_content = chunks[i-1].page_content[:-chunk_overlap] + chunks[i].page_content
        new_chunk = Document(page_content=new_chunk_page_content, metadata=new_chunk_metadata)
        
        # Delete original chunks
        del chunks[i-1:i+1]
        
        # Insert merged chunk
        chunks.insert(i-1, new_chunk)

    # **Reassign chunk_ids sequentially**
    for idx, chunk in enumerate(chunks):
        chunk.metadata["chunk_id"] = idx

    idx_of_threshold_chunks = [doc.metadata["chunk_id"] for doc in chunks if len(doc.page_content)<threshold]
    idx_of_threshold_chunks = [
    j for j in idx_of_threshold_chunks 
    if (j-1 >= 0 and chunks[j-1].metadata["doc_id"] == chunks[j].metadata["doc_id"])
    or (j+1 < len(chunks) and chunks[j+1].metadata["doc_id"] == chunks[j].metadata["doc_id"])
    ]
    print("Before Processing docs: ",idx_of_threshold_chunks)
    return chunks


def process_chunk(chunk):
    keywords = extract_tags(chunk.metadata["title"], chunk.page_content)
    metadata = chunk.metadata.copy()
    metadata["keywords"] = keywords
    header = metadata_template.format(**metadata)
    chunk.page_content = header + "\n\nDocument Fragment:\n" + chunk.page_content
    return chunk

def inject_context_to_chunks_parallel(chunks, n_jobs=12):
    results = Parallel(n_jobs=n_jobs, backend="loky")(
        delayed(process_chunk)(chunk) for chunk in tqdm(chunks, desc="Processing")
    )
    return results