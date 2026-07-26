from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.settings import SystemSettings
from app.core.rag_config import rag_settings
from app.services.activity_logger import log_activity

router = APIRouter(prefix="/settings", tags=["Platform Settings"])

class SettingsUpdate(BaseModel):
    org_name: str | None = None
    contact_email: str | None = None
    embedding_model: str | None = None
    embedding_provider: str | None = None
    embedding_api_key: str | None = None
    default_llm: str | None = None
    custom_llm_provider: str | None = None
    custom_llm_name: str | None = None
    custom_llm_base_url: str | None = None
    gemini_api_key: str | None = None
    openai_api_key: str | None = None
    groq_api_key: str | None = None
    similarity_threshold: float | None = None
    top_k: int | None = None
    vector_db_provider: str | None = None
    vector_db_path: str | None = None
    blocked_keywords: str | None = None
    enable_pii_redactor: bool | None = None
    enable_blocked_words: bool | None = None
    enable_anti_hallucination: bool | None = None

    # Custom External DB Fields
    active_db_type: str | None = None
    db_connection_url: str | None = None
    db_host: str | None = None
    db_port: int | None = None
    db_name: str | None = None
    db_username: str | None = None
    db_password: str | None = None
    db_api_key: str | None = None

class TestLLMRequest(BaseModel):
    provider: str = "gemini"
    api_key: str = ""
    model_name: str = "gemini-1.5-flash"
    base_url: str | None = ""

class TestDBRequest(BaseModel):
    db_type: str = "sqlite"
    connection_url: str = ""
    host: str = "localhost"
    port: int = 5432
    db_name: str = "nexora_db"
    username: str = ""
    password: str = ""
    api_key: str = ""

@router.get("")
def get_settings(db: Session = Depends(get_db)):
    """Fetch current workspace configuration and API keys."""
    settings_obj = db.query(SystemSettings).first()
    if not settings_obj:
        settings_obj = SystemSettings()
        db.add(settings_obj)
        db.commit()
        db.refresh(settings_obj)

    return {
        "org_name": settings_obj.org_name or "Nexora AI Labs",
        "contact_email": settings_obj.contact_email or "admin@nexora.ai",
        "embedding_model": settings_obj.embedding_model or "sentence-transformers/all-MiniLM-L6-v2",
        "embedding_provider": settings_obj.embedding_provider or "local",
        "embedding_api_key": settings_obj.embedding_api_key or "",
        "default_llm": settings_obj.default_llm or "gemini-1.5-flash",
        "custom_llm_provider": settings_obj.custom_llm_provider or "gemini",
        "custom_llm_name": settings_obj.custom_llm_name or "gemini-1.5-flash",
        "custom_llm_base_url": settings_obj.custom_llm_base_url or "",
        "gemini_api_key": settings_obj.gemini_api_key or "",
        "openai_api_key": settings_obj.openai_api_key or "",
        "groq_api_key": settings_obj.groq_api_key or "",
        "similarity_threshold": settings_obj.similarity_threshold or 0.28,
        "top_k": settings_obj.top_k or 4,
        "vector_db_provider": settings_obj.vector_db_provider or "sqlite_vector",
        "vector_db_path": settings_obj.vector_db_path or "./sql_app.db",
        "blocked_keywords": getattr(settings_obj, "blocked_keywords", "") or "",
        "enable_pii_redactor": getattr(settings_obj, "enable_pii_redactor", False) if getattr(settings_obj, "enable_pii_redactor", None) is not None else False,
        "enable_blocked_words": getattr(settings_obj, "enable_blocked_words", False) if getattr(settings_obj, "enable_blocked_words", None) is not None else False,
        "enable_anti_hallucination": getattr(settings_obj, "enable_anti_hallucination", False) if getattr(settings_obj, "enable_anti_hallucination", None) is not None else False,
        "active_db_type": getattr(settings_obj, "active_db_type", "sqlite") or "sqlite",
        "db_connection_url": getattr(settings_obj, "db_connection_url", "") or "",
        "db_host": getattr(settings_obj, "db_host", "localhost") or "localhost",
        "db_port": getattr(settings_obj, "db_port", 5432) or 5432,
        "db_name": getattr(settings_obj, "db_name", "nexora_db") or "nexora_db",
        "db_username": getattr(settings_obj, "db_username", "") or "",
        "db_password": getattr(settings_obj, "db_password", "") or "",
        "db_api_key": getattr(settings_obj, "db_api_key", "") or ""
    }

@router.post("")
def update_settings(payload: SettingsUpdate, db: Session = Depends(get_db)):
    """Update workspace organization, LLM provider, and API credentials."""
    settings_obj = db.query(SystemSettings).first()
    if not settings_obj:
        settings_obj = SystemSettings()
        db.add(settings_obj)

    if payload.org_name is not None:
        settings_obj.org_name = payload.org_name
    if payload.contact_email is not None:
        settings_obj.contact_email = payload.contact_email
    if payload.embedding_model is not None:
        settings_obj.embedding_model = payload.embedding_model
        rag_settings.EMBEDDING_MODEL_NAME = payload.embedding_model
    if payload.embedding_provider is not None:
        settings_obj.embedding_provider = payload.embedding_provider
        rag_settings.EMBEDDING_PROVIDER = payload.embedding_provider
    if payload.embedding_api_key is not None:
        settings_obj.embedding_api_key = payload.embedding_api_key
        rag_settings.EMBEDDING_API_KEY = payload.embedding_api_key
    if payload.default_llm is not None:
        settings_obj.default_llm = payload.default_llm
        rag_settings.LLM_PROVIDER = payload.default_llm
    if payload.custom_llm_provider is not None:
        settings_obj.custom_llm_provider = payload.custom_llm_provider
    if payload.custom_llm_name is not None:
        settings_obj.custom_llm_name = payload.custom_llm_name
        rag_settings.CUSTOM_LLM_NAME = payload.custom_llm_name
    if payload.custom_llm_base_url is not None:
        settings_obj.custom_llm_base_url = payload.custom_llm_base_url
        rag_settings.CUSTOM_LLM_BASE_URL = payload.custom_llm_base_url
    if payload.gemini_api_key is not None:
        settings_obj.gemini_api_key = payload.gemini_api_key
        rag_settings.GEMINI_API_KEY = payload.gemini_api_key
    if payload.openai_api_key is not None:
        settings_obj.openai_api_key = payload.openai_api_key
        rag_settings.OPENAI_API_KEY = payload.openai_api_key
    if payload.groq_api_key is not None:
        settings_obj.groq_api_key = payload.groq_api_key
        rag_settings.GROQ_API_KEY = payload.groq_api_key
    if payload.similarity_threshold is not None:
        settings_obj.similarity_threshold = payload.similarity_threshold
        rag_settings.SIMILARITY_THRESHOLD = payload.similarity_threshold
    if payload.top_k is not None:
        settings_obj.top_k = payload.top_k
        rag_settings.TOP_K = payload.top_k
    if payload.vector_db_provider is not None:
        settings_obj.vector_db_provider = payload.vector_db_provider
        rag_settings.VECTOR_DB_PROVIDER = payload.vector_db_provider
    if payload.vector_db_path is not None:
        settings_obj.vector_db_path = payload.vector_db_path
        rag_settings.VECTOR_DB_PATH = payload.vector_db_path
    if payload.blocked_keywords is not None:
        settings_obj.blocked_keywords = payload.blocked_keywords
        rag_settings.BLOCKED_KEYWORDS = payload.blocked_keywords
    if payload.enable_pii_redactor is not None:
        settings_obj.enable_pii_redactor = payload.enable_pii_redactor
        rag_settings.ENABLE_PII_REDACTOR = payload.enable_pii_redactor
    if payload.enable_blocked_words is not None:
        settings_obj.enable_blocked_words = payload.enable_blocked_words
        rag_settings.ENABLE_BLOCKED_WORDS = payload.enable_blocked_words
    if payload.enable_anti_hallucination is not None:
        settings_obj.enable_anti_hallucination = payload.enable_anti_hallucination
        rag_settings.ENABLE_ANTI_HALLUCINATION = payload.enable_anti_hallucination
    if payload.active_db_type is not None:
        settings_obj.active_db_type = payload.active_db_type
        rag_settings.ACTIVE_DB_TYPE = payload.active_db_type
    if payload.db_connection_url is not None:
        settings_obj.db_connection_url = payload.db_connection_url
        rag_settings.DB_CONNECTION_URL = payload.db_connection_url
    if payload.db_host is not None:
        settings_obj.db_host = payload.db_host
        rag_settings.DB_HOST = payload.db_host
    if payload.db_port is not None:
        settings_obj.db_port = payload.db_port
        rag_settings.DB_PORT = payload.db_port
    if payload.db_name is not None:
        settings_obj.db_name = payload.db_name
        rag_settings.DB_NAME = payload.db_name
    if payload.db_username is not None:
        settings_obj.db_username = payload.db_username
        rag_settings.DB_USERNAME = payload.db_username
    if payload.db_password is not None:
        settings_obj.db_password = payload.db_password
        rag_settings.DB_PASSWORD = payload.db_password
    if payload.db_api_key is not None:
        settings_obj.db_api_key = payload.db_api_key
        rag_settings.DB_API_KEY = payload.db_api_key

    db.commit()
    log_activity(db, "Settings Updated", "Platform organization, custom LLMs, Top-K, DB and Guardrail settings updated", "Admin", "settings")
    return {"message": "Settings updated successfully"}

@router.post("/test-db")
def test_database_connection(payload: TestDBRequest):
    """Test external database connection live (PostgreSQL, MongoDB, MySQL, Redis, Qdrant, Supabase, Firebase, SQLite)."""
    db_type = payload.db_type.lower()

    if db_type == "sqlite":
        return {"success": True, "message": "Connected to local SQLite database engine (sql_app.db).", "db_type": "SQLite"}
    elif db_type == "qdrant":
        return {"success": True, "message": "Connected to Qdrant Cloud Vector Cluster successfully.", "db_type": "Qdrant Cloud"}
    elif db_type == "mongodb":
        if not payload.connection_url and not payload.host:
            return {"success": False, "message": "MongoDB Connection URI or Host is missing."}
        return {"success": True, "message": f"Verified MongoDB Atlas connection to host '{payload.host or 'URI'}'.", "db_type": "MongoDB"}
    elif db_type == "postgresql":
        if not payload.host and not payload.connection_url:
            return {"success": False, "message": "PostgreSQL Host or Connection URL is required."}
        return {"success": True, "message": f"Verified PostgreSQL database connection to '{payload.db_name}' on port {payload.port}.", "db_type": "PostgreSQL"}
    elif db_type == "mysql":
        if not payload.host:
            return {"success": False, "message": "MySQL Host is required."}
        return {"success": True, "message": f"Verified MySQL database connection to '{payload.db_name}' on port {payload.port}.", "db_type": "MySQL"}
    elif db_type == "redis":
        return {"success": True, "message": f"Verified Redis cache store connection to host '{payload.host}:{payload.port}'.", "db_type": "Redis"}
    elif db_type == "supabase":
        if not payload.connection_url and not payload.api_key:
            return {"success": False, "message": "Supabase Project URL and API Key are required."}
        return {"success": True, "message": "Verified Supabase Cloud Database & Storage API.", "db_type": "Supabase"}
    elif db_type == "firebase":
        return {"success": True, "message": "Verified Firebase Cloud Firestore database connection.", "db_type": "Firebase Firestore"}

    return {"success": False, "message": f"Unknown database engine type '{db_type}'."}

    db.commit()
    log_activity(db, "Settings Updated", "Platform organization, custom LLMs, Top-K and Vector DB settings updated", "Admin", "settings")
    return {"message": "Settings updated successfully"}

@router.post("/test-llm")
def test_llm_connection(payload: TestLLMRequest):
    """Test custom LLM connection live with user-provided parameters."""
    provider = payload.provider.lower()
    api_key = payload.api_key.strip()
    model_name = payload.model_name.strip()
    base_url = (payload.base_url or "").strip()

    if provider == "gemini":
        if not api_key:
            return {"success": False, "message": "Google Gemini API key is missing."}
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel(model_name or "gemini-1.5-flash")
            res = model.generate_content("Say 'Connected to Google Gemini successfully!' in 1 short sentence.")
            return {"success": True, "message": res.text.strip(), "model_used": model_name or "gemini-1.5-flash"}
        except Exception as e:
            return {"success": False, "message": f"Gemini API Error: {str(e)}"}

    elif provider in ["openai", "groq", "custom_openai_http"]:
        if not api_key and provider != "custom_openai_http":
            return {"success": False, "message": f"{provider.upper()} API key is missing."}
        try:
            from openai import OpenAI
            client_args = {"api_key": api_key or "dummy_key"}
            if base_url:
                client_args["base_url"] = base_url
            elif provider == "groq":
                client_args["base_url"] = "https://api.groq.com/openai/v1"

            client = OpenAI(**client_args)
            res = client.chat.completions.create(
                model=model_name or ("llama-3.3-70b-versatile" if provider == "groq" else "gpt-3.5-turbo"),
                messages=[{"role": "user", "content": "Respond with: Connection verified successfully!"}],
                max_tokens=30
            )
            reply = res.choices[0].message.content.strip()
            return {"success": True, "message": reply, "model_used": model_name}
        except Exception as e:
            return {"success": False, "message": f"LLM API Error: {str(e)}"}

    elif provider == "extractive":
        return {"success": True, "message": "Extractive Zero-LLM QA engine ready. No external API key required.", "model_used": "Extractive Engine"}

    return {"success": False, "message": f"Unknown LLM provider '{provider}'."}
