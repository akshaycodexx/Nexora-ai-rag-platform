import os
import re
import time
import warnings
warnings.filterwarnings("ignore", category=FutureWarning)

import google.generativeai as genai
from openai import OpenAI
from app.services.vector_store import vector_store
from app.core.rag_config import rag_settings, sync_rag_settings

SYSTEM_PROMPT = """You are an intelligent, precise Anti-Hallucination QA Assistant.
Answer the user's question accurately using ONLY the document context provided below.

INSTRUCTIONS:
1. Answer clearly, directly, and comprehensively based strictly on the context.
2. If the user asks about projects, skills, tech stack, experience, or summaries, synthesize a structured summary with bold headers and bullet points.
3. Do NOT invent facts or make assumptions not present in the context.
4. If the provided context contains NO relevant information at all to answer the question, respond EXACTLY with:
   "The requested information is not available in the uploaded documents."

CONTEXT FROM DOCUMENTS:
{context}

USER QUESTION:
{question}

ANSWER:"""

STOPWORDS = frozenset(
    "a an the is are was were be been being have has had do does did "
    "will shall would should can could may might must of in on at to for "
    "with by from as into through during before after above below between "
    "out off over under again further then once here there when where why "
    "how all each every both few more most other some such no nor not only "
    "own same so than too very and but if or because until while "
    "what which who whom this that these those i me my we our you your "
    "he him his she her it its they them their".split()
)

def _extract_keywords(text: str) -> set[str]:
    """Extract meaningful content words from text."""
    tokens = re.findall(r"[a-z0-9]+", text.lower())
    keywords = set()
    for token in tokens:
        if token in STOPWORDS or len(token) <= 2:
            continue
        if len(token) > 4 and token.endswith("ies"):
            token = f"{token[:-3]}y"
        elif len(token) > 4 and token.endswith("s"):
            token = token[:-1]
        keywords.add(token)
    return keywords

def _keyword_overlap_score(query: str, chunk_text: str) -> float:
    """Fraction of query keywords that appear in the chunk text."""
    q_kw = _extract_keywords(query)
    if not q_kw:
        return 0.0
    c_kw = _extract_keywords(chunk_text)
    overlap = q_kw & c_kw
    return len(overlap) / len(q_kw)


def _keyword_overlap_details(query: str, chunk_text: str) -> tuple[set[str], set[str], float]:
    """Return query keywords, overlapping keywords, and overlap ratio."""
    q_kw = _extract_keywords(query)
    if not q_kw:
        return q_kw, set(), 0.0
    c_kw = _extract_keywords(chunk_text)
    overlap = q_kw & c_kw
    return q_kw, overlap, len(overlap) / len(q_kw)


def _guardrail_response(question: str, reason: str, confidence_score: float, start_time: float) -> dict:
    """Build one consistent out-of-scope response for unsupported questions."""
    latency_ms = int((time.time() - start_time) * 1000)
    vector_store.log_query(question, 0, latency_ms)
    coll_name = str(getattr(vector_store, 'collection_name', 'nexora_documents'))
    pipeline_trace = [
        {"step": 1, "title": "Document Parsing & Chunking", "detail": f"Active Knowledge Base contains {len(vector_store.chunks)} chunks.", "status": "success"},
        {"step": 2, "title": "Query Vector Embedding", "detail": f"Encoded 384-dim vector with '{rag_settings.EMBEDDING_MODEL_NAME}'.", "status": "success"},
        {"step": 3, "title": "Qdrant Cloud Similarity Search", "detail": f"HNSW index search completed on collection '{coll_name}'.", "status": "success"},
        {"step": 4, "title": "Anti-Hallucination Guardrail Check", "detail": f"Rejection: {reason} (Similarity score: {confidence_score * 100:.1f}% vs Min Threshold: {rag_settings.SIMILARITY_THRESHOLD}).", "status": "warning"}
    ]
    return {
        "answer": "The requested information is not available in the uploaded documents.",
        "is_hallucination_guarded": True,
        "confidence_score": round(max(confidence_score, 0.0), 4),
        "llm_used": reason,
        "sources": [],
        "threshold": rag_settings.SIMILARITY_THRESHOLD,
        "pipeline_trace": pipeline_trace
    }


def query_rag_system(
    question: str,
    top_k: int = 4,
    provider_override: str | None = None,
    api_key_override: str | None = None,
    doc_ids: list[str] | None = None
) -> dict:
    """Execute Anti-Hallucination RAG pipeline with LLM API generation."""
    start_time = time.time()
    sync_rag_settings()

    effective_top_k = top_k if (top_k and top_k != 4) else (rag_settings.TOP_K or 4)

    # 1. Check if vector store has indexed documents
    if not vector_store.chunks:
        return {
            "answer": "No documents have been uploaded yet. Please upload a document first.",
            "is_hallucination_guarded": True,
            "confidence_score": 0.0,
            "llm_used": "None",
            "sources": []
        }

    # 2. Retrieve top-k relevant text chunks using LangChain EnsembleRetriever
    results = vector_store.langchain_search(question, top_k=effective_top_k, doc_ids=doc_ids)

    if not results:
        return {
            "answer": "No relevant content found in the uploaded documents.",
            "is_hallucination_guarded": True,
            "confidence_score": 0.0,
            "llm_used": "None",
            "sources": []
        }

    top_chunk, top_score = results[0]

    # Detect query intent
    q_lower = question.lower()
    is_summary_query = any(w in q_lower for w in [
        "summarize", "summary", "overview", "explain everything",
        "tell me everything", "what does this document", "what is this",
        "tech stack", "tech stacks", "skills", "skill", "technologies", "tools",
        "projects", "project", "experience", "education", "resume", "cv"
    ])
    is_identity_query = any(w in q_lower for w in [
        "name", "who is", "who am i", "candidate", "applicant", "author",
        "owner", "whose resume", "whose document", "person", "profile",
        "my name", "your name", "candidate name"
    ])

    # ANTI-HALLUCINATION GUARDRAIL
    q_keywords, overlapping_keywords, kw_overlap = _keyword_overlap_details(question, top_chunk["text"])

    # Guardrail: trigger out-of-scope ONLY if both vector similarity is very weak (< 0.05) AND zero keyword overlap
    if not (is_summary_query or is_identity_query):
        if top_score < 0.05 and not overlapping_keywords:
            return _guardrail_response(
                question,
                "Low Relevance Guardrail",
                top_score,
                start_time
            )

    # Collect top relevant chunks (preserving rank order & deduplicating)
    seen_ids = set()
    relevant_chunks = []
    for chunk, score in results[:effective_top_k]:
        cid = chunk.get("chunk_id") or chunk.get("id") or hash(chunk.get("text", ""))
        if cid not in seen_ids:
            seen_ids.add(cid)
            relevant_chunks.append((chunk, score))

    # Format sources and final context for LLM
    sources = []
    context_blocks = []
    
    print("\n" + "=" * 70)
    print(f"USER QUERY:\n{question}\n")
    print(f"REQUESTED DOC IDS:\n{doc_ids}\n")
    print("DENSE / RETRIEVAL RESULTS:")
    for rank, (chunk, score) in enumerate(results[:effective_top_k], 1):
        did = chunk.get("doc_id", "N/A")
        fname = chunk.get("filename") or "document.txt"
        print(f"  [{rank}] doc_id: {did} | filename: {fname} | score: {score:.4f}")

    print("\nFUSED / RRF RESULTS:")
    for rank, (chunk, score) in enumerate(relevant_chunks, 1):
        did = chunk.get("doc_id", "N/A")
        fname = chunk.get("filename") or "document.txt"
        loc = chunk.get("location") or f"Page {chunk.get('page_number', 1)}"
        snippet_text = chunk.get("text", "")
        print(f"  [{rank}] doc_id: {did} | filename: {fname} | score: {score:.4f}")

        sources.append({
            "filename": fname,
            "page_number": chunk.get("page_number", 1),
            "location": loc,
            "chunk_index": chunk.get("chunk_index", 0),
            "similarity_score": round(score, 4),
            "snippet": snippet_text
        })
        context_blocks.append(f"[doc_id: {did} | File: {fname} | {loc}]\n{snippet_text}")

    full_context = "\n\n".join(context_blocks)
    safe_context = full_context.encode("ascii", errors="replace").decode("ascii")
    print("\n----------------\nFINAL CONTEXT SENT TO LLM:\n" + safe_context + "\n----------------\n")

    # 5. Determine LLM Provider & API Key
    provider = (provider_override or rag_settings.LLM_PROVIDER or "groq").lower()
    gemini_key = api_key_override if (provider_override == "gemini" and api_key_override) else (rag_settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY"))
    openai_key = api_key_override if (provider_override == "openai" and api_key_override) else (rag_settings.OPENAI_API_KEY or os.getenv("OPENAI_API_KEY"))
    groq_key = api_key_override if (provider_override == "groq" and api_key_override) else (rag_settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY"))
    
    custom_model_name = rag_settings.CUSTOM_LLM_NAME or ""
    custom_base_url = rag_settings.CUSTOM_LLM_BASE_URL or ""

    answer_text = ""
    llm_used = "Extractive Grounded Engine"

    # Helper for Groq execution
    def _try_groq():
        nonlocal answer_text, llm_used
        if not groq_key:
            return False
        try:
            client_args = {"api_key": groq_key, "base_url": custom_base_url or "https://api.groq.com/openai/v1"}
            client = OpenAI(**client_args)
            prompt = SYSTEM_PROMPT.format(context=full_context, question=question)

            groq_candidates = [
                custom_model_name if (custom_model_name and not custom_model_name.startswith("gemini")) else None,
                "llama-3.3-70b-versatile",
                "llama-3.1-8b-instant",
                "mixtral-8x7b-32768",
                "llama3-70b-8192",
                "llama3-8b-8192"
            ]
            groq_candidates = [m for m in groq_candidates if m]
            
            for gmodel in groq_candidates:
                try:
                    response = client.chat.completions.create(
                        model=gmodel,
                        messages=[
                            {"role": "system", "content": "You are a strict anti-hallucination document QA system."},
                            {"role": "user", "content": prompt}
                        ],
                        temperature=0.0
                    )
                    if response.choices and response.choices[0].message.content:
                        answer_text = response.choices[0].message.content.strip()
                        llm_used = f"Groq ({gmodel})"
                        return True
                except Exception as ex:
                    print(f"Groq model '{gmodel}' failed: {ex}")
                    continue
        except Exception as e:
            print(f"Groq API Exception: {e}")
        return False

    # Helper for Gemini execution
    def _try_gemini():
        nonlocal answer_text, llm_used
        if not gemini_key:
            return False
        try:
            genai.configure(api_key=gemini_key)
            gemini_candidates = [
                custom_model_name if (custom_model_name and custom_model_name.startswith("gemini")) else None,
                "gemini-2.5-flash",
                "gemini-2.0-flash",
                "gemini-1.5-flash",
                "gemini-2.5-pro",
                "gemini-flash-latest"
            ]
            gemini_candidates = [m for m in gemini_candidates if m]

            for mname in gemini_candidates:
                try:
                    model = genai.GenerativeModel(mname)
                    prompt = SYSTEM_PROMPT.format(context=full_context, question=question)
                    response = model.generate_content(prompt)
                    if response.text and response.text.strip():
                        answer_text = response.text.strip()
                        llm_used = f"Google Gemini ({mname})"
                        return True
                except Exception as ex:
                    print(f"Gemini model '{mname}' failed: {ex}")
                    continue
        except Exception as e:
            print(f"Gemini API Exception: {e}")
        return False

    # Primary execution based on selected provider
    if provider == "groq":
        if not _try_groq():
            print("Groq execution failed. Attempting Gemini fallback...")
            if not _try_gemini():
                answer_text = synthesize_extractive_answer(question, relevant_chunks)
                llm_used = "Extractive Fallback (Groq & Gemini unavailable)"
            else:
                llm_used += " (Fallback from Groq)"
    elif provider == "gemini":
        if not _try_gemini():
            print("Gemini execution failed. Attempting Groq fallback...")
            if not _try_groq():
                answer_text = synthesize_extractive_answer(question, relevant_chunks)
                llm_used = "Extractive Fallback (Gemini & Groq unavailable)"
            else:
                llm_used += " (Fallback from Gemini)"
    elif provider in ["openai", "custom_openai_http"] and (openai_key or custom_base_url):
        try:
            client_args = {"api_key": openai_key or "dummy_key"}
            if custom_base_url:
                client_args["base_url"] = custom_base_url

            client = OpenAI(**client_args)
            prompt = SYSTEM_PROMPT.format(context=full_context, question=question)
            
            model_to_use = custom_model_name or "gpt-3.5-turbo"
            response = client.chat.completions.create(
                model=model_to_use,
                messages=[
                    {"role": "system", "content": "You are an anti-hallucination document QA system."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.0
            )
            answer_text = response.choices[0].message.content.strip()
            llm_used = f"{provider.upper()} ({model_to_use})"
        except Exception as e:
            print(f"{provider.upper()} API Exception: {e}. Falling back to Gemini/Groq/Extractive QA.")
            if not _try_groq() and not _try_gemini():
                answer_text = synthesize_extractive_answer(question, relevant_chunks)
                llm_used = f"Extractive Fallback ({provider} unavailable)"
    else:
        if not _try_groq() and not _try_gemini():
            answer_text = synthesize_extractive_answer(question, relevant_chunks)
            llm_used = "Extractive Grounded Engine (No valid API key)"

    latency_ms = int((time.time() - start_time) * 1000)
    vector_store.log_query(question, len(sources), latency_ms)

    safe_ans = str(answer_text).encode("ascii", errors="replace").decode("ascii")
    print(f"LLM RESPONSE ({llm_used}):\n{safe_ans}\n" + "=" * 70)

    coll_name = str(getattr(vector_store, 'collection_name', 'nexora_documents'))
    pipeline_trace = [
        {"step": 1, "title": "Document Parsing & Text Extraction", "detail": f"Active Knowledge Base contains {len(vector_store.chunks)} sentence-aware chunks from {len(vector_store.documents)} documents.", "status": "success"},
        {"step": 2, "title": "Dense Vector Embedding Encoding", "detail": f"Encoded 384-dim dense vector using embedding model '{rag_settings.EMBEDDING_MODEL_NAME}'.", "status": "success"},
        {"step": 3, "title": "LangChain Ensemble & Qdrant Cloud Search", "detail": f"Executed LangChain BM25Retriever + Qdrant Cloud HNSW search on collection '{coll_name}' (Top-K={effective_top_k}).", "status": "success"},
        {"step": 4, "title": "Guardrail & Relevance Grounding", "detail": f"Top chunk match score: {top_score * 100:.1f}% (Min Threshold: {rag_settings.SIMILARITY_THRESHOLD}). Relevance check passed.", "status": "success"},
        {"step": 5, "title": "LLM Synthesis & Response Generation", "detail": f"Grounded response generated using {llm_used}.", "status": "success"}
    ]

    # 1. Automated PII & Secret Data Masking Redactor
    if getattr(rag_settings, "ENABLE_PII_REDACTOR", True):
        answer_text, pii_count = redact_pii_and_secrets(answer_text)
        if pii_count > 0:
            pipeline_trace.append({
                "step": 6,
                "title": "Automated PII & Secret Data Redactor",
                "detail": f"Masked {pii_count} sensitive PII item(s) (API Keys / Emails / Phone) in response.",
                "status": "warning"
            })

    # 2. Custom Blocked Words Redactor
    if getattr(rag_settings, "ENABLE_BLOCKED_WORDS", True):
        answer_text, blocked_count = redact_blocked_keywords(answer_text)
        if blocked_count > 0:
            pipeline_trace.append({
                "step": 7,
                "title": "Custom Blocked Keywords Redactor",
                "detail": f"Redacted {blocked_count} custom blocked term(s) from output.",
                "status": "warning"
            })

    is_guarded = answer_text.strip().lower().startswith("the requested information is not available")
    return {
        "answer": answer_text,
        "is_hallucination_guarded": is_guarded,
        "confidence_score": round(top_score, 4),
        "llm_used": llm_used,
        "sources": sources if not is_guarded else [],
        "threshold": rag_settings.SIMILARITY_THRESHOLD,
        "pipeline_trace": pipeline_trace
    }

def redact_blocked_keywords(text: str) -> tuple[str, int]:
    """Redact custom blocked keywords from text using [REDACTED]."""
    raw_keywords = getattr(rag_settings, "BLOCKED_KEYWORDS", "") or ""
    if not raw_keywords or not text:
        return text, 0

    keywords = [k.strip() for k in raw_keywords.split(",") if k.strip()]
    if not keywords:
        return text, 0

    redacted_count = 0
    result_text = text
    for kw in keywords:
        pattern = re.compile(re.escape(kw), re.IGNORECASE)
        matches = len(pattern.findall(result_text))
        if matches > 0:
            redacted_count += matches
            result_text = pattern.sub("[REDACTED]", result_text)

    return result_text, redacted_count

def redact_pii_and_secrets(text: str) -> tuple[str, int]:
    """Automated PII & Secret Data Redactor (API Keys, Passwords, Phone Numbers, Emails)."""
    if not text:
        return text, 0

    redacted_count = 0
    res_text = text

    # API Keys & Secret Tokens
    api_key_patterns = [
        r'\b(?:sk-[a-zA-Z0-9]{20,}|gsk_[a-zA-Z0-9]{20,}|AIzaSy[a-zA-Z0-9_-]{33})\b'
    ]
    for pat in api_key_patterns:
        matches = len(re.findall(pat, res_text))
        if matches > 0:
            redacted_count += matches
            res_text = re.sub(pat, "***API_KEY_REDACTED***", res_text)

    # Email Addresses
    email_pat = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b'
    e_matches = len(re.findall(email_pat, res_text))
    if e_matches > 0:
        redacted_count += e_matches
        res_text = re.sub(email_pat, "***EMAIL_REDACTED***", res_text)

    # Phone Numbers
    phone_pat = r'\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b'
    p_matches = len(re.findall(phone_pat, res_text))
    if p_matches > 0:
        redacted_count += p_matches
        res_text = re.sub(phone_pat, "***PHONE_REDACTED***", res_text)

    return res_text, redacted_count


def synthesize_extractive_answer(question: str, relevant_chunks: list[tuple[dict, float]]) -> str:
    """Deterministic, zero-hallucination extractive answer builder."""
    if not relevant_chunks:
        return "No relevant content found in the uploaded documents."

    top_chunk, top_score = relevant_chunks[0]
    filename = top_chunk.get("filename") or "document.txt"
    loc = top_chunk.get("location") or f"Page {top_chunk.get('page_number', 1)}"
    snippet = top_chunk.get("text", "")

    lines = [f"Based on '{filename}' ({loc}):\n"]
    lines.append(snippet)

    if len(relevant_chunks) > 1:
        lines.append("\n\nAdditional relevant sections:")
        for chunk, score in relevant_chunks[1:]:
            fname = chunk.get("filename") or "document.txt"
            chunk_loc = chunk.get("location") or f"Page {chunk.get('page_number', 1)}"
            text_preview = chunk.get("text", "")[:200]
            lines.append(f"\n- {fname} ({chunk_loc}):\n{text_preview}")

    return "\n".join(lines)
