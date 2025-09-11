from langchain_core.messages import HumanMessage, AIMessageChunk
from fastapi import FastAPI, Query
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from chatbot.graph import create_app_async
import json
from typing import Optional
from uuid import uuid4
from contextlib import asynccontextmanager
import asyncio

graph, conn = None, None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global graph, conn
    graph, conn = await create_app_async()
    try:
        yield
    finally:
        # Run cleanup safely with timeout
        if conn:
            try:
                await asyncio.wait_for(conn.close(), timeout=3)
                print("✅ Connection closed cleanly")
            except asyncio.TimeoutError:
                print("⚠️ Connection close timed out, forcing shutdown")
            except Exception as e:
                print(f"⚠️ Error during shutdown: {e}")

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Type"],
)

def serialise_ai_message_chunk(chunk): 
    if(isinstance(chunk, AIMessageChunk)):
        return chunk.content
    else:
        raise TypeError(
            f"Object of type {type(chunk).__name__} is not correctly formatted for serialisation"
        )

import json
from typing import Optional
from uuid import uuid4
from langchain_core.messages import HumanMessage

async def generate_chat_responses(message: str, checkpoint_id: Optional[str] = None):
    is_new_conversation = checkpoint_id is None

    if is_new_conversation:
        new_checkpoint_id = str(uuid4())
        config = {"configurable": {"thread_id": new_checkpoint_id}}

        events = graph.astream_events(
            {"messages": [HumanMessage(content=message)]},
            version="v2",
            config=config,
        )

        # send checkpoint to frontend
        yield f"data: {json.dumps({'type': 'checkpoint', 'checkpoint_id': new_checkpoint_id})}\n\n"
    else:
        config = {"configurable": {"thread_id": checkpoint_id}}
        events = graph.astream_events(
            {"messages": [HumanMessage(content=message)]},
            version="v2",
            config=config,
        )

    async for event in events:
        event_type = event["event"]
        
        # 🔹 LLM started reasoning
        if event_type == "on_chat_model_start":
            yield f"data: {json.dumps({'type': 'thinking'})}\n\n"

        # 🔹 Stream tokens as they arrive
        elif event_type == "on_chat_model_stream":
            chunk_content = serialise_ai_message_chunk(event["data"]["chunk"])
            if chunk_content:  # skip empty tokens
                yield f"data: {json.dumps({'type': 'content', 'content': chunk_content})}\n\n"

        # 🔹 Tool starts (like search query)
        elif event_type == "on_tool_start": 
            if event.get("name") == "rag_tool":
                # Send "search_start" immediately with the query
                search_query = event["data"].get("input", {}).get("query", "")
                yield f"data: {json.dumps({'type': 'rag_start', 'query': search_query})}\n\n"
            elif event.get("name") == "tavily_search":
                search_query = event["data"].get("input", {}).get("query", "")
                yield f"data: {json.dumps({'type': 'search_start', 'query': search_query})}\n\n"
            elif event.get("name") == "indian_kannon_search_tool":
                search_query = event["data"].get("input", {}).get("query", "")
                yield f"data: {json.dumps({'type': 'i_search_start', 'query': search_query})}\n\n"        

        # 🔹 Tool ends (returning results)
        elif event_type == "on_tool_end":
            if event.get("name") == "rag_tool":
                output = event["data"]["output"].content[100:200]+"......"
                yield f"data: {json.dumps({'type': 'rag_results', 'context': output})}\n\n"
            elif event.get("name") == "tavily_search":
                output = event["data"]["output"]
                if hasattr(output, "content"):
                    parsed = json.loads(output.content)
                    results = parsed.get("results", [])
                    urls = [r["url"] for r in results if "url" in r]
                    yield f"data: {json.dumps({'type': 'search_results', 'urls': urls})}\n\n"
            elif event.get("name") == "indian_kannon_search_tool":
                output = event["data"]["output"]
                results = json.loads(output.content)
                url = results[0].get("link", "")
                yield f"data: {json.dumps({'type': 'i_search_results', 'url': url})}\n\n"

    # 🔹 End of stream
    yield f"data: {json.dumps({'type': 'end'})}\n\n"




@app.get("/chat_stream/{message}")
async def chat_stream(message: str, checkpoint_id: Optional[str] = Query(None)):
    return StreamingResponse(
        generate_chat_responses(message, checkpoint_id), 
        media_type="text/event-stream"
    )

