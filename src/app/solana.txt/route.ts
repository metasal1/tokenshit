import {
  CLAIM_GH_FORK,
  CLAIM_X_FOLLOW,
  CLAIM_X_TWEET,
  CLAIM_X_VERIFIED,
  PLAY_POT_ADDRESS,
  PLAY_REV_ADDRESS,
  SHIT_DECIMALS,
  SHIT_MINT,
  SHIT_SYMBOL,
  TREASURY_ADDRESS,
  X_HANDLE,
} from "@/lib/shit-token";

export const dynamic = "force-dynamic";

export async function GET() {
  const BODY = `# TokenShit — Solana
# https://tokenshit.com

token: ${SHIT_MINT}
chain: solana
symbol: ${SHIT_SYMBOL}
name: TokenShit
decimals: ${SHIT_DECIMALS}

site: https://tokenshit.com
claim: https://tokenshit.com/claim
play: https://tokenshit.com/play
buy: https://jup.ag/swap/SOL-${SHIT_MINT}
chart: https://dexscreener.com/solana/${SHIT_MINT}

treasury: ${TREASURY_ADDRESS}
play_pot: ${PLAY_POT_ADDRESS}
play_rev: ${PLAY_REV_ADDRESS}

x_tweet_claim: ${CLAIM_X_TWEET}
x_follow_claim: ${CLAIM_X_FOLLOW}
x_verified_claim: ${CLAIM_X_VERIFIED}
gh_fork_claim: ${CLAIM_GH_FORK}
tag: @${X_HANDLE}

x: https://x.com/${X_HANDLE}
registry: https://github.com/solana-foundation/tokens
tokens_xyz: https://tokens.xyz

solscan_token: https://solscan.io/token/${SHIT_MINT}
portfolio_treasury: https://sol.new/portfolio/${TREASURY_ADDRESS}
portfolio_play_pot: https://sol.new/portfolio/${PLAY_POT_ADDRESS}
portfolio_play_rev: https://sol.new/portfolio/${PLAY_REV_ADDRESS}
`;
  return new Response(BODY, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=120",
    },
  });
}
