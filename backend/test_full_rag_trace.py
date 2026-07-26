import os
import sys

# Ensure backend directory is in sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.document_parser import extract_chunks_from_file
from app.services.vector_store import vector_store
from app.services.rag_engine import query_rag_system

def run_full_rag_trace():
    print("======================================================================")
    print("END-TO-END RAG DIAGNOSTIC TRACE")
    print("======================================================================")

    # Multi-section document containing complex policy specifications
    doc_bytes = (
        "NEXORA ENTERPRISE PLATFORM SPECIFICATION 2026\n\n"
        "Chapter 1: Infrastructure and High Availability\n"
        "The Nexora cluster runs across 3 availability zones in AWS (sa-east-1a, sa-east-1b, sa-east-1c).\n"
        "Database replication operates in active-passive mode with automated failover in 15 seconds.\n"
        "Vector search is powered by Qdrant Cloud HNSW index with sub-10ms query latency.\n\n"
        "Chapter 2: Security & Encryption Protocols\n"
        "All data at rest is encrypted using AES-256 GCM algorithm. Data in transit is secured with TLS 1.3.\n"
        "User authentication uses OAuth2 JWT bearer tokens signed via HS256 algorithm with a 30-minute expiration.\n"
        "Password hashes are generated using Passlib Bcrypt with round factor 12.\n\n"
        "Chapter 3: SLA and Refund Guarantee\n"
        "Platform uptime SLA guarantee is 99.95% per calendar month.\n"
        "If system availability drops below 99.95%, customers receive a 15% billing credit.\n"
        "Refund requests must be submitted within 14 calendar days of month-end billing."
    ).encode("utf-8")

    filename = "Nexora_Platform_Spec.txt"
    chunks = extract_chunks_from_file(doc_bytes, filename)
    doc_id = chunks[0]["doc_id"]

    print(f"Extracted {len(chunks)} sentence-aware chunks (Chunk size: {len(chunks[0]['text'])} chars)")
    vector_store.add_document(doc_id, filename, page_count=1, chunks=chunks)

    # Test Query
    query = "What is the uptime SLA guarantee and refund credit percentage?"
    
    # Execute full RAG pipeline with trace output
    result = query_rag_system(query, top_k=4)

    # Cleanup
    vector_store.delete_document(doc_id)
    print("\n[SUCCESS] END-TO-END RAG DIAGNOSTIC TRACE COMPLETED!")

if __name__ == "__main__":
    run_full_rag_trace()
