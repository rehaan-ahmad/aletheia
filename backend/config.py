import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
GPTZERO_API_KEY = os.getenv("GPTZERO_API_KEY")

# Startup check
if not all([GEMINI_API_KEY, TAVILY_API_KEY, GPTZERO_API_KEY]):
    print("WARNING: One or more API keys (GEMINI_API_KEY, TAVILY_API_KEY, GPTZERO_API_KEY) are missing in .env")
