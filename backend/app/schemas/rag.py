from pydantic import BaseModel, Field
from typing import Optional

class RAGQueryRequest(BaseModel):
    question: str = Field(..., min_length=2, description="Question to ask based on uploaded PDFs")
    top_k: Optional[int] = Field(4, ge=1, le=10, description="Number of top chunks to retrieve")
    llm_provider: Optional[str] = Field(None, description="Provider: 'gemini' | 'openai' | 'none'")
    api_key: Optional[str] = Field(None, description="Optional API key override (Gemini or OpenAI)")
    doc_ids: Optional[list[str]] = Field(None, description="Optional list of document IDs to filter search")

class SourceCitation(BaseModel):
    filename: str
    page_number: int
    chunk_index: int
    similarity_score: float
    snippet: str

class PipelineStepTrace(BaseModel):
    step: int
    title: str
    detail: str
    status: str = "success"

class RAGQueryResponse(BaseModel):
    answer: str
    is_hallucination_guarded: bool
    confidence_score: float
    llm_used: str
    sources: list[SourceCitation]
    threshold: Optional[float] = 0.10
    pipeline_trace: Optional[list[PipelineStepTrace]] = None


class PDFUploadResponse(BaseModel):
    doc_id: str
    filename: str
    page_count: int
    chunk_count: int
    message: str
