"""
modules/media_detector.py — Media Detection module for Aletheia.
"""
import asyncio
import base64
import json
import re
import httpx
from bs4 import BeautifulSoup
from google import genai
from google.genai import types

from config import GEMINI_API_KEY, GEMINI_MODEL
from models import MediaResult

_client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

def extract_image_urls(url: str, max_images: int = 3) -> list[str]:
    """Extract and filter image URLs from a webpage."""
    try:
        import requests
        response = requests.get(url, timeout=10)
        html = response.text
    except Exception:
        return []

    soup = BeautifulSoup(html, "html.parser")
    urls = []
    
    og_image = soup.find("meta", property="og:image")
    if og_image and og_image.get("content"):
        urls.append(og_image["content"])
        
    imgs = soup.find_all("img")
    for img in imgs:
        src = img.get("src")
        if src:
            urls.append(src)
            
    filtered = []
    forbidden_words = ["icon", "logo", "avatar", "badge", "button", "sprite", "1x1", "pixel"]
    
    seen = set()
    for u in urls:
        u_lower = u.lower()
        if not u_lower.startswith("http"):
            continue
        if any(fw in u_lower for fw in forbidden_words):
            continue
        if u not in seen:
            seen.add(u)
            filtered.append(u)
            
    return filtered[:max_images]

async def download_image_as_base64(image_url: str) -> tuple[str, str]:
    """Download an image and return (base64_encoded_string, mime_type)."""
    try:
        async with httpx.AsyncClient(follow_redirects=True) as client:
            resp = await client.get(image_url, timeout=10.0)
            if resp.status_code == 200:
                content_type = resp.headers.get("content-type", "image/jpeg").lower()
                valid_mimes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
                if content_type not in valid_mimes:
                    content_type = "image/jpeg"
                    
                b64_str = base64.b64encode(resp.content).decode("utf-8")
                return b64_str, content_type
    except Exception:
        pass
    return "", ""

MEDIA_PROMPT = """Analyze this image to determine if it is AI-generated.
Examine for: unnatural skin textures, inconsistent lighting, distorted hands/teeth/hair edges, background warping, uncanny valley facial features, garbled in-image text, and inconsistent shadows.
Be conservative — only say "AI-Generated" when multiple strong artifacts are present.

Return ONLY valid JSON with keys:
- "verdict": one of "AI-Generated", "Likely AI", "Likely Real", "Real"
- "confidence": integer 0-100 indicating confidence in your verdict
- "artifacts": list of strings detailing any strange artifacts found
- "regions_of_concern": list of strings detailing which parts of the image look suspicious
"""

async def analyze_image(image_url: str) -> MediaResult:
    """Analyze a single image via Gemini Vision."""
    fallback = MediaResult(
        image_url=image_url,
        verdict="Unanalyzable",
        confidence=0,
        artifacts=["Failed to analyze image or missing API key"]
    )
    
    if not _client:
        return fallback

    b64_str, mime_type = await download_image_as_base64(image_url)
    if not b64_str:
        return MediaResult(
            image_url=image_url,
            verdict="Unanalyzable",
            confidence=0,
            artifacts=["Failed to download image"]
        )

    image_bytes = base64.b64decode(b64_str)
    
    try:
        part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
        
        response = await asyncio.to_thread(
            _client.models.generate_content,
            model=GEMINI_MODEL,
            contents=[part, MEDIA_PROMPT],
        )
        
        raw_text = response.text.strip()
        raw_text = re.sub(r"^```(?:json)?\s*", "", raw_text)
        raw_text = re.sub(r"\s*```$", "", raw_text)
        
        data = json.loads(raw_text)
        
        valid_verdicts = ["AI-Generated", "Likely AI", "Likely Real", "Real"]
        verdict = data.get("verdict", "Unanalyzable")
        if verdict not in valid_verdicts:
            verdict = "Unanalyzable"
            
        conf = data.get("confidence", 0)
        try:
            conf = int(conf)
        except (ValueError, TypeError):
            conf = 0
            
        artifacts = data.get("artifacts", [])
        
        return MediaResult(
            image_url=image_url,
            verdict=verdict,
            confidence=conf,
            artifacts=artifacts
        )
        
    except Exception as e:
        return fallback

async def analyze_article_media(url: str) -> list[MediaResult]:
    """Batch analyze images from an article URL."""
    image_urls = await asyncio.to_thread(extract_image_urls, url)
    if not image_urls:
        return []
        
    tasks = [analyze_image(u) for u in image_urls]
    results = await asyncio.gather(*tasks)
    return list(results)

if __name__ == "__main__":
    async def main():
        url = "https://example.com"
        print(f"Batch analyzing media from {url}...")
        results = await analyze_article_media(url)
        for r in results:
            print(r.model_dump_json(indent=2))
            
    asyncio.run(main())
