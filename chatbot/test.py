import requests
import os
from dotenv import load_dotenv

load_dotenv()

def indian_kannon_search_tool(query: str, pagenum: int = 1):
    """Search Indian Kanoon for case law or statutes or Judgements
    Input: query (str) - search keywords or case name
    Output: top 2 search results (title + link + snippet + truncated judgment)"""

    base_url = "https://api.indiankanoon.org"
    api_key = os.getenv("INDIAN_KANOON_API_KEY")

    headers = {
        "Authorization": f"Token {api_key}",
        "Accept": "application/json"
    }

    # ✅ Use POST instead of GET
    search_url = f"{base_url}/search/"
    payload = {"formInput": query, "pagenum": pagenum}

    response = requests.post(search_url, headers=headers, data=payload)
    if response.status_code != 200:
        return f"Error {response.status_code}: {response.text}"

    data = response.json()
    results = []

    # ✅ Limit to top 2 results
    for item in data.get("docs", [])[:2]:
        docid = item.get("id", "")
        if not docid:
            continue

        # Fetch judgment text (also POST)
        doc_url = f"{base_url}/doc/{docid}/"
        doc_res = requests.post(doc_url, headers=headers)
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
            "judgment_text": judgment_text[:2000] + "..."
        })

    return results if results else "No results found."


if __name__ == "__main__":
    print(indian_kannon_search_tool("W.Daniel Rajkumar vs V.M.Sivasamy on 5 August, 2022", 1))
