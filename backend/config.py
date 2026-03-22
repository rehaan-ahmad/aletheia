"""
config.py — Environment variable loader for Aletheia backend.
Loads API keys from .env and exports them as module-level constants.
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# API Keys
GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
TAVILY_API_KEY: str = os.getenv("TAVILY_API_KEY", "")
GPTZERO_API_KEY: str = os.getenv("GPTZERO_API_KEY", "")

# Model configuration
GEMINI_MODEL: str = "gemini-2.0-flash"

# Startup validation — warn about missing keys
_required_keys = {
    "GEMINI_API_KEY": GEMINI_API_KEY,
    "TAVILY_API_KEY": TAVILY_API_KEY,
    "GPTZERO_API_KEY": GPTZERO_API_KEY,
}

_missing = [name for name, value in _required_keys.items() if not value]
if _missing:
    print(f"⚠️  WARNING: The following API keys are missing or empty: {', '.join(_missing)}")
    print("   Some features will not work without them. Check your backend/.env file.")
