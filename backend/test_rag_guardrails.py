import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.document_parser import extract_chunks_from_file
from app.services.rag_engine import query_rag_system
from app.services.vector_store import vector_store


def setup_function():
    vector_store.clear()


def test_unrelated_question_is_rejected_even_with_retrieved_chunks():
    chunk = {
        "id": "etl_c1",
        "doc_id": "etl_doc",
        "filename": "ETL_Platform_Documentation.txt",
        "location": "Section: Pipeline State Machine",
        "chunk_index": 1,
        "text": "Pipeline State Machine validates extract, transform, load, retry, failed, and completed states."
    }
    original_search = vector_store.search
    vector_store.chunks = [chunk]
    vector_store.search = lambda *args, **kwargs: [(chunk, 0.71)]

    try:
        result = query_rag_system(
            "national anthem of India?",
            provider_override="extractive",
            top_k=4
        )
    finally:
        vector_store.search = original_search

    assert result["is_hallucination_guarded"] is True
    assert result["answer"] == "The requested information is not available in the uploaded documents."
    assert result["sources"] == []
    assert result["llm_used"] == "Keyword Relevance Guardrail"


def test_related_question_still_returns_grounded_sources():
    content = """ETL Platform Documentation
Pipeline State Machine
The platform validates pipeline states before execution. It supports extract,
transform, load, retry, failed, and completed states for industrial data jobs.
"""
    chunks = extract_chunks_from_file(content.encode("utf-8"), "ETL_Platform_Documentation.txt")
    vector_store.add_document(chunks[0]["doc_id"], "ETL_Platform_Documentation.txt", 1, chunks)

    result = query_rag_system(
        "What pipeline states are supported?",
        provider_override="extractive",
        top_k=4
    )

    assert result["is_hallucination_guarded"] is False
    assert len(result["sources"]) > 0
    assert "pipeline states" in result["answer"].lower()
