import os
import sys

# Ensure backend directory is in sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.document_parser import extract_chunks_from_file
from app.services.vector_store import vector_store

def run_rag_retrieval_diagnostic():
    print("=" * 70)
    print("RAG RETRIEVAL PIPELINE DIAGNOSTIC & DEBUGGER")
    print("=" * 70)


    # 1. Sample document text (mimicking a company policy / leave allowance PDF)
    sample_pdf_text = (
        "COMPANY HR POLICIES & BENEFIT MANUAL 2026\n\n"
        "Section 1: Work Hours and Schedule\n"
        "Standard working hours are Monday through Friday, 9:00 AM to 5:00 PM. Flexible hours require manager approval.\n\n"
        "Section 2: Annual Leave Allowance and Time Off\n"
        "Employee annual leave allowance is 24 paid days per year. Leaves accrue at 2 days per month.\n"
        "Unused annual leave up to 5 days can be carried forward to the next calendar year.\n"
        "Sick leave allowance is 10 days per year and requires a medical certificate if absent for more than 2 consecutive days.\n\n"
        "Section 3: Remote Work Policy\n"
        "Employees can work remotely up to 2 days per week after completing the 90-day probation period."
    ).encode("utf-8")

    filename = "Company_HR_Policies.txt"

    # Step 1: Text Extraction & Chunking Check
    print("\n1. [EXTRACT & CHUNK] Extracting text and creating chunks...")
    chunks = extract_chunks_from_file(sample_pdf_text, filename)
    doc_id = chunks[0]["doc_id"]
    print(f"   Extracted {len(chunks)} chunks from '{filename}' (doc_id: {doc_id})")

    for i, c in enumerate(chunks):
        print(f"\n   --- Chunk {i+1} (Location: {c['location']}) ---")
        print(f"   Text: {c['text'][:120]}...")

    # Step 2: Indexing into Vector DB (Qdrant Cloud)
    print("\n2. [VECTOR DB INDEXING] Indexing chunks into Qdrant Cloud...")
    vector_store.add_document(doc_id, filename, page_count=1, chunks=chunks)
    print("   Indexed chunks into Qdrant Cloud successfully.")

    # Step 3: Test Queries & Print Top-5 Retrieved Chunks with Scores
    test_queries = [
        "How many annual leaves are allowed for employees?",
        "What is the sick leave policy and medical certificate requirement?",
        "Can employees work from home remotely?"
    ]

    for q_idx, query in enumerate(test_queries, 1):
        print("\n" + "=" * 70)
        print(f"3.{q_idx} [SIMILARITY SEARCH] Testing Query: '{query}'")
        print("=" * 70)

        # Retrieve Top-5 chunks from Qdrant Cloud
        results = vector_store.search(query, top_k=5)

        print(f"Top-{len(results)} Retrieved Chunks from Qdrant Cloud:\n")
        for rank, (chunk, score) in enumerate(results, 1):
            print(f"--- RANK {rank} | Cosine Similarity Score: {score:.4f} ---")
            print(f"File: {chunk.get('filename')} | Location: {chunk.get('location')}")
            print(f"Text Snippet: {chunk.get('text')}")
            print("-" * 50)

    # Step 4: Clean up test document
    print("\n4. [CLEANUP] Deleting test document from Qdrant Cloud...")
    vector_store.delete_document(doc_id)
    print("   Cleaned up test document!")
    print("\n[SUCCESS] RAG RETRIEVAL PIPELINE DIAGNOSTIC COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    run_rag_retrieval_diagnostic()
