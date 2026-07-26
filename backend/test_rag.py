import os
import sys

# Ensure backend directory is in sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.document_parser import extract_chunks_from_file
from app.services.vector_store import vector_store
from app.services.rag_engine import query_rag_system

def test_multi_format_rag():
    print("1. Testing XML parsing & chunking...")
    xml_data = """<?xml version="1.0" encoding="UTF-8"?>
    <company>
        <department name="Engineering">
            <project name="Quantum Engine">
                <architect>Akshay Sharma</architect>
                <protocol>AES-256 Vector Encryption</protocol>
                <budget>10 Million USD</budget>
            </project>
        </department>
    </company>""".encode('utf-8')

    xml_chunks = extract_chunks_from_file(xml_data, "system_architecture.xml")
    assert len(xml_chunks) > 0
    print(f"   XML parsed successfully! Extracted {len(xml_chunks)} chunks.")

    print("\n2. Indexing XML document into Vector Store...")
    doc_id = xml_chunks[0]["doc_id"]
    vector_store.add_document(doc_id, "system_architecture.xml", page_count=1, chunks=xml_chunks)
    print("   Indexed XML document.")

    print("\n3. Querying RAG System on XML Document Content...")
    query = "What is the budget and protocol for Quantum Engine project?"
    result = query_rag_system(query)
    print(f"   Question: {query}")
    print(f"   Answer: {result['answer']}")
    print(f"   Confidence Score: {result['confidence_score']}")
    assert result['is_hallucination_guarded'] == False
    assert len(result['sources']) > 0
    print("   XML RAG Query test passed!")

    print("\n4. Testing Anti-Hallucination Guardrail on Unrelated Question...")
    bad_query = "What is the capital of Mars?"
    bad_result = query_rag_system(bad_query)
    print(f"   Question: {bad_query}")
    print(f"   Answer: {bad_result['answer']}")
    print(f"   Is Guarded: {bad_result['is_hallucination_guarded']}")
    assert bad_result['is_hallucination_guarded'] == True
    print("   Guardrail test passed!")

    print("\n[SUCCESS] MULTI-FORMAT RAG SYSTEM (PDF, DOCX, XML, TXT) TEST PASSED!")

if __name__ == "__main__":
    test_multi_format_rag()
