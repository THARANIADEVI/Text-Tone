// empty string in dev -> relative requests go through the Vite proxy to localhost:5000
// set to the Render backend URL in Vercel's env vars for production
const API_ORIGIN = import.meta.env.VITE_API_BASE_URL || "";
const BASE = `${API_ORIGIN}/api`;

function resolveAudioUrl(path) {
  if (!path || path.startsWith("http")) return path;
  return `${API_ORIGIN}${path}`;
}

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export async function fetchLanguages() {
  const res = await fetch(`${BASE}/languages`);
  const data = await handle(res);
  return data.languages;
}

export async function fetchVoices(language) {
  const res = await fetch(`${BASE}/voices?language=${encodeURIComponent(language)}`);
  const data = await handle(res);
  return data.voices;
}

export async function generateSpeech({ text, language, voice, speed }) {
  const res = await fetch(`${BASE}/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language, voice, speed }),
  });
  const data = await handle(res);
  return resolveAudioUrl(data.audio_url);
}

export async function fetchHistory() {
  const res = await fetch(`${BASE}/history`);
  const data = await handle(res);
  return data.history.map((item) => ({ ...item, audio_url: resolveAudioUrl(item.audio_url) }));
}

export async function deleteHistoryEntry(id) {
  const res = await fetch(`${BASE}/history/${id}`, { method: "DELETE" });
  return handle(res);
}
