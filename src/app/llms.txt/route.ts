/**
 * LLM SEO — https://llmstxt.org
 * GET /llms.txt
 */
export const dynamic = "force-static";

const BODY = `# TOKEN$HIT

> Every token is shit until proven otherwise.

HIT / SHIT verdicts on real Solana assets (Tokens.xyz / Solana Foundation registry).
Play $SHIT OF THE DAY, free arena votes, claims, swap, whales.

## Site

- Home: https://tokenshit.com/
- Play ($SHIT OF THE DAY): https://tokenshit.com/play
- Whales (holders): https://tokenshit.com/whales
- Swap: https://tokenshit.com/swap
- Claim: https://tokenshit.com/claim
- Memes: https://tokenshit.com/memes
- Stats: https://tokenshit.com/stats
- Winners: https://tokenshit.com/winners
- Referrals: https://tokenshit.com/referrals
- Brand: https://tokenshit.com/brand
- Search: https://tokenshit.com/search
- Seeker: https://tokenshit.com/seeker
- Terms: https://tokenshit.com/terms
- Privacy: https://tokenshit.com/privacy

## Product

- Ticker: $TOKENSHIT (Token-2022)
- Mint: fEbiuDdZZ1QaWYpJFPqk23ZkaRnAyHg4aivhrCTshit
- Treasury: SHTy7yoA5uAZoevKT3BFcSeDeFaHEyqWc55uApd3MJB
- X: https://x.com/Tokenshit_
- Registry: https://github.com/solana-foundation/tokens
- Data: https://tokens.xyz · https://docs.tokens.xyz

## Optional

- Sitemap: https://tokenshit.com/sitemap.xml
- Full: https://tokenshit.com/llms-full.txt
- solana.txt: https://tokenshit.com/solana.txt
`;

export function GET() {
  return new Response(BODY, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
