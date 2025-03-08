from motor.motor_asyncio import AsyncIOMotorDatabase
from models.message import Message

class ReadReceiptRepository: 
    def __init__(self,db:AsyncIOMotorDatabase):
        self.collection = db["read_receipts"]
    @staticmethod
    async def init_collection(self):
        await self.collection.create_index(["message_id",1])
        await self.collection.create_index(["user_id",1])
    async def create(self,message:Message) ->str:
        message_dict = message.dict(by_alias=True, exclude={"id"}) 
        result = await self.collection.insert_one(message_dict)
        return str(result.inserted_id)
   
    async def find_by_id(self,id:str):
        data = await self.collection.find_one({"_id":id})
        return Message(**data) if data else None