# Treasury security (post Aug 2026 drain)

## What broke
1. **Referral track paid instantly** (no auth) — first drain.
2. After partial fix, **claim path still paid large amounts** (esp. GH fork **250k**) with weak uniqueness / no global caps.
3. **No mandatory ledger** — on-chain sends could outrun DB rows (DB showed 0 claims while chain moved millions).

## Hard stops (live now)
| Secret | Value | Effect |
|--------|--------|--------|
| `TREASURY_SENDS_ENABLED` | `0` | No chain sends |
| `CLAIMS_ENABLED` | `0` | Claim API 503 |
| `REFERRAL_PAYOUTS_ENABLED` | `0` | Referral claim 503 |

## Code fix (this PR)
1. **`payFromTreasury()`** only path for claim + referral  
   - reserve ledger row (unique idempotency key)  
   - enforce **day budget / wallet day / wallet life / identity life**  
   - blacklist  
   - then send → finalize signature  
2. **Blacklist** drain wallets  
3. **Max single** default 25k (`TREASURY_MAX_SINGLE`)  
4. **Lower rewards** (tweet 5k, follow 3k, verified 5k, GH 10k, ref 2k)

## Caps (env, defaults)
| Env | Default |
|-----|---------|
| `TREASURY_DAY_BUDGET` | 100_000 |
| `TREASURY_WALLET_DAY_CAP` | 25_000 |
| `TREASURY_WALLET_LIFE_CAP` | 50_000 |
| `TREASURY_IDENTITY_LIFE_CAP` | 50_000 |
| `TREASURY_MAX_SINGLE` | 25_000 |

## Safe reopen checklist
1. Confirm treasury balance + SOL for fees  
2. `npx wrangler secret put CLAIMS_ENABLED` → `1`  
3. `npx wrangler secret put REFERRAL_PAYOUTS_ENABLED` → `1` only if referrals ready  
4. **Last:** `npx wrangler secret put TREASURY_SENDS_ENABLED` → `1`  
5. Test one small claim with a known wallet  
6. Watch `treasury_payouts` table + on-chain ATA  

## Do not reopen if
- Kill switches still needed for ops reason  
- GH fork check still gameable and amount not tiny  
- No monitoring on `treasury_payouts` / hour outflow

## Claim rules (Metasal — product)

| Rule | Value |
|------|--------|
| Auth | **X (Twitter) sign-in compulsory** via Privy |
| Wallet | **Only Privy Solana wallet linked to that X** |
| Profile | **PFP required** + **≥100 followers** |
| Verified (non-premium) | **10,000** $TOKENSHIT once |
| X Premium (blue) | **20,000** once (not stackable with verified) |
| GH fork `solana-foundation/tokens` | **100,000** once (still needs X+PFP+100 followers) |
| Major claims IP | **1 per IP per day** (verified / premium / GH) |
| Kill switches | Still apply until reopen |

