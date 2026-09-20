import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv

from routes.tts_routes import tts_bp
from routes.auth_routes import auth_bp
from routes.admin_routes import admin_bp
from utils.db import init_db

load_dotenv()


def create_app():
    app = Flask(__name__)
    init_db()
    app.config["MAX_TEXT_LENGTH"] = int(os.getenv("MAX_TEXT_LENGTH", 500))
    app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024  # 5MB cap, sized for PDF/DOCX uploads
    # per-user daily cap on /api/tts generations; 0 disables the limit
    app.config["DAILY_TTS_LIMIT"] = int(os.getenv("DAILY_TTS_LIMIT", 50))

    # comma-separated list so one Render backend can allow a Vercel prod + preview URL at once
    cors_origins = [o.strip() for o in os.getenv("CORS_ORIGIN", "http://localhost:5173").split(",")]
    CORS(app, resources={r"/api/*": {"origins": cors_origins}, r"/audio/*": {"origins": cors_origins}})

    limiter = Limiter(get_remote_address, app=app, default_limits=["60 per minute"])
    limiter.limit("10 per minute")(tts_bp)
    limiter.limit("20 per minute")(auth_bp)
    limiter.limit("30 per minute")(admin_bp)

    app.register_blueprint(tts_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)

    @app.errorhandler(404)
    def not_found(_err):
        return jsonify({"success": False, "error": "Resource not found."}), 404

    @app.errorhandler(500)
    def server_error(_err):
        return jsonify({"success": False, "error": "Internal server error."}), 500

    return app


# module-level app object so `gunicorn app:app` can find it on Render;
# the __main__ block below is only used for local `python app.py` runs
app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", os.getenv("FLASK_PORT", 5000)))
    app.run(host="0.0.0.0", port=port, debug=True)
