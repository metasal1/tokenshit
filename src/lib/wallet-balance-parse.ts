/** Parse /api/wallet/balances JSON. Null = keep last-good (do not wipe). */
export type WalletBals = { sol: number; usdc: number; shit: number };

export function parseWalletBalances(data: unknown): WalletBals | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  if (d.error) return null;
  const sol = Number(d.sol);
  const usdc = Number(d.usdc);
  const shit = Number(d.shit ?? d.tokenshit);
  if (![sol, usdc, shit].every(Number.isFinite)) return null;
  return { sol, usdc, shit };
}

/** Parse /api/wallet/shit-balance JSON. Null = keep last-good (do not wipe to 0). */
export function parseShitBalance(data: unknown): number | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  if (d.error) return null;
  if (typeof d.balance !== "number" || !Number.isFinite(d.balance)) return null;
  return d.balance;
}

/**
 * Referral claim CTA: don't lock "Nothing to claim" when owner detail
 * failed to load (missing Privy token → unpaidCount forced to 0).
 */
export function referralClaimLocked(opts: {
  wallet: string | null | undefined;
  unpaidCount?: number;
  detail?: boolean;
}): boolean {
  if (!opts.wallet) return true;
  if (opts.detail === false) return false;
  return (opts.unpaidCount ?? 0) === 0;
}
