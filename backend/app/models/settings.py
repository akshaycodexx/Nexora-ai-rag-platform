from sqlalchemy import Column, Integer, String, Float, Boolean
from app.db.database import Base

class SystemSettings(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    org_name = Column(String, default="Nexora AI Labs")
    contact_email = Column(String, default="admin@nexora.ai")
    embedding_model = Column(String, default="sentence-transformers/all-MiniLM-L6-v2")
    embedding_provider = Column(String, default="local")
    embedding_api_key = Column(String, default="")
    default_llm = Column(String, default="gemini-1.5-flash")
    custom_llm_provider = Column(String, default="gemini")
    custom_llm_name = Column(String, default="gemini-1.5-flash")
    custom_llm_base_url = Column(String, default="")
    gemini_api_key = Column(String, default="")
    openai_api_key = Column(String, default="")
    groq_api_key = Column(String, default="")
    similarity_threshold = Column(Float, default=0.28)
    top_k = Column(Integer, default=4)
    vector_db_provider = Column(String, default="sqlite_vector")
    vector_db_path = Column(String, default="./sql_app.db")
    blocked_keywords = Column(String, default="")
    enable_pii_redactor = Column(Boolean, default=False)
    enable_blocked_words = Column(Boolean, default=False)
    enable_anti_hallucination = Column(Boolean, default=False)

    # Custom External Database Settings
    active_db_type = Column(String, default="sqlite")
    db_connection_url = Column(String, default="")
    db_host = Column(String, default="localhost")
    db_port = Column(Integer, default=5432)
    db_name = Column(String, default="nexora_db")
    db_username = Column(String, default="")
    db_password = Column(String, default="")
    db_api_key = Column(String, default="")

    def __repr__(self):
        return f"<SystemSettings(id={self.id}, org_name='{self.org_name}')>"
