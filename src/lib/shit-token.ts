/** Official TokenShit mint + game / treasury constants */
export const SHIT_MINT =
  "fEbiuDdZZ1QaWYpJFPqk23ZkaRnAyHg4aivhrCTshit" as const;

export const SHIT_DECIMALS = 6;
/** On-chain / display ticker */
export const SHIT_SYMBOL = "TOKENSHIT";
export const SHIT_NAME = "TokenShit";
export const SHIT_TICKER_DISPLAY = "$TOKENSHIT";

/** Official X account to follow/tag */
export const X_HANDLE = "Tokenshit_";
export const X_URL = `https://x.com/${X_HANDLE}`;
export const X_USER_ID = "2037761105359986688";

/** Public treasury = SHT vanity */
export const TREASURY_ADDRESS =
  process.env.NEXT_PUBLIC_TREASURY_ADDRESS ||
  "SHTy7yoA5uAZoevKT3BFcSeDeFaHEyqWc55uApd3MJB";

/** One-time claim amounts (whole tokens) */
export const CLAIM_X_VERIFIED = 100_000;
export const CLAIM_GH_FORK = 250_000;
/** Tweet + tag @Tokenshit_ (once) */
export const CLAIM_X_TWEET = 25_000;
/** Follow @Tokenshit_ (once) — checked via recent engagement path if available */
export const CLAIM_X_FOLLOW = 15_000;
/** $TOKENSHIT per referral */
export const REFERRAL_REWARD_SHIT = 10_000;

/** Anti-farm floors (overridable via env — see src/lib/abuse.ts) */
export const ABUSE_MIN_FOLLOWERS_CLAIM = Number(
  process.env.MIN_X_FOLLOWERS_CLAIM || 50
);
export const ABUSE_MIN_FOLLOWERS_REFERRAL = Number(
  process.env.MIN_X_FOLLOWERS_REFERRAL || 25
);

/**
 * Global treasury daily top-up (cron at UTC 00:00).
 * UI countdown targets next midnight UTC.
 */
export const GLOBAL_TREASURY_DAILY_DROP = 1_000_000;
export const GLOBAL_TREASURY_CRON_UTC_HOUR = 0;

export const GH_FORK_UPSTREAM = "solana-foundation/tokens";

/** Next UTC midnight (00:00:00.000Z) after `from` (default now). */
export function nextUtcMidnight(from: Date = new Date()): Date {
  const d = new Date(from.getTime());
  d.setUTCHours(GLOBAL_TREASURY_CRON_UTC_HOUR, 0, 0, 0);
  if (d.getTime() <= from.getTime()) {
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return d;
}

/** ms until next UTC 00:00 */
export function msUntilNextUtcMidnight(from: Date = new Date()): number {
  return Math.max(0, nextUtcMidnight(from).getTime() - from.getTime());
}

export function formatCountdown(ms: number): {
  h: string;
  m: string;
  s: string;
  totalSeconds: number;
} {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return { h: pad(h), m: pad(m), s: pad(s), totalSeconds };
}

export function shitBuyUrl(amountSol?: number): string {
  const base = `https://jup.ag/swap/SOL-${SHIT_MINT}`;
  if (amountSol && amountSol > 0) return `${base}?amount=${amountSol}`;
  return base;
}

export function shitChartUrl(): string {
  return `https://dexscreener.com/solana/${SHIT_MINT}`;
}

export function treasurySolscanUrl(): string {
  return `https://sol.new/portfolio/${TREASURY_ADDRESS}`;
}

/** @deprecated alias — portfolio lives on sol.new */
export function treasuryPortfolioUrl(): string {
  return treasurySolscanUrl();
}

export function mintSolscanUrl(): string {
  return `https://solscan.io/token/${SHIT_MINT}`;
}

/** Intent URL: compose tweet tagging @Tokenshit_ */
export function tweetTagIntentUrl(text?: string): string {
  const body =
    text ||
    `Just judged bags on @${X_HANDLE} — every token is shit until proven otherwise.\n\nhttps://tokenshit.com`;
  return `https://x.com/intent/tweet?text=${encodeURIComponent(body)}`;
}

export function followIntentUrl(): string {
  return `https://x.com/intent/follow?screen_name=${X_HANDLE}`;
}

export function shitToRaw(amount: number): bigint {
  return BigInt(Math.floor(amount)) * BigInt(10 ** SHIT_DECIMALS);
}

export function rawToShit(raw: bigint | number | string): number {
  const n = typeof raw === "bigint" ? raw : BigInt(raw);
  return Number(n) / 10 ** SHIT_DECIMALS;
}

export const GAME = {
  xpVote: 10,
  xpStreakPerDay: 5,
  xpStreakCap: 50,
  xpPerShitBurned: 100,
  minBurnShit: 1,
  superVoteXpCost: 50,
  superVoteWeight: 3,
} as const;

export const TOKENOMICS_BLURB = [
  "Vote free — earn Clout (XP).",
  "Buy $TOKENSHIT — skin in the court.",
  `Tweet + tag @${X_HANDLE} — claim ${CLAIM_X_TWEET.toLocaleString()} $TOKENSHIT once.`,
  "X verified — claim 100,000 $TOKENSHIT once.",
  "Fork solana-foundation/tokens — claim 250,000 $TOKENSHIT once.",
  "Refer friends — 10,000 $TOKENSHIT each.",
].join(" ");
