from pydantic import BaseModel
from typing import List, Annotated, TypedDict
from langgraph.graph import add_messages

class base_state(TypedDict):
    messages : Annotated[list, add_messages]


