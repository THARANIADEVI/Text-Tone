import os
from flask import Blueprint, request, jsonify, send_from_directory, current_app

from services.tts_service import (
    synthesize,
    get_supported_languages,
    get_voices,
    TTSError,
    AUDIO_DIR,
)
from utils.db import add_history, list_history, delete_history

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

    audio_url = f"/audio/{filename}"
    add_history(text, language, voice, audio_url)
    return jsonify({"success": True, "audio_url": audio_url}), 201


@tts_bp.route("/api/history", methods=["GET"])
def get_history():
    return jsonify({"success": True, "history": list_history()}), 200


@tts_bp.route("/api/history/<int:entry_id>", methods=["DELETE"])
def remove_history(entry_id):
    deleted = delete_history(entry_id)
    if not deleted:
        return jsonify({"success": False, "error": "History entry not found."}), 404
    return jsonify({"success": True}), 200


@tts_bp.route("/audio/<path:filename>", methods=["GET"])
def get_audio(filename):
    # basename strips any path traversal attempt (../) before hitting the filesystem
    safe_name = os.path.basename(filename)
    if not os.path.isfile(os.path.join(AUDIO_DIR, safe_name)):
        return jsonify({"success": False, "error": "Audio file not found."}), 404
    return send_from_directory(AUDIO_DIR, safe_name, mimetype="audio/mpeg")
