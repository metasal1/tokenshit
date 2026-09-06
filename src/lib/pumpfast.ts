/** pumpfa.st public API v1.3 — https://pumpfa.st/developers */

import { SHIT_MINT } from "@/lib/shit-token";

export const PUMPFAST_API = "https://pumpfa.st/api/v1";
export const PUMPFAST_DOCS = "https://pumpfa.st/developers";
export const PUMPFAST_TOKEN_URL = `https://pumpfa.st/token/${SHIT_MINT}`;

export type PumpfastUpvote = {
  ok: boolean;
  upvoted: boolean;
  queried?: string;
  xUsername?: string | null;
  xUserId?: string | null;
  weekOffset?: number;
  error?: string;
};

function accountCandidates(opts: {
  twitter?: string | null;
  twitterId?: string | null;
}): string[] {
  const out: string[] = [];
  const handle = String(opts.twitter || "")
    .trim()
    .replace(/^@/, "")
    .toLowerCase();
  const id = String(opts.twitterId || "").trim();
  if (handle) out.push(handle);
  if (id && /^\d{1,32}$/.test(id) && !out.includes(id)) out.push(id);
  return out;
}

export async function checkPumpfastUpvote(opts: {
  twitter?: string | null;
  twitterId?: string | null;
  week?: number;
}): Promise<PumpfastUpvote> {
  const accounts = accountCandidates(opts);
  if (!accounts.length) {
    return { ok: false, upvoted: false, error: "twitter required" };
  }
  const week = Number.isFinite(opts.week) ? Number(opts.week) : 0;
  let lastErr = "";
  for (const account of accounts) {
    const url = `${PUMPFAST_API}/tokens/${encodeURIComponent(SHIT_MINT)}/upvotes/${encodeURIComponent(account)}?week=${week}`;
    try {
      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "TokenShit/1.0 (+https://tokenshit.com)",
        },
        cache: "no-store",
      });
      const raw = await res.json().catch(() => null);
      const data = (raw && typeof raw === "object" && "data" in raw
        ? (raw as { data: Record<string, unknown> }).data
        : raw) as Record<string, unknown> | null;
      if (!res.ok || !data) {
        lastErr = `pumpfa.st ${res.status}`;
        continue;
      }
      const upvoted = data.upvoted === true;
      const result: PumpfastUpvote = {
        ok: true,
        upvoted,
        queried: String(data.queriedAccount || account),
        xUsername: (data.xUsername as string | null) ?? null,
        xUserId: (data.xUserId as string | null) ?? null,
        weekOffset: Number(data.weekOffset ?? week),
      };
      if (upvoted) return result;
      lastErr = "";
      if (account === accounts[accounts.length - 1]) return result;
    } catch (e) {
      lastErr = e instanceof Error ? e.message : String(e);
    }
  }
  return { ok: false, upvoted: false, error: lastErr || "upvote check failed" };
}
