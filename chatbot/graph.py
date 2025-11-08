from chatbot.schema import base_state
from langgraph.graph import StateGraph, END
from chatbot.nodes import tool_node, model
from langgraph.checkpoint.mongodb import AsyncMongoDBSaver
import os
import traceback


async def create_app_async(checkpointer):
    """Creates and compiles the StateGraph using the given checkpointer."""
    try:
        # Define the graph
        graph = StateGraph(base_state)
        graph.add_node("model", model)
        graph.add_node("tool_node", tool_node)
        graph.set_entry_point("model")

        # Conditional edge between model → tool or END
        def should_use_tool(state: base_state):
            if not state or "messages" not in state or not state["messages"]:
                # Empty or invalid state; safely end
                return "no_tools"

            last_message = state["messages"][-1]
            if hasattr(last_message, "tool_calls") and len(last_message.tool_calls) > 0:
                return "use_tools"
            return "no_tools"

        graph.add_conditional_edges("model", should_use_tool, path_map={
            "use_tools": "tool_node",
            "no_tools": END
        })

        # Conditional edge tool_node → model or END
        def tool_router(state: base_state):
            if not state or state.get("end"):
                return END
            return "model"

        graph.add_conditional_edges("tool_node", tool_router)

        # Compile graph
        app = graph.compile(checkpointer=checkpointer)
        return app

    except Exception as e:
        print("❌ Error while creating app graph:")
        traceback.print_exc()
        return None


async def init_mongo_saver():
    """Initializes and returns an AsyncMongoDBSaver instance."""
    MONGODB_URI = os.getenv("MONGO_DEV_URI")
    DB_NAME = os.getenv("DB_NAME", "langgraph_checkpoints")

    if not MONGODB_URI:
        raise ValueError("❌ MONGO_DEV_URI environment variable not set.")

    return AsyncMongoDBSaver.from_conn_string(MONGODB_URI, DB_NAME)
