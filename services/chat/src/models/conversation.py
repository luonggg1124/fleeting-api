from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional,List

class Conversation(BaseModel): 
    id: Optional[str] = Field(None, alias="_id")
    participants: List[str]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_message_id: Optional[str] = None