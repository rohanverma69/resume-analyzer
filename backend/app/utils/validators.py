import re
import zipfile
import io

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")


def validate_email(email: str) -> bool:
    if not email or not isinstance(email, str) or len(email) > 255:
        return False
    return bool(EMAIL_REGEX.match(email.strip()))


def validate_password(password: str) -> tuple[bool, str]:
    if not password or not isinstance(password, str):
        return False, "Password cannot be empty."
    if len(password) < 8:
        return False, "Password must be at least 8 characters long."
    if len(password) > 128:
        return False, "Password cannot exceed 128 characters."
    return True, ""


def validate_file_content(file_bytes: bytes, filename: str) -> tuple[bool, str, str]:
    """
    Validates uploaded file size, extension, and binary signature.
    Returns: (is_valid, detected_type, error_message)
    """
    if not file_bytes:
        return False, "", "The uploaded file is empty (0 bytes)."

    max_size = 5 * 1024 * 1024  # 5 MB
    if len(file_bytes) > max_size:
        return False, "", "File size exceeds the 5 MB limit."

    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in {"pdf", "docx"}:
        return False, "", f"Unsupported file extension '.{ext}'. Allowed types are PDF and DOCX."

    # Validate binary signatures
    if ext == "pdf":
        if not file_bytes.startswith(b"%PDF-"):
            return False, "", "Invalid PDF file: Missing standard %PDF- header signature."
        return True, "pdf", ""

    if ext == "docx":
        # DOCX is an OpenXML ZIP archive starting with PK\x03\x04
        if not file_bytes.startswith(b"PK\x03\x04"):
            return False, "", "Invalid DOCX file: Missing standard ZIP/OpenXML signature."
        try:
            with zipfile.ZipFile(io.BytesIO(file_bytes)) as z:
                # Check for word/document.xml
                filenames = z.namelist()
                if not any("word/document.xml" in name for name in filenames):
                    return False, "", "Invalid DOCX document: Missing word/document.xml."
        except zipfile.BadZipFile:
            return False, "", "Corrupted or malformed DOCX document."
        except Exception as e:
            return False, "", f"Failed to verify DOCX structure: {str(e)}"
        return True, "docx", ""

    return False, "", "Unsupported document format."
