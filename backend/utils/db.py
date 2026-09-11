import os
import sqlite3
from datetime import datetime, timezone

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "history.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS speech_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                text TEXT NOT NULL,
                language TEXT NOT NULL,
                voice TEXT NOT NULL,
                audio_url TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )


def add_history(text, language, voice, audio_url):
    with get_connection() as conn:
        cursor = conn.execute(
            "INSERT INTO speech_history (text, language, voice, audio_url, created_at) VALUES (?, ?, ?, ?, ?)",
            (text, language, voice, audio_url, datetime.now(timezone.utc).isoformat()),
        )
        return cursor.lastrowid


def list_history(limit=50):
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT * FROM speech_history ORDER BY id DESC LIMIT ?", (limit,)
        ).fetchall()
        return [dict(row) for row in rows]


def delete_history(entry_id):
    with get_connection() as conn:
        cursor = conn.execute("DELETE FROM speech_history WHERE id = ?", (entry_id,))
        return cursor.rowcount > 0
