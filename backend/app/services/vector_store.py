import numpy as np
import hashlib
import os
import re
import uuid
from app.core.rag_config import rag_settings

SentenceTransformer = None
HAS_SENTENCE_TRANSFORMERS = True

try:
    from qdrant_client import QdrantClient
    from qdrant_client.http import models as qmodels
    HAS_QDRANT = True
except ImportError:
    HAS_QDRANT = False
    qmodels = None

try:
    from rank_bm25 import BM25Okapi
    HAS_BM25 = True
except ImportError:
    HAS_BM25 = False
    BM25Okapi = None

try:
    from langchain_core.documents import Document as LCDocument
    from langchain_community.retrievers import BM25Retriever
    HAS_LANGCHAIN = True
except ImportError:
    HAS_LANGCHAIN = False
    LCDocument = None
    BM25Retriever = None




STOPWORDS = frozenset(
    "a an the is are was were be been being have has had do does did "
    "will shall would should can could may might must of in on at to for "
    "with by from as into through during before after above below between "
    "out off over under again further then once here there when where why "
    "how all each every both few more most other some such no nor not only "
    "own same so than too very and but if or because until while".split()
)

def _tokenize(text: str) -> list[str]:
    """Lower-case, strip punctuation, remove stopwords."""
    tokens = re.findall(r"[a-z0-9]+", text.lower())
    return [t for t in tokens if t not in STOPWORDS and len(t) > 1]

def _fallback_embed(texts: list[str]) -> np.ndarray:
    """Word-level feature-hashing embedder (384-dim)."""
    DIM = 384
    embeddings = []
    for text in texts:
        vec = np.zeros(DIM, dtype=np.float32)
        tokens = _tokenize(text)
        if not tokens:
            embeddings.append(vec)
            continue

        for token in tokens:
            h = hashlib.md5(token.encode()).hexdigest()
            idx1 = int(h[:8], 16) % DIM
            idx2 = int(h[8:16], 16) % DIM
            idx3 = int(h[16:24], 16) % DIM
            sign = 1.0 if int(h[24:26], 16) % 2 == 0 else -1.0
            vec[idx1] += sign * 1.0
            vec[idx2] += sign * 0.7
            vec[idx3] += sign * 0.4

        norm = np.linalg.norm(vec)
        if norm > 0:
            vec /= norm
        embeddings.append(vec)
    return np.array(embeddings, dtype=np.float32)


class QdrantVectorStore:
    def __init__(self):
        self.model = None
        self._model_load_attempted = False
        print(f"Embedding model deferred until first use: {rag_settings.EMBEDDING_MODEL_NAME}.")

        self.chunks: list[dict] = []
        self.embeddings: np.ndarray | None = None
        self.documents: dict[str, dict] = {}
        self.query_history: list[dict] = []

        # Qdrant client setup
        self.qdrant_client = None
        self.collection_name = getattr(rag_settings, "QDRANT_COLLECTION_NAME", "nexora_documents")
        self.use_qdrant = False
        self._qdrant_init_attempted = False

        if os.getenv("EAGER_QDRANT_INIT", "").lower() in {"1", "true", "yes"}:
            self._ensure_qdrant_initialized()
        
        # Seed initial knowledge base document
        self.seed_sample_documents()

    def _init_qdrant(self):
        raw_url = getattr(rag_settings, "QDRANT_URL", "") or os.getenv("QDRANT_URL", "")
        qdrant_api_key = getattr(rag_settings, "QDRANT_API_KEY", "") or os.getenv("QDRANT_API_KEY", "")

        if HAS_QDRANT and raw_url and qdrant_api_key:
            candidate_urls = []
            clean_url = raw_url.replace(":6333", "").strip()
            candidate_urls.append(clean_url)
            if raw_url != clean_url:
                candidate_urls.append(raw_url)

            for url in candidate_urls:
                try:
                    print(f"Connecting to Qdrant Cloud at {url}...")
                    self.qdrant_client = QdrantClient(
                        url=url,
                        api_key=qdrant_api_key,
                        timeout=30.0,
                        prefer_grpc=False
                    )
                    collections = [c.name for c in self.qdrant_client.get_collections().collections]
                    sample_dim = int(os.getenv("EMBEDDING_DIM", "384"))

                    if self.collection_name not in collections:
                        print(f"Creating Qdrant collection '{self.collection_name}' (vector dimension: {sample_dim})...")
                        self.qdrant_client.create_collection(
                            collection_name=self.collection_name,
                            vectors_config=qmodels.VectorParams(size=sample_dim, distance=qmodels.Distance.COSINE)
                        )
                    # Create payload index for doc_id filtering
                    try:
                        self.qdrant_client.create_payload_index(
                            collection_name=self.collection_name,
                            field_name="doc_id",
                            field_schema=qmodels.PayloadSchemaType.KEYWORD
                        )
                    except Exception:
                        pass

                    self.use_qdrant = True
                    print(f"Qdrant Cloud vector store initialized successfully (collection: '{self.collection_name}').")
                    self._sync_from_qdrant()
                    return
                except Exception as e:
                    print(f"Connection attempt to {url} failed: {e}")

            print("Warning: All Qdrant Cloud connection attempts failed. Falling back to local vector store.")
            self.use_qdrant = False
        else:
            print("Qdrant Cloud credentials not specified. Operating in local vector store mode.")

    def _ensure_qdrant_initialized(self):
        if self._qdrant_init_attempted:
            return
        self._qdrant_init_attempted = True
        self._init_qdrant()

    def _sync_from_qdrant(self):
        """Load indexed document metadata & chunks from Qdrant Cloud into memory."""
        if not (self.use_qdrant and self.qdrant_client):
            return
        try:
            records, _ = self.qdrant_client.scroll(
                collection_name=self.collection_name,
                limit=500,
                with_payload=True,
                with_vectors=True
            )
            if not records:
                return

            self.chunks = []
            embeddings_list = []
            self.documents = {}

            for r in records:
                payload = dict(r.payload or {})
                doc_id = payload.get("doc_id", "unknown_doc")
                filename = payload.get("filename", "document.txt")

                self.chunks.append(payload)
                if hasattr(r, 'vector') and r.vector:
                    embeddings_list.append(r.vector)

                if doc_id not in self.documents:
                    self.documents[doc_id] = {
                        "doc_id": doc_id,
                        "filename": filename,
                        "page_count": 1,
                        "chunk_count": 0
                    }
                self.documents[doc_id]["chunk_count"] += 1

            if embeddings_list:
                self.embeddings = np.array(embeddings_list, dtype=np.float32)
            print(f"Synced {len(self.chunks)} chunks across {len(self.documents)} documents from Qdrant Cloud.")
        except Exception as e:
            print(f"Qdrant sync notice: {e}")



    def seed_sample_documents(self):
        """Do not seed initial documents. Knowledge base starts clean and empty."""
        pass

    def log_query(self, question: str, sources_count: int, latency_ms: int):
        self.query_history.insert(0, {
            "id": f"q_{len(self.query_history) + 1}",
            "question": question,
            "sources": sources_count,
            "responseTime": f"{latency_ms}ms",
            "timestamp": "Just now"
        })
        if len(self.query_history) > 50:
            self.query_history.pop()

    def _encode_texts(self, texts: list[str]) -> np.ndarray:
        self._load_embedding_model()
        if self.model is not None:
            try:
                return self.model.encode(texts, convert_to_numpy=True)
            except Exception:
                pass
        return _fallback_embed(texts)

    def _load_embedding_model(self):
        global SentenceTransformer, HAS_SENTENCE_TRANSFORMERS

        if self._model_load_attempted or not HAS_SENTENCE_TRANSFORMERS:
            return

        self._model_load_attempted = True
        if os.getenv("ENABLE_SENTENCE_TRANSFORMERS", "").lower() not in {"1", "true", "yes"}:
            print("Using fallback word-hash embedder (sentence-transformers disabled by default).")
            return

        print(f"Loading embedding model: {rag_settings.EMBEDDING_MODEL_NAME}...")
        try:
            if SentenceTransformer is None:
                from sentence_transformers import SentenceTransformer as _SentenceTransformer
                SentenceTransformer = _SentenceTransformer
            self.model = SentenceTransformer(rag_settings.EMBEDDING_MODEL_NAME)
            print(f"SentenceTransformer ('{rag_settings.EMBEDDING_MODEL_NAME}') loaded successfully.")
        except ImportError:
            HAS_SENTENCE_TRANSFORMERS = False
            self.model = None
            print("Using fallback word-hash embedder (sentence-transformers not installed).")
        except Exception as e:
            print(f"SentenceTransformer load warning ({e}). Trying local cache.")
            try:
                self.model = SentenceTransformer(rag_settings.EMBEDDING_MODEL_NAME, local_files_only=True)
            except Exception:
                self.model = None
                print("Using fallback word-hash embedder (no SentenceTransformer).")

    def add_document(self, doc_id: str, filename: str, page_count: int, chunks: list[dict], owner: str = "System Admin"):
        """Add chunks of a document to the vector store (Qdrant & Local fallback)."""
        for c in chunks:
            c["owner"] = owner

        texts = [c["text"] for c in chunks]
        new_embeddings = self._encode_texts(texts)

        # Update local memory copy
        if self.embeddings is None or len(self.embeddings) == 0:
            self.embeddings = new_embeddings
        else:
            self.embeddings = np.vstack([self.embeddings, new_embeddings])

        self.chunks.extend(chunks)
        self.documents[doc_id] = {
            "doc_id": doc_id,
            "filename": filename,
            "page_count": page_count,
            "chunk_count": len(chunks),
            "owner": owner
        }

        # Upsert into Qdrant Cloud if enabled
        self._ensure_qdrant_initialized()
        if self.use_qdrant and self.qdrant_client and qmodels:
            try:
                points = []
                for idx, c in enumerate(chunks):
                    point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, str(c.get("chunk_id", f"{doc_id}_{idx}"))))
                    payload = {
                        "chunk_id": c.get("chunk_id", f"{doc_id}_{idx}"),
                        "doc_id": doc_id,
                        "filename": filename,
                        "location": c.get("location", "page_1"),
                        "text": c.get("text", ""),
                        "owner": owner
                    }
                    points.append(qmodels.PointStruct(
                        id=point_id,
                        vector=new_embeddings[idx].tolist(),
                        payload=payload
                    ))
                self.qdrant_client.upsert(collection_name=self.collection_name, points=points)
                print(f"Upserted {len(points)} points into Qdrant collection '{self.collection_name}'.")
            except Exception as e:
                print(f"Qdrant Cloud upsert error: {e}. Falling back to local vectors.")

    def search(self, query: str, top_k: int = 4, doc_ids: list[str] | None = None) -> list[tuple[dict, float]]:
        """Search top-k relevant chunks filtered by optional doc_ids."""
        query_vec = self._encode_texts([query])[0]

        # 1. Try Qdrant Cloud search first
        self._ensure_qdrant_initialized()
        if self.use_qdrant and self.qdrant_client and qmodels:
            try:
                query_filter = None
                if doc_ids and len(doc_ids) > 0:
                    query_filter = qmodels.Filter(
                        must=[
                            qmodels.FieldCondition(
                                key="doc_id",
                                match=qmodels.MatchAny(any=doc_ids)
                            )
                        ]
                    )

                limit_candidates = max(12, top_k * 3)
                if hasattr(self.qdrant_client, 'query_points'):
                    search_res = self.qdrant_client.query_points(
                        collection_name=self.collection_name,
                        query=query_vec.tolist(),
                        query_filter=query_filter,
                        limit=limit_candidates
                    )
                    hits = search_res.points
                else:
                    hits = self.qdrant_client.search(
                        collection_name=self.collection_name,
                        query_vector=query_vec.tolist(),
                        query_filter=query_filter,
                        limit=limit_candidates
                    )

                candidate_pool = []
                seen_texts = set()
                for hit in hits:
                    chunk_payload = dict(hit.payload or {})
                    v_score = float(hit.score)
                    txt = chunk_payload.get("text", "")
                    if txt not in seen_texts:
                        seen_texts.add(txt)
                        candidate_pool.append((chunk_payload, v_score))

                if candidate_pool:
                    results = []
                    query_tokens = _tokenize(query)
                    
                    if BM25Okapi and query_tokens:
                        corpus = [_tokenize(c[0].get("text", "")) for c in candidate_pool]
                        bm25 = BM25Okapi(corpus)
                        bm25_raw_scores = bm25.get_scores(query_tokens)
                        max_bm25 = max(bm25_raw_scores) if (len(bm25_raw_scores) > 0 and max(bm25_raw_scores) > 0) else 1.0
                        
                        for idx, (chunk_payload, v_score) in enumerate(candidate_pool):
                            k_score = float(bm25_raw_scores[idx]) / max_bm25
                            # Hybrid Score: 70% Qdrant Dense Cosine Vector + 30% BM25Okapi Sparse TF-IDF Score
                            hybrid_score = round((0.70 * v_score) + (0.30 * k_score), 4)
                            results.append((chunk_payload, hybrid_score))
                    else:
                        results = candidate_pool

                    results.sort(key=lambda x: x[1], reverse=True)
                    return results[:top_k]



            except Exception as e:
                print(f"Qdrant Cloud search failed ({e}). Falling back to local vector search.")

        # 2. Local vector search fallback
        if not self.chunks or self.embeddings is None:
            return []

        if doc_ids and len(doc_ids) > 0:
            target_indices = [i for i, c in enumerate(self.chunks) if c.get("doc_id") in doc_ids]
            if not target_indices:
                return []
            candidate_chunks = [self.chunks[i] for i in target_indices]
            candidate_embeddings = self.embeddings[target_indices]
        else:
            candidate_chunks = self.chunks
            candidate_embeddings = self.embeddings

        norms = np.linalg.norm(candidate_embeddings, axis=1) * np.linalg.norm(query_vec)
        norms[norms == 0] = 1e-10
        similarities = np.dot(candidate_embeddings, query_vec) / norms

        top_candidate_count = min(max(12, top_k * 3), len(candidate_chunks))
        candidate_indices = np.argsort(similarities)[::-1][:top_candidate_count]

        pool = [(candidate_chunks[idx], float(similarities[idx])) for idx in candidate_indices]
        query_tokens = _tokenize(query)

        if BM25Okapi and query_tokens:
            corpus = [_tokenize(c[0].get("text", "")) for c in pool]
            bm25 = BM25Okapi(corpus)
            bm25_raw_scores = bm25.get_scores(query_tokens)
            max_bm25 = max(bm25_raw_scores) if (len(bm25_raw_scores) > 0 and max(bm25_raw_scores) > 0) else 1.0
            
            results = []
            for idx, (chunk_payload, v_score) in enumerate(pool):
                k_score = float(bm25_raw_scores[idx]) / max_bm25
                hybrid_score = round((0.70 * v_score) + (0.30 * k_score), 4)
                results.append((chunk_payload, hybrid_score))
            results.sort(key=lambda x: x[1], reverse=True)
            return results[:top_k]
            return pool[:top_k]

    def langchain_search(self, query: str, top_k: int = 4, doc_ids: list[str] | None = None) -> list[tuple[dict, float]]:
        """Search top-k relevant chunks using LangChain BM25Retriever & LCDocument abstractions combined with Qdrant vector store."""
        # 1. Query candidate chunks from Qdrant Cloud
        vector_results = self.search(query, top_k=min(16, top_k * 4), doc_ids=doc_ids)

        if not vector_results:
            return []

        if not HAS_LANGCHAIN:
            return vector_results[:top_k]

        try:
            # 2. Build LangChain Documents from Qdrant vector candidate payloads
            lc_docs = [
                LCDocument(
                    page_content=payload["text"],
                    metadata=payload
                )
                for payload, _ in vector_results
            ]

            # 3. Initialize & invoke LangChain BM25Retriever
            retriever = BM25Retriever.from_documents(lc_docs)
            retriever.k = min(len(lc_docs), top_k * 2)
            retrieved_lc_docs = retriever.invoke(query)

            # 4. Perform Reciprocal Rank Fusion (RRF) between Qdrant Dense Vector & LangChain BM25
            rrf_scores = {}
            chunk_map = {}

            # Dense Vector ranks
            for rank, (payload, v_score) in enumerate(vector_results):
                cid = payload.get("chunk_id", hash(payload.get("text", "")))
                rrf_scores[cid] = rrf_scores.get(cid, 0.0) + (0.70 * v_score) + (1.0 / (60 + rank + 1))
                chunk_map[cid] = payload

            # LangChain BM25 ranks
            max_bm25_rank = max(1, len(retrieved_lc_docs))
            for rank, doc in enumerate(retrieved_lc_docs):
                cid = doc.metadata.get("chunk_id", hash(doc.page_content))
                bm25_score = (max_bm25_rank - rank) / max_bm25_rank
                rrf_scores[cid] = rrf_scores.get(cid, 0.0) + (0.30 * bm25_score) + (1.0 / (60 + rank + 1))
                if cid not in chunk_map:
                    chunk_map[cid] = doc.metadata

            sorted_cids = sorted(rrf_scores.keys(), key=lambda k: rrf_scores[k], reverse=True)

            results = []
            for cid in sorted_cids[:top_k]:
                score = round(rrf_scores[cid], 4)
                results.append((chunk_map[cid], score))

            return results

        except Exception as e:
            print(f"LangChain search exception ({e}). Falling back to standard vector search.")
            return vector_results[:top_k]




    def delete_document(self, doc_id: str) -> bool:
        """Delete document by doc_id from both Qdrant Cloud and local memory with zero-point verification."""
        doc_id = str(doc_id).strip()
        
        initial_chunk_count = len(self.chunks)
        self.chunks = [c for c in self.chunks if str(c.get("doc_id")).strip() != doc_id]
        
        if self.embeddings is not None and len(self.embeddings) > 0:
            keep_indices = [i for i, c in enumerate(self.chunks) if str(c.get("doc_id")).strip() != doc_id]
            if keep_indices and len(keep_indices) > 0:
                self.embeddings = self.embeddings[keep_indices]
            else:
                self.embeddings = None

        deleted_local = doc_id in self.documents or (len(self.chunks) < initial_chunk_count)
        if doc_id in self.documents:
            del self.documents[doc_id]

        deleted_qdrant = False
        self._ensure_qdrant_initialized()
        if self.use_qdrant and self.qdrant_client and qmodels:
            try:
                filter_obj = qmodels.Filter(
                    must=[
                        qmodels.FieldCondition(
                            key="doc_id",
                            match=qmodels.MatchValue(value=doc_id)
                        )
                    ]
                )
                
                self.qdrant_client.delete(
                    collection_name=self.collection_name,
                    points_selector=qmodels.FilterSelector(filter=filter_obj)
                )

                count_res = self.qdrant_client.count(
                    collection_name=self.collection_name,
                    count_filter=filter_obj
                )
                remaining = count_res.count
                if remaining == 0:
                    deleted_qdrant = True
                    print(f"[VERIFIED QDRANT DELETE] Deleted all points for doc_id='{doc_id}' (0 points remaining).")
                else:
                    print(f"[WARNING QDRANT DELETE] Delete called for doc_id='{doc_id}', but {remaining} points remain.")
            except Exception as e:
                print(f"[QDRANT DELETE ERROR] Error deleting doc_id='{doc_id}': {e}")

        return deleted_local or deleted_qdrant



    def clear(self):
        """Remove all indexed documents, chunks, embeddings, and query history."""
        self.chunks = []
        self.embeddings = None
        self.documents = {}
        self.query_history = []

        self._ensure_qdrant_initialized()
        if self.use_qdrant and self.qdrant_client and qmodels:
            try:
                self.qdrant_client.delete_collection(collection_name=self.collection_name)
                sample_dim = int(os.getenv("EMBEDDING_DIM", "384"))
                self.qdrant_client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=qmodels.VectorParams(size=sample_dim, distance=qmodels.Distance.COSINE)
                )
                print(f"Cleared Qdrant Cloud collection '{self.collection_name}'.")
            except Exception as e:
                print(f"Qdrant Cloud clear warning: {e}")

    def list_documents(self, owner: str | None = None) -> list[dict]:
        self._ensure_qdrant_initialized()
        if owner and owner != "System Admin":
            return [doc for doc in self.documents.values() if doc.get("owner") == owner]
        return list(self.documents.values())

# Alias for backward compatibility
LocalVectorStore = QdrantVectorStore

# Global Singleton Instance
vector_store = QdrantVectorStore()
