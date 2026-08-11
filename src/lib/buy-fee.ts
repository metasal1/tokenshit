import {
  SHIT_MINT,
  TREASURY_ADDRESS,
  shitBuyUrl,
} from "@/lib/shit-token";

/** Platform fee on $SHIT buys (basis points). 100 = 1% */
export const BUY_FEE_BPS = 100;

/**
 * Treasury ATA for $SHIT — Jupiter feeAccount must be an ATA of the
 * output mint owned by the fee recipient.
 * Derived: ATA(SHIT_MINT, TREASURY_ADDRESS)
 */
export const SHIT_FEE_ATA =
  process.env.NEXT_PUBLIC_SHIT_FEE_ATA ||
  "3Pr2F6LjTiKBrTCMpDYHCLs3rs3tF3VxddCoV1u7h2id";

export const JUP_QUOTE = "https://quote-api.jup.ag/v6/quote";
export const JUP_SWAP = "https://quote-api.jup.ag/v6/swap";

export const SOL_MINT = "So11111111111111111111111111111111111111112";

export function jupiterBuyUrlWithFee(): string {
  // Deep link still useful as fallback; in-app swap applies feeAccount.
  return shitBuyUrl();
}

export { SHIT_MINT, TREASURY_ADDRESS };
