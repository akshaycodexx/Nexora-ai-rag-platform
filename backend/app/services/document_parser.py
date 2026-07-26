import uuid
import xml.etree.ElementTree as ET
from io import BytesIO
from pypdf import PdfReader
import docx
from app.core.rag_config import rag_settings

def extract_chunks_from_file(file_bytes: bytes, filename: str) -> list[dict]:
    """Universal parser for PDF, DOCX, XML, and TXT files with metadata preservation."""
    ext = filename.lower().split('.')[-1]
    
    if ext == "pdf":
        return parse_pdf(file_bytes, filename)
    elif ext in ["docx", "doc"]:
        return parse_docx(file_bytes, filename)
    elif ext == "xml":
        return parse_xml(file_bytes, filename)
    elif ext in ["txt", "md", "json"]:
        return parse_txt(file_bytes, filename)
    else:
        raise ValueError(f"Unsupported file format: .{ext}. Supported formats: PDF, DOCX, XML, TXT.")

def chunk_text_blocks(blocks: list[dict], doc_id: str, filename: str) -> list[dict]:
    """Helper to chunk list of section text blocks into overlapping chunks with boundary preservation."""
    chunks = []
    chunk_counter = 0

    chunk_size = rag_settings.CHUNK_SIZE or 1500
    overlap = rag_settings.CHUNK_OVERLAP or 300

    for block in blocks:
        page_or_sec = block["location"]
        text = block["text"].strip()
        if not text:
            continue

        start = 0
        text_length = len(text)

        while start < text_length:
            end = start + chunk_size

            # If end is within text, attempt to find nearest sentence or paragraph boundary
            if end < text_length:
                boundary = max(
                    text.rfind("\n\n", start, end),
                    text.rfind("\n", start, end),
                    text.rfind(". ", start, end),
                    text.rfind("; ", start, end)
                )
                if boundary > start + (chunk_size // 2):
                    end = boundary + (2 if text[boundary:boundary+2] in [". ", "; "] else 1)

            chunk_text = text[start:end].strip()

            if chunk_text:
                chunk_counter += 1
                chunk_id = f"{doc_id}_c{chunk_counter}"
                chunks.append({
                    "chunk_id": chunk_id,
                    "id": chunk_id,
                    "doc_id": doc_id,
                    "filename": filename,
                    "location": page_or_sec,
                    "chunk_index": chunk_counter,
                    "text": chunk_text
                })

            if end >= text_length:
                break
            
            # Slide window with overlap
            next_start = end - overlap
            if next_start <= start:
                next_start = start + chunk_size
            start = next_start

    return chunks


def parse_pdf(pdf_bytes: bytes, filename: str) -> list[dict]:
    """Parse PDF document page by page preserving layout order."""
    reader = PdfReader(BytesIO(pdf_bytes))
    doc_id = str(uuid.uuid4())
    blocks = []

    for page_idx, page in enumerate(reader.pages):
        try:
            page_text = page.extract_text(extraction_mode="layout") or page.extract_text() or ""
        except Exception:
            page_text = page.extract_text() or ""

        if page_text.strip():
            blocks.append({
                "location": f"Page {page_idx + 1}",
                "text": page_text
            })

    return chunk_text_blocks(blocks, doc_id, filename)


def parse_docx(docx_bytes: bytes, filename: str) -> list[dict]:
    """Parse Microsoft Word DOCX document by paragraphs and headings."""
    doc = docx.Document(BytesIO(docx_bytes))
    doc_id = str(uuid.uuid4())
    blocks = []
    current_section = "Main Content"
    current_text = []

    for p in doc.paragraphs:
        text = p.text.strip()
        if not text:
            continue

        if p.style and p.style.name.startswith("Heading"):
            if current_text:
                blocks.append({
                    "location": current_section,
                    "text": "\n".join(current_text)
                })
                current_text = []
            current_section = f"Section: {text}"
        
        current_text.append(text)

    if current_text:
        blocks.append({
            "location": current_section,
            "text": "\n".join(current_text)
        })

    return chunk_text_blocks(blocks, doc_id, filename)

def parse_xml(xml_bytes: bytes, filename: str) -> list[dict]:
    """Parse XML document converting elements into structured text nodes."""
    doc_id = str(uuid.uuid4())
    blocks = []

    try:
        root = ET.fromstring(xml_bytes)
        
        def extract_element(element, path=""):
            tag_path = f"{path}/{element.tag}" if path else element.tag
            node_str = f"Tag: {tag_path}\n"
            if element.attrib:
                node_str += f"Attributes: {element.attrib}\n"
            if element.text and element.text.strip():
                node_str += f"Content: {element.text.strip()}\n"

            if len(node_str.strip()) > 10:
                blocks.append({
                    "location": f"XML Node: {tag_path}",
                    "text": node_str
                })

            for child in element:
                extract_element(child, tag_path)

        extract_element(root)
    except Exception as e:
        # Fallback to plain text if XML parsing fails
        plain_text = xml_bytes.decode("utf-8", errors="ignore")
        blocks.append({
            "location": "Raw XML Text",
            "text": plain_text
        })

    return chunk_text_blocks(blocks, doc_id, filename)

def parse_txt(txt_bytes: bytes, filename: str) -> list[dict]:
    """Parse plain text document."""
    doc_id = str(uuid.uuid4())
    text = txt_bytes.decode("utf-8", errors="ignore")
    blocks = [{
        "location": "Document Body",
        "text": text
    }]
    return chunk_text_blocks(blocks, doc_id, filename)
