import os

from mistralai.client import Mistral

ACTIONS = {
    "summarize": "Summarize the following text concisely while preserving its key meaning:",
    "grammar": "Correct any grammar and spelling mistakes in the following text without changing its meaning:",
    "rewrite": "Rewrite the following text to improve clarity and flow:",
    "conversational": (
        "Rewrite the following text in a natural, conversational speaking style "
        "suitable for text-to-speech narration:"
    ),
}


class AIError(Exception):
    def __init__(self, message, status_code=503):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def is_configured():
    return bool(os.getenv("MISTRAL_API_KEY"))


def enhance_text(text, action):
    if action not in ACTIONS:
        raise AIError(f"Unsupported action: {action}. Choose one of {sorted(ACTIONS)}.", 400)

    api_key = os.getenv("MISTRAL_API_KEY")
    if not api_key:
        raise AIError("AI text enhancement is not configured on this server.", 503)

    client = Mistral(api_key=api_key)
    try:
        response = client.chat.complete(
            model=os.getenv("MISTRAL_MODEL", "mistral-small-latest"),
            messages=[
                {
                    "role": "system",
                    "content": "You rewrite text for a text-to-speech app. Reply with only the "
                    "rewritten text and no preamble, quotes, or explanation.",
                },
                {"role": "user", "content": f"{ACTIONS[action]}\n\n{text}"},
            ],
        )
    except Exception as exc:
        raise AIError(f"AI service error: {exc}", 503)

    enhanced = response.choices[0].message.content
    if not enhanced or not enhanced.strip():
        raise AIError("AI service returned an empty response.", 503)
    return enhanced.strip()
