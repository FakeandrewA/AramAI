from retrieval.utils import get_relevant_points,get_client
from retrieval.config import CROSS_ENCODER,COLLECTION_NAME   # loaded at start

def search_vectorstore(query: str,top_k:int,top_rk:int):
    # your Qdrant query here...
    client = get_client()
    if client:
        points = get_relevant_points(query,client,COLLECTION_NAME,top_k,True,top_rk)
        return {"results": [p.payload.get("page_content","") for p in points]}
    else:
        raise Exception()
    

if __name__ == "__main__":
    # print(search_vectorstore("Who is the prime minster of india",10,5))
