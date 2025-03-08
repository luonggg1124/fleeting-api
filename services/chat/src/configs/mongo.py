from motor.motor_asyncio import AsyncIOMotorClient
from configs.config import MONGO_URL,DB_NAME


mongo_client = AsyncIOMotorClient(MONGO_URL)
db = mongo_client[DB_NAME]

async def init_collections():
    collections = await db.list_collection_names()

    if "messages" not in collections:
        await db.create_collection("messages")
        print("Created 'messages' collection")
    
    if "conversations" not in collections:
        await db.create_collection("conversations")
        print("Created 'conversations' collection")

    if "read_receipts" not in collections:
        await db.create_collection("read_receipts")
        print("Created 'read_receipts' collection")

    if "attachments" not in collections:
        await db.create_collection("attachments")
        print("Created 'attachments' collection")
    
    await init_indexes()

async def init_indexes():
    """Create indexes if they do not exist"""
    await db["messages"].create_index([("conversation_id", 1)])
    await db["messages"].create_index([("sender_id", 1)])
    await db["messages"].create_index([("created_at", -1)])
    await db["messages"].create_index([("conversation_id", -1), ("created_at", -1)])
    
    await db["conversations"].create_index([("participants", 1)])
    await db["conversations"].create_index([("last_message_id", 1)])

    await db["read_receipts"].create_index([("message_id", 1)])
    await db["read_receipts"].create_index([("user_id", 1)])

    await db["attachments"].create_index([("message_id", 1)])
    await db["attachments"].create_index([("uploaded_at", -1)])

    print("Indexes created")
    