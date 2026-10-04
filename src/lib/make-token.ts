/** TOKENSHIT /make - platform pays create + $1 first buy to creator wallet. */

export const MAKE_PAYER = "HitAB3uWeS1G9J2RR9kQDcvjprJnyMmKz1q7gLu5PMAe";
export const MAKE_FIRST_BUY_USD = 1;
/** SOL needed for create rent + fees before the $1 buy. */
export const MAKE_MIN_SOL = 0.03;
/** Logged-in user must hold this many TOKENSHIT (ui). */
export const MAKE_MIN_HOLD = 1_000_000;

export type MakeSide = "hit" | "shit";

export function vanityTable(side: MakeSide): "hit_keypairs" | "shit_keypairs" {
  return side === "hit" ? "hit_keypairs" : "shit_keypairs";
}
