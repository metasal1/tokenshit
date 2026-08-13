/**
 * Product brand: THE HOUR
 * Hourly HIT / SHIT stake game — clear public name, page, link.
 */
export const HOUR_PRODUCT = {
  /** Full product name */
  name: "THE HOUR",
  /** Short nav label */
  nav: "Hour",
  /** One-liner */
  tagline: "Call HIT or SHIT. Stake the hour.",
  /** Rules blurb */
  blurb:
    "1,000 $TOKENSHIT · real majors · best % takes HIT pot · worst % takes SHIT pot · every UTC hour · VRF picks one wallet · 25% treasury",
  /** Canonical public paths */
  path: "/hour",
  winnersPath: "/winners",
  prevPath: "/hour/prev",
  receiptPath: (key: string) => `/hour/${encodeURIComponent(key)}`,
  /** Keep internal API stable */
  api: {
    status: "/api/day",
    winners: "/api/day/winners",
    buildTransfer: "/api/day/build-transfer",
  },
} as const;
