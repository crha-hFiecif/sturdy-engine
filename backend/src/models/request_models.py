from pydantic import BaseModel
from typing import Optional

class ExtractionRequest(BaseModel):
    model_name: str
    max_tokens: int
    temperature: float
    top_p: float
    system_prompt: Optional[str] = ""
    user_prompt: str
    
    class Config:
        protected_namespaces = ()