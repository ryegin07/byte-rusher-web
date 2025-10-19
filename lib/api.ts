// Unified API helper: always call same-origin /api to avoid CORS in dev
export async function apiFetch(path: string, options: RequestInit = {}) {
  const url = path.startsWith('/api/') ? path : `/api${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    credentials: 'include',
  });
  // Try to parse JSON; if not JSON, return text
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    return res.json();
  }
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

// Convenience helpers for the Contact page (kept for compatibility)
export async function createSubmission(payload: any) {
  return apiFetch('/submissions', { method: 'POST', body: JSON.stringify(payload) });
}

export async function getSubmissions() {
  return apiFetch('/submissions');
}
