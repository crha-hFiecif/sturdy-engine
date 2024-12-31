from pydantic import BaseModel
from typing import Any, Dict, Optional

class ExtractionResponse(BaseModel):
    extracted_data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    