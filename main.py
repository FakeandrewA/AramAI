from retrieval.config import CROSS_ENCODER,COLLECTION_NAME   # loaded at start
from chatbot.graph import app, config
import os
from langchain.schema import HumanMessage
from dotenv import load_dotenv
load_dotenv()

    

if __name__ == "__main__":

    response = app.ainvoke(input = {
    "messages" : [HumanMessage(content="What are the Charges If i murder someone")]
    }, config=config)
    print(response)

