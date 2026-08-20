# Privy Solana gas sponsorship — ATA CloseAccount abuse

**Incident:** Privy paused Solana gas sponsorship after ATA rent-refund abuse drained credits. Account credited back to $0. Re-enable only after defenses below.

**Docs:** https://docs.privy.io/wallets/gas-and-asset-management/gas/security#security-best-practices

## Attack

On Solana, closing an ATA refunds rent (~0.002 SOL) to the **owner**, not the fee payer. With app-pays gas + Jupiter routes that append `CloseAccount`, a user can repeatedly create/close ATAs and pocket rent while the app pays create fees.

## Defenses shipped

| Control | Where |
|--------|--------|
| Strip Token + Token-2022 `CloseAccount` (disc. `9`) before `sponsor: true` | `src/lib/strip-close-account.ts` |
| Unified sponsor send (strip → gate → sponsor → self-pay fallback) | `src/lib/sponsor-send.ts` |
| Rate limit: 15/wallet/day, 40/IP/day (env override) | `POST /api/sponsor/gate` → `sponsor_usage` |
| Jupiter build prefers **legacy** txs (easier strip) | `/api/buy`, `/api/swap` |
| Play path already `sponsor: false` | `src/lib/solana-send.ts` |

Wired clients: `SwapDesk`, `BuyShitPanel`, `WithdrawPanel`, `OnrampButton`.

Env (optional):

```
SPONSOR_MAX_PER_WALLET_DAY=15
SPONSOR_MAX_PER_IP_DAY=40
```

## Reply to Privy (copy)

> We've implemented your Solana gas sponsorship security guidance:
>
> 1. **CloseAccount stripping** on all client paths that request `sponsor: true` (Token + Token-2022), so Jupiter/temp ATA closes cannot refund rent to users on sponsored txs.
> 2. **Per-wallet and per-IP daily rate limits** before sponsorship is attempted (server gate + Turso ledger).
> 3. **Legacy Jupiter builds preferred** so instructions can be fully audited/stripped.
> 4. Play remains **self-pay** (no Privy sponsor).
>
> Please re-enable Solana gas sponsorship for app `cmdz9woca0012ky0bgpyfqept` when convenient. Happy to share a short walkthrough or tx samples.

## Checklist before they flip it back on

- [x] Strip CloseAccount before sponsor
- [x] Rate limits per user/wallet/IP
- [x] Fail closed if gate errors (no sponsor)
- [ ] Dashboard: confirm App pays + reasonable tank
- [ ] Optional: Privy dashboard spending alerts if available
- [ ] Smoke: buy/swap with 0 SOL user after re-enable
