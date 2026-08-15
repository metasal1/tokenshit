/**
 * Extended LLM reference.
 */
export const dynamic = "force-static";

const BODY = `# TOKEN$HIT — full reference

## One-liner
Every token is shit until proven otherwise. Vote HIT or SHIT on Solana Foundation registry assets. Play hourly $HIT OF THE DAY pots. Claim, swap, refer.

## Primary surfaces
| Path | Role |
|------|------|
| / | Home — Play + free Vote |
| /play | $HIT OF THE DAY (canonical game) |
| /whales | Top holders, hold time, movements |
| /swap | Buy/swap $TOKENSHIT (Jupiter) |
| /claim | Rewards (tweet, follow, GH fork, list, verified) |
| /memes | Meme studio (Monoton captions) |
| /stats | Vote/visitor stats |
| /winners | Past HIT/SHIT bags |
| /referrals | Referral program |
| /brand | Brand kit |

## Token
- Name: TokenShit
- Symbol: TOKENSHIT
- Mint: fEbiuDdZZ1QaWYpJFPqk23ZkaRnAyHg4aivhrCTshit
- Decimals: 6
- Program: Token-2022
- Treasury: SHTy7yoA5uAZoevKT3BFcSeDeFaHEyqWc55uApd3MJB
- Portfolio UI: https://sol.new/portfolio/SHTy7yoA5uAZoevKT3BFcSeDeFaHEyqWc55uApd3MJB

## Game rules ($HIT OF THE DAY)
- Path: /play (never call it “stake” in UI — always Play)
- Stake size: 1,000 $TOKENSHIT per play
- Sides: HIT (best %) · SHIT (worst %)
- Cadence: hourly UTC
- VRF fair draw · 25% house
- Real majors only

## Auth
- Privy: email + X + GitHub
- Solana wallets only

## Contact
- X @Tokenshit_
- bugs@tokenshit.com
- Brand: https://tokenshit.com/brand

## Do not
- Self-host Solana Foundation tokens monorepo
- Confuse free arena Vote with Play pots
- Promise mint-wide limit order books
`;

export function GET() {
  return new Response(BODY, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
