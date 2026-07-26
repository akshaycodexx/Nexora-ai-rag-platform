from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.document_parser import extract_chunks_from_file
from app.services.vector_store import vector_store
from app.services.rag_engine import query_rag_system
from app.schemas.rag import PDFUploadResponse, RAGQueryRequest, RAGQueryResponse
from app.services.activity_logger import log_activity

router = APIRouter(prefix="/rag", tags=["RAG Document Engine"])

ALLOWED_EXTENSIONS = {"pdf", "docx", "doc", "xml", "txt", "md", "json"}

@router.get("/collections")
def list_collections(owner: str | None = None):
    """Fetch knowledge base collections statistics filtered by user owner."""
    docs = vector_store.list_documents(owner=owner)
    total_docs = len(docs)

    if owner and owner != "System Admin":
        user_chunks = [c for c in (vector_store.chunks or []) if c.get("owner") == owner]
    else:
        user_chunks = vector_store.chunks or []

    total_chunks = len(user_chunks)

    return {
        "collections": [
            { "id": "col1", "name": "Technical Documentation", "docs": total_docs, "chunks": total_chunks, "model": "SentenceTransformer MiniLM", "updated": "Just now", "status": "Operational" },
            { "id": "col2", "name": "Security & Compliance", "docs": max(0, total_docs // 2), "chunks": total_chunks // 2, "model": "SentenceTransformer MiniLM", "updated": "2 hours ago", "status": "Operational" },
            { "id": "col3", "name": "Engineering Architecture Specs", "docs": max(0, total_docs // 3), "chunks": total_chunks // 3, "model": "SentenceTransformer MiniLM", "updated": "1 day ago", "status": "Operational" }
        ]
    }

@router.post("/upload-document", response_model=PDFUploadResponse, status_code=status.HTTP_201_CREATED)
@router.post("/upload-pdf", response_model=PDFUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(file: UploadFile = File(...), owner: str = "System Admin", db: Session = Depends(get_db)):
    """Upload PDF, DOCX, XML, or TXT document, extract text chunks, compute vector embeddings, and index."""
    filename = file.filename or "document.txt"
    ext = filename.lower().split('.')[-1]

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '.{ext}'. Supported formats: PDF, DOCX, XML, TXT, MD."
        )

    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty."
        )

    try:
        chunks = extract_chunks_from_file(contents, filename)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error parsing {ext.upper()} document: {str(e)}"
        )

    if not chunks:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No readable text extracted from {filename}."
        )

    doc_id = chunks[0]["doc_id"]
    locations = set(c["location"] for c in chunks)
    location_count = len(locations)

    vector_store.add_document(doc_id, filename, location_count, chunks, owner=owner)

    log_activity(db, "Document Uploaded", f"Indexed '{filename}' ({location_count} sections, {len(chunks)} chunks)", owner, "document")

    return PDFUploadResponse(
        doc_id=doc_id,
        filename=filename,
        page_count=location_count,
        chunk_count=len(chunks),
        message=f"Successfully indexed '{filename}' ({location_count} pages/sections, {len(chunks)} text chunks)."
    )

@router.post("/query", response_model=RAGQueryResponse)
def query_rag(request: RAGQueryRequest):
    """Execute RAG question query against vector store with anti-hallucination check."""
    response = query_rag_system(
        question=request.question,
        top_k=request.top_k,
        provider_override=request.llm_provider,
        api_key_override=request.api_key,
        doc_ids=request.doc_ids
    )
    return response

@router.get("/documents")
def list_documents(owner: str | None = None):
    """List all indexed documents in vector store filtered by owner."""
    return {"documents": vector_store.list_documents(owner=owner)}

@router.delete("/documents/{doc_id}")
def delete_document(doc_id: str):
    """Delete a document from vector index."""
    success = vector_store.delete_document(doc_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document ID not found.")
    return {"message": f"Document {doc_id} successfully deleted."}

@router.delete("/clear")
def clear_all_documents():
    """Clear all documents and embeddings from vector index."""
    vector_store.clear()
    return {"message": "All documents and vector embeddings have been cleared."}
