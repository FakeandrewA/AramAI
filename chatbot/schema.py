from typing import List, Annotated, TypedDict, Optional
from langgraph.graph import add_messages

class base_state(TypedDict):
    messages: Annotated[List, add_messages]
    end: Optional[bool]