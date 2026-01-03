# backend/services/parser_service.py
import pdfplumber
from fastapi import UploadFile

async def extract_text_from_pdf(file: UploadFile) -> str:
    """
    Extracts text content from an uploaded PDF file.
    """
    text_content = ""
    try:
        # pdfplumber requires a file-like object or path. 
        # UploadFile.file is a SpooledTemporaryFile which works.
        with pdfplumber.open(file.file) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    text_content += text + "\n"
        return text_content.strip()
    except Exception as e:
        print(f"Error parsing PDF: {e}")
        raise ValueError("Failed to extract text from PDF")
