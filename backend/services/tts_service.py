import os
import re
import uuid
from gtts import gTTS
from gtts.lang import tts_langs

AUDIO_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "generated_audio")
os.makedirs(AUDIO_DIR, exist_ok=True)

# language code -> display name (subset of what gTTS supports, matches doc's example list)
LANGUAGES = {
    "en": "English",
    "hi": "Hindi",
    "gu": "Gujarati",
    "mr": "Marathi",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
}

# gTTS has no true multi-voice API; we simulate "voices" via accent (tld) + speaking style (slow/normal).
# Each voice belongs to exactly one language, matching the validation rule in the spec.
VOICES = {
    "en": [
        {"id": "en-us-standard", "label": "English (US) - Standard", "tld": "com", "slow": False},
        {"id": "en-uk-standard", "label": "English (UK) - Standard", "tld": "co.uk", "slow": False},
        {"id": "en-in-standard", "label": "English (India) - Standard", "tld": "co.in", "slow": False},
        {"id": "en-us-slow", "label": "English (US) - Slow", "tld": "com", "slow": True},
    ],
    "hi": [{"id": "hi-in-standard", "label": "Hindi (India) - Standard", "tld": "co.in", "slow": False}],
    "gu": [{"id": "gu-in-standard", "label": "Gujarati (India) - Standard", "tld": "co.in", "slow": False}],
    "mr": [{"id": "mr-in-standard", "label": "Marathi (India) - Standard", "tld": "co.in", "slow": False}],
    "es": [
        {"id": "es-es-standard", "label": "Spanish (Spain) - Standard", "tld": "es", "slow": False},
        {"id": "es-us-standard", "label": "Spanish (US) - Standard", "tld": "com", "slow": False},
    ],
    "fr": [{"id": "fr-fr-standard", "label": "French (France) - Standard", "tld": "fr", "slow": False}],
    "de": [{"id": "de-de-standard", "label": "German (Germany) - Standard", "tld": "de", "slow": False}],
}


class TTSError(Exception):
    def __init__(self, message, status_code=400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def get_supported_languages():
    return [{"code": code, "name": name} for code, name in LANGUAGES.items()]


def get_voices(language=None):
    if language:
        if language not in VOICES:
            raise TTSError(f"Unsupported language: {language}", 400)
        return VOICES[language]
    return VOICES


def _find_voice(language, voice_id):
    for voice in VOICES.get(language, []):
        if voice["id"] == voice_id:
            return voice
    return None


def validate_request(text, language, voice_id, max_length):
    if not text or not text.strip():
        raise TTSError("Text must not be empty.", 400)
    if len(text) > max_length:
        raise TTSError(f"Text exceeds maximum length of {max_length} characters.", 400)
    if language not in LANGUAGES:
        raise TTSError(f"Unsupported language: {language}", 400)
    voice = _find_voice(language, voice_id)
    if voice is None:
        raise TTSError(f"Voice '{voice_id}' does not belong to language '{language}'.", 400)
    return voice


def synthesize(text, language, voice_id, max_length, speed=None):
    voice = validate_request(text, language, voice_id, max_length)
    # speed overrides the voice's default pace when explicitly provided by the caller
    slow = voice["slow"] if speed is None else speed == "slow"

    try:
        tts = gTTS(text=text, lang=language, tld=voice["tld"], slow=slow)
    except ValueError as exc:
        raise TTSError(f"Invalid language/voice combination: {exc}", 400)

    filename = f"{uuid.uuid4().hex}.mp3"
    filepath = os.path.join(AUDIO_DIR, filename)

    try:
        tts.save(filepath)
    except Exception as exc:
        raise TTSError(f"Text-to-Speech provider error: {exc}", 503)

    return filename
