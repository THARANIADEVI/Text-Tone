const API_ORIGIN = import.meta.env.VITE_API_BASE_URL || "";
const BASE = `${API_ORIGIN}/api/auth`;

const TOKEN_KEY = "tts_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export async function register(email, password) {
  const res = await fetch(`${BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await handle(res);
  setToken(data.token);
  return data.user;
}

export async function login(email, password) {
  const res = await fetch(`${BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await handle(res);
  setToken(data.token);
  return data.user;
}

export async function fetchMe() {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(`${BASE}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await handle(res);
    return data.user;
  } catch {
    clearToken();
    return null;
  }
}

export function logout() {
  clearToken();
}
