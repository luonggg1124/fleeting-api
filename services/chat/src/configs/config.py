import os 
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL","")
DB_NAME = os.getenv("DB_NAME","chat-fleeting")
REDIS_URL = os.getenv("REDIS_URL","localhost:6379")
