const API_BASE = "https://api.tokens.xyz/v1";

export function apiHeaders(): HeadersInit {
  return {
    "x-api-key": process.env.TOKENS_XYZ_API_KEY!,
    "Content-Type": "application/json",
  };
}

export async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...apiHeaders(), ...init?.headers },
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`);
  }
  return res.json();
}
