const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${API_BASE_URL}${path}`, init);
}

export async function requestReport<T>(payload: unknown): Promise<T> {
  const response = await apiFetch('/report', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(data.error ?? `Report failed (${response.status})`);
  return data;
}
