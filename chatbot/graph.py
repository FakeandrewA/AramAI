# chatbot/graph.py
from chatbot.schema import base_state
from langgraph.graph import StateGraph, END
from chatbot.nodes import tool_node, model
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

    # Router for model → tool or end
    def should_use_tool(state: base_state):
        last_message = state["messages"][-1]
        if (hasattr(last_message, "tool_calls") and len(last_message.tool_calls) > 0):
            return "use_tools"
        return "no_tools"

    graph.add_conditional_edges("model", should_use_tool, path_map={
        "use_tools": "tool_node",
        "no_tools": END
    })

    # Router for tool_node → either back to model or stop
    def tool_router(state: base_state):
        if state.get("end"):   # set by draft_selection_tool in tool_node
            return END
        return "model"

    graph.add_conditional_edges("tool_node", tool_router)

    app = graph.compile(checkpointer=memory)
    return app, conn  # Return the connection
