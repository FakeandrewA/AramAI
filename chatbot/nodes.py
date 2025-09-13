from chatbot.schema import base_state
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate,MessagesPlaceholder
from chatbot.tools import indian_kannon_search_tool,rag_tool
from langchain_tavily import TavilySearch
from langchain_core.messages import ToolMessage
from dotenv import load_dotenv

system_prompt = """You are a legal assistant specialized in Indian law. 
Your role is to answer ONLY queries related to Indian law (Constitution, Acts, Rules, Regulations, and case law).

--------------------
General Rules:
1. Always check if the user query is relevant to Indian law.
   - If greetings (e.g., "hello", "hi"), respond politely without calling any tool.
   - If unrelated to Indian law (e.g., politics, weather, general trivia), respond with:  
     "This assistant only provides guidance under Indian law."
   - If legal but no relevant information is found in the knowledge base, respond with:  
     "Not specified in the available legal text."

--------------------
Legal Query Handling:
2. Retrieval Priority:
   - Always try the **RAG tool first** to fetch locally stored and faster information.  
   - If RAG provides irrelevant or no useful context, then fallback to other tools (e.g., Indian Kanoon search).  

3. Using Retrieved Context:
   - Use only the parts of the retrieved context that directly answer the query.  
   - Discard irrelevant chunks.  
   - Interpret the answer strictly within the **Indian legal framework**.

4. Citations:
   - Always cite the exact statute, section, and year if applicable.  
     Example: "Section 420, Indian Penal Code, 1860".  
   - If case law is relevant, use the case retrieval tool and provide proper citation:  
     Example: "State of Maharashtra v. XYZ, (2010) 5 SCC 123".  
   - Never invent or fabricate case names or citations.  

--------------------
Response Format:
5. Always end every response with the disclaimer:  
   "Disclaimer: This information is for general guidance under Indian law and does not substitute professional legal advice from a licensed advocate."

--------------------
Answer:"""

load_dotenv()

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash")

search_tool = TavilySearch(
    max_results=4,
)
tools = [search_tool, indian_kannon_search_tool,rag_tool]

async def model(state : base_state) -> base_state:
    
    legal_advisor_prompt = ChatPromptTemplate.from_messages([("system",system_prompt),
    MessagesPlaceholder(variable_name="messages")])

    llm_with_tools = llm.bind_tools(tools=tools)
    legal_advisor_chain =  legal_advisor_prompt | llm_with_tools
    response = await legal_advisor_chain.ainvoke({"messages":state["messages"]})
    return {
        "messages" : response
    }


async def tool_node(state):
    """Custom tool node that handles tool calls from the LLM."""

    tool_calls = state["messages"][-1].tool_calls
    tool_messages = []

    stop_after_this = False   # 👈 flag to short-circuit

    for tool_call in tool_calls:
        tool_name = tool_call["name"]
        tool_args = tool_call["args"]
        tool_id = tool_call["id"]

        if tool_name == "tavily_search":
            search_results = await search_tool.ainvoke(tool_args)
            tool_message = ToolMessage(
                content=str(search_results),
                tool_call_id=tool_id,
                name=tool_name
            )
            tool_messages.append(tool_message)

        elif tool_name == "indian_kannon_search_tool":
            search_results = await indian_kannon_search_tool.ainvoke(tool_args)
            tool_message = ToolMessage(
                content=search_results,
                tool_call_id=tool_id,
                name=tool_name,
            )
            tool_messages.append(tool_message)

        elif tool_name == "rag_tool":
            context = await rag_tool.ainvoke(tool_args)
            tool_message = ToolMessage(
                content=context,
                tool_call_id=tool_id,
                name=tool_name,
            )
            tool_messages.append(tool_message)

        # elif tool_name == "draft_selection_tool":
        #     draft_object = await draft_selection_tool.ainvoke(tool_args)

        #     # If tool returns JSON string
        #     if isinstance(draft_object, str):
        #         obj = json.loads(draft_object)
        #     else:
        #         obj = draft_object  # already dict

        #     tool_message = ToolMessage(
        #         content=draft_object,
        #         tool_call_id=tool_id,
        #         name=tool_name,
        #     )
        #     tool_messages.append(tool_message)

        #     variables_json = json.dumps(obj.get("variables", []))
        #     system_msg_text = (
        #         "We are in Drafting Mode. To ensure safety, first collect all these variables "
        #         f"from the user before returning to normal mode.\n"
        #         f"The variables are {variables_json}. "
        #         "Make sure to ask a question for each variable."
        #     )

        #     tool_messages.append(SystemMessage(content=system_msg_text))

        #     stop_after_this = True

    # If draft_selection_tool was used → stop here
    if stop_after_this:
        # return tool outputs as final state
        return {"messages": tool_messages, "end": True}

    # Otherwise continue as usual
    return {"messages": tool_messages}




# tool_node = ToolNode(tools = tools)
