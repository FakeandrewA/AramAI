from langchain.tools import tool
from langgraph.prebuilt import ToolNode
import requests
from bs4 import BeautifulSoup
from schema import base_state
from dotenv import load_dotenv
load_dotenv()
import os

@tool
def indian_kannon_search_tool(query : str, pagenum : int = 1):
    """Search Indian Kanoon for case law or statutes or Judgements
    Input: query (str) - search keywords or case name
    output : top 3 search results (title + link + snippet)"""

    base_url = "https://api.indiankanoon.org"
    
    api_key = os.getenv("INDIAN_KANOON_API_KEY")

    headers = {
        "Authorization": f"Token {api_key}",
        "Accept": "application/json"
    }

    search_url = f"{base_url}/search/"
    params = {"formInput": query, "pagenum": pagenum}
    response = requests.get(search_url, headers=headers, params=params)
    if response.status_code != 200:
        return f"Error {response.status_code}: {response.text}"

    data = response.json()
    results = []

    # Step 2: For top 2–3 results, fetch full judgment text
    for item in data.get("docs", [])[:2]:  # limit to 2 for efficiency
        docid = item.get("id", "")
        if not docid:
            continue

        # Fetch judgment
        doc_url = f"{base_url}/doc/{docid}/"
        doc_res = requests.get(doc_url, headers=headers)
        if doc_res.status_code != 200:
            judgment_text = f"Could not fetch doc {docid}"
        else:
            judgment_data = doc_res.json()
            judgment_text = judgment_data.get("doc", "No text available")

        results.append({
            "title": item.get("title", "Not specified"),
            "citation": item.get("citation", "Not specified"),
            "link": f"https://indiankanoon.org/doc/{docid}/",
            "snippet": item.get("snippet", "").strip(),
            "judgment_text": judgment_text[:2000] + "..."  # truncate for LLM context
        })

    return results if results else "No results found."


