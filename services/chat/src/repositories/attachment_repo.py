from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from configs.mongo import db
from models.message import Message
from typing import List,Optional

class MessageRepository: 
    def __init__(self,db:AsyncIOMotorDatabase):
        self.collection = db["attachments"]
   
    async def create(self,message:Message) ->str:
        message_dict = message.dict(by_alias=True, exclude={"id"}) 
        result = await self.collection.insert_one(message_dict)
        return str(result.inserted_id)
   
    async def find_by_id(self,id:str):
        data = await self.collection.find_one({"_id":id})
        return Message(**data) if data else None