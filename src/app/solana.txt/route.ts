import { NextResponse } from "next/server";
import {
  CLAIM_GH_FORK,
  CLAIM_X_VERIFIED,
  SHIT_DECIMALS,
  SHIT_MINT,
  TREASURY_ADDRESS,
} from "@/lib/shit-token";

export const dynamic = "force-dynamic";

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
treasury: ${TREASURY_ADDRESS}
buy: https://jup.ag/swap/SOL-${SHIT_MINT}
x_verified_claim: ${CLAIM_X_VERIFIED}
gh_fork_claim: ${CLAIM_GH_FORK}
fork_upstream: solana-foundation/tokens
x: https://x.com/Tokenshit_
registry: https://tokens.xyz
`;
  return new NextResponse(BODY, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=600",
    },
  });
}
