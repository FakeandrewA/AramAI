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

### Pydantic Models
class Link(BaseModel):
    link: str = Field(..., description="Must be name of the link provided in the context, that is appropriate for the user's query")

class YesNoAnswer(BaseModel):
    answer: str = Field(..., description="Must be either 'yes' or 'no'")

### Custom LLMs

relevance_checker = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash").with_structured_output(YesNoAnswer)

### Prompt templates

rag_relevance_template = PromptTemplate.from_template("""You are legal assistant who excel in checking relevance of documents retrieved by the RAG with the users query.
Your task is provide 'yes' if there is relevance or 'no'. dont generate anything else
User Query: {query}                          
Here is the Retrieved Context:
{context}
""")


### Chains

rag_relevance_chain = rag_relevance_template | relevance_checker

### Helper Functions

def extract_tokens_with_bs4(text: str):
    """Extract tokens using BeautifulSoup, lowercase + simple split."""
    soup = BeautifulSoup(text, "html.parser")
    clean_text = soup.get_text(" ", strip=True)
    tokens = [w.lower() for w in clean_text.split() if len(w) > 2]
    stopwords = {"the", "and", "for", "with", "that", "from", "case", "law"}
    return [t for t in tokens if t not in stopwords]

### Tools

@tool
def rag_tool(query:str,rerank:bool,top_k:int,top_rerank_k:int):
    """Retrieve relevant document chunks from the Qdrant vector database and generate context 
    for Retrieval-Augmented Generation (RAG).

    This tool reformulates vague user queries into descriptive queries that better match 
    vector embeddings. It retrieves top-k candidate chunks, optionally re-ranks them, and 
    constructs a context string for the LLM to determine relevancy.

    Args:
        query (str): The user's query, which may be vague or incomplete. 
        rerank (bool): Whether to apply a re-ranking step to refine the retrieved chunks. 
        top_k (int): Number of top candidate chunks to initially retrieve. 
        top_rerank_k (int): Number of chunks to keep after re-ranking (if rerank=True).

    Returns:
        str: 
            - The concatenated relevant context if the LLM determines it is useful. 
            - "No relevant Context Found in the VectorDatabase. Please Use Search Tool to Get Context" 
              if no suitable context is found.

    Side Effects:
        Prints "The LLM Said Yes" if the LLM confirms the retrieved context is relevant.

    Notes:
        - Retrieval is performed from the configured Qdrant collection.
        - Each retrieved chunk is prefixed with its index for traceability.
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
    """Search Indian Kanoon for case law, statutes, or judgments and return the most 
    relevant pages using BM25 ranking.

    This tool integrates with the Indian Kanoon API to fetch legal documents matching 
    a user query. It then applies BM25 ranking at the page level to identify the most 
    relevant sections of a judgment, along with their neighbors for better context.

    Workflow:
        1. Query the Indian Kanoon API to retrieve document metadata.
        2. For each retrieved document (limited to top 2):
            - Fetch the full judgment text.
            - Clean HTML into plain text and split into pseudo-pages.
            - Tokenize pages and rank them using BM25 against query tokens.
            - Select the most relevant page along with its neighbors.
        3. Return structured results with metadata and relevant page content.

    Args:
        query (str): Search query string (e.g., case name, statute, legal keywords).
        pagenum (int, optional): Page number of search results to fetch. Defaults to 1.

    Returns:
        list[dict] | str:
            - A list of dictionaries containing:
                - title (str): Title of the case or document.
                - citation (str): Citation of the case (if available).
                - publishdate (str): Publication date of the judgment.
                - docsource (str): Source of the document (e.g., High Court, Supreme Court).
                - link (str): Direct link to the full judgment on Indian Kanoon.
                - snippet (str): Highlighted snippet from the search result.
                - relevant_pages (list[dict]): BM25-ranked relevant pages with:
                    - page_no (int): Index of the page within the judgment.
                    - score (float): BM25 relevance score.
                    - content (str): Page text.
            - "No results found." if no documents match the query.

    Raises:
        HTTPError: If the Indian Kanoon API returns an error response.

    Notes:
        - Only the top 2 search results are processed for efficiency.
        - Each judgment is split into pseudo-pages by paragraph grouping.
        - Neighboring pages are included to avoid losing context.
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


    
