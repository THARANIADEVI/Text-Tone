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
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRES_HOURS),
    }
    return jwt.encode(payload, _secret(), algorithm=JWT_ALGORITHM)


def decode_token(token):
    payload = jwt.decode(token, _secret(), algorithms=[JWT_ALGORITHM])
    return payload["sub"]


def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        header = request.headers.get("Authorization", "")
        if not header.startswith("Bearer "):
            return jsonify({"success": False, "error": "Authentication required."}), 401

        token = header[len("Bearer "):]
        try:
            g.user_id = decode_token(token)
        except jwt.ExpiredSignatureError:
            return jsonify({"success": False, "error": "Session expired. Please log in again."}), 401
        except jwt.InvalidTokenError:
            return jsonify({"success": False, "error": "Invalid authentication token."}), 401

        return view(*args, **kwargs)

    return wrapped
