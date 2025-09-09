from retrieval.utils import get_relevant_points,get_client
from retrieval.config import CROSS_ENCODER,COLLECTION_NAME   # loaded at start
from chatbot.graph import app
import os
from langchain.schema import HumanMessage
from dotenv import load_dotenv
load_dotenv()

    

if __name__ == "__main__":

    response = app.invoke(input = {
    "messages" : [HumanMessage(content="I need to know what are the charges if i attempt with a murder but i did not commit murder")]
    })
    print(response)

