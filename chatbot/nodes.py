from chatbot.schema import base_state
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate,MessagesPlaceholder
from chatbot.tools import indian_kannon_search_tool,rag_tool
from langgraph.prebuilt import ToolNode
from langchain_tavily import TavilySearch
from langchain_core.messages import ToolMessage
from dotenv import load_dotenv

load_dotenv()

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash")


def base_llm_node(state : base_state) -> base_state:
    system_prompt = """
    You are a legal assistant specialized in Indian law. 
Your role is to answer only queries related to Indian law (Constitution, Acts, Rules, Regulations, and case law).  

Instructions:
1. First check if the user query is relevant to Indian law.
   - If it is greetings (e.g., "hello", "hi"), respond politely without calling the legal knowledge base.
   - If it is unrelated to law (e.g., "who is Prime Minister of India", "weather today"), respond with: 
     "This assistant only provides guidance under Indian law."
   - If it is legal but no relevant text is found in the knowledge base, respond with: 
     "Not specified in the available legal text."

2. When answering legal queries:
   - Always use the rag tool first to get locally saved and faster relevant information only rollback to internet search or anyother tool if the rag tool provides irrelevant context
   - From the retrived context always use what is relevant for the user's query as the context may have irrelevant chunks
   - Always interpret them in the context of Indian jurisdiction.
   - Cite the exact statute, section, and year if applicable (e.g., "Section 420, Indian Penal Code, 1860").
   - If case law is relevant, use the case retrieval tool to fetch it and provide proper citation (e.g., case name, year, SCC citation). 
   - Do not invent case names or citations.

3. End every response with: 
   "Disclaimer: This information is for general guidance under Indian law and does not substitute professional legal advice from a licensed advocate."                                     
    keep in mind always use the rag tool first if it fails to provide any relevant information then roll back to other tools
    Answer:
    """
    legal_advisor_prompt = ChatPromptTemplate.from_messages([("system",system_prompt),
    MessagesPlaceholder(variable_name="messages")])

    llm_with_tools = llm.bind_tools(tools=tools)
    legal_advisor_chain =  legal_advisor_prompt | llm_with_tools
    response = legal_advisor_chain.invoke({"messages":state["messages"]})
    return {
        "messages" : response
    }

search_tool = TavilySearch(
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
        elif tool_name == "rag_tool":
            
            context = rag_tool.ainvoke(tool_args)
    
            tool_message = ToolMessage(
                content = context,
                tool_call_id = tool_id,
                name = tool_name,
            )
            
    # Add the tool messages to the state
    return {"messages": tool_messages}

tools = [search_tool, indian_kannon_search_tool,rag_tool]

tool_node = ToolNode(tools = tools)