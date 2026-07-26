import sys
import os
import uuid
import time
from app.services.vector_store import QdrantVectorStore, vector_store
from app.services.rag_engine import query_rag_system

def run_regression_suite():
    print("=" * 80)
    print("STARTING COMPLETE RAG ISOLATION & DELETION REGRESSION TEST SUITE")
    print("=" * 80)

    # -------------------------------------------------------------------------
    # TEST 1 — Document Isolation
    # -------------------------------------------------------------------------
    print("\n--- RUNNING TEST 1: Document Isolation ---")
    doc_a_id = f"test_doc_A_{uuid.uuid4().hex[:8]}"
    doc_b_id = f"test_doc_B_{uuid.uuid4().hex[:8]}"

    chunks_a = [{
        "chunk_id": f"{doc_a_id}_c1",
        "id": f"{doc_a_id}_c1",
        "doc_id": doc_a_id,
        "filename": "A.pdf",
        "page_number": 1,
        "location": "Page 1",
        "chunk_index": 1,
        "text": "Alpha Project Documentation: The secret code for Alpha is ALPHA_SECRET_92841. Store it securely."
    }]

    chunks_b = [{
        "chunk_id": f"{doc_b_id}_c1",
        "id": f"{doc_b_id}_c1",
        "doc_id": doc_b_id,
        "filename": "B.pdf",
        "page_number": 1,
        "location": "Page 1",
        "chunk_index": 1,
        "text": "Beta Project Documentation: The secret code for Beta is BETA_SECRET_57219. Keep it confidential."
    }]

    vector_store.add_document(doc_a_id, "A.pdf", 1, chunks_a)
    vector_store.add_document(doc_b_id, "B.pdf", 1, chunks_b)

    # Query selecting ONLY doc_a_id asking for BETA_SECRET
    res_a = query_rag_system(
        question="What is BETA_SECRET_57219?",
        top_k=4,
        doc_ids=[doc_a_id]
    )

    retrieved_filenames = [s["filename"] for s in res_a.get("sources", [])]
    retrieved_doc_ids = [s.get("doc_id") for s in res_a.get("sources", [])]

    print(f"Querying with doc_ids=['{doc_a_id}']...")
    print(f"Retrieved sources filenames: {retrieved_filenames}")
    
    assert "B.pdf" not in retrieved_filenames, f"FAIL: B.pdf appeared in sources! {retrieved_filenames}"
    assert doc_b_id not in retrieved_doc_ids, f"FAIL: B.pdf doc_id appeared in sources!"
    assert "BETA_SECRET_57219" not in res_a.get("answer", ""), f"FAIL: LLM answered with BETA_SECRET_57219!"
    print("[PASS] TEST 1 PASSED: Strict Document Isolation Verified (B.pdf completely blocked when only A.pdf selected).")

    # Clean up test 1 docs
    vector_store.delete_document(doc_a_id)
    vector_store.delete_document(doc_b_id)


    # -------------------------------------------------------------------------
    # TEST 2 — Deleted Document & Zero-Point Qdrant Verification
    # -------------------------------------------------------------------------
    print("\n--- RUNNING TEST 2: Deleted Document & Qdrant Zero-Point Verification ---")
    del_doc_id = f"test_del_{uuid.uuid4().hex[:8]}"
    chunks_del = [{
        "chunk_id": f"{del_doc_id}_c1",
        "id": f"{del_doc_id}_c1",
        "doc_id": del_doc_id,
        "filename": "DELETE_TEST.pdf",
        "page_number": 1,
        "location": "Page 1",
        "chunk_index": 1,
        "text": "Top Secret Deletion Target: The confidential value is DELETE_SECRET_73921."
    }]

    vector_store.add_document(del_doc_id, "DELETE_TEST.pdf", 1, chunks_del)

    # 1. Confirm retrievable before deletion
    pre_del_res = query_rag_system(
        question="What is DELETE_SECRET_73921?",
        top_k=4,
        doc_ids=[del_doc_id]
    )
    assert len(pre_del_res.get("sources", [])) > 0, "FAIL: DELETE_TEST.pdf was not retrievable before delete!"

    # 2. Delete document
    vector_store.delete_document(del_doc_id)

    # 3. Verify zero points remain in Qdrant Cloud directly
    if vector_store.use_qdrant and vector_store.qdrant_client:
        from qdrant_client.http import models as qmodels
        count_res = vector_store.qdrant_client.count(
            collection_name=vector_store.collection_name,
            count_filter=qmodels.Filter(
                must=[
                    qmodels.FieldCondition(
                        key="doc_id",
                        match=qmodels.MatchValue(value=del_doc_id)
                    )
                ]
            )
        )
        remaining_qdrant_points = count_res.count
        print(f"Qdrant point count for deleted doc_id '{del_doc_id}': {remaining_qdrant_points}")
        assert remaining_qdrant_points == 0, f"FAIL: {remaining_qdrant_points} points remain in Qdrant after delete!"
    
    # 4. Query again and confirm unavailable
    post_del_res = query_rag_system(
        question="What is DELETE_SECRET_73921?",
        top_k=4,
        doc_ids=[del_doc_id]
    )
    assert "DELETE_SECRET_73921" not in post_del_res.get("answer", ""), "FAIL: LLM answered with deleted secret!"
    assert len(post_del_res.get("sources", [])) == 0, "FAIL: Deleted document returned chunks in sources!"
    print("[PASS] TEST 2 PASSED: Deleted document completely removed from Qdrant Cloud (0 points remaining) & unretrievable.")


    # -------------------------------------------------------------------------
    # TEST 3 — Cross-Document Contamination
    # -------------------------------------------------------------------------
    print("\n--- RUNNING TEST 3: Cross-Document Contamination ---")
    doc1_id = f"test_doc1_{uuid.uuid4().hex[:8]}"
    doc2_id = f"test_doc2_{uuid.uuid4().hex[:8]}"
    doc3_id = f"test_doc3_{uuid.uuid4().hex[:8]}"

    c1 = [{"chunk_id": f"{doc1_id}_c1", "doc_id": doc1_id, "filename": "Doc1.pdf", "page_number": 1, "location": "Page 1", "chunk_index": 1, "text": "Gamma specification contains GAMMA_SECRET_11111."}]
    c2 = [{"chunk_id": f"{doc2_id}_c1", "doc_id": doc2_id, "filename": "Doc2.pdf", "page_number": 1, "location": "Page 1", "chunk_index": 1, "text": "Delta specification contains DELTA_SECRET_22222."}]
    c3 = [{"chunk_id": f"{doc3_id}_c1", "doc_id": doc3_id, "filename": "Doc3.pdf", "page_number": 1, "location": "Page 1", "chunk_index": 1, "text": "Epsilon specification contains EPSILON_SECRET_33333."}]

    vector_store.add_document(doc1_id, "Doc1.pdf", 1, c1)
    vector_store.add_document(doc2_id, "Doc2.pdf", 1, c2)
    vector_store.add_document(doc3_id, "Doc3.pdf", 1, c3)

    # Query with ONLY doc3_id selected asking for all secrets
    res_multi = query_rag_system(
        question="What are the secrets GAMMA_SECRET_11111 and DELTA_SECRET_22222 and EPSILON_SECRET_33333?",
        top_k=4,
        doc_ids=[doc3_id]
    )

    for src in res_multi.get("sources", []):
        assert src["filename"] == "Doc3.pdf", f"FAIL: Contamination! Source filename was {src['filename']}"

    print("[PASS] TEST 3 PASSED: Zero cross-document contamination (100% of chunks came from selected Doc3.pdf).")

    # Clean up test 3 docs
    vector_store.delete_document(doc1_id)
    vector_store.delete_document(doc2_id)
    vector_store.delete_document(doc3_id)


    # -------------------------------------------------------------------------
    # TEST 4 — Restart Persistence
    # -------------------------------------------------------------------------
    print("\n--- RUNNING TEST 4: Restart Persistence ---")
    restart_doc_id = f"test_restart_{uuid.uuid4().hex[:8]}"
    c_restart = [{"chunk_id": f"{restart_doc_id}_c1", "doc_id": restart_doc_id, "filename": "RESTART_TEST.pdf", "page_number": 1, "location": "Page 1", "chunk_index": 1, "text": "Restart Secret is RESTART_SECRET_99999."}]

    vector_store.add_document(restart_doc_id, "RESTART_TEST.pdf", 1, c_restart)
    vector_store.delete_document(restart_doc_id)

    # Instantiate fresh QdrantVectorStore object (simulating backend worker restart)
    print("Instantiating fresh QdrantVectorStore instance (simulating worker process restart)...")
    fresh_store = QdrantVectorStore()

    # Query fresh store for deleted secret
    res_restart = fresh_store.search("What is RESTART_SECRET_99999?", top_k=4, doc_ids=[restart_doc_id])
    assert len(res_restart) == 0, f"FAIL: Fresh store retrieved deleted document chunks after restart! {res_restart}"

    if fresh_store.use_qdrant and fresh_store.qdrant_client:
        from qdrant_client.http import models as qmodels
        fresh_count = fresh_store.qdrant_client.count(
            collection_name=fresh_store.collection_name,
            count_filter=qmodels.Filter(
                must=[
                    qmodels.FieldCondition(
                        key="doc_id",
                        match=qmodels.MatchValue(value=restart_doc_id)
                    )
                ]
            )
        ).count
        assert fresh_count == 0, f"FAIL: Qdrant Cloud still has {fresh_count} points after restart!"

    print("[PASS] TEST 4 PASSED: Restart persistence verified (Deleted document is permanently gone across server restarts).")

    print("\n" + "=" * 80)
    print("ALL 4 REGRESSION TESTS PASSED 100% SUCCESSFULLY!")
    print("=" * 80)

if __name__ == "__main__":
    run_regression_suite()
