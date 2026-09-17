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
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
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
        # speech_history predates user accounts; add the column for existing local
        # dev DBs instead of dropping them. OperationalError means it's already there.
        try:
            conn.execute("ALTER TABLE speech_history ADD COLUMN user_id INTEGER REFERENCES users(id)")
        except sqlite3.OperationalError:
            pass
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS favorites (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL REFERENCES users(id),
                favorite_type TEXT NOT NULL CHECK (favorite_type IN ('voice', 'history')),
                language TEXT,
                voice_id TEXT,
                history_id INTEGER REFERENCES speech_history(id),
                created_at TEXT NOT NULL,
                UNIQUE (user_id, favorite_type, language, voice_id, history_id)
            )
            """
        )


# ---- users ----


def create_user(email, password_hash):
    with get_connection() as conn:
        cursor = conn.execute(
            "INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, ?)",
            (email, password_hash, datetime.now(timezone.utc).isoformat()),
        )
        return cursor.lastrowid


def get_user_by_email(email):
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        return dict(row) if row else None


def get_user_by_id(user_id):
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        return dict(row) if row else None


# ---- speech history (per-user) ----


def add_history(text, language, voice, audio_url, user_id):
    with get_connection() as conn:
        cursor = conn.execute(
            "INSERT INTO speech_history (text, language, voice, audio_url, created_at, user_id) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (text, language, voice, audio_url, datetime.now(timezone.utc).isoformat(), user_id),
        )
        return cursor.lastrowid


def list_history(user_id, limit=50):
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT * FROM speech_history WHERE user_id = ? ORDER BY id DESC LIMIT ?",
            (user_id, limit),
        ).fetchall()
        return [dict(row) for row in rows]


def get_history_entry(entry_id, user_id):
    with get_connection() as conn:
        row = conn.execute(
            "SELECT * FROM speech_history WHERE id = ? AND user_id = ?", (entry_id, user_id)
        ).fetchone()
        return dict(row) if row else None


def delete_history(entry_id, user_id):
    with get_connection() as conn:
        cursor = conn.execute(
            "DELETE FROM speech_history WHERE id = ? AND user_id = ?", (entry_id, user_id)
        )
        return cursor.rowcount > 0


# ---- favorites ----


class DuplicateFavoriteError(Exception):
    pass


def add_favorite(user_id, favorite_type, language=None, voice_id=None, history_id=None):
    # the table's UNIQUE constraint doesn't catch duplicates here: SQLite treats NULL columns
    # (language/voice_id for a "history" favorite, history_id for a "voice" favorite) as distinct
    # from each other, so it never fires. Check explicitly instead.
    with get_connection() as conn:
        existing = conn.execute(
            "SELECT id FROM favorites WHERE user_id = ? AND favorite_type = ? "
            "AND language IS ? AND voice_id IS ? AND history_id IS ?",
            (user_id, favorite_type, language, voice_id, history_id),
        ).fetchone()
        if existing:
            raise DuplicateFavoriteError()

        cursor = conn.execute(
            "INSERT INTO favorites (user_id, favorite_type, language, voice_id, history_id, created_at) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (user_id, favorite_type, language, voice_id, history_id, datetime.now(timezone.utc).isoformat()),
        )
        return cursor.lastrowid


def list_favorites(user_id, favorite_type=None):
    # LEFT JOIN so a "history" favorite carries the clip's text/audio_url without a second round trip
    # (history.* columns are NULL for "voice" favorites, or if the favorited clip was since deleted)
    query = (
        "SELECT favorites.*, speech_history.text AS history_text, "
        "speech_history.audio_url AS history_audio_url "
        "FROM favorites LEFT JOIN speech_history ON speech_history.id = favorites.history_id "
        "WHERE favorites.user_id = ?"
    )
    params = [user_id]
    if favorite_type:
        query += " AND favorites.favorite_type = ?"
        params.append(favorite_type)
    query += " ORDER BY favorites.id DESC"

    with get_connection() as conn:
        rows = conn.execute(query, params).fetchall()
        return [dict(row) for row in rows]


def delete_favorite(favorite_id, user_id):
    with get_connection() as conn:
        cursor = conn.execute(
            "DELETE FROM favorites WHERE id = ? AND user_id = ?", (favorite_id, user_id)
        )
        return cursor.rowcount > 0
