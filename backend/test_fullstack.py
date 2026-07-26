import sys
import os
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.db.database import Base, engine

Base.metadata.create_all(bind=engine)
client = TestClient(app)

def test_full_system():
    uid = str(int(time.time()))
    email = f"user_{uid}@nexora.ai"
    username = f"user_{uid}"
    password = "Password123!"

    print("--- 1. Testing Root Health Check ---")
    res = client.get("/")
    assert res.status_code == 200
    print("Health check response:", res.json())

    print(f"\n--- 2. Testing User Signup ({username}) ---")
    signup_payload = {
        "email": email,
        "username": username,
        "password": password,
        "role": "admin"
    }
    res = client.post("/api/v1/auth/signup", json=signup_payload)
    assert res.status_code == 201
    print("Signup successful:", res.json())

    print(f"\n--- 3. Testing User Login ({username}) ---")
    login_data = {
        "username": username,
        "password": password
    }
    res = client.post("/api/v1/auth/login", data=login_data)
    assert res.status_code == 200
    tokens = res.json()
    assert "access_token" in tokens
    token = tokens["access_token"]
    print("Login successful! Issued Bearer JWT Token.")

    print("\n--- 4. Testing Get Profile (/auth/me) ---")
    headers = {"Authorization": f"Bearer {token}"}
    res = client.get("/api/v1/auth/me", headers=headers)
    assert res.status_code == 200
    user_info = res.json()
    assert user_info["username"] == username
    print("User profile retrieved successfully:", user_info)

    print("\n--- 5. Testing Dashboard Overview (/dashboard/overview) ---")
    res = client.get("/api/v1/dashboard/overview", headers=headers)
    assert res.status_code == 200
    dashboard = res.json()
    assert "metrics" in dashboard
    assert "system_health" in dashboard
    print("Dashboard overview fetched successfully! Metrics count:", len(dashboard["metrics"]))

    print("\n--- 6. Testing Document Upload (/rag/upload-document) ---")
    sample_text = """
    # Nexora Security Protocols
    Authentication in Nexora is powered by OAuth2 Bearer tokens signed with HS256 algorithm.
    All passwords are encrypted using Bcrypt password hashing.
    Database connections use SQLite ORM with SQLAlchemy models.
    """
    files = {"file": ("security-protocols.txt", sample_text.encode("utf-8"), "text/plain")}
    res = client.post("/api/v1/rag/upload-document", files=files, headers=headers)
    assert res.status_code == 201
    upload_res = res.json()
    print("Document uploaded successfully:", upload_res)

    print("\n--- 7. Testing RAG Vector Search & Query (/rag/query) ---")
    query_payload = {
        "question": "How are passwords encrypted in Nexora?",
        "top_k": 4,
        "llm_provider": "extractive"
    }
    res = client.post("/api/v1/rag/query", json=query_payload, headers=headers)
    assert res.status_code == 200
    query_res = res.json()
    print("RAG query executed successfully!")
    print("Answer:", query_res["answer"])
    print("Confidence:", query_res["confidence_score"])
    print("Sources count:", len(query_res["sources"]))

    print("\n--- 8. Testing Guardrail Threshold Update (/guardrails/update) ---")
    res = client.post("/api/v1/guardrails/update", json={"similarity_threshold": 0.35}, headers=headers)
    assert res.status_code == 200
    print("Guardrail threshold updated successfully:", res.json())

    print("\n--- 9. Testing Activity Audit Logs (/activity/logs) ---")
    res = client.get("/api/v1/activity/logs", headers=headers)
    assert res.status_code == 200
    logs = res.json()
    print("Fetched audit logs count:", len(logs))

    print("\n[SUCCESS] ALL 9 FULL-STACK INTEGRATION TESTS PASSED WITH 100% SUCCESS!")

if __name__ == "__main__":
    test_full_system()
