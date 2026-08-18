/**
 * Tokens.xyz API client — SOURCE OF TRUTH for asset universe, metadata, markets.
 * https://api.tokens.xyz/v1 · https://docs.tokens.xyz
 */
const API_BASE =
  process.env.TOKENS_XYZ_API_BASE?.replace(/\/$/, "") ||
  "https://api.tokens.xyz/v1";

export function apiHeaders(): HeadersInit {
  const key =
    process.env.TOKENS_XYZ_API_KEY ||
    process.env.TOKENS_API_KEY ||
    "";
  const h: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "User-Agent": "TokenShit/1.0 (+https://tokenshit.com)",
  };
  if (key) h["x-api-key"] = key;
  return h;
}

export async function apiFetch(path: string, init?: RequestInit) {
  const p = path.startsWith("/") ? path : `/${path}`;
  const res = await fetch(`${API_BASE}${p}`, {
    ...init,
    headers: { ...apiHeaders(), ...init?.headers },
    cache: init?.cache ?? "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Tokens.xyz API ${res.status}: ${body.slice(0, 240) || res.statusText}`
    );
  }
  return res.json();
}

export { API_BASE as TOKENS_XYZ_API_BASE };
