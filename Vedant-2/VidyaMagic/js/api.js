// VidyaMagic — Backend API client
// Wraps fetch() with optional JWT. Silently no-ops if backend not reachable.

const BASE = window.VM_API_BASE || 'http://localhost:3001/api';
const TOKEN_KEY = 'vm_token';

export const setToken = t => localStorage.setItem(TOKEN_KEY, t);
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

async function req(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  const t = getToken();
  if (t) headers.Authorization = `Bearer ${t}`;
  try {
    const res = await fetch(BASE + path, { ...opts, headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (e) {
    console.warn('[VM API offline]', path, e.message);
    return null;
  }
}

export const api = {
  health: () => req('/health'),
  signup: (email, password, phone) => req('/auth/signup', { method: 'POST', body: JSON.stringify({ email, password, phone }) }),
  login:  (email, password) => req('/auth/login',  { method: 'POST', body: JSON.stringify({ email, password }) }),
  createKid: (name, age, grade, theme, userId) => req('/kids', { method: 'POST', body: JSON.stringify({ name, age, grade, theme, userId }) }),
  getKids: (userId) => req(`/kids/${userId}`),
  syncProgress: (kidId, topics, skills) =>
    req('/progress/sync', { method: 'POST', body: JSON.stringify({ kidId, topics, skills }) }),
  getProgress: (kidId) => req(`/progress/${kidId}`),
  logAttempt: (a) => req('/attempts', { method: 'POST', body: JSON.stringify(a) }),
};
