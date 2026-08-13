/**
 * Server-side security helpers for treasury-facing APIs.
 * Updated after Aug 11 2026 multi-vector drain.
 */

/** Known drain / exit wallets (full base58) */
export const BLACKLISTED_WALLETS = new Set<string>([
  // Fake referral spam → 10k drip
  "9kJBoqekAF3F1YU2AcWyPnTY8JmW32choy3vdRLeuNdh",
  // Peer drip
  "GMiEAt5VivnEqm5K1MNPxV3qeTXMBgNEasooDcLXXM1E",
  // 8× 250k GH-fork-sized drains
  "56yKVwgfNdqWrP2DmmZ8Wf9YSAvfMMXjbD6ahWchk3zv",
  // other outflows
  "Hf2fBpH77cxCRA41f16dsFEaPCnR3bhLdpGYVHni4NHE",
  "8HXhS2tTyptSFxqesgBA8zLCKWsm8Fjeb2QXKMJsN1t9",
  "G3C9diRjUCjMzohqe3uKcLwgXTxSAySAtBBipfoKpX7h",
  "FKjgf7tTDQ8iQLNn1MrXtSa3QdrbQk1FYRjqcYSjYD4Q",
  "4N3fZSA3peeBUx8ryypfrSoXsqUjfaFdzLrgseJW3Rjt",
]);

const BLACKLIST_PREFIXES: string[] = [
  "2GCXJDao", // sweep exit
  "GMiEAt5Viv",
  "9kJBoqekAF",
  "56yKVwgfNd",
];

export function loadEnvBlacklist() {
  const raw = process.env.TREASURY_WALLET_BLACKLIST || "";
  for (const part of raw.split(",")) {
    const w = part.trim();
    if (w.length >= 32) BLACKLISTED_WALLETS.add(w);
  }
}

export function isBlacklistedWallet(wallet: string | null | undefined): boolean {
  loadEnvBlacklist();
  if (!wallet) return false;
  const w = wallet.trim();
  if (BLACKLISTED_WALLETS.has(w)) return true;
  return BLACKLIST_PREFIXES.some((p) => w.startsWith(p));
}

export function assertNotBlacklisted(wallet: string): Response | null {
  if (isBlacklistedWallet(wallet)) {
    return Response.json(
      { error: "Wallet blocked from treasury actions" },
      { status: 403 }
    );
  }
  return null;
}

/**
 * Global kill switch for ANY treasury token send.
 * CLAIMS_ENABLED=0 or TREASURY_SENDS_ENABLED=0 or REFERRAL_PAYOUTS_ENABLED=0
 * alone does not stop claims — this does.
 */
export function treasurySendsAllowed(): {
  ok: boolean;
  reason?: string;
} {
  if (process.env.TREASURY_SENDS_ENABLED === "0") {
    return { ok: false, reason: "TREASURY_SENDS_ENABLED=0" };
  }
  if (process.env.CLAIMS_ENABLED === "0") {
    // claims off — still allow explicit treasury ops only if SENDS=1
    if (process.env.TREASURY_SENDS_ENABLED !== "1") {
      return { ok: false, reason: "CLAIMS_ENABLED=0 (payouts paused)" };
    }
  }
  // Hard max single transfer (whole tokens)
  return { ok: true };
}

export function maxSinglePayoutWhole(): number {
  // Claims max 100k; day-game pots can be larger
  const n = Number(process.env.TREASURY_MAX_SINGLE || 1_000_000);
  return Number.isFinite(n) && n > 0 ? n : 1_000_000;
}
