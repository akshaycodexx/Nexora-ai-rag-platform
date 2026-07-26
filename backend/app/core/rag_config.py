import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class RAGSettings(BaseSettings):
    CHUNK_SIZE: int = 1500
    CHUNK_OVERLAP: int = 300
    SIMILARITY_THRESHOLD: float = 0.10  # Minimum cosine similarity score threshold (relaxed for semantic queries)

    TOP_K: int = 4
    EMBEDDING_MODEL_NAME: str = "sentence-transformers/all-MiniLM-L6-v2"
    EMBEDDING_PROVIDER: str = "local"
    EMBEDDING_API_KEY: str = ""
    UPLOAD_DIR: str = os.path.join(os.getcwd(), "uploaded_pdfs")

    # LLM Settings
    LLM_PROVIDER: str = "gemini"  # "gemini" | "openai" | "groq" | "custom_openai_http" | "extractive"
    CUSTOM_LLM_NAME: str = "gemini-1.5-flash"
    CUSTOM_LLM_BASE_URL: str = ""
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    GROQ_API_KEY: str = ""

    # Vector DB & Storage
    VECTOR_DB_PROVIDER: str = "qdrant"
    VECTOR_DB_PATH: str = "./sql_app.db"
    QDRANT_URL: str = "https://1a1b0b80-d407-458e-8f58-0abfb6639354.sa-east-1-0.aws.cloud.qdrant.io"

    QDRANT_API_KEY: str = ""
    QDRANT_COLLECTION_NAME: str = "nexora_documents"
    BLOCKED_KEYWORDS: str = ""
    ENABLE_PII_REDACTOR: bool = False
    ENABLE_BLOCKED_WORDS: bool = False
    ENABLE_ANTI_HALLUCINATION: bool = False

    # External Database Credentials
    ACTIVE_DB_TYPE: str = "sqlite"
    DB_CONNECTION_URL: str = ""
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str = "nexora_db"
    DB_USERNAME: str = ""
    DB_PASSWORD: str = ""
    DB_API_KEY: str = ""


    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

rag_settings = RAGSettings()

def sync_rag_settings(db=None):
    """Synchronize database SystemSettings model into runtime rag_settings."""
    close_db = False
    if db is None:
        try:
            from app.db.database import SessionLocal
            db = SessionLocal()
            close_db = True
        except Exception:
            return

    try:
        from app.models.settings import SystemSettings
        settings_obj = db.query(SystemSettings).first()
        if settings_obj:
            if settings_obj.custom_llm_provider:
                rag_settings.LLM_PROVIDER = settings_obj.custom_llm_provider
            if settings_obj.custom_llm_name:
                rag_settings.CUSTOM_LLM_NAME = settings_obj.custom_llm_name
            if settings_obj.custom_llm_base_url:
                rag_settings.CUSTOM_LLM_BASE_URL = settings_obj.custom_llm_base_url
            if settings_obj.gemini_api_key:
                rag_settings.GEMINI_API_KEY = settings_obj.gemini_api_key
            if settings_obj.openai_api_key:
                rag_settings.OPENAI_API_KEY = settings_obj.openai_api_key
            if settings_obj.groq_api_key:
                rag_settings.GROQ_API_KEY = settings_obj.groq_api_key
            if settings_obj.similarity_threshold:
                rag_settings.SIMILARITY_THRESHOLD = settings_obj.similarity_threshold
            if settings_obj.top_k:
                rag_settings.TOP_K = settings_obj.top_k
            if settings_obj.vector_db_provider:
                rag_settings.VECTOR_DB_PROVIDER = settings_obj.vector_db_provider
            if settings_obj.vector_db_path:
                rag_settings.VECTOR_DB_PATH = settings_obj.vector_db_path
            if hasattr(settings_obj, "blocked_keywords") and settings_obj.blocked_keywords is not None:
                rag_settings.BLOCKED_KEYWORDS = settings_obj.blocked_keywords
            if hasattr(settings_obj, "enable_pii_redactor") and settings_obj.enable_pii_redactor is not None:
                rag_settings.ENABLE_PII_REDACTOR = settings_obj.enable_pii_redactor
            if hasattr(settings_obj, "enable_blocked_words") and settings_obj.enable_blocked_words is not None:
                rag_settings.ENABLE_BLOCKED_WORDS = settings_obj.enable_blocked_words
            if hasattr(settings_obj, "enable_anti_hallucination") and settings_obj.enable_anti_hallucination is not None:
                rag_settings.ENABLE_ANTI_HALLUCINATION = settings_obj.enable_anti_hallucination
            if hasattr(settings_obj, "active_db_type") and settings_obj.active_db_type:
                rag_settings.ACTIVE_DB_TYPE = settings_obj.active_db_type
            if hasattr(settings_obj, "db_connection_url") and settings_obj.db_connection_url:
                rag_settings.DB_CONNECTION_URL = settings_obj.db_connection_url
            if hasattr(settings_obj, "db_host") and settings_obj.db_host:
                rag_settings.DB_HOST = settings_obj.db_host
            if hasattr(settings_obj, "db_port") and settings_obj.db_port:
                rag_settings.DB_PORT = settings_obj.db_port
            if hasattr(settings_obj, "db_name") and settings_obj.db_name:
                rag_settings.DB_NAME = settings_obj.db_name
            if hasattr(settings_obj, "db_username") and settings_obj.db_username:
                rag_settings.DB_USERNAME = settings_obj.db_username
            if hasattr(settings_obj, "db_password") and settings_obj.db_password:
                rag_settings.DB_PASSWORD = settings_obj.db_password
            if hasattr(settings_obj, "db_api_key") and settings_obj.db_api_key:
                rag_settings.DB_API_KEY = settings_obj.db_api_key
    except Exception as e:
        print(f"Notice: sync_rag_settings DB sync bypass: {e}")
    finally:
        if close_db and db:
            db.close()
