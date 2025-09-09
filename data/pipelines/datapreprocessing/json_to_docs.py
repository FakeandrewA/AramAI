import re
from langchain.schema import Document
import json
from typing import List
from tqdm import tqdm

# --- Doctype Patterns ---
DOCTYPE_PATTERNS = {
    "Act": r"act( no\.)?[, ]\d{4}|act",
    "Rule": r"rules?, \d{4}|rules",
    "Regulation": r"regulation[s]?, \d{4}",
    "Notification": r"notification|gsr|s\.o\.|official gazette",
    "Order": r"order|circular|office memorandum",
    "Guidelines": r"guidelines",
    "Scheme": r"scheme|program|yojana",
    "By-law": r"by[- ]law|bye-law",
    "Amendment": r"amendment|amending act|amending rule",
    "Repeal": r"repeal|repealing act",
}

# --- Helper Functions ---

def detect_doctype(title, text):
    title_lower = title.lower()
    for doctype, pattern in DOCTYPE_PATTERNS.items():
        if re.search(pattern, title_lower):
            return doctype
    # fallback: search in text
    text_lower = text.lower()
    for doctype, pattern in DOCTYPE_PATTERNS.items():
        if re.search(pattern, text_lower):
            return doctype
    return "Other"

def extract_tags(title, text):
    combined = (title + " " + text).lower()
    tags = []
    domain_map = {
        "Environment": ["pollution", "environment", "oil", "waste"],
        "Shipping": ["shipping", "port", "harbour", "vessel", "merchant"],
        "Taxation": ["tax", "gst", "duty", "income-tax", "excise"],
        "Labour": ["labour", "worker", "employment", "wages", "factory"],
        "Healthcare": ["health", "hospital", "dispensary", "public health"],
        "Agriculture": ["agriculture", "farmer", "farming", "irrigation"],
        "Education": ["education", "university", "technical training"],
        "Transport": ["railway", "road", "highway", "airways", "port authority"],
        "Forestry": ["forest", "wildlife", "protection of wild animals"],
        "Intellectual Property": ["patent", "copyright", "trademark"],
        "Telecom": ["telecommunication", "broadcasting", "airwave"],
    }
    for tag, keywords in domain_map.items():
        if any(k in combined for k in keywords):
            tags.append(tag)
    return tags

def detect_jurisdiction(docsource, title=""):
    docsource = docsource.lower()
    title = title.lower()
    if "union of india" in docsource or "central" in docsource or "constitution and amendments" in docsource or "international treaty" in docsource or "united nations conventions" in docsource:
        return "Central"
    if "act" in docsource or "state of" in docsource:
        return "State"
    if "union territory" in docsource:
        return "Union Territory"
    return "Unknown"



def convert_json_to_docs(json_file:str, page_size:int=3300)->List[Document]:
    """
    Reads a JSON file containing legal documents, processes each document, and
    converts them into a list of Document objects.

    Each document from the JSON is split into smaller "pages" based on the
    `page_size`. The function automatically detects the document type,
    jurisdiction, and relevant tags for each document.

    Args:
        json_file (str): The path to the input JSON file. The JSON is expected
                         to be a dictionary where keys are years and values are
                         lists of document entries.
        page_size (int, optional): The maximum number of characters for each
                                   'page' or chunk of the document. Defaults to 3300.

    Returns:
        list: A list of `Document` objects. Each object contains a 'page_content'
              (a chunk of the original text) and a 'metadata' dictionary with
              extracted information such as 'doc_id', 'year', 'title', 'doctype',
              'jurisdiction', 'tags', and 'pageno'.
    """
    with open(json_file, "r", encoding="utf-8") as f:
        raw_data = json.load(f)

    all_docs = []

    for year, entries in tqdm(list(raw_data.items())[:-1],total=len(list(raw_data.items())[:-1]),desc="Processing"):
        for entry in entries:
            title = entry.get("title", "")
            text = entry.get("data", "")
            doc_id = entry.get("doc_id", "")
            link = entry.get("link", "")
            cited_to = entry.get("cited_to", 0)
            cited_by = entry.get("cited_by", 0)
            source = entry.get("docsource", "")
            jurisdiction = detect_jurisdiction(source, title)
            doctype = detect_doctype(title, text)
            
            # Split the text into pages of `page_size` characters
            pages = [text[i:i+page_size] for i in range(0, len(text), page_size)]

            for idx, page_text in enumerate(pages):
                page_doc = Document(
                    page_content=page_text,
                    metadata={
                        "doc_id": doc_id,
                        "year": year,
                        "link": link,
                        "title": title,
                        "cited_to": cited_to,
                        "cited_by": cited_by,
                        "tags": ", ".join(extract_tags(title, page_text)),
                        "jurisdiction": jurisdiction,
                        "source": source,
                        "doctype": doctype,
                        "pageno": idx + 1  # page number within this document
                    }
                )
                all_docs.append(page_doc)

    return all_docs

