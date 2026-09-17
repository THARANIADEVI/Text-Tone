import re

from flask import Blueprint, request, jsonify, g

from utils.auth import hash_password, verify_password, create_token, login_required
from utils.db import create_user, get_user_by_email, get_user_by_id

auth_bp = Blueprint("auth", __name__)

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _public_user(user):
    return {"id": user["id"], "email": user["email"]}


@auth_bp.route("/api/auth/register", methods=["POST"])
def register():
    body = request.get_json(silent=True) or {}
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""

    if not EMAIL_RE.match(email):
        return jsonify({"success": False, "error": "Enter a valid email address."}), 400
    if len(password) < 8:
        return jsonify({"success": False, "error": "Password must be at least 8 characters."}), 400
    if get_user_by_email(email):
        return jsonify({"success": False, "error": "An account with this email already exists."}), 409

    user_id = create_user(email, hash_password(password))
    token = create_token(user_id)
    return jsonify({"success": True, "token": token, "user": {"id": user_id, "email": email}}), 201


@auth_bp.route("/api/auth/login", methods=["POST"])
def login():
    body = request.get_json(silent=True) or {}
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""

    user = get_user_by_email(email)
    if not user or not verify_password(password, user["password_hash"]):
        return jsonify({"success": False, "error": "Invalid email or password."}), 401

    token = create_token(user["id"])
    return jsonify({"success": True, "token": token, "user": _public_user(user)}), 200


@auth_bp.route("/api/auth/me", methods=["GET"])
@login_required
def me():
    user = get_user_by_id(g.user_id)
    if not user:
        return jsonify({"success": False, "error": "User not found."}), 404
    return jsonify({"success": True, "user": _public_user(user)}), 200
