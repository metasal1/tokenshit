/**
 * Product brand: $SHIT OF THE DAY
 * Public play surface at /play (hourly rounds under the hood).
 */
export const PLAY_PRODUCT = {
  /** Full product name */
  name: "$SHIT OF THE DAY",
  /** Display without ticker $ for Monoton split if needed */
  nameDisplay: "SHIT OF THE DAY",
  /** Short nav label */
  nav: "Play",
  /** One-liner */
  tagline: "Call HIT or SHIT. Stake the bag.",
  /** Rules blurb */
  blurb:
    "1,000 $TOKENSHIT · real majors · best % takes HIT pot · worst % takes SHIT pot · VRF picks one wallet · 25% treasury",
  /** Canonical public paths */
  path: "/play",
  winnersPath: "/winners",
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
