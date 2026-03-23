"""
modules/text_detector.py — AI Text Detection module for Aletheia.
"""
import asyncio
import json
import re
import httpx
from google import genai
from config import GEMINI_API_KEY, GEMINI_MODEL, GPTZERO_API_KEY

_gemini_client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

async def gptzero_score(text: str) -> dict:
    """Call GPTZero API to get AI text probability."""
    if not GPTZERO_API_KEY:
        return {"score": -1, "source": "gptzero"}

    url = "https://api.gptzero.me/v2/predict/text"
    headers = {"x-api-key": GPTZERO_API_KEY, "Content-Type": "application/json"}
    body = {"document": text[:5000]}

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=body, timeout=10.0)
            if response.status_code == 200:
                data = response.json()
                doc = data.get("documents", [{}])[0]
                prob = doc.get("completely_generated_prob", 0)
                score = int(prob * 100)
                label = doc.get("predicted_class", "unknown")
                return {"score": score, "label": label, "source": "gptzero"}
            else:
                return {"score": -1, "source": "gptzero"}
    except Exception:
        return {"score": -1, "source": "gptzero"}


GEMINI_STYLE_PROMPT = """Analyze the following text stylometrically to determine if it is AI-generated.
Look for: uniform sentence length, absence of personal anecdotes, excessive hedging phrases, formulaic paragraph structure, lack of typos or colloquialisms, and overly comprehensive coverage without an opinionated stance.

Text: {text}

Return ONLY valid JSON with keys:
- "ai_probability": integer 0-100 indicating likelihood of AI generation
- "reasoning": 2 sentences explaining the stylistic signals found
- "key_signals": list of up to 3 short strings naming the exact stylistic traits found (e.g. "uniform sentence length", "formulaic structure")
"""

async def gemini_style_score(text: str) -> dict:
    """Use Gemini to perform stylometric analysis."""
    fallback = {"score": -1, "reasoning": "", "signals": [], "source": "gemini"}
    if not _gemini_client:
        return fallback

    prompt = GEMINI_STYLE_PROMPT.format(text=text[:5000])

    try:
        response = await asyncio.to_thread(
            _gemini_client.models.generate_content,
            model=GEMINI_MODEL,
            contents=prompt,
        )
        
        raw_text = response.text.strip()
        raw_text = re.sub(r"^```(?:json)?\s*", "", raw_text)
        raw_text = re.sub(r"\s*```$", "", raw_text)
        
        data = json.loads(raw_text)
        
        prob = int(data.get("ai_probability", 0))
        reasoning = data.get("reasoning", "")
        signals = data.get("key_signals", [])
        
        return {
            "score": prob,
            "reasoning": reasoning,
            "signals": signals[:3],
            "source": "gemini"
        }
    except Exception:
        return fallback


async def detect_ai_text(text: str) -> dict:
    """Run both GPTZero and Gemini concurrently and combine scores."""
    gpt_task = gptzero_score(text)
    gemini_task = gemini_style_score(text)
    
    gpt_result, gemini_result = await asyncio.gather(gpt_task, gemini_task)
    
    gpt_s = gpt_result["score"]
    gem_s = gemini_result["score"]
    
    if gpt_s != -1 and gem_s != -1:
        final_score = int(gpt_s * 0.6 + gem_s * 0.4)
    elif gpt_s != -1:
        final_score = gpt_s
    elif gem_s != -1:
        final_score = gem_s
    else:
        final_score = -1
        
    if final_score >= 80:
        label = "AI Generated"
    elif final_score >= 55:
        label = "Likely AI"
    elif final_score >= 35:
        label = "Uncertain"
    elif final_score != -1:
        label = "Likely Human"
    else:
        label = "Unknown"

    return {
        "final_score": final_score,
        "label": label,
        "gptzero": gpt_result,
        "gemini": gemini_result
    }

if __name__ == "__main__":
    async def main():
        sample = "The Great Wall of China is a series of fortifications that were built across the historical northern borders of ancient Chinese states and Imperial China as protection against various nomadic groups from the Eurasian Steppe."
        res = await detect_ai_text(sample)
        print(json.dumps(res, indent=2))
        
    asyncio.run(main())
