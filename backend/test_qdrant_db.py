import os
import sys

# Ensure backend directory is in sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.vector_store import vector_store

def test_qdrant_vector_store():
    print("=== QDRANT VECTOR STORE TEST ===")
    print(f"Use Qdrant Cloud: {vector_store.use_qdrant}")
    print(f"Collection Name: {vector_store.collection_name}")

    # 1. Index document
    chunks = [{
        "chunk_id": "qdrant_test_c0",
        "doc_id": "doc_qdrant_test",
        "filename": "qdrant_architecture.pdf",
        "page_number": 1,
        "location": "Page 1, Section 1",
        "chunk_index": 0,
        "text": "Qdrant is a high-performance vector database with cloud clustering and HNSW similarity search indexing."
    }]

    print("Indexing test document...")
    vector_store.add_document("doc_qdrant_test", "qdrant_architecture.pdf", 1, chunks)
    print("Indexed successfully!")

    # 2. Perform Similarity Search
    print("Searching for: 'Qdrant vector database similarity search'...")
    results = vector_store.search("Qdrant vector database similarity search", top_k=2)
    assert len(results) > 0, "No results returned from search!"
    
    match_chunk, match_score = results[0]
    print(f"Match found! Score: {match_score:.4f}")
    print(f"Content: {match_chunk['text']}")

    # 3. Clean up
    print("Cleaning up test document...")
    vector_store.delete_document("doc_qdrant_test")
    print("[SUCCESS] QDRANT CLOUD VECTOR DB INTEGRATION TEST PASSED!")

if __name__ == "__main__":
    test_qdrant_vector_store()
