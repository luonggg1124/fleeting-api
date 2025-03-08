from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class Message(BaseModel):
    id: Optional[str] = Field(None, alias = "_id")
    conversation_id: str
    sender_id: str
    text: Optional[str] = None
    attachment_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    read: bool = False