import datetime
import re
import os
import secrets
from functools import wraps
import jwt
from flask import request, jsonify, current_app, g
from app.models.user import User


def generate_auth_token(user_id: int) -> str:
    """Generate a signed JWT authentication token."""
    secret = current_app.config["JWT_SECRET_KEY"]
    expires = datetime.datetime.now(datetime.timezone.utc) + current_app.config["JWT_ACCESS_TOKEN_EXPIRES"]
    payload = {
        "sub": str(user_id),
        "iat": datetime.datetime.now(datetime.timezone.utc),
        "exp": expires,
        "jti": secrets.token_hex(16),
    }
    return jwt.encode(payload, secret, algorithm="HS256")


def decode_auth_token(token: str) -> dict:
    """Decode and validate a JWT authentication token."""
    secret = current_app.config["JWT_SECRET_KEY"]
    try:
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired. Please log in again.")
    except jwt.InvalidTokenError:
        raise ValueError("Invalid authentication token.")


def get_token_from_request() -> str | None:
    """Extract token from Authorization header or cookie."""
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ", 1)[1].strip()

    # Fallback to secure cookie if present
    cookie_token = request.cookies.get("careerai_token")
    if cookie_token:
        return cookie_token

    return None


def login_required(f):
    """Decorator to enforce authentication on private endpoints."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = get_token_from_request()
        if not token:
            return jsonify({
                "success": False,
                "error": "Authentication required. Please provide a valid Bearer token.",
                "code": "AUTH_REQUIRED"
            }), 401

        try:
            payload = decode_auth_token(token)
            user_id = int(payload.get("sub"))
            from app.extensions import db
            user = db.session.get(User, user_id)
            if not user or not user.is_active:
                return jsonify({
                    "success": False,
                    "error": "Account not found or has been deactivated.",
                    "code": "ACCOUNT_INACTIVE"
                }), 401

            g.current_user = user
        except ValueError as e:
            return jsonify({
                "success": False,
                "error": str(e),
                "code": "INVALID_TOKEN"
            }), 401
        except Exception:
            return jsonify({
                "success": False,
                "error": "Authentication failure.",
                "code": "AUTH_ERROR"
            }), 401

        return f(*args, **kwargs)

    return decorated_function


def sanitize_filename(filename: str) -> str:
    """Sanitize filename to prevent directory traversal and filesystem attacks."""
    if not filename:
        return "resume.pdf"
    # Strip paths
    basename = os.path.basename(filename)
    # Remove any non-alphanumeric, dot, underscore, dash
    clean = re.sub(r"[^a-zA-Z0-9._-]", "_", basename)
    # Collapse duplicate dots and underscores
    clean = re.sub(r"\.{2,}", ".", clean)
    clean = re.sub(r"_{2,}", "_", clean)
    # Ensure it's not empty and reasonable length
    if not clean or clean.startswith("."):
        clean = f"document_{clean.lstrip('.')}"
    return clean[:120]


def mask_sensitive_text(text: str) -> str:
    """Mask email and phone numbers for safe logging."""
    if not text:
        return ""
    # Mask emails: j***e@domain.com
    text = re.sub(r"([a-zA-Z0-9._%+-])[a-zA-Z0-9._%+-]*@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})", r"\1***@\2", text)
    # Mask phone numbers
    text = re.sub(r"(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}", r"[REDACTED_PHONE]", text)
    return text
