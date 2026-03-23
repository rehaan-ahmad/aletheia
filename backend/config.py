from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    # LLM & Search
    gemini_api_key: str
    tavily_api_key: str
    gptzero_api_key: str
    hive_api_key: str = ""

    # Auth
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expire_hours: int = 24

    # DB
    database_url: str = "sqlite+aiosqlite:///./aletheia.db"

    # App
    frontend_url: str = "http://localhost:3000"
    environment: str = "development"

    # Rate limits
    verify_rate_limit: str = "5/hour"
    login_rate_limit: str = "10/15minutes"

    # Pipeline config
    max_claims_per_input: int = 10
    max_search_iterations: int = 3
    max_searches_per_claim: int = 2
    pipeline_timeout_seconds: int = 90

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

@lru_cache()
def get_settings() -> Settings:
    return Settings()
