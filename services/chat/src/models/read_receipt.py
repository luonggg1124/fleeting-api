from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
class ReadReceipt(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    message_id: str
    user_id: str
    read_at : datetime = Field(default_factory=datetime.utcnow)