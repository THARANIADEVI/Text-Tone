import os
from datetime import datetime, timedelta, timezone
from functools import wraps

import jwt
from flask import request, jsonify, g
from werkzeug.security import generate_password_hash, check_password_hash

JWT_ALGORITHM = "HS256"
JWT_EXPIRES_HOURS = 24 * 7


def hash_password(password):
    return generate_password_hash(password)


def verify_password(password, password_hash):
    return check_password_hash(password_hash, password)


def _secret():
    # required at call time (not import time) so tests/scripts can set it before first use
    secret = os.getenv("JWT_SECRET")
    if not secret:
        raise RuntimeError("JWT_SECRET environment variable is not set.")
    return secret


def create_token(user_id):
    payload = {
        "sub": str(user_id),  # PyJWT >=2.10 requires "sub" to be a string
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRES_HOURS),
    }
    return jwt.encode(payload, _secret(), algorithm=JWT_ALGORITHM)


def decode_token(token):
    payload = jwt.decode(token, _secret(), algorithms=[JWT_ALGORITHM])
    return int(payload["sub"])


def _decode_request_token():
    """Returns (user_id, None) on success or (None, (response, status)) on failure."""
    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        return None, (jsonify({"success": False, "error": "Authentication required."}), 401)

    token = header[len("Bearer "):]
    try:
        return decode_token(token), None
    except jwt.ExpiredSignatureError:
        return None, (jsonify({"success": False, "error": "Session expired. Please log in again."}), 401)
    except jwt.InvalidTokenError:
        return None, (jsonify({"success": False, "error": "Invalid authentication token."}), 401)


def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        user_id, error = _decode_request_token()
        if error:
            return error
        g.user_id = user_id
        return view(*args, **kwargs)

    return wrapped


def is_admin_email(email):
    admin_emails = {e.strip().lower() for e in os.getenv("ADMIN_EMAILS", "").split(",") if e.strip()}
    return (email or "").strip().lower() in admin_emails


def admin_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        user_id, error = _decode_request_token()
        if error:
            return error

        from utils.db import get_user_by_id  # deferred to avoid a module import cycle

        user = get_user_by_id(user_id)
        if not user or not is_admin_email(user["email"]):
            return jsonify({"success": False, "error": "Admin access required."}), 403

        g.user_id = user_id
        return view(*args, **kwargs)

    return wrapped
