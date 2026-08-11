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
 */
export const SHIT_FEE_ATA =
  process.env.NEXT_PUBLIC_SHIT_FEE_ATA ||
  "3Pr2F6LjTiKBrTCMpDYHCLs3rs3tF3VxddCoV1u7h2id";

/** Prefer api.jup.ag with key; lite-api works from CF Workers */
export const JUP_QUOTE =
  process.env.JUP_QUOTE_URL || "https://lite-api.jup.ag/swap/v1/quote";
export const JUP_SWAP =
  process.env.JUP_SWAP_URL || "https://lite-api.jup.ag/swap/v1/swap";

export const SOL_MINT = "So11111111111111111111111111111111111111112";

export function jupiterBuyUrlWithFee(): string {
  return shitBuyUrl();
}

export function jupHeaders(): HeadersInit {
  const key =
    process.env.JUP_API_KEY ||
    process.env.JUPITER_API_KEY ||
    "";
  const h: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "User-Agent": "TokenShit/1.0 (+https://tokenshit.com)",
  };
  if (key) h["x-api-key"] = key;
  return h;
}

export { SHIT_MINT, TREASURY_ADDRESS };
