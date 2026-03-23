from langchain_google_genai import ChatGoogleGenerativeAI
from config import get_settings

settings = get_settings()

def get_gemini_model(temperature=0.0):
    return ChatGoogleGenerativeAI(
        model="gemini-1.5-pro",
        temperature=temperature,
        google_api_key=settings.gemini_api_key,
        max_output_tokens=8192
    )
