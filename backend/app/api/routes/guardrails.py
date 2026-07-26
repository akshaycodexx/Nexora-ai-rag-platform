from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.rag_config import rag_settings
from app.services.activity_logger import log_activity

router = APIRouter(prefix="/guardrails", tags=["Anti-Hallucination Guardrails"])

class GuardrailUpdate(BaseModel):
    similarity_threshold: float

@router.get("")
def get_guardrail_config():
    """Fetch active guardrail rules and similarity score threshold."""
    return {
        "similarity_threshold": rag_settings.SIMILARITY_THRESHOLD,
        "policies": [
            { "id": "g1", "name": "Strict Context Similarity Threshold", "value": f"{rag_settings.SIMILARITY_THRESHOLD} Score", "description": "Rejects queries with vector similarity below threshold to prevent hallucination.", "enabled": True },
            { "id": "g2", "name": "Out-of-Bounds Rejection", "value": "Active", "description": "Forces system to return explicit missing notice if facts are absent.", "enabled": True },
            { "id": "g3", "name": "PII & Sensitive Data Redaction", "value": "Active", "description": "Automatically redacts SSN, API keys, and credit card numbers from LLM context.", "enabled": True },
            { "id": "g4", "name": "Maximum Retrieval Chunks Limit", "value": f"{rag_settings.TOP_K} Chunks", "description": "Caps Top-K retrieval at 4 chunks per query for optimal precision.", "enabled": True }
        ]
    }

@router.post("/update")
def update_guardrail_threshold(payload: GuardrailUpdate, db: Session = Depends(get_db)):
    """Update similarity score threshold dynamically."""
    rag_settings.SIMILARITY_THRESHOLD = payload.similarity_threshold
    log_activity(db, "Guardrail Threshold Updated", f"Similarity score threshold updated to {payload.similarity_threshold}", "Admin", "security")
    return {
        "message": f"Similarity threshold updated to {payload.similarity_threshold}",
        "similarity_threshold": rag_settings.SIMILARITY_THRESHOLD
    }
