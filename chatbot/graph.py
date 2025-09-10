# new file or replace chatbot/graph.py contents that create `app`
from chatbot.schema import base_state
from langgraph.graph import StateGraph, END
from chatbot.nodes import tool_node, model
from langchain_core.messages import HumanMessage
from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver
import aiosqlite

config = {"configurable": {"thread_id": 12345}}

async def create_app_async():
    conn = await aiosqlite.connect("checkpoint.sqlite")
    memory = AsyncSqliteSaver(conn)

    graph = StateGraph(base_state)
    graph.add_node("model", model)
    graph.add_node("tool_node", tool_node)
    graph.set_entry_point("model")

    def should_use_tool(state : base_state):
        last_message = state["messages"][-1]
        if (hasattr(last_message, "tool_calls") and len(last_message.tool_calls) > 0):
            return "use_tools"
        return "no_tools"

    graph.add_edge("tool_node", "model")
    graph.add_conditional_edges("model", should_use_tool, path_map={
        "use_tools": "tool_node",
        "no_tools": END
    })

    app = graph.compile(checkpointer=memory)
    return app, conn  # Return the connection

