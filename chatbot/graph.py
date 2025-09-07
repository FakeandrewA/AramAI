from schema import base_state
from langgraph.graph import StateGraph, END
from nodes import indian_kannon_search_tool_node, base_llm_node
from langchain_core.messages import HumanMessage

graph = StateGraph(base_state)

graph.add_node("base_llm_node", base_llm_node)
graph.add_node("tool_node", indian_kannon_search_tool_node)

graph.set_entry_point("base_llm_node")


def should_use_tool(state : base_state):
    last_message = state["messages"][-1]
    if (hasattr(last_message, "tool_calls") and len(last_message.tool_calls) > 0):
        return "use_tools"
    return "no_tools"



graph.add_edge("tool_node", "base_llm_node")
graph.add_conditional_edges("base_llm_node", should_use_tool, path_map={
    "use_tools" : "tool_node",
    "no_tools" : END
})

app = graph.compile()


diagram = app.get_graph().draw_mermaid_png()

with open("graph.png","wb") as f:
    f.write(diagram)

response = app.invoke(input = {
    "messages" : [HumanMessage(content="what happened in the case happened between nandha kumar and lg")]
})
print(response)