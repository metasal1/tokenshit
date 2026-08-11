/** Official TokenShit $SHIT mint + game / treasury constants */
export const SHIT_MINT =
  "fEbiuDdZZ1QaWYpJFPqk23ZkaRnAyHg4aivhrCTshit" as const;

export const SHIT_DECIMALS = 6;
export const SHIT_SYMBOL = "SHIT";
export const SHIT_NAME = "TokenShit";

/** Public treasury = SHT vanity (secret offline / TREASURY_SECRET_JSON) */
export const TREASURY_ADDRESS =
  process.env.NEXT_PUBLIC_TREASURY_ADDRESS ||
  "SHTy7yoA5uAZoevKT3BFcSeDeFaHEyqWc55uApd3MJB";

/** One-time claim amounts (whole tokens) */
export const CLAIM_X_VERIFIED = 100_000;
export const CLAIM_GH_FORK = 250_000;
/** $SHIT paid to referrer when a new user signs up via their link */
export const REFERRAL_REWARD_SHIT = 10_000;

export const GH_FORK_UPSTREAM = "solana-foundation/tokens";

/** Jupiter swap deep link (buy $SHIT with SOL) */
export function shitBuyUrl(amountSol?: number): string {
  const base = `https://jup.ag/swap/SOL-${SHIT_MINT}`;
  if (amountSol && amountSol > 0) return `${base}?amount=${amountSol}`;
  return base;
}

/** DexScreener chart */
export function shitChartUrl(): string {
  return `https://dexscreener.com/solana/${SHIT_MINT}`;
}

export function treasurySolscanUrl(): string {
  return `https://solscan.io/account/${TREASURY_ADDRESS}`;
}

export function mintSolscanUrl(): string {
  return `https://solscan.io/token/${SHIT_MINT}`;
}

/** UI amount → raw (bigint string-safe) */
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
  "Buy $SHIT — skin in the court.",
  "Burn $SHIT — mint Clout (deflation).",
  "X verified — claim 100,000 $SHIT once.",
  "Fork solana-foundation/tokens — claim 250,000 $SHIT once.",
  "Spend Clout — Super Vote (3× weight).",
].join(" ");
