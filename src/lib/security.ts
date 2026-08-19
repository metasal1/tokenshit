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
  // 2026-08-19 bangdayak45731 × gamaa.id claim farm ring
  "3cNts2RwzjrARa7JRtpzsfaT8uLHXKMsXnyrTftvvHNW",
  "BteyCThS7ZcDTJ5vnhMUBgxGQsQGsJ9eSmhdBouc77RA",
  "4dDHAHJyQhzUgdF1a9nrPoEDPqNuwfF5jiaUJgQTFuU8",
  "62P7GjJfaXiYL1Zt7Xs6BmqCKiTVTWZnNLPhwZVsShb5",
  "6BWjmLZYgEYy1sSTtPmZa4ZuszgRDbJCrrJUa64Cxt7L",
  "6QDduAsg8e6JNKxMDbVyVKLM9pw1AkwAW1jMrgT1bWM8",
  "6rURmdkXDsDxbsJujRWNLPQSeXTwGNNmGRVUoS2a1aHH",
  "6tdHsASYwc7rwpK92nAdvyYqQsLyPqgW1CLcbYDPy69w",
  "7GugoqYrs2vkYVD3jE9YN3ZqyAkG3kHjtMitCeSwq3WH",
  "8EJWfcpZskAhAXpCeuVEbnJUSvU5KdXsRmSKx3AMQ57Z",
  "94aNe6yjZuWWVxuKb872Va7s5jfeJQXhbyPDvFq9Ko5s",
  "9DggRZhYZpi8jTZvDAn6Wa2a5oyU5jA29ryfXESbDyDf",
  "BPbQGNHYaoeDg7ikW3561JpAzPCd2fbVr5aGcrqUDxPF",
  "DDZYbijzBv1BhCJu2V1xrZRcjFme3yF8Rtb6rvHXLtWS",
  "DNQcubFEZ78fbKKNNd1fstd2ibG6qXLbhKy6VxDdDxC1",
  "DzDVo13e33NjtCnR7BZ5YRXHYvz6gX36XLyJPxSvAQwD",
  "DzRGqTe63cUfJoXE7YYtSTFCAPmHZg3Rc7ig1yh6BLZi",
  "ER5WAoQjAhfknDbCf2rWeCziMpa9NjhTmP7BMtLtnmeo",
  "Efa7aYKYM1jFvGH688FQC1z89riimQNCNzLZw4iD9QrF",
  "F6zbaHAPYCiZLjxnDzW2AGBNq8BUW7YUaTkJYoxDtF22",
  "FJYDdxV59YirG87iaxqJ6FYsPyNTaSb1kwkufPERebfi",
  "GHHRrkVW6nJwydxePs93fue6iTioZmKgwHQsVpk2gxC9",
  "GomDeLCCgkQ2gA121FX17Ro1FARAA5pb1T7kgwhvJcrK",
  "H34RK8gNNiPhW4Ffh8gfrqevPMaaz4sxAqwV8vHrThY2",
  "FNxL4x4969zfzCSKCmk5fbpKwkWjYwfQFt4vwwxR4kQR",

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
