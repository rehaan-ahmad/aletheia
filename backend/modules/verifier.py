"""
modules/verifier.py — Claim verification module for Aletheia.
"""
import json
import re
import asyncio
from typing import List, Dict, Any
from google import genai

from config import GEMINI_API_KEY, GEMINI_MODEL
from models import ClaimResult

_client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

VERIFIER_PROMPT = """You are an expert fact-checker. 
Analyze the claim based strictly on the provided evidence.

Claim: {claim}

Search Query Used: {query}

Evidence:
{evidence_block}

Please reason through the following steps:
1. Summarise what the evidence says about the claim.
2. Identify any conflicts or contradictions across sources.
3. Classify as one of: 'True', 'False', 'Partially True', 'Unverifiable' — based ONLY on the evidence, not training knowledge.
4. Assign a confidence score 0-100 (80-100=multiple authoritative sources agree, 50-79=some support with gaps, 20-49=weak or conflicting, 0-19=essentially no evidence).

Return ONLY valid JSON with keys: "reasoning", "verdict", "confidence", "key_source".
Do not include any explanation outside the JSON.
"""

async def verify_claim(claim: str, sources: List[Dict[str, Any]], query_used: str) -> ClaimResult:
    """Verify a claim purely based on retrieved sources using Gemini."""
    if not sources:
        evidence_block = "No evidence retrieved"
    else:
        blocks = []
        for i, source in enumerate(sources, 1):
            title = source.get('title', 'No Title')
            url = source.get('url', 'No URL')
            content = source.get('content', '')
            blocks.append(f"[{i}] {title} ({url})\n{content}")
        evidence_block = "\n\n".join(blocks)
    
    prompt = VERIFIER_PROMPT.format(
        claim=claim,
        query=query_used,
        evidence_block=evidence_block
    )

    valid_verdicts = {"True", "False", "Partially True", "Unverifiable"}
    
    fallback_result = ClaimResult(
        claim=claim,
        verdict="Unverifiable",
        confidence=0,
        reasoning="Verification failed or Gemini API key missing.",
        sources=[s.get('url', '') for s in sources],
        search_query_used=query_used
    )

    if not _client:
        return fallback_result

    try:
        response = await asyncio.to_thread(
            _client.models.generate_content,
            model=GEMINI_MODEL,
            contents=prompt,
        )
        
        raw_text = response.text.strip()
        raw_text = re.sub(r"^```(?:json)?\s*", "", raw_text)
        raw_text = re.sub(r"\s*```$", "", raw_text)
        raw_text = raw_text.strip()
        
        data = json.loads(raw_text)
        
        verdict = data.get("verdict", "Unverifiable")
        if verdict not in valid_verdicts:
            verdict = "Unverifiable"
            
        confidence = data.get("confidence", 0)
        try:
            confidence = int(confidence)
        except (ValueError, TypeError):
            confidence = 0
        confidence = max(0, min(100, confidence))
        
        reasoning_str = data.get("reasoning", "")
        
        return ClaimResult(
            claim=claim,
            verdict=verdict,
            confidence=confidence,
            reasoning=reasoning_str,
            sources=[s.get('url', '') for s in sources],
            search_query_used=query_used
        )
    except Exception:
        return fallback_result

if __name__ == "__main__":
    async def main():
        claim = "The Great Wall of China is visible from space with the naked eye."
        sources = [
            {
                "title": "NASA - Is the Great Wall Visible?",
                "url": "https://www.nasa.gov/vision/space/workinginspace/great_wall.html",
                "content": "Despite the myth, no human structure, including the Great Wall of China, is visible from low Earth orbit without magnification."
            }
        ]
        result = await verify_claim(claim, sources, "Great Wall of China visible from space naked eye")
        print(result.model_dump_json(indent=2))
        
    asyncio.run(main())
