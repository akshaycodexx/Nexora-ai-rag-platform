from app.services.document_parser import extract_chunks_from_file

def extract_chunks_from_pdf(pdf_bytes: bytes, filename: str) -> list[dict]:
    """Extract page text from PDF and split into sentence-aware overlapping chunks with metadata."""
    return extract_chunks_from_file(pdf_bytes, filename)

