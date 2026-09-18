import mimetypes
import os

_client = None
_client_loaded = False


def is_configured():
    return bool(os.getenv("SUPABASE_URL") and os.getenv("SUPABASE_KEY"))


def _get_client():
    global _client, _client_loaded
    if _client_loaded:
        return _client
    _client_loaded = True

    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    if not url or not key:
        return None

    from supabase import create_client

    _client = create_client(url, key)
    return _client


def upload_audio(filepath, filename):
    """Upload a local audio file to Supabase Storage, returning its public URL.

    Returns None (never raises) if cloud storage isn't configured or the upload
    fails, so callers can fall back to serving the file from local disk.
    """
    client = _get_client()
    if client is None:
        return None

    bucket = os.getenv("SUPABASE_BUCKET", "audio")
    content_type = mimetypes.guess_type(filename)[0] or "audio/mpeg"

    try:
        with open(filepath, "rb") as f:
            client.storage.from_(bucket).upload(filename, f, {"content-type": content_type})
        return client.storage.from_(bucket).get_public_url(filename)
    except Exception:
        return None
