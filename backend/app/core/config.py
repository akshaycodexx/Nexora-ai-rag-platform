import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Nexora Enterprise RAG & Auth System"
    SECRET_KEY: str = "supersecretkey_change_in_production_environment_12345"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    DATABASE_URL: str = "sqlite:///./sql_app.db"
    DATABASE_URL_AUTO_CREATE: str = "false"

    LLM_PROVIDER: str = "gemini"
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    GROQ_API_KEY: str = ""

    QDRANT_URL: str = "https://1a1b0b80-d407-458e-8f58-0abfb6639354.sa-east-1-0.aws.cloud.qdrant.io"

    QDRANT_API_KEY: str = ""
    QDRANT_COLLECTION_NAME: str = "nexora_documents"


    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
