/**
 * Server-side security helpers for treasury-facing APIs.
 * Added 2026-08 after unauthenticated referral drain.
 */

/** Known drain / exit wallets */
export const BLACKLISTED_WALLETS = new Set<string>([
  // Primary drain (fake referral spam → 10k each)
  "9kJBoqekAF3F1YU2AcWyPnTY8JmW32choy3vdRLeuNdh",
]);

/** Prefix match for exit wallets when full address confirmed at runtime */
const BLACKLIST_PREFIXES: string[] = [
  // Sweep destination seen in drain txs (prefix from balance deltas)
  "2GCXJDao",
  // Peer drip wallet
  "GMiEAt5Viv",
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
