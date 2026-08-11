# Incident: TOKENSHIT treasury referral drain (2026-08-11)

## Summary
Unauthenticated `POST /api/referral/track` paid **10,000 $TOKENSHIT** per request when `referrerWallet` was set. Attacker spammed fake `referredTwitter` values and drained SHTy treasury to ~5k remaining.

## Timeline (UTC)
- ~20:43–20:50 2026-08-11 — burst of 10k transfers from treasury ATA `G9TdwfCL…` to wallet `9kJBoqekAF3F1YU2AcWyPnTY8JmW32choy3vdRLeuNdh`
- Exit sweeps to wallets prefix `2GCXJDao…` and peer drip `GMiEAt5Viv…`
- Same day — patch: no pay-on-track; claim-rewards paused; reserve-before-send
- Follow-up — Privy Bearer required; wallet blacklist; claim path auth

## Root cause
1. Public track endpoint with no auth
2. Immediate `sendShitFromTreasury` on track
3. Pay before durable unique DB row

## Fix
- Track = insert only + Privy of referred user
- Claim-rewards = Privy + optional `REFERRAL_PAYOUTS_ENABLED` / `PRIVY_APP_SECRET`
- Blacklist drain wallets
- Claims reserve row before send

## Reopen checklist
1. Set Worker secret `PRIVY_APP_SECRET`
2. Set `REFERRAL_PAYOUTS_ENABLED=1` only after Privy secret verified
3. Fund treasury ATA (Token-2022) intentionally
4. Smoke: unauth track → 401; blacklisted wallet → 403

## Wallets
- Drain: `9kJBoqekAF3F1YU2AcWyPnTY8JmW32choy3vdRLeuNdh`
- Treasury: `SHTy7yoA5uAZoevKT3BFcSeDeFaHEyqWc55uApd3MJB`
