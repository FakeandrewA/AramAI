from schema import base_state
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
from tools import indian_kannon_search_tool
from langgraph.prebuilt import ToolNode
from langchain_tavily import TavilySearchResults
from langchain_core.messages import ToolMessage

tools = [indian_kannon_search_tool]

llm = ChatGoogleGenerativeAI(model="gemini-2.5-pro")


def base_llm_node(state : base_state) -> base_state:
    input_message = state["messages"][-1]
    legal_advisor_prompt = ChatPromptTemplate.from_template("""
    You are a legal assistant specialized in **Indian law**. 
    Your role is to help users understand legal rules, statutes, and case law in India. 
    Follow these instructions strictly:

    1. Always interpret queries in the context of **Indian jurisdiction** (Constitution, Acts, Rules, Regulations, and case law).  
    2. If a relevant **statute, section, or rule** exists, cite it with its exact number and year (e.g., "Section 420, Indian Penal Code, 1860").  
    3. If relevant **case law** exists, first use the Indian Kanoon tool to fetch it. Do not invent case names or citations. Provide the full citation (case name, year, SCC citation if available). If no citation is found, provide the Indian Kanoon link.  
    4. Structure the response clearly:  
       - [Actor] Who is affected / responsible  
       - [Condition] What must or must not be done  
       - [Enforcement] Penalties, consequences, or authorities  
       - [Note] Clarifications, exceptions, or references  
       - [Citation] Exact sections, rules, and cases used  
    5. If the question is outside Indian law, reply:  
    "This assistant only provides guidance under Indian law."  
    6. If the query is vague or incomplete, ask the user to clarify instead of assuming.  
    7. If information is not available in the retrieved legal text, state:  
    "Not specified in the available legal text."  
    8. End every answer with:  
    **Disclaimer: This information is for general guidance under Indian law and does not substitute professional legal advice from a licensed advocate.**

    User Query: {query}
    Answer:
    """)
    llm_with_tools = llm.bind_tools(tools=tools)
    legal_advisor_chain =  legal_advisor_prompt | llm_with_tools
    response = legal_advisor_chain.invoke({"query" : input_message})
    return {
        "messages" : response
    }

search_tool = TavilySearchResults(
    max_results=4,
)

def tool_node(state):
    """Custom tool node that handles tool calls from the LLM."""

    tool_calls = state["messages"][-1].tool_calls
    
    tool_messages = []
    
    for tool_call in tool_calls:
        tool_name = tool_call["name"]
        tool_args = tool_call["args"]
        tool_id = tool_call["id"]
        
        if tool_name == "tavily_search_results_json":

            search_results = search_tool.ainvoke(tool_args)
            
            tool_message = ToolMessage(
                content=str(search_results),
                tool_call_id=tool_id,
                name=tool_name
            )
            
            tool_messages.append(tool_message)
        
        elif tool_name == "indian_kannon_search_tool":

            search_results = indian_kannon_search_tool.ainvoke(tool_args)

            tool_message = ToolMessage(
                content = search_results,
                tool_call_id = tool_id,
                name = tool_name,
            )
    
    # Add the tool messages to the state
    return {"messages": tool_messages}

tools = [search_tool, indian_kannon_search_tool]

tool_node = ToolNode(tools = tools)