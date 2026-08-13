# Shit / Hit of the Day — locked product design

**Status:** design lock (not built)  
**Updated:** 2026-08-13  
**Brand:** TOKEN$HIT · majors only · UTC day

---

## One-liner

Pay **1,000 $TOKENSHIT** to call HIT or SHIT on a **majors** bag. Two pots. End of **UTC day**: best **price %** bag wins HIT pot; worst **price %** bag wins SHIT pot. **Proof Network VRF** picks one correct caller at random. **25% house** → treasury; **75%** → winner. No eligible callers → **pot → treasury**.

---

## Decisions (final)

| # | Topic | Lock |
|---|--------|------|
| 1C | Pots | **Two pots** — HIT stakes fund HIT prize; SHIT stakes fund SHIT prize |
| 2A | Hit bag | **Highest price % gain** over the UTC day (Tokens.xyz prices) |
| 3A | Shit bag | **Lowest (worst) price %** over the UTC day (Tokens.xyz) |
| 4 | Winner wallet | **Random** among correct callers via **Proof Network VRF** (`proofnetwork.lol` / VRF) — **reuse Seeker Tracker raffle bot integration** (same pattern as sol.new `vrf_draws` / fair draw) |
| 5B | Stake | **1,000 $TOKENSHIT escrowed** into that side’s pot (not burned at entry) |
| 6 | Clock | **UTC calendar day** (`00:00:00Z` → next `00:00:00Z`), same family as treasury drop |
| 7 | Universe | **Full majors** list (Tokens.xyz `list=majors`, quality filter TBD at build — all majors assets in pool) |
| Oracle | Prices | **Tokens.xyz** |
| Winner bag set | Scope | **Full majors** (not only bags that received stakes) |
| Stake limits | Cap | **Unlimited** stakes (wallet may stake many times / many bags) |
| No winner | Empty / no callers | **Prize → treasury** |
| House fee | Cut | **25%** of pot → treasury; **75%** → VRF winner |

---

## Day lifecycle

```
00:00 UTC  open day N
           snapshot open prices for all majors (Tokens.xyz)
           HIT_pot = 0, SHIT_pot = 0

during day  user: pick majors bag + HIT|SHIT
            pay 1000 $TOKENSHIT → escrow into HIT_pot or SHIT_pot
            record stake {wallet, assetId, side, amount, sig, day}

00:00 UTC  close day N / open N+1
           snapshot close prices for all majors
           hitBag  = argmax (close-open)/open   over majors with finite prices
           shitBag = argmin (close-open)/open
           hitEligible  = wallets that staked HIT  on hitBag
           shitEligible = wallets that staked SHIT on shitBag

           for each side pot:
             fee = floor(pot * 0.25) → treasury
             prize = pot - fee
             if eligible empty OR prize == 0:
               prize (+ remaining) → treasury
             else:
               winner = VRF(eligible[], seed=day|side|…)  // Proof Network
               pay prize → winner wallet
             emit public receipt (day, bags, % moves, pot, fee, winner, vrf proof)
```

---

## Economics

| Item | Rule |
|------|------|
| Entry | 1,000 $TOKENSHIT per stake action |
| Escrow | Held until settle (Token-2022 treasury/escrow ATA) |
| HIT pot | Sum of all HIT stakes that UTC day |
| SHIT pot | Sum of all SHIT stakes that UTC day |
| Fee | **25%** of each pot → `TREASURY_ADDRESS` |
| Winner | **75%** of that pot → one VRF-selected correct caller |
| No correct callers | **100%** of that pot (after or including fee — prefer: whole pot to treasury) → treasury |
| Unlimited | No per-wallet / per-bag stake cap in v1 |

**Note:** Unlimited + 1k each means large whales can dominate entries; VRF is still uniform over **entries** (or over unique wallets — see open crumb). Default v1: **one ticket per stake** (10 stakes = 10 tickets).

---

## Eligibility for VRF

- Wallet must have **successfully escrowed** ≥1 stake of **correct side** on the **winning bag**.  
- Multiple stakes on same bag/side → **multiple tickets** (unless we switch to unique wallet later).  
- Wrong side on winning bag → not eligible.  
- Stakes on other bags → not eligible for that pot.

---

## Oracle (Tokens.xyz)

- **Source:** Tokens.xyz curated majors + price stats (same API family as arena).  
- **Open:** price at or first sample after `dayStart` UTC.  
- **Close:** price at or last sample before `dayEnd` UTC.  
- **Return:** `(close - open) / open`.  
- Skip assets missing open or close (or open ≤ 0).  
- Tie on %: deterministic break (e.g. higher volume, then assetId sort) — document in receipt.

---

## Randomness (Proof Network VRF)

- **Provider:** Proof Network VRF ([proofnetwork.lol](https://proofnetwork.lol) / vrfs).  
- **Implementation source:** port from **Seeker Tracker raffle bot** + sol.new fair-draw patterns (`vrf_draws` receipt, seed materials).  
- **Seed materials (illustrative):** `utcDay | side | hitBag|shitBag | potRaw | entriesMerkle | slot/blockhash`  
- **Output:** index into eligible ticket list; publish proof + draw id on `/day/<utcDay>` receipt.  
- **No VRF / failure:** fail closed — do not pick silently; retry cron or route pot to treasury with public `failed_vrf` status (prefer retry then treasury after N fails).

---

## Product surfaces (when built)

| Surface | Purpose |
|---------|---------|
| `/day` or home module | Today’s pots, countdown, stake UI (majors picker) |
| Stake modal | Bag + HIT/SHIT + 1k confirm (Privy sign + transfer) |
| Live board | Top movers (oracle) + pot sizes (not “vote weight” as winner) |
| `/day/[yyyy-mm-dd]` | Settlement receipt: bags, %, pots, fee, winner, tx, VRF |
| Cron | Snapshot open · snapshot close · settle · TG ping |

---

## Anti-abuse / ops

- Claims already gate low-follower X; day stakes should require **Privy + Solana wallet** linked.  
- Unlimited stakes → monitor treasury SOL for fee legs; escrow ATA balance.  
- **25% fee** reduces extract; still watch wash trading on majors prices (oracle trust = Tokens.xyz).  
- Pause switches: `DAY_GAME_ENABLED=0`, reuse treasury kill switches for payouts.

---

## Out of scope v1

- Non-majors bags  
- Price sources other than Tokens.xyz  
- Partial pot refunds  
- Parimutuel split among all correct callers (single VRF winner only)  
- Mobile widget / push for settle (nice-to-have)

---

## Build status

**v1 shipped** (2026-08-13)

| Piece | Path |
|-------|------|
| Core | `src/lib/day-game.ts` · `src/lib/day-vrf.ts` · `src/lib/majors-filter.ts` |
| API | `GET/POST /api/day` · `POST /api/day/build-transfer` · `GET /api/day/[date]` |
| Cron | `POST /api/cron/day-game?action=open\|close\|settle\|daily` |
| UI | `/day` · `/day/[date]` · `/day/yesterday` |
| Nav | Day link |

### Ticket rule
**1 wallet = 1 VRF ticket** (unique wallet among correct callers). Unlimited stakes still add 1k each to the pot.

### Majors
**Real majors** only (tier1/2 or mcap ≥ $50M).

### Tie-break
**Higher volume24h only** (close snapshot).

### Cron
```bash
# open snapshot (00:05 UTC)
curl -X POST -H "Authorization: Bearer $CRON_SECRET" \
  'https://tokenshit.com/api/cron/day-game?action=open'

# settle previous day (00:10 UTC) — close snap + VRF + payout
curl -X POST -H "Authorization: Bearer $CRON_SECRET" \
  'https://tokenshit.com/api/cron/day-game?action=daily'
```
