"""Test anti-hallucination guardrail: unrelated queries must be rejected."""
import requests, json

BASE = "http://127.0.0.1:8000/api/v1"

# 1. Sign up / login
print("=== Step 1: Auth ===")
try:
    r = requests.post(f"{BASE}/auth/signup", json={
        "email": "test_hal@nexora.ai", "username": "test_hal",
        "password": "Password123!", "role": "admin"
    })
except:
    pass

r = requests.post(f"{BASE}/auth/login", data={
    "username": "test_hal@nexora.ai", "password": "Password123!"
})
token = r.json().get("access_token", "")
headers = {"Authorization": f"Bearer {token}"}
print(f"  Token obtained: {bool(token)}")

# 2. Upload a document about ETL
print("\n=== Step 2: Upload ETL doc ===")
content = """ETL Platform Documentation
1. What Is This Project?
This is an industrial IoT ETL (Extract, Transform, Load) Platform designed for
manufacturing companies. It processes sensor data from factory equipment,
transforms it using configurable pipelines, and loads it into time-series databases.

2. Architecture
The system uses React 18 frontend with FastAPI backend. Data flows through
Kafka message queues into Apache Spark processing nodes.

3. Pipeline Configuration
Users can configure pipeline steps: filtering, aggregation, anomaly detection,
and data enrichment. Each step has configurable parameters.
"""
files = {"file": ("etl_docs.txt", content, "text/plain")}
r = requests.post(f"{BASE}/rag/upload-document", files=files, headers=headers)
print(f"  Upload: {r.json().get('message', r.text)}")

# 3. Test UNRELATED queries — these MUST be rejected
print("\n=== Step 3: Test UNRELATED queries (should be REJECTED) ===")
unrelated_queries = [
    "national anthem of India?",
    "who is the president of USA?",
    "what is the capital of France?",
    "how to cook biryani?",
    "tell me about quantum physics",
]

all_passed = True
for q in unrelated_queries:
    r = requests.post(f"{BASE}/rag/query", json={"question": q, "top_k": 4},
                      headers=headers)
    data = r.json()
    guarded = data.get("is_hallucination_guarded", False)
    score = data.get("confidence_score", 0)
    status = "REJECTED (correct)" if guarded else "ANSWERED (WRONG!)"
    if not guarded:
        all_passed = False
    print(f"  [{status}] Q: '{q}' | Score: {score} | LLM: {data.get('llm_used')}")

# 4. Test RELATED queries — these MUST return answers
print("\n=== Step 4: Test RELATED queries (should be ANSWERED) ===")
related_queries = [
    "What is the ETL platform?",
    "What architecture does the system use?",
    "What are the pipeline steps?",
    "What is Kafka used for?",
]

for q in related_queries:
    r = requests.post(f"{BASE}/rag/query", json={"question": q, "top_k": 4},
                      headers=headers)
    data = r.json()
    guarded = data.get("is_hallucination_guarded", False)
    score = data.get("confidence_score", 0)
    status = "ANSWERED (correct)" if not guarded else "REJECTED (WRONG!)"
    if guarded:
        all_passed = False
    answer_preview = data.get("answer", "")[:100]
    print(f"  [{status}] Q: '{q}' | Score: {score} | Answer: {answer_preview}...")

# 5. Test summary query
print("\n=== Step 5: Test SUMMARY query ===")
r = requests.post(f"{BASE}/rag/query", json={"question": "summarize", "top_k": 6},
                  headers=headers)
data = r.json()
guarded = data.get("is_hallucination_guarded", False)
status = "ANSWERED (correct)" if not guarded else "REJECTED (WRONG!)"
if guarded:
    all_passed = False
print(f"  [{status}] Q: 'summarize' | Score: {data.get('confidence_score')}")
print(f"  Answer preview: {data.get('answer', '')[:150]}...")

# Final result
print(f"\n{'='*60}")
if all_passed:
    print("[SUCCESS] ALL ANTI-HALLUCINATION TESTS PASSED!")
else:
    print("[FAIL] Some tests did not pass — check above.")
print(f"{'='*60}")
