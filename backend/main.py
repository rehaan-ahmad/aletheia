"""
main.py — FastAPI entry point for Aletheia backend.
Phase 3: Verification endpoint.
"""
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import VerifyRequest, VerifyResponse, ClaimResult
from modules.extractor import fetch_article_text, extract_claims
from modules.searcher import get_evidence_for_claim
from modules.verifier import verify_claim

app = FastAPI(
    title="Aletheia — Fact & Claim Verification API",
    version="0.1.0",
    description="AI-powered fact-checking and claim verification system.",
)

# CORS — allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def health_check():
    """Health check endpoint."""
    return {"status": "Aletheia is running"}


@app.post("/extract-claims")
async def extract_claims_endpoint(request: VerifyRequest):
    """
    Extract verifiable claims from text or a URL.
    Returns the list of claims, count, and preview of text used.
    """
    if not request.input_text and not request.url:
        raise HTTPException(
            status_code=400,
            detail="Either 'input_text' or 'url' must be provided.",
        )

    if request.url:
        try:
            text = fetch_article_text(request.url)
        except ValueError as e:
            raise HTTPException(status_code=422, detail=str(e))
    else:
        text = str(request.input_text)

    try:
        claims = await extract_claims(text)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Claim extraction failed: {str(e)}",
        )

    return {
        "claims": claims,
        "count": len(claims),
        "text_used": text[:500],
    }


async def process_single_claim(claim: str) -> ClaimResult:
    """Helper to process one claim end-to-end: searcher -> verifier."""
    query, sources = await get_evidence_for_claim(claim)
    result = await verify_claim(claim, sources, query)
    return result


@app.post("/verify", response_model=VerifyResponse)
async def verify_endpoint(request: VerifyRequest):
    """
    Full pipeline: text -> claims -> search -> verify.
    """
    if not request.input_text and not request.url:
        raise HTTPException(
            status_code=400,
            detail="Either 'input_text' or 'url' must be provided.",
        )

    if request.url:
        try:
            text = fetch_article_text(request.url)
        except ValueError as e:
            raise HTTPException(status_code=422, detail=str(e))
    else:
        text = str(request.input_text)

    try:
        claims = await extract_claims(text)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Claim extraction failed: {str(e)}",
        )

    # Concurrently process all claims
    tasks = [process_single_claim(c) for c in claims]
    claim_results = await asyncio.gather(*tasks)

    true_count = sum(1 for r in claim_results if r.verdict == "True")
    false_count = sum(1 for r in claim_results if r.verdict == "False")
    partial_count = sum(1 for r in claim_results if r.verdict == "Partially True")
    unverifiable_count = sum(1 for r in claim_results if r.verdict == "Unverifiable")
    total_claims = len(claim_results)

    if total_claims > 0:
        accuracy = ((true_count + 0.5 * partial_count) / total_claims) * 100.0
    else:
        accuracy = 0.0

    return VerifyResponse(
        claims=claim_results,
        overall_accuracy=accuracy,
        ai_text_score=None,
        ai_text_reasoning=None,
        media_results=None,
        article_text_used=text[:500],
        total_claims=total_claims,
        true_count=true_count,
        false_count=false_count,
        partial_count=partial_count,
        unverifiable_count=unverifiable_count
    )
