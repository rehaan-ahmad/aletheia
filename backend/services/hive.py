import requests
from config import get_settings

settings = get_settings()

def detect_media(url: str) -> dict:
    if not settings.hive_api_key or settings.hive_api_key.strip() == "":
        return {
            "analyzed_assets": [{"url": url, "asset_type": "image", "deepfake_probability": 0.0, "ai_generated_probability": 0.0, "verdict": "Likely Authentic (Mock Data)"}],
            "overall_verdict": "Likely Authentic (Mock Data)",
            "is_mock": True,
            "available": False
        }
        
    api_url = "https://api.thehive.ai/api/v2/task/sync"
    headers = {
        "Authorization": f"token {settings.hive_api_key}",
        "Content-Type": "application/json"
    }
    data = {"url": url, "classes": [{"class": "ai_generated"}]}
    
    try:
        response = requests.post(api_url, headers=headers, json=data, timeout=15)
        response.raise_for_status()
        res = response.json()
        
        best = res.get("status", [])[0].get("response", {}).get("output", [])[0].get("classes", [])[0] if res.get("status") else None
        score = best.get("score", 0.0) if best else 0.0
        is_synthetic = score > 0.5
        
        asset = {
            "url": url,
            "asset_type": "image",
            "deepfake_probability": score,
            "ai_generated_probability": score,
            "verdict": "Likely Synthetic" if is_synthetic else "Likely Authentic"
        }
        return {
            "analyzed_assets": [asset],
            "overall_verdict": asset["verdict"],
            "is_mock": False,
            "available": True
        }
    except Exception as e:
        print(f"Hive AI Media test failed: {e}")
        return {
            "analyzed_assets": [{"url": url, "asset_type": "image", "deepfake_probability": 0.0, "ai_generated_probability": 0.0, "verdict": "Likely Authentic (Mock Data)"}],
            "overall_verdict": "Likely Authentic (Error Fallback)",
            "is_mock": True,
            "available": False
        }
