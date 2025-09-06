import os
from langchain.schema import Document
from typing import List
from tqdm import tqdm
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

    