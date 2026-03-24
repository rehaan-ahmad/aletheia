import uuid
import time
from datetime import datetime

DEMOS = {
  "NASA was established on July 29, 1958. It succeeded the National Advisory Committee for Aeronautics (NACA). The agency is responsible for the civilian space program, as well as aeronautics and space research.": {
      "type": "factual",
      "claims": [
          {"id": "1", "text": "NASA was established on July 29, 1958.", "verdict": "True", "score": 0.99},
          {"id": "2", "text": "It succeeded the National Advisory Committee for Aeronautics (NACA).", "verdict": "True", "score": 0.98},
          {"id": "3", "text": "The agency is responsible for the civilian space program, as well as aeronautics and space research.", "verdict": "True", "score": 0.99}
      ]
  },
  "Albert Einstein failed mathematics in school and was considered a poor student. The Great Wall of China is visible from space with the naked eye. Humans only use 10% of their brains at any given time. Napoleon Bonaparte was unusually short, standing at just 5 feet 2 inches tall.": {
      "type": "misinfo",
      "claims": [
          {"id": "4", "text": "Albert Einstein failed mathematics in school and was considered a poor student.", "verdict": "False", "score": 0.95},
          {"id": "5", "text": "The Great Wall of China is visible from space with the naked eye.", "verdict": "False", "score": 0.98},
          {"id": "6", "text": "Humans only use 10% of their brains at any given time.", "verdict": "False", "score": 0.99},
          {"id": "7", "text": "Napoleon Bonaparte was unusually short, standing at just 5 feet 2 inches tall.", "verdict": "False", "score": 0.96}
      ]
  },
  "Social media usage is directly linked to increased rates of depression in teenagers. The global average temperature has risen by exactly 1.1 degrees Celsius since pre-industrial times. Drinking coffee significantly reduces the risk of developing Alzheimer's disease.": {
      "type": "conflict",
      "claims": [
          {"id": "8", "text": "Social media usage is directly linked to increased rates of depression in teenagers.", "verdict": "Partially True", "score": 0.85},
          {"id": "9", "text": "The global average temperature has risen by exactly 1.1 degrees Celsius since pre-industrial times.", "verdict": "Partially True", "score": 0.90},
          {"id": "10", "text": "Drinking coffee significantly reduces the risk of developing Alzheimer's disease.", "verdict": "Unverifiable", "score": 0.70}
      ]
  }
}

def is_demo_text(text: str) -> bool:
    return text.strip() in DEMOS

def get_demo_events(text: str, report_id: str):
    text = text.strip()
    demo_data = DEMOS[text]
    
    yield "status", {"step": "extract_done", "message": "Extracting verifiable claims (Seeded DB)...", "progress": 10}
    
    yield "status", {"step": "retrieve", "message": "Verifying seeded claims concurrently...", "progress": 20}
    
    claims_verified = []
    
    for idx, c in enumerate(demo_data["claims"]):
        claim_obj = {
            "claim_id": c["id"],
            "claim_text": c["text"],
            "original_context": c["text"],
            "verdict": c["verdict"],
            "confidence_score": c["score"],
            "justification": f"This is a pre-seeded verification for demo purposes demonstrating a {c['verdict']} claim. In a production run, LangGraph would evaluate this live.",
            "reasoning_chain": "1. Identified exact string match against seeded demo cache.\n2. Loaded cached assertion and confidence metrics.\n3. Short-circuited FIRE iteration to deliver an instant response.",
            "citations": [
                {"url": "https://database.aletheia.io/static-cache", "title": "Verified Fast-Track Fact Database (Cache)", "snippet": c["text"], "credibility_tier": "high"}
            ],
            "search_queries_used": ["demo static cache lookup"],
            "conflict_detected": c["verdict"] == "Partially True",
            "temporal_flag": False
        }
        claims_verified.append(claim_obj)
        
        progress = 20 + int(((idx + 1) / len(demo_data["claims"])) * 60)
        yield "claim_complete", {"claim": claim_obj, "progress": progress}
        
    yield "status", {"step": "report", "message": "Running pre-cached detection pipelines...", "progress": 90}
    
    ai_res = {
        "ai_probability": 0.05,
        "human_probability": 0.95,
        "sentence_scores": [],
        "classification": "Human-Written",
        "is_mock": True
    }
    
    verdict_counts = {"True": 0, "False": 0, "Partially True": 0, "Unverifiable": 0}
    score_sum = 0
    for c in claims_verified:
        verdict_counts[c["verdict"]] += 1
        if c["verdict"] == "True": score_sum += 1.0 * c["confidence_score"]
        elif c["verdict"] == "Partially True": score_sum += 0.5 * c["confidence_score"]
        elif c["verdict"] == "False": score_sum += 0.0
        else: score_sum += 0.5 * c["confidence_score"]
        
    overall_accuracy = score_sum / len(claims_verified) if claims_verified else 0.0
    
    report = {
        "report_id": report_id,
        "input_source": "Text Input",
        "input_type": "text",
        "input_preview": text[:200] + "..." if len(text) > 200 else text,
        "claims": claims_verified,
        "overall_accuracy_score": overall_accuracy,
        "verdict_counts": verdict_counts,
        "summary": f"Verification immediately complete for seeded cache demo: {demo_data['type']}.",
        "ai_detection": ai_res,
        "media_detection": None,
        "processing_time_seconds": 1.25,
        "created_at": datetime.utcnow().isoformat()
    }
    
    yield "done", {"report": report, "progress": 100}
