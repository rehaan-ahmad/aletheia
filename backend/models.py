from pydantic import BaseModel
from typing import List, Optional

class VerifyRequest(BaseModel):
    input_text: Optional[str] = None
    url: Optional[str] = None

class ClaimResult(BaseModel):
    claim: str
    verdict: str  # True / False / Partially True / Unverifiable
    confidence: int  # 0–100
    reasoning: str
    sources: List[str]

class VerifyResponse(BaseModel):
    claims: List[ClaimResult] = []
    overall_accuracy: float = 0.0
    ai_text_score: Optional[int] = None
    media_results: Optional[List] = None
