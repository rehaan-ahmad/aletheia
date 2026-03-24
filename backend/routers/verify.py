import json
import uuid
import time
import asyncio
from datetime import datetime
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse

from schemas import VerifyRequest, AccuracyReport, ClaimVerification
from services.scraper import scrape_url
from services.extractor import extract_claims
from services.verifier import build_verifier_graph
from services.gptzero import detect_ai_text
from services.hive import detect_media
from services.demo_seeder import get_demo_events, is_demo_text

router = APIRouter()
verifier_app = build_verifier_graph()

def generate_sse(event: str, data: dict):
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"

async def verify_stream_generator(request: Request, body: VerifyRequest):
    start_time = time.time()
    report_id = str(uuid.uuid4())
    input_text = body.text or ""
    
    if body.url:
        yield generate_sse("status", {"step": "scrape", "message": "Fetching source text...", "progress": 5})
        try:
            input_text = await asyncio.to_thread(scrape_url, body.url)
        except:
            pass
            
    input_source = body.url if body.url else "Text Input"
    
    # --- INSTANT SEEDED CACHE DEMOS ---
    if is_demo_text(input_text):
        for event, data in get_demo_events(input_text, report_id):
            yield generate_sse(event, data)
            await asyncio.sleep(0.4) # Add tiny synthetic visual delay
        return

    preview = input_text[:200] + "..." if len(input_text) > 200 else input_text
    yield generate_sse("status", {"step": "extract_done", "message": "Extracting verifiable claims...", "progress": 10})
    
    # Run LLM extractor in parallel worker
    extraction = await asyncio.to_thread(extract_claims, input_text)
    
    if not extraction.claims:
        yield generate_sse("error", {"message": "No verifiable claims found in the submitted text."})
        return
        
    claims_verified = []
    
    yield generate_sse("status", {"step": "retrieve", "message": f"Queueing {len(extraction.claims)} claims across concurrent threads...", "progress": 20})
    
    queue = asyncio.Queue()
    
    # Process multiple langgraph cycles perfectly in parallel
    async def process_claim(i, claim):
        state = {
            "claim": claim,
            "search_queries": [],
            "citations": [],
            "iteration": 0,
            "max_iterations": 1,
            "is_confident": False,
        }
        try:
            result_state = await asyncio.to_thread(verifier_app.invoke, state)
            final_verif = result_state.get("final_verification")
            await queue.put((i, final_verif))
        except Exception as e:
            print(f"Claim verification failed: {e}")
            await queue.put((i, None))

    # Dispatch tasks to thread-pool concurrently
    tasks = [asyncio.create_task(process_claim(i, claim)) for i, claim in enumerate(extraction.claims)]
    
    completed = 0
    while completed < len(tasks):
        i, final_verif = await queue.get()
        completed += 1
        if final_verif:
            claims_verified.append(final_verif)
            progress = 20 + int((completed / len(tasks)) * 60)
            yield generate_sse("claim_complete", {"claim": final_verif.model_dump(), "progress": progress})
            
    yield generate_sse("status", {"step": "report", "message": "Compiling analytics...", "progress": 85})
    
    ai_res = None
    media_res = None
    
    async def get_ai():
        return await asyncio.to_thread(detect_ai_text, input_text)
        
    async def get_med():
        return await asyncio.to_thread(detect_media, body.url)
        
    if body.enable_ai_detection:
        ai_res = await get_ai()
    if body.enable_media_detection and body.url:
        media_res = await get_med()
        
    # Stats processing
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
        summary="Parallel Verification finalized securely.",
        ai_detection=ai_res,
        media_detection=media_res,
        processing_time_seconds=round(time.time() - start_time, 2),
        created_at=datetime.utcnow().isoformat()
    )
    
    yield generate_sse("done", {"report": report.model_dump(), "progress": 100})

@router.post("/stream")
async def verify_stream_endpoint(request: Request, body: VerifyRequest):
    return StreamingResponse(verify_stream_generator(request, body), media_type="text/event-stream")
