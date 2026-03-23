"""
main.py — FastAPI entry point for Aletheia backend.
Phase 6: SSE Streaming endpoint.
"""
import asyncio
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse

from models import VerifyRequest, VerifyResponse, ClaimResult
from modules.extractor import fetch_article_text, extract_claims
from modules.searcher import get_evidence_for_claim
from modules.verifier import verify_claim
from modules.text_detector import detect_ai_text
from modules.media_detector import analyze_article_media, extract_image_urls, analyze_image

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
    Full pipeline: text -> claims -> search -> verify + AI text + AI media detection.
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

    # Phase 4: AI Text detection on the source text
    ai_result = await detect_ai_text(text)
    ai_score = ai_result.get("final_score", -1)
    ai_reasoning = ai_result.get("gemini", {}).get("reasoning", "")
    if ai_score == -1:
        ai_score = None
        ai_reasoning = None

    # Phase 5: Media detection
    media_results = None
    if request.url:
        media_results = await analyze_article_media(request.url)

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
        ai_text_score=ai_score,
        ai_text_reasoning=ai_reasoning,
        media_results=media_results,
        article_text_used=text[:500],
        total_claims=total_claims,
        true_count=true_count,
        false_count=false_count,
        partial_count=partial_count,
        unverifiable_count=unverifiable_count
    )


@app.post("/detect-text")
async def detect_text_endpoint(request: VerifyRequest):
    """Standalone AI text detection endpoint."""
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

    result = await detect_ai_text(text)
    return result


@app.post("/verify-stream")
async def verify_stream_endpoint(request: VerifyRequest):
    """Event stream for verification pipeline."""
    async def event_generator():
        try:
            # 1. Extraction Stage
            yield {
                "event": "status",
                "data": json.dumps({"stage": "extracting", "message": "Fetching text and extracting claims..."})
            }
            
            if not request.input_text and not request.url:
                raise ValueError("Either 'input_text' or 'url' must be provided.")
                
            if request.url:
                text = await asyncio.to_thread(fetch_article_text, request.url)
            else:
                text = str(request.input_text)
                
            claims = await extract_claims(text)
            
            yield {
                "event": "claims",
                "data": json.dumps({"claims": claims, "count": len(claims)})
            }
            
            # 2. Claim Verification Stage
            claim_results = []
            for i, claim in enumerate(claims, 1):
                yield {
                    "event": "status",
                    "data": json.dumps({
                        "stage": "searching",
                        "message": f"Searching: '{claim[:40]}...'",
                        "claim": i
                    })
                }
                
                query, sources = await get_evidence_for_claim(claim)
                
                yield {
                    "event": "status",
                    "data": json.dumps({
                        "stage": "verifying",
                        "message": f"Verifying: '{claim[:40]}...'",
                        "claim": i,
                        "query": query
                    })
                }
                
                result = await verify_claim(claim, sources, query)
                claim_results.append(result)
                
                # using model_dump_json for Pydantic v2
                yield {
                    "event": "claim_result",
                    "data": result.model_dump_json()
                }
                
            # 3. AI Text Detection Stage
            yield {
                "event": "status",
                "data": json.dumps({"stage": "ai_detection", "message": "Running AI text detection..."})
            }
            ai_result = await detect_ai_text(text)
            ai_score = ai_result.get("final_score", -1)
            
            yield {
                "event": "ai_text",
                "data": json.dumps(ai_result)
            }
            
            # 4. Media Detection Stage
            media_results = []
            if request.url:
                yield {
                    "event": "status",
                    "data": json.dumps({"stage": "media", "message": "Scanning for article images..."})
                }
                
                image_urls = await asyncio.to_thread(extract_image_urls, request.url)
                for img_url in image_urls:
                    yield {
                        "event": "status",
                        "data": json.dumps({"stage": "media", "message": f"Analyzing image: {img_url[-20:]}"})
                    }
                    m_result = await analyze_image(img_url)
                    media_results.append(m_result)
                    
                    yield {
                        "event": "media",
                        "data": m_result.model_dump_json()
                    }
            
            # 5. Summary Complete Stage
            true_count = sum(1 for r in claim_results if r.verdict == "True")
            false_count = sum(1 for r in claim_results if r.verdict == "False")
            partial_count = sum(1 for r in claim_results if r.verdict == "Partially True")
            unverifiable_count = sum(1 for r in claim_results if r.verdict == "Unverifiable")
            total_claims = len(claim_results)

            if total_claims > 0:
                accuracy = ((true_count + 0.5 * partial_count) / total_claims) * 100.0
            else:
                accuracy = 0.0
                
            yield {
                "event": "complete",
                "data": json.dumps({
                    "total_claims": total_claims,
                    "overall_accuracy": accuracy,
                    "true_count": true_count,
                    "false_count": false_count,
                    "partial_count": partial_count,
                    "unverifiable_count": unverifiable_count,
                    "ai_text_score": None if ai_score == -1 else ai_score
                })
            }

        except Exception as e:
            yield {
                "event": "error",
                "data": json.dumps({"message": str(e)})
            }
            
    return EventSourceResponse(event_generator())
