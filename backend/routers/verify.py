import json
import uuid
import time
from datetime import datetime
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse

from schemas import VerifyRequest, AccuracyReport, ClaimVerification
from services.scraper import scrape_url
from services.extractor import extract_claims
from services.verifier import build_verifier_graph
from services.gptzero import detect_ai_text
from services.hive import detect_media

router = APIRouter()
verifier_app = build_verifier_graph()

def generate_sse(event: str, data: dict):
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"

async def verify_stream_generator(request: Request, body: VerifyRequest):
    start_time = time.time()
    report_id = str(uuid.uuid4())
    
    yield generate_sse("status", {"step": "scrape", "message": "Fetching source text..."})
    
    input_text = body.text or ""
    input_source = "Text Input"
    if body.url:
        input_text = scrape_url(body.url)
        input_source = body.url
        
    preview = input_text[:200] + "..." if len(input_text) > 200 else input_text
    
    yield generate_sse("status", {"step": "extract_done", "message": "Extracting verifiable claims..."})
    extraction = extract_claims(input_text)
    
    if not extraction.claims:
        yield generate_sse("error", {"message": "No verifiable claims found in the text."})
        return
        
    claims_verified = []
    
    for i, claim in enumerate(extraction.claims):
        yield generate_sse("status", {"step": "retrieve", "message": f"Verifying claim {i+1}/{len(extraction.claims)}: {claim.claim_text[:40]}...", "progress": int((i/len(extraction.claims))*80)})
        
        state = {
            "claim": claim,
            "search_queries": [],
            "citations": [],
            "iteration": 0,
            "max_iterations": 2,
            "is_confident": False,
        }
        
        result_state = verifier_app.invoke(state)
        final_verif = result_state.get("final_verification")
        if not final_verif:
            continue
            
        claims_verified.append(final_verif)
        
        yield generate_sse("claim_complete", {"claim": final_verif.model_dump(), "progress": int(((i+1)/len(extraction.claims))*80)})
        
    yield generate_sse("status", {"step": "report", "message": "Running AI and Media detection...", "progress": 90})
    
    ai_res = None
    media_res = None
    if body.enable_ai_detection:
        ai_res = detect_ai_text(input_text)
    if body.enable_media_detection and body.url:
        media_res = detect_media(body.url)
        
    # Calculate overall stats
    verdict_counts = {"True": 0, "False": 0, "Partially True": 0, "Unverifiable": 0}
    score_sum = 0
    for c in claims_verified:
        verdict_counts[c.verdict] = verdict_counts.get(c.verdict, 0) + 1
        if c.verdict == "True": score_sum += 1.0 * c.confidence_score
        elif c.verdict == "Partially True": score_sum += 0.5 * c.confidence_score
        elif c.verdict == "False": score_sum += 0.0
        else: score_sum += 0.5 * c.confidence_score
        
    overall_accuracy = score_sum / len(claims_verified) if claims_verified else 0.0
    
    report = AccuracyReport(
        report_id=report_id,
        input_source=input_source,
        input_type="url" if body.url else "text",
        input_preview=preview,
        claims=claims_verified,
        overall_accuracy_score=overall_accuracy,
        verdict_counts=verdict_counts,
        summary="Verification complete.",
        ai_detection=ai_res,
        media_detection=media_res,
        processing_time_seconds=round(time.time() - start_time, 2),
        created_at=datetime.utcnow().isoformat()
    )
    
    yield generate_sse("done", {"report": report.model_dump(), "progress": 100})

@router.post("/stream")
async def verify_stream_endpoint(request: Request, body: VerifyRequest):
    return StreamingResponse(verify_stream_generator(request, body), media_type="text/event-stream")
