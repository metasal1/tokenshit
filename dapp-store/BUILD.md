# TOKEN$HIT dApp Store / TWA (Seeker)

Scaffold only — first APK not built until keystore + Metasal GO.

## Identity (planned)

| | |
|--|--|
| Package | `com.tokenshit.app` |
| Host | `https://tokenshit.com` |
| Start URL | `https://tokenshit.com/?source=seeker` |
| short_description | `HIT/SHIT on Solana tokens` (≤30) |
| Support | bugs@tokenshit.com |
| Terms | https://tokenshit.com/terms |
| Privacy | https://tokenshit.com/privacy |
| Seeker guide | https://tokenshit.com/seeker |

## Init (one-time)

```bash
cd dapp-store
# Install bubblewrap if needed: npm i -g @bubblewrap/cli
# bubblewrap init --manifest https://tokenshit.com/manifest.webmanifest
# package: com.tokenshit.app
# Generate android.keystore — store password in .keystore-password (chmod 600)
# NEVER commit keystore or password
```

## Build

```bash
KS_PW=$(tr -d '\n' < .keystore-password)
BUBBLEWRAP_KEYSTORE_PASSWORD="$KS_PW" BUBBLEWRAP_KEY_PASSWORD="$KS_PW" \
  bubblewrap build --skipPwaValidation
mkdir -p media
cp app-release-signed.apk media/tokenshit.apk
# SHA256 fingerprint → update site assetlinks.json + CF deploy
```

## Media (required before publish)

| File | Spec |
|------|------|
| media/icon.png | 512×512+ |
| media/banner-1200x600.png | **1200×600** |
| media/screenshot-*.png | phone portrait |

Source icons: `../public/icons/icon-512.png`, brand posters under `../public/brand/`.

## config.yaml

Fill after publisher + app NFT exist (portal). Pattern: sol.new `dapp-store/config.yaml`.

```yaml
publisher:
  name: TOKEN$HIT
  website: https://tokenshit.com
  email: bugs@tokenshit.com
app:
  name: TOKEN$HIT
  android_package: com.tokenshit.app
  urls:
    license_url: https://tokenshit.com/terms
    copyright_url: https://tokenshit.com/terms
    privacy_policy_url: https://tokenshit.com/privacy
    website: https://tokenshit.com
```

## CLI

See Hermes skill **solana-dapp-store-publish**. API key: `~/.credentials/dapp-store-api-key.txt`.
