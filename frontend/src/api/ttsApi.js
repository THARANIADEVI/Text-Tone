// empty string in dev -> relative requests go through the Vite proxy to localhost:5000
// set to the Render backend URL in Vercel's env vars for production
import { getToken } from "./authApi";

const API_ORIGIN = import.meta.env.VITE_API_BASE_URL || "";
const BASE = `${API_ORIGIN}/api`;

function resolveAudioUrl(path) {
  if (!path || path.startsWith("http")) return path;
  return `${API_ORIGIN}${path}`;
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
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
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ text, language, voice, speed }),
  });
  const data = await handle(res);
  return resolveAudioUrl(data.audio_url);
}

export async function fetchUsage() {
  const res = await fetch(`${BASE}/usage`, { headers: authHeaders() });
  return handle(res);
}

export async function fetchHistory() {
  const res = await fetch(`${BASE}/history`, { headers: authHeaders() });
  const data = await handle(res);
  return data.history.map((item) => ({ ...item, audio_url: resolveAudioUrl(item.audio_url) }));
}

export async function deleteHistoryEntry(id) {
  const res = await fetch(`${BASE}/history/${id}`, { method: "DELETE", headers: authHeaders() });
  return handle(res);
}

export async function fetchFavorites(type) {
  const query = type ? `?type=${encodeURIComponent(type)}` : "";
  const res = await fetch(`${BASE}/favorites${query}`, { headers: authHeaders() });
  const data = await handle(res);
  return data.favorites.map((fav) => ({
    ...fav,
    history_audio_url: fav.history_audio_url ? resolveAudioUrl(fav.history_audio_url) : null,
  }));
}

export async function addFavorite(payload) {
  const res = await fetch(`${BASE}/favorites`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function removeFavorite(id) {
  const res = await fetch(`${BASE}/favorites/${id}`, { method: "DELETE", headers: authHeaders() });
  return handle(res);
}

export async function extractTextFromFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE}/extract-text`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });
  const data = await handle(res);
  return data.text;
}

export async function enhanceText(text, action) {
  const res = await fetch(`${BASE}/enhance-text`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ text, action }),
  });
  const data = await handle(res);
  return data.text;
}
