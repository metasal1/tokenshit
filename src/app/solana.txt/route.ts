import { NextResponse } from "next/server";
import {
  CLAIM_GH_FORK,
  CLAIM_X_VERIFIED,
  SHIT_DECIMALS,
  SHIT_MINT,
  TREASURY_ADDRESS,
} from "@/lib/shit-token";

export const dynamic = "force-dynamic";

/** SHT vanity wallet (pubkey only — secret offline) */
const VANITY_SHT = "SHTy7yoA5uAZoevKT3BFcSeDeFaHEyqWc55uApd3MJB";

export async function GET() {
  const BODY = `# TokenShit — Solana
# https://tokenshit.com

token: ${SHIT_MINT}
chain: solana
symbol: SHIT
name: TokenShit
decimals: ${SHIT_DECIMALS}

site: https://tokenshit.com
claim: https://tokenshit.com/claim
buy: https://jup.ag/swap/SOL-${SHIT_MINT}
chart: https://dexscreener.com/solana/${SHIT_MINT}

treasury: ${TREASURY_ADDRESS}
vanity: ${VANITY_SHT}

x_verified_claim: ${CLAIM_X_VERIFIED}
gh_fork_claim: ${CLAIM_GH_FORK}
fork_upstream: solana-foundation/tokens

x: https://x.com/Tokenshit_
registry: https://github.com/solana-foundation/tokens
tokens_xyz: https://tokens.xyz

solscan_token: https://solscan.io/token/${SHIT_MINT}
solscan_treasury: https://solscan.io/account/${TREASURY_ADDRESS}
`;
  return new NextResponse(BODY, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=120",
    },
  });
}
