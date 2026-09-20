import { getToken } from "./authApi";

const API_ORIGIN = import.meta.env.VITE_API_BASE_URL || "";
const BASE = `${API_ORIGIN}/api/admin`;

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

export async function fetchAdminUsers() {
  const res = await fetch(`${BASE}/users`, { headers: authHeaders() });
  const data = await handle(res);
  return data.users;
}

export async function fetchAdminAnalytics() {
  const res = await fetch(`${BASE}/analytics`, { headers: authHeaders() });
  return handle(res);
}
