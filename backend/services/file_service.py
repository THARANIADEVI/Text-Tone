import io

from docx import Document
from pypdf import PdfReader


class FileExtractionError(Exception):
    def __init__(self, message, status_code=400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def extract_text(filename, file_bytes):
    name = filename.lower()

    if name.endswith(".txt"):
        try:
            return file_bytes.decode("utf-8")
        except UnicodeDecodeError:
            raise FileExtractionError("Could not decode text file as UTF-8.", 400)

    if name.endswith(".pdf"):
        try:
            reader = PdfReader(io.BytesIO(file_bytes))
            return "\n".join(page.extract_text() or "" for page in reader.pages)
        except Exception as exc:
            raise FileExtractionError(f"Could not read PDF: {exc}", 400)

    if name.endswith(".docx"):
        try:
            document = Document(io.BytesIO(file_bytes))
            return "\n".join(p.text for p in document.paragraphs)
        except Exception as exc:
            raise FileExtractionError(f"Could not read DOCX: {exc}", 400)

    raise FileExtractionError("Unsupported file type. Use .txt, .pdf, or .docx.", 400)
