/** pumpfa.st public API v1 — https://pumpfa.st/developers */

import { SHIT_MINT } from "@/lib/shit-token";

export const PUMPFAST_API = "https://pumpfa.st/api/v1";
export const PUMPFAST_DOCS = "https://pumpfa.st/developers";
export const PUMPFAST_TOKEN_URL = `https://pumpfa.st/token/${SHIT_MINT}`;
export const PUMPFAST_WIDGET_URL = `https://pumpfa.st/widgets/token/${SHIT_MINT}`;

export type PumpfastCheck = {
  ok: boolean;
  listed: boolean;
  mint?: string;
  symbol?: string;
  websiteUrl?: string | null;
  rank?: number | null;
  error?: string;
};

export async function checkPumpfastToken(): Promise<PumpfastCheck> {
  try {
    const r = await fetch(`${PUMPFAST_API}/tokens/${SHIT_MINT}`, {
      headers: { Accept: "application/json", "User-Agent": "tokenshit/1.0" },
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
    if (!r.ok) {
      return { ok: false, listed: false, error: `pumpfa.st ${r.status}` };
    }
    const json = (await r.json()) as {
      data?: {
        mint?: string;
        symbol?: string;
        websiteUrl?: string | null;
      };
    };
    const data = json.data || {};
    const mint = String(data.mint || "");
    const listed = mint === SHIT_MINT;
    if (!listed) {
      return { ok: true, listed: false, mint, error: "TOKENSHIT not listed on pumpfa.st" };
    }
    const site = String(data.websiteUrl || "").toLowerCase();
    if (site && !site.includes("tokenshit.com")) {
      return {
        ok: true,
        listed: false,
        mint,
        websiteUrl: data.websiteUrl,
        error: "pumpfa.st listing website is not tokenshit.com",
      };
    }
    return {
      ok: true,
      listed: true,
      mint,
      symbol: data.symbol,
      websiteUrl: data.websiteUrl ?? null,
    };
  } catch (e) {
    return {
      ok: false,
      listed: false,
      error: e instanceof Error ? e.message : "pumpfa.st unreachable",
    };
  }
}
