/**
 * Product brand: PLAY FOR PRIZES (in-app + OG)
 * Tweets / X copy: SH!T (reads as SHIT, not $HIT)
 * Game sides remain HIT / SHIT (mechanics).
 */
export const PLAY_PRODUCT = {
  /** Full product name (UI) */
  name: "PLAY FOR PRIZES",
  /** X / tweet / share product name */
  tweetName: "PLAY FOR PRIZES",
  /** Display without ticker $ for Monoton split if needed */
  nameDisplay: "PLAY FOR PRIZES",
  /** Short nav label */
  nav: "Play",
  /** One-liner */
  tagline: "FREE. 1 UP + 1 DOWN. Win the hour.",
  /** Rules blurb */
  blurb:
    "FREE Play · 1 UP + 1 DOWN per hour · hold 10,000 · follow @Tokenshit_ · 10,000 $TOKENSHIT / hour · jackpot rolls",
  /** Canonical public paths */
  path: "/play",
  winnersPath: "/winners",
  boardsPath: "/boards",
  prevPath: "/play/prev",
  receiptPath: (key: string) => `/play/${encodeURIComponent(key)}`,
  /** Keep internal API stable */
  api: {
    status: "/api/day",
    winners: "/api/day/winners",
    buildTransfer: "/api/day/build-transfer",
  },
} as const;

/** @deprecated use PLAY_PRODUCT */
export const HOUR_PRODUCT = PLAY_PRODUCT;
