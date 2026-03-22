"""
modules/extractor.py — Claim extraction module for Aletheia.

Two responsibilities:
1. URL-to-text extraction (trafilatura + newspaper3k fallback)
2. Claim extraction via Google Gemini
"""

import json
import re
import asyncio

import trafilatura
from newspaper import Article
from google import genai

from config import GEMINI_API_KEY, GEMINI_MODEL


# ---------------------------------------------------------------------------
# URL-to-text extraction
# ---------------------------------------------------------------------------

def fetch_article_text(url: str) -> str:
    """
    Extract article text from a URL.
    Tries trafilatura first, falls back to newspaper3k.
    Raises ValueError if both methods fail.
    """
    # Attempt 1: trafilatura
    try:
        downloaded = trafilatura.fetch_url(url)
        if downloaded:
            text = trafilatura.extract(downloaded)
            if text and len(text) > 200:
                return text
    except Exception:
        pass

    # Attempt 2: newspaper3k fallback
    try:
        article = Article(url)
        article.download()
        article.parse()
        if article.text and len(article.text) > 200:
            return article.text
    except Exception:
        pass

    raise ValueError(
        f"Could not extract readable text from URL: {url}. "
        "The page may be paywalled, require JavaScript, or contain too little text."
    )


# ---------------------------------------------------------------------------
# Claim extraction via Gemini
# ---------------------------------------------------------------------------

# Initialise Google GenAI client
_client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

CLAIM_EXTRACTION_PROMPT = """You are a fact-checking assistant. Your task is to extract verifiable, atomic, self-contained factual claims from the given text.

Rules:
1. Extract ONLY verifiable factual claims — no opinions, predictions, or subjective statements.
2. Each claim must be atomic (one fact per claim) and self-contained (no pronouns — use full names/entities).
3. Rephrase any claim that relies on pronouns or context to be fully self-contained.
4. Extract a MAXIMUM of 12 claims, prioritising the most significant and newsworthy ones.
5. Return ONLY a valid JSON array of strings. No markdown, no code fences, no preamble, no explanation.

Text to analyze:
{text}"""


async def extract_claims(text: str) -> list[str]:
    """
    Use Gemini to extract verifiable factual claims from text.
    Returns a list of claim strings.
    """
    if not _client:
        raise RuntimeError("Gemini client not initialised — check GEMINI_API_KEY in .env")

    # Cap input text at 8000 characters
    truncated_text = text[:8000]

    prompt = CLAIM_EXTRACTION_PROMPT.format(text=truncated_text)

    # Call Gemini
    response = await asyncio.to_thread(
        _client.models.generate_content,
        model=GEMINI_MODEL,
        contents=prompt,
    )

    raw_text = response.text.strip()

    # Strip markdown code fences if present
    raw_text = re.sub(r"^```(?:json)?\s*", "", raw_text)
    raw_text = re.sub(r"\s*```$", "", raw_text)
    raw_text = raw_text.strip()

    # Parse JSON
    try:
        claims = json.loads(raw_text)
    except json.JSONDecodeError as e:
        raise ValueError(f"Gemini returned invalid JSON for claim extraction: {e}\nRaw: {raw_text[:500]}")

    # Validate that result is a list
    if not isinstance(claims, list):
        raise ValueError(f"Expected a list of claims, got {type(claims).__name__}")

    return claims


# ---------------------------------------------------------------------------
# Standalone test
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    sample_text = (
        "The Great Wall of China was built over many centuries, with the most "
        "well-known sections built during the Ming Dynasty (1368-1644). The wall "
        "stretches approximately 13,171 miles according to a 2012 survey by China's "
        "State Administration of Cultural Heritage. Tim Cook became the CEO of Apple "
        "Inc. in August 2011, succeeding Steve Jobs. The company's headquarters, "
        "Apple Park, is located in Cupertino, California, and was completed in 2017."
    )

    async def main():
        print("=" * 60)
        print("Testing claim extraction...")
        print("=" * 60)
        claims = await extract_claims(sample_text)
        print(f"\nExtracted {len(claims)} claims:\n")
        for i, claim in enumerate(claims, 1):
            print(f"  {i}. {claim}")

    asyncio.run(main())
