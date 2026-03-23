import requests
from config import get_settings

settings = get_settings()

def detect_ai_text(text: str) -> dict:
    url = "https://api.gptzero.me/v2/predict/text"
    headers = {
        "x-api-key": settings.gptzero_api_key,
        "Content-Type": "application/json"
    }
    data = {
        "document": text,
        "version": "2024-01-09"
    }
    try:
        response = requests.post(url, headers=headers, json=data, timeout=10)
        response.raise_for_status()
        res_data = response.json()
        doc = res_data.get("documents", [{}])[0]
        
        prob = doc.get("completely_generated_prob", 0.0)
        human_prob = doc.get("completely_human_prob", 1.0)
        
        if prob > 0.7:
            classification = "AI-Generated"
        elif prob < 0.3:
            classification = "Human-Written"
        else:
            classification = "Mixed"
            
        sentence_scores = []
        for s in doc.get("sentences", []):
            sentence_scores.append({
                "sentence": s.get("sentence", ""),
                "generated_prob": s.get("generated_prob", 0.0),
                "perplexity": s.get("perplexity")
            })
            
        return {
            "ai_probability": prob,
            "human_probability": human_prob,
            "sentence_scores": sentence_scores,
            "classification": classification,
            "is_mock": False
        }
    except Exception as e:
        print(f"GPTZero failed: {e}")
        return {
            "ai_probability": 0.0,
            "human_probability": 1.0,
            "sentence_scores": [],
            "classification": "Human-Written",
            "is_mock": True
        }
