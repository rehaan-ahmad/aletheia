"""
modules/searcher.py — Evidence retrieval module for Aletheia.
"""
import asyncio
from google import genai
from tavily import TavilyClient

from config import GEMINI_API_KEY, GEMINI_MODEL, TAVILY_API_KEY

_gemini_client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None
_tavily_client = TavilyClient(api_key=TAVILY_API_KEY) if TAVILY_API_KEY else None

SEARCH_QUERY_PROMPT = """Generate a single search query (4-8 keyword-style words) targeting the most specific verifiable element of the following claim.
Return ONLY the query string. No explanation, no quotes, no preamble.

Claim: {claim}"""

async def generate_search_query(claim: str) -> str:
    """Generate a concise search query for a claim using Gemini."""
    if not _gemini_client:
        return claim[:50]  # Fallback

    prompt = SEARCH_QUERY_PROMPT.format(claim=claim)
    try:
        response = await asyncio.to_thread(
            _gemini_client.models.generate_content,
            model=GEMINI_MODEL,
            contents=prompt,
        )
        query = response.text.strip().replace('"', '').replace("'", "")
        return query
    except Exception:
        return claim[:50]

async def search_evidence(query: str) -> list[dict]:
    """Search for evidence using Tavily."""
    if not _tavily_client:
        return []
    
    try:
        response = await asyncio.to_thread(
            _tavily_client.search,
            query=query,
            search_depth="advanced",
            max_results=4,
            include_answer=True
        )
        results = []
        for res in response.get("results", []):
            results.append({
                "title": res.get("title", ""),
                "url": res.get("url", ""),
                "content": res.get("content", "")[:600],
                "relevance_score": res.get("score", 0.0)
            })
        return results
    except Exception as e:
        return []

async def get_evidence_for_claim(claim: str) -> tuple[str, list[dict]]:
    """Chain query generation and search."""
    query = await generate_search_query(claim)
    sources = await search_evidence(query)
    return query, sources

if __name__ == "__main__":
    async def main():
        claim = "Tim Cook became the CEO of Apple Inc. in August 2011."
        print(f"Claim: {claim}")
        query, sources = await get_evidence_for_claim(claim)
        print(f"Generated Query: {query}")
        print(f"Found {len(sources)} sources:")
        for s in sources:
            print(f"- {s['title']} ({s['url']})")
    
    asyncio.run(main())
