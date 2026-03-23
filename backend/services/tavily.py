from duckduckgo_search import DDGS
from config import get_settings

settings = get_settings()

def search_tavily(query: str, search_depth: str = "advanced", max_results: int = 5) -> list[dict]:
    """
    Substituted Tavily with DuckDuckGo for free generous use.
    Retaining functional signature to avoid refactoring upstream orchestrator.
    """
    try:
        results = []
        with DDGS() as ddgs:
            for r in ddgs.text(query, max_results=max_results):
                results.append({
                    "url": r.get("href"),
                    "title": r.get("title"),
                    "content": r.get("body")
                })
        return results
    except Exception as e:
        print(f"DuckDuckGo search failed for query '{query}': {e}")
        return []
