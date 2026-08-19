/**
 * Product brand: $HIT OF THE DAY (in-app)
 * Tweets / X copy: SH!T OF THE DAY (reads as SHIT, not $HIT)
 * Game sides remain HIT / SHIT (mechanics).
 */
export const PLAY_PRODUCT = {
  /** Full product name (UI) */
  name: "$HIT OF THE DAY",
  /** X / tweet / share product name */
  tweetName: "SH!T OF THE DAY",
  /** Display without ticker $ for Monoton split if needed */
  nameDisplay: "HIT OF THE DAY",
  /** Short nav label */
  nav: "Play",
  /** One-liner */
  tagline: "Call HIT or SHIT. Play the bag.",
  /** Rules blurb */
  blurb:
    "1,000 $TOKENSHIT · house spark in the bag · best % HIT pot · worst % SHIT pot · prize split · 25% house",
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
