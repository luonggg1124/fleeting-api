from configs.mongo import db
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.conversation import Conversation
from bson import ObjectId
from typing import List,Optional
class ConversationRepository: 
    def __init__(self, db:AsyncIOMotorDatabase):
        self.collection = db["conversations"]
    @staticmethod
    async def create(self,conversation:Conversation) ->str:
        dict = conversation.dict(by_alias=True, exclude={"id"})
        result = await self.collection.insert_one(dict)
        return str(result.inserted_id)

    @staticmethod
    async def find_by_id(self,id:str) -> Optional[Conversation]: 
        convo = await self.collection.find_one({"_id":ObjectId(id)})
        return Conversation(**convo, id=str(convo["_id"])) if convo else None
    
conversation_repo = ConversationRepository()