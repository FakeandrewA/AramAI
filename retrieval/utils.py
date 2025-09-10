from qdrant_client import QdrantClient
from langchain_ollama import OllamaEmbeddings
from typing import List
from qdrant_client.models import ScoredPoint
from qdrant_client import QdrantClient
from sentence_transformers import CrossEncoder

def embed_query(query: str):
    query_vector = OllamaEmbeddings(model = "nomic-embed-text").embed_query(query)
    return query_vector

def get_client(host : str = "localhost", api_key : str = ""):
    client = QdrantClient(host=host, port=6333, api_key= api_key)
    try:
        client.info()
        print("Qdrant is running ✅")
        return client
    except Exception as e:
        print("Qdrant is NOT running ❌", e)
        return None

def get_relevant_points(
    query: str,
    client: QdrantClient,
    collection_name: str,
    top_k: int = 20,
    rerank: bool = False,
    top_rk: int = 5,
    cross_encoder: CrossEncoder = None,
) -> List[str]:

    # Get query vector
    query_vector = embed_query(query)

    # Search in Qdrant
    points = client.query_points(
        collection_name=collection_name,
        query=query_vector,
        limit=top_k,
        with_payload=True,
    ).points

    # Optional reranking
    if rerank and cross_encoder is not None:
        pairs = [[query, point.payload.get("page_content", "")] for point in points]
        scores = cross_encoder.predict(pairs)
        scored_docs = sorted(zip(points, scores), key=lambda x: x[1], reverse=True)
        points = [point for point, _ in scored_docs][:top_rk]

    return [point.payload.get("page_content","") for point in points]