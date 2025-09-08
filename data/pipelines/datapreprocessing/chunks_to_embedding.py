from concurrent.futures import ThreadPoolExecutor, as_completed
from qdrant_client.http.models import VectorParams
from qdrant_client import QdrantClient
import uuid
from tqdm import tqdm
import time


def embed_documents_to_qdrant(
    documents,
    embedding_model,            
    collection_name,
    vector_dim,
    distance,
    batch_size=32,  
    max_workers=8,
    qdrant_url="http://localhost:6333"
):
    
    client = QdrantClient(url=qdrant_url,prefer_grpc=False)

    
    # Split documents into batches
    batches = [documents[i:i + batch_size] for i in range(0, len(documents), batch_size)]

    # -------------------------------
    # Function to embed + prepare points
    # -------------------------------
    def process_batch(batch, batch_id):
        texts = [doc.page_content for doc in batch]
        metadatas = [doc.metadata for doc in batch]

        # Embed documents (GPU efficient)
        embeddings = embedding_model.embed_documents(texts)

        # Prepare points for Qdrant
        points = [
            {
                "id": str(uuid.uuid4()),
                "vector": vector,
                "payload": {**metadata, "page_content": text}
            }
            for vector, metadata, text in zip(embeddings, metadatas, texts)
        ]

        # Upsert to Qdrant
        client.upsert(collection_name=collection_name, points=points)

        return len(batch), batch_id

    # -------------------------------
    # Run threaded batches
    # -------------------------------
    start = time.time()
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = [executor.submit(process_batch, batch, i) for i, batch in enumerate(batches)]
        for future in tqdm(as_completed(futures), total=len(futures), desc="Embedding batches"):
            count, batch_id = future.result()

    end = time.time()
    print(f"\n✅ Completed {len(documents)} chunks in {end - start:.2f} seconds")
