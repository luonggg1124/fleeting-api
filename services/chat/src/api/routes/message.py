from fastapi import APIRouter, Depends
from services.message_service import MessageService
from repositories.message_repo import MessageRepository
from configs.mongo import db

router = APIRouter()

def get_message_service():
    message_repo = MessageRepository(db)
    return MessageService(message_repo)
@router.post("/messages")
async def send(message_data:dict, service:MessageService = Depends(get_message_service())):
    return {"message_id": await service.send_message(message_data)}