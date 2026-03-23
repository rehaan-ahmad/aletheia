from pydantic import BaseModel, HttpUrl, field_validator
from typing import Literal, Optional, List
from datetime import datetime

# ── Input Schemas ──────────────────────────────────────────
class VerifyRequest(BaseModel):
    text: Optional[str] = None
    url: Optional[str] = None
    enable_ai_detection: bool = True
    enable_media_detection: bool = False

    @field_validator("text", "url", mode="before")
    @classmethod
    def at_least_one(cls, v, info):
        return v  # cross-field check done in route

class AuthRegisterRequest(BaseModel):
    username: str
    email: str
    password: str

class AuthLoginRequest(BaseModel):
    username: str
    password: str

# ── Pipeline Internal Schemas ───────────────────────────────
class AtomicClaim(BaseModel):
    claim_id: str
    claim_text: str
    original_context: str     # verbatim original text for UI highlighting
    char_start: Optional[int] = None   # character offset in original for precise highlight
    char_end: Optional[int] = None

class SkippedSegment(BaseModel):
    text: str
    reason: str

class ExtractionResult(BaseModel):
    claims: List[AtomicClaim]
    skipped: List[SkippedSegment]
    total_found: int

class CitationSource(BaseModel):
    url: str
    title: str
    snippet: str
    credibility_tier: Literal["high", "medium", "low"]
    published_date: Optional[str] = None

class ClaimVerification(BaseModel):
    claim_id: str
    claim_text: str
    original_context: str
    verdict: Literal["True", "False", "Partially True", "Unverifiable"]
    confidence_score: float
    justification: str
    reasoning_chain: str
    citations: List[CitationSource]
    search_queries_used: List[str]
    conflict_detected: bool = False
    temporal_flag: bool = False
    key_evidence_snippet: Optional[str] = None

# ── Detection Schemas ───────────────────────────────────────
class SentenceAIScore(BaseModel):
    sentence: str
    generated_prob: float
    perplexity: Optional[float] = None

class AIDetectionResult(BaseModel):
    ai_probability: float
    human_probability: float
    sentence_scores: List[SentenceAIScore]
    classification: Literal["AI-Generated", "Human-Written", "Mixed"]
    is_mock: bool = False

class MediaAsset(BaseModel):
    url: str
    asset_type: Literal["image", "video", "audio"]
    deepfake_probability: float
    ai_generated_probability: float
    verdict: Literal["Likely Authentic", "Likely Synthetic", "Inconclusive"]

class MediaDetectionResult(BaseModel):
    analyzed_assets: List[MediaAsset]
    overall_verdict: str
    is_mock: bool = False
    available: bool = True

# ── Output Schemas ──────────────────────────────────────────
class AccuracyReport(BaseModel):
    report_id: str
    input_source: str
    input_type: Literal["text", "url"]
    input_preview: str          # first 200 chars for display
    article_title: Optional[str] = None
    claims: List[ClaimVerification]
    overall_accuracy_score: float
    verdict_counts: dict        # {"True": n, "False": n, "Partially True": n, "Unverifiable": n}
    summary: str
    ai_detection: Optional[AIDetectionResult] = None
    media_detection: Optional[MediaDetectionResult] = None
    processing_time_seconds: float
    created_at: str

class SSEEvent(BaseModel):
    event: str                  # "status" | "claim_complete" | "rate_limit_pause" | "done" | "error"
    data: dict

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    username: str
