from flask import Blueprint, jsonify

from utils.auth import admin_required
from utils.db import (
    count_all_history,
    count_users,
    history_counts_by_day,
    list_users_with_counts,
    top_languages,
    top_voices,
)

admin_bp = Blueprint("admin", __name__)


@admin_bp.route("/api/admin/users", methods=["GET"])
@admin_required
def get_users():
    return jsonify({"success": True, "users": list_users_with_counts()}), 200


@admin_bp.route("/api/admin/analytics", methods=["GET"])
@admin_required
def get_analytics():
    return jsonify(
        {
            "success": True,
            "total_users": count_users(),
            "total_generations": count_all_history(),
            "generations_by_day": history_counts_by_day(14),
            "top_languages": top_languages(5),
            "top_voices": top_voices(5),
        }
    ), 200
