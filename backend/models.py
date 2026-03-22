"""
models.py — Pydantic data models for Aletheia API.
Defines request/response schemas for the fact-checking pipeline.
"""

from pydantic import BaseModel, Field
from typing import Optional


class VerifyRequest(BaseModel):
    """Request body for verification endpoints."""
    input_text: Optional[str] = None
    url: Optional[str] = None


class ClaimResult(BaseModel):
    """Result of verifying a single claim."""
    claim: str
    verdict: str = Field(
        description="One of: True, False, Partially True, Unverifiable"
    )
    confidence: int = Field(ge=0, le=100, description="Confidence score 0-100")
    reasoning: str
    sources: list[str] = Field(default_factory=list, description="List of source URLs")
    search_query_used: str = ""


class MediaResult(BaseModel):
    """Result of analyzing a single image for AI generation."""
    image_url: str
    verdict: str = Field(
        description="One of: AI-Generated, Likely AI, Likely Real, Real, Unanalyzable"
    )
    confidence: int = Field(ge=0, le=100)
    artifacts: list[str] = Field(default_factory=list)


class VerifyResponse(BaseModel):
    """Complete response from the /verify endpoint."""
    claims: list[ClaimResult]
    overall_accuracy: float
    ai_text_score: Optional[int] = None
    ai_text_reasoning: Optional[str] = None
    media_results: Optional[list[MediaResult]] = None
    article_text_used: str
    total_claims: int
    true_count: int
    false_count: int
    partial_count: int
    unverifiable_count: int
