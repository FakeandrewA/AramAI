from langchain.tools import tool
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
import os
from rank_bm25 import BM25Okapi
from retrieval.utils import get_relevant_points,get_client
from retrieval.config import COLLECTION_NAME,CROSS_ENCODER
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from pydantic import BaseModel,Field
load_dotenv()

class YesNoAnswer(BaseModel):
    answer: str = Field(..., description="Must be either 'yes' or 'no'")

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash").with_structured_output(YesNoAnswer)

rag_relevance_template = PromptTemplate.from_template("""You are legal assistant who excel in checking relevance of documents retrieved by the RAG with the users query.
Your task is provide 'yes' if there is relevance or 'no'. dont generate anything else
User Query: {query}                          
Here is the Retrieved Context:
{context}
""")

rag_relevance_chain = rag_relevance_template | llm

def extract_tokens_with_bs4(text: str):
    """Extract tokens using BeautifulSoup, lowercase + simple split."""
    soup = BeautifulSoup(text, "html.parser")
    clean_text = soup.get_text(" ", strip=True)
    tokens = [w.lower() for w in clean_text.split() if len(w) > 2]
    stopwords = {"the", "and", "for", "with", "that", "from", "case", "law"}
    return [t for t in tokens if t not in stopwords]

@tool
def rag_tool(query:str,rerank:bool,top_k:int,top_rerank_k:int):
    """Use this tool to get relevant document chunks stored in our qdrant db for the user's query , restructure the user's query to get the most relevancy
    unlike a search query , rag queries must be very descriptive even if the user gives a vague query, so the database can match a vector.
    """
    client = get_client()
    retrieved_chunks = get_relevant_points(query,client,COLLECTION_NAME,top_k,rerank,top_rerank_k)
    context=""
    for i,chunk in enumerate(retrieved_chunks):
        context += f"Chunk {i}\n\n"+chunk.split("Document Fragment:")[1]+"\n\n"
    response = rag_relevance_chain.invoke({"query":query,"context":context}).answer
    if response.lower() == "yes":
        print("The LLM Said Yes")
        return context
    
    return "No relevant Context Found in the VectorDatabase. Please Use Search Tool to Get Context" 

@tool
def indian_kannon_search_tool(query: str, pagenum: int = 1):
    """Search Indian Kanoon for case law, statutes or judgments.
    Uses BM25 to find the most relevant pages inside judgments.
    """

    base_url = "https://api.indiankanoon.org"
    api_key = os.getenv("INDIAN_KANOON_API_KEY")

    headers = {
        "Authorization": f"Token {api_key}",
        "Accept": "application/json"
    }

    search_url = f"{base_url}/search/"
    payload = {"formInput": query, "pagenum": pagenum}

    response = requests.post(search_url, headers=headers, data=payload)
    if response.status_code != 200:
        return f"Error {response.status_code}: {response.text}"

    data = response.json()
    results = []

    # Query tokens for BM25
    query_tokens = extract_tokens_with_bs4(query)

    for item in data.get("docs", [])[:2]:
        docid = item.get("tid")
        if not docid:
            continue

        # Fetch full judgment
        doc_url = f"{base_url}/doc/{docid}/"
        doc_res = requests.post(doc_url, headers=headers)
        if doc_res.status_code != 200:
            continue

        judgment_data = doc_res.json()
        judgment_text = judgment_data.get("doc", "No text available")

        # Clean HTML into plain text
        soup = BeautifulSoup(judgment_text, "html.parser")
        full_text = soup.get_text("\n", strip=True)

        # Split into pseudo-pages
        pages = [p.strip() for p in full_text.split("\n\n\n") if p.strip()]

        # Tokenize pages
        tokenized_pages = [extract_tokens_with_bs4(p) for p in pages]

        # BM25 model
        bm25 = BM25Okapi(tokenized_pages)

        # Rank pages
        scores = bm25.get_scores(query_tokens)
        if not scores.any():
            continue

        best_idx = int(scores.argmax())

        # Collect best + neighbors
        relevant_pages = []
        for i in [best_idx - 1, best_idx, best_idx + 1]:
            if 0 <= i < len(pages):
                relevant_pages.append({
                    "page_no": i,
                    "score": float(scores[i]),
                    "content": pages[i]
                })

        results.append({
            "title": BeautifulSoup(item.get("title", "Not specified"), "html.parser").get_text(" ", strip=True),
            "citation": BeautifulSoup(item.get("citation", "Not specified"), "html.parser").get_text(" ", strip=True),
            "publishdate": item.get("publishdate", "Unknown"),
            "docsource": BeautifulSoup(item.get("docsource", "Unknown"), "html.parser").get_text(" ", strip=True),
            "link": f"https://indiankanoon.org/doc/{docid}/",
            "snippet": BeautifulSoup(item.get("headline", ""), "html.parser").get_text(" ", strip=True),
            "relevant_pages": relevant_pages
        })

    return results if results else "No results found."