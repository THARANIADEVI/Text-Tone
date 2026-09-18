import os
from flask import Blueprint, request, jsonify, send_from_directory, current_app, g

from services.tts_service import (
    synthesize,
    get_supported_languages,
    get_voices,
    TTSError,
    AUDIO_DIR,
)
from services.file_service import extract_text, FileExtractionError
from services.ai_service import enhance_text, AIError
from services.storage_service import upload_audio
from utils.auth import login_required
from utils.db import (
    add_history,
    list_history,
    delete_history,
    get_history_entry,
    add_favorite,
    list_favorites,
    delete_favorite,
    DuplicateFavoriteError,
)

MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5MB

tts_bp = Blueprint("tts", __name__)


@tts_bp.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200


@tts_bp.route("/api/languages", methods=["GET"])
def languages():
    return jsonify({"success": True, "languages": get_supported_languages()}), 200


@tts_bp.route("/api/voices", methods=["GET"])
def voices():
    language = request.args.get("language")
    try:
        data = get_voices(language)
    except TTSError as err:
        return jsonify({"success": False, "error": err.message}), err.status_code
    return jsonify({"success": True, "voices": data}), 200


@tts_bp.route("/api/tts", methods=["POST"])
@login_required
def generate_tts():
    if not request.is_json:
        return jsonify({"success": False, "error": "Content-Type must be application/json."}), 400

    body = request.get_json(silent=True) or {}
    text = body.get("text", "")
    language = body.get("language", "")
    voice = body.get("voice", "")
    speed = body.get("speed")  # "normal" | "slow" | None (falls back to voice default)

    max_length = current_app.config["MAX_TEXT_LENGTH"]

    try:
        filename = synthesize(text, language, voice, max_length, speed)
    except TTSError as err:
        return jsonify({"success": False, "error": err.message}), err.status_code
    except Exception as exc:  # unexpected failure -> 500, never leak internals
        current_app.logger.exception("Unexpected TTS failure")
        return jsonify({"success": False, "error": "Internal server error."}), 500

    local_path = os.path.join(AUDIO_DIR, filename)
    cloud_url = upload_audio(local_path, filename)
    if cloud_url:
        audio_url = cloud_url
        try:
            os.remove(local_path)  # spec: don't keep generated audio on disk once it's in cloud storage
        except OSError:
            pass
    else:
        audio_url = f"/audio/{filename}"

    add_history(text, language, voice, audio_url, g.user_id)
    return jsonify({"success": True, "audio_url": audio_url}), 201


@tts_bp.route("/api/extract-text", methods=["POST"])
@login_required
def extract_text_route():
    if "file" not in request.files:
        return jsonify({"success": False, "error": "No file uploaded."}), 400

    file = request.files["file"]
    if not file.filename:
        return jsonify({"success": False, "error": "No file selected."}), 400

    file_bytes = file.read()
    if len(file_bytes) > MAX_UPLOAD_BYTES:
        return jsonify({"success": False, "error": "File too large (max 5MB)."}), 400

    try:
        text = extract_text(file.filename, file_bytes)
    except FileExtractionError as err:
        return jsonify({"success": False, "error": err.message}), err.status_code

    max_length = current_app.config["MAX_TEXT_LENGTH"]
    return jsonify({"success": True, "text": text.strip()[:max_length]}), 200


@tts_bp.route("/api/enhance-text", methods=["POST"])
@login_required
def enhance_text_route():
    body = request.get_json(silent=True) or {}
    text = (body.get("text") or "").strip()
    action = body.get("action", "")

    if not text:
        return jsonify({"success": False, "error": "Text must not be empty."}), 400

    max_length = current_app.config["MAX_TEXT_LENGTH"]
    if len(text) > max_length:
        return jsonify(
            {"success": False, "error": f"Text exceeds maximum length of {max_length} characters."}
        ), 400

    try:
        enhanced = enhance_text(text, action)
    except AIError as err:
        return jsonify({"success": False, "error": err.message}), err.status_code

    return jsonify({"success": True, "text": enhanced[:max_length]}), 200


@tts_bp.route("/api/history", methods=["GET"])
@login_required
def get_history():
    return jsonify({"success": True, "history": list_history(g.user_id)}), 200


@tts_bp.route("/api/history/<int:entry_id>", methods=["DELETE"])
@login_required
def remove_history(entry_id):
    deleted = delete_history(entry_id, g.user_id)
    if not deleted:
        return jsonify({"success": False, "error": "History entry not found."}), 404
    return jsonify({"success": True}), 200


@tts_bp.route("/api/favorites", methods=["GET"])
@login_required
def get_favorites():
    favorite_type = request.args.get("type")
    if favorite_type not in (None, "voice", "history"):
        return jsonify({"success": False, "error": "type must be 'voice' or 'history'."}), 400
    return jsonify({"success": True, "favorites": list_favorites(g.user_id, favorite_type)}), 200


@tts_bp.route("/api/favorites", methods=["POST"])
@login_required
def create_favorite():
    body = request.get_json(silent=True) or {}
    favorite_type = body.get("favorite_type")

    if favorite_type == "voice":
        language = body.get("language")
        voice_id = body.get("voice_id")
        if not language or not voice_id:
            return jsonify({"success": False, "error": "language and voice_id are required."}), 400
        args = ("voice", language, voice_id, None)
    elif favorite_type == "history":
        history_id = body.get("history_id")
        if not history_id or not get_history_entry(history_id, g.user_id):
            return jsonify({"success": False, "error": "History entry not found."}), 404
        args = ("history", None, None, history_id)
    else:
        return jsonify({"success": False, "error": "favorite_type must be 'voice' or 'history'."}), 400

    try:
        favorite_id = add_favorite(g.user_id, args[0], language=args[1], voice_id=args[2], history_id=args[3])
    except DuplicateFavoriteError:
        return jsonify({"success": False, "error": "Already favorited."}), 409

    return jsonify({"success": True, "id": favorite_id}), 201


@tts_bp.route("/api/favorites/<int:favorite_id>", methods=["DELETE"])
@login_required
def remove_favorite(favorite_id):
    deleted = delete_favorite(favorite_id, g.user_id)
    if not deleted:
        return jsonify({"success": False, "error": "Favorite not found."}), 404
    return jsonify({"success": True}), 200


@tts_bp.route("/audio/<path:filename>", methods=["GET"])
def get_audio(filename):
    # basename strips any path traversal attempt (../) before hitting the filesystem
    safe_name = os.path.basename(filename)
    if not os.path.isfile(os.path.join(AUDIO_DIR, safe_name)):
        return jsonify({"success": False, "error": "Audio file not found."}), 404
    return send_from_directory(AUDIO_DIR, safe_name, mimetype="audio/mpeg")
