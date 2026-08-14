# TOKEN$HIT — Solana Seeker launch

Ship path: **web (tokenshit.com) first** → **PWA** → **TWA APK** → **dApp Store**.

Package (planned): `com.tokenshit.app`  
Short description (≤30): `HIT/SHIT on Solana tokens`  
Support: `bugs@tokenshit.com` · `gm@metasal.xyz`

## Live product URLs (must 200)

| Page | URL |
|------|-----|
| Website | https://tokenshit.com |
| Play | https://tokenshit.com/play |
| Seeker guide | https://tokenshit.com/seeker |
| **Terms** | https://tokenshit.com/terms |
| **Privacy** | https://tokenshit.com/privacy |
| Claim / Swap | https://tokenshit.com/claim · /swap |
| Asset links | https://tokenshit.com/.well-known/assetlinks.json |

## Ready now

- [x] Mobile-first Play / Vote / Claim / Swap
- [x] PWA v2 (splash, SW, install sheet, safe-area)
- [x] PWA X login full-page OAuth
- [x] Terms + Privacy
- [x] `/seeker` install guide
- [x] `assetlinks.json` route (fingerprint placeholder)
- [x] GA4 · SEO · OG share card
- [x] Solana-only Privy wallets

## Before dApp Store submit

1. **KYB Active** on Solana Mobile publisher portal (same org as sol.new / Snake if shared).
2. **Keystore** — create once under `dapp-store/`, never lose; password in gitignored file.
3. **Bubblewrap TWA** against `https://tokenshit.com` (start URL `/` or `/play`).
4. Put **SHA-256 cert fingerprint** into `assetlinks.json` + redeploy CF.
5. **Store art**
   - Icon 512+ (use `/icons/icon-512.png`)
   - Banner **1200×600** (required for updates)
   - 3–5 screenshots: Play, Vote, Claim, Whales, Memes (phone frames)
6. **config.yaml** — website, license_url=terms, privacy_policy_url, short_description ≤30.
7. Fund **publisher** keypair (~0.05+ SOL mainnet).
8. `versionCode` bumps every APK.

## Build sketch (after keystore)

```bash
cd dapp-store
# init bubblewrap if not present — package com.tokenshit.app
# twa-manifest.json host: tokenshit.com
KS_PW=$(cat .keystore-password)
BUBBLEWRAP_KEYSTORE_PASSWORD="$KS_PW" BUBBLEWRAP_KEY_PASSWORD="$KS_PW" \
  bubblewrap build --skipPwaValidation
cp app-release-signed.apk media/tokenshit.apk
# fingerprint → assetlinks → ship CF → validate → create release → publish update
```

CLI patterns: skill **`solana-dapp-store-publish`** (sol.new 0.15 legacy vs portal ≥1.0).

## Mobile QA checklist (Seeker hardware or emulator)

| # | Check |
|---|--------|
| 1 | Cold open `/` &lt;3s; boot splash fades |
| 2 | Safe-area: ticker below status bar |
| 3 | Login Email works standalone |
| 4 | Login X full-page returns session |
| 5 | Embedded Solana wallet funds/shows |
| 6 | `/play` stake 1k path (or dry-run UI) |
| 7 | Free HIT/SHIT vote + confetti |
| 8 | `/claim` status loads; no ETH wallet |
| 9 | `/swap` quote (needs SOL dust / sponsor) |
| 10 | `/whales` top 50 |
| 11 | `/memes` export share sheet |
| 12 | Install / A2HS prompt once |
| 13 | Rotate portrait only OK |
| 14 | Terms + Privacy readable |

## Soft launch sequence

1. Ship this prep (legal + seeker page + assetlinks stub) — **this PR**.
2. Phone QA on Seeker browser + PWA (Metasal).
3. Generate store banner + screenshots.
4. Build TWA APK; fill fingerprint; CF redeploy assetlinks.
5. Portal listing draft → internal APK sideload.
6. After Metasal OK → `create release` / publish update.
7. Announce X + TG only after store or public APK live (no auto-tweet).

## Risks

| Risk | Mitigation |
|------|------------|
| OAuth popup on Seeker | Full-page X + email path |
| Assetlinks mismatch | Never rotate keystore; update JSON before store |
| short_description &gt;30 | Keep `HIT/SHIT on Solana tokens` |
| Treasury empty | Claims kill switches; warn in UI |
| Jup routes | Allowlist + dual build |

## Related

- `docs/TRACTION-14DAY.md`
- skill `tokenshit-site` · `solana-dapp-store-publish`
- sol.new TWA reference: `/Volumes/PRO-G40/solnew/sol-new/dapp-store`
