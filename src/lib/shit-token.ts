/** Official TokenShit mint + game / treasury constants */
export const SHIT_MINT =
  "fEbiuDdZZ1QaWYpJFPqk23ZkaRnAyHg4aivhrCTshit" as const;
/** Tweet / deeplink form */
export const SHIT_MINT_SOLANA_URI = `solana:${SHIT_MINT}` as const;

export const SHIT_DECIMALS = 6;
/** On-chain / display ticker */
export const SHIT_SYMBOL = "TOKENSHIT";
export const SHIT_NAME = "TokenShit";
export const SHIT_TICKER_DISPLAY = "$TOKENSHIT";

/** Official X account to follow/tag */
export const X_HANDLE = "Tokenshit_";
export const X_URL = `https://x.com/${X_HANDLE}`;
export const X_USER_ID = "2037761105359986688";

/** Public treasury = SHT vanity (claims, daily drop, house) */
export const TREASURY_ADDRESS =
  process.env.NEXT_PUBLIC_TREASURY_ADDRESS ||
  "SHTy7yoA5uAZoevKT3BFcSeDeFaHEyqWc55uApd3MJB";

/**
 * Play pot escrow — stakes **in**, prizes **out**.
 * `potRvs…` (not claims SHTy, not rev revenue).
 */
export const PLAY_POT_ADDRESS =
  process.env.NEXT_PUBLIC_PLAY_POT_ADDRESS ||
  "potRvsxc3dju4nQA28vMLuTvppyUiiphjkkTz92gF1r";

/**
 * Play house / revenue wallet (**rev…**).
 * Settle sends 25% house cut pot → rev. Claims still use SHTy.
 */
export const PLAY_REV_ADDRESS =
  process.env.NEXT_PUBLIC_PLAY_REV_ADDRESS ||
  "revn2bE1MtTvn5cBXguuAuuSyEC2VbiyRE2imFMAX7U";

/** One-time claim amounts (Metasal — halved) */
export const CLAIM_X_VERIFIED = 5_000;
/** X Premium (blue) */
export const CLAIM_X_PREMIUM = 7_500;
/** GitHub fork of solana-foundation/tokens */
export const CLAIM_GH_FORK = 7_500;
/** Jupiter VRFD — like $TOKENSHIT on verified.jup.ag with same X (once) */
export const CLAIM_JUP_VERIFIED = 5_000;
/** Tweet + tag @Tokenshit_ — every 24h; tweet must be <24h old */
export const CLAIM_X_TWEET = 2_500;
/** Follow @Tokenshit_ (once) — minor */
export const CLAIM_X_FOLLOW = 1_500;
/** Retweet promo post (once) */
export const CLAIM_X_RETWEET = 1_000;
/** Target status for x_retweet claim */
export const CLAIM_RT_TWEET_ID = "2091804745849774464";
export const CLAIM_RT_TWEET_URL =
  process.env.NEXT_PUBLIC_CLAIM_RT_TWEET_URL ||
  `https://x.com/Tokenshit_/status/${CLAIM_RT_TWEET_ID}`;

export const CLAIM_EMAIL_LIST = 2_500;
/** $TOKENSHIT per referral */
export const REFERRAL_REWARD_SHIT = 1_000;

/** Scout bounty when a 10k+ KOL nom is accepted/live */
export const KOL_SCOUT_REWARD_SHIT = Number(
  process.env.KOL_SCOUT_REWARD_SHIT || 2_500
);

/**
 * One-time SOL gas starter so new users can play without buying SOL.
 * Sized for N play tickets at ~PLAY_FEE_LAMPORTS_EST each (+ small buffer).
 * Metasal: 67 games.
 */
export const PLAY_GAS_STARTER_GAMES = 67;
/** Live play fees ~11k lamports; pad to 12k for CU variance */
export const PLAY_FEE_LAMPORTS_EST = 12_000;
/** Buffer so wallet isn't dusted to unusable */
export const PLAY_GAS_DROP_BUFFER_LAMPORTS = 50_000;
export const PLAY_GAS_DROP_LAMPORTS =
  PLAY_GAS_STARTER_GAMES * PLAY_FEE_LAMPORTS_EST + PLAY_GAS_DROP_BUFFER_LAMPORTS;
// 67 * 12_000 + 50_000 = 854_000 lamports ≈ 0.000854 SOL
export const PLAY_GAS_DROP_SOL = PLAY_GAS_DROP_LAMPORTS / 1e9;

/**
 * House spark for play pot — $2.4/day budget (~90k SHIT @ ~$0.0000256).
 * Smooth: ~3,750 SHIT/hour, day cap 90,000.
 */
export const PLAY_SEED_ENABLED = process.env.PLAY_SEED_ENABLED !== "0";
export const PLAY_SEED_HOUR_AMOUNT = Number(
  process.env.PLAY_SEED_HOUR_AMOUNT || 3_750
);
export const PLAY_SEED_DAY_CAP = Number(process.env.PLAY_SEED_DAY_CAP || 90_000);
/** Only top up when pot (hit+shit DB) is below this */
export const PLAY_SEED_FLOOR = Number(
  process.env.PLAY_SEED_FLOOR || PLAY_SEED_HOUR_AMOUNT
);

/** Exact tweet text for one-time SOL gas claim (67 plays). Spaces around the dot required. */
/** Min X followers to nominate a KOL */
export const MIN_KOL_FOLLOWERS = 10_000;

export const LOVE_GAS_TWEET = "I LOVE TOKENSHIT 💚 @tokenshit_ https://tokenshit.com/love";

/** Anti-farm floors (overridable via env — see src/lib/abuse.ts) */
export const CLAIM_REQUIRE_PFP = process.env.CLAIM_REQUIRE_PFP !== "0";
export const MAJOR_CLAIMS_PER_IP_DAY = Number(
  process.env.MAJOR_CLAIMS_PER_IP_DAY || 1
);
export const ABUSE_MIN_FOLLOWERS_CLAIM = Number(
  process.env.MIN_X_FOLLOWERS_CLAIM || 250
);
export const ABUSE_MIN_FOLLOWERS_REFERRAL = Number(
  process.env.MIN_X_FOLLOWERS_REFERRAL || 100
);

/**
 * Global treasury daily top-up (cron at UTC 00:00).
 * UI countdown targets next midnight UTC.
 */
export const GLOBAL_TREASURY_DAILY_DROP = 500_000;
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

/** Play pot escrow portfolio (stakes in · prizes out) */
export function playPotPortfolioUrl(): string {
  return `https://sol.new/portfolio/${PLAY_POT_ADDRESS}`;
}

/** Play house / rev revenue portfolio */
export function playRevPortfolioUrl(): string {
  return `https://sol.new/portfolio/${PLAY_REV_ADDRESS}`;
}

/** @deprecated alias — portfolio lives on sol.new */
export function treasuryPortfolioUrl(): string {
  return treasurySolscanUrl();
}

export function mintSolscanUrl(): string {
  return `https://solscan.io/token/${SHIT_MINT}`;
}

/** Intent URL: compose tweet tagging @Tokenshit_ (+ optional ref link) */
/** Default 24h tweet-claim copy — must tag @Tokenshit_ and include mint CA */
export function tweetClaimBody(refHandle?: string | null): string {
  const ref =
    refHandle && refHandle.replace(/^@/, "").trim()
      ? `https://tokenshit.com/?ref=${encodeURIComponent(
          refHandle.replace(/^@/, "").toLowerCase()
        )}`
      : "https://tokenshit.com";
  return (
    `I just love tokenshit all day everyday. @${X_HANDLE} — every token is SH!T until proven otherwise.\n\n` +
    `${SHIT_MINT_SOLANA_URI}\n\n` +
    ref
  );
}

export function tweetTagIntentUrl(text?: string, refHandle?: string | null): string {
  const body = text || tweetClaimBody(refHandle);
  return `https://x.com/intent/tweet?text=${encodeURIComponent(body)}`;
}


export function tweetCABody(): string {
  return `CA for $TOKENSHIT: ${SHIT_MINT_SOLANA_URI}\n\n@Tokenshit_ https://tokenshit.com`;
}

export function tweetCAIntentUrl(): string {
  return `https://x.com/intent/tweet?text=${encodeURIComponent(tweetCABody())}`;
}
export function followIntentUrl(): string {
  return `https://x.com/intent/follow?screen_name=${X_HANDLE}`;
}

/** Intent to retweet the promo status (x_retweet claim). */
export function retweetIntentUrl(tweetId = CLAIM_RT_TWEET_ID): string {
  return `https://x.com/intent/retweet?tweet_id=${encodeURIComponent(tweetId)}`;
}

/** Quote-RT the promo (fallback verify via pasted status URL). */
export function quoteRetweetIntentUrl(
  tweetId = CLAIM_RT_TWEET_ID,
  text = "SH!T"
): string {
  const u = new URL("https://x.com/intent/tweet");
  if (text) u.searchParams.set("text", text);
  u.searchParams.set("url", `https://x.com/Tokenshit_/status/${tweetId}`);
  return u.toString();
}

/** Pre-filled exact love-gas tweet */
export function loveGasTweetIntentUrl(refHandle?: string | null): string {
  const base = "https://tokenshit.com/love";
  const h = (refHandle || "").replace(/^@/, "").trim().toLowerCase();
  const link = h && /^[a-z0-9_]{1,15}$/.test(h) ? `${base}?ref=${encodeURIComponent(h)}` : base;
  // Exact claim text uses bare /love; intent can include ?ref= for attribution (matcher strips query)
  const text = h
    ? `I LOVE TOKENSHIT 💚 @tokenshit_ ${link}`
    : LOVE_GAS_TWEET;
  return `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
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
  "Buy $TOKENSHIT — skin in the game.",
  `Tweet + tag @${X_HANDLE} — claim ${CLAIM_X_TWEET.toLocaleString()} $TOKENSHIT every 24h.`,
  `X verified — claim ${CLAIM_X_VERIFIED.toLocaleString()} $TOKENSHIT once.`,
  `X Premium — claim ${CLAIM_X_PREMIUM.toLocaleString()} $TOKENSHIT once.`,
  `Like $TOKENSHIT on Jupiter VRFD (same X) — claim ${CLAIM_JUP_VERIFIED.toLocaleString()} $TOKENSHIT once.`,
  `Fork solana-foundation/tokens — claim ${CLAIM_GH_FORK.toLocaleString()} $TOKENSHIT once.`,
  `Refer friends — ${REFERRAL_REWARD_SHIT.toLocaleString()} $TOKENSHIT each.`,
].join(" ");
