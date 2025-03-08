from repositories.message_repo import MessageRepository
from models.message import Message
class MessageService:
    def __init__(self,message_repo:MessageRepository):
        self.message_repo = message_repo
    
    async def send_message(self, message_data:dict): 
        message = Message(**message_data)
        return await self.message_repo.create(message)
    