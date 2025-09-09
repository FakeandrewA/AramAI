from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_experimental.text_splitter import SemanticChunker
from langchain_ollama import OllamaEmbeddings
from typing import List
from langchain.schema import Document
from tqdm import tqdm

def convert_docs_to_chunks(documents:List[Document],chunk_size:int=1800,chunk_overlap:int=250,chunking_type:str="re")->List[Document]:
    """
    Splits a list of documents into smaller, manageable chunks.

    This function supports two types of chunking methods:
    1. 're' (Recursive): Uses a RecursiveCharacterTextSplitter to divide documents based on a
       hierarchy of separators. This method is effective for maintaining semantic integrity
       by keeping related text together.
    2. 'se' (Semantic): Uses a SemanticChunker to split documents based on the semantic
       similarity of sentences. Chunks are created at "breakpoints" where the meaning
       of the text changes significantly.

    Args:
        documents (list): A list of document objects to be chunked. Each document is expected
                          to have metadata, including 'doc_id' and 'pageno'.
        chunk_size (int, optional): The maximum size of each chunk. This is only used for
                                    the 're' (Recursive) chunking type. Defaults to 1800.
        chunk_overlap (int, optional): The number of characters to overlap between adjacent
                                       chunks. This is only used for the 're' (Recursive)
                                       chunking type. Defaults to 250.
        chunking_type (str, optional): The type of chunking to perform.
                                       - "re": Recursive chunking.
                                       - "se": Semantic chunking.
                                       Defaults to "re".

    Returns:
        list: A list of chunked document objects, each with an added 'chunk_id' in its metadata.
    """
    final_chunks = []
    if chunking_type=="re":
        splitter = RecursiveCharacterTextSplitter(chunk_size=1800, chunk_overlap=250)
        for page_doc in tqdm(documents,total=len(documents),desc="Processing: "):
            chunks = splitter.split_documents([page_doc])
            for i, chunk in enumerate(chunks):
                chunk.metadata["chunk_id"] = len(final_chunks)
                final_chunks.append(chunk)

    if chunking_type=="se":
        embedding_model = OllamaEmbeddings(model="nomic-embed-text")
        text_splitter = SemanticChunker(embedding_model, breakpoint_threshold_type="percentile")
        for page_doc in tqdm(documents,total=len(documents),desc="Processing: "):
            chunks = text_splitter.split_documents([page_doc])
            for i, chunk in enumerate(chunks):
                chunk.metadata["chunk_id"] = f"{chunk.metadata['doc_id']}_{chunk.metadata['pageno']}_{i+1}"
                final_chunks.append(chunk)

    return final_chunks
