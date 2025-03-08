from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class Attachment(BaseModel): 
    id: Optional[str] = Field(None, alias="_id")
    message_id: str
    url: str
    file_type: str
    file_size: int
    uploaded_at: datetime =Field(default_factory=datetime.utcnow)