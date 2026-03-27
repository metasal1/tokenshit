# TokenShit 💩

> Every token is shit until proven otherwise.

A Solana token explorer with attitude. Search tokens, check risk scores, and find out which ones are certified **$HIT**.

## Features

🔍 **Token Search** — Find any Solana token instantly with live data from Tokens.xyz API

📊 **Risk Analysis** — $HIT Score indicates token risk level (100 = safe, 0 = risky)

💰 **Market Data** — Price, market cap, volume, liquidity, FDV, and DEX markets

🗳️ **Community Voting** — Hit or Shit voting system with persistent stats

📈 **Live Visitor Count** — See who's exploring right now

🎨 **OG Images** — Shareable social previews for every token

## Tech Stack

- **Frontend:** Next.js 16.2 + Tailwind CSS
- **Backend:** Cloudflare Workers + Turso Database
- **APIs:** [Tokens.xyz API](https://tokens.xyz) for token data
- **Hosting:** Cloudflare Workers
- **Analytics:** Google Analytics (G-R0H3LP9LHZ)

## Deployment

Deployed on **Cloudflare Workers** (not Pages) for full SSR support.

```bash
# Install dependencies
npm install

# Build
npm run build

# Deploy
npx wrangler deploy
```

### Environment Variables

```env
TOKENS_XYZ_API_KEY=your_tokens_xyz_api_key
TURSO_DATABASE_URL=libsql://tokenshit-metasal1.aws-ap-northeast-1.turso.io
TURSO_AUTH_TOKEN=your_turso_auth_token
```

## Database

Uses **Turso** (SQLite on the edge) for:
- Vote tracking (Hit/Shit per token)
- Active visitor counts
- Vote leaderboards

```sql
CREATE TABLE votes (
  id TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL,
  vote_type TEXT NOT NULL, -- 'hit' or 'shit'
  device_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE active_visitors (
  id TEXT PRIMARY KEY,
  last_seen TIMESTAMP
);
```

## API Routes

- `GET /api/asset/[assetId]` — Token details
- `GET /api/asset/[assetId]/markets` — DEX markets
- `GET /api/asset/[assetId]/ohlcv` — Price history
- `GET /api/asset/[assetId]/risk` — Risk score
- `POST /api/vote` — Submit Hit/Shit vote
- `GET /api/votes/leaderboard` — Top voted tokens
- `GET /api/stats` — Global stats

## Pages

- `/` — Homepage with featured tokens
- `/token/[assetId]` — Token detail page
- `/search?q=query` — Token search
- `/stats` — Global voting stats & leaderboard

## Brand Assets

All brand assets available in `/tokenshit-assets/`:
- Faye Icon (PNG + SVG)
- Open Grass Icon (PNG + SVG)
- Square icons (3 variants)
- Tokenshit icon

Use `openbrand.sh` to fetch website assets:
```bash
./openbrand.sh https://tokenshit.com ./my-assets
```

## Development

```bash
# Local dev server (on port 3340)
npm run dev

# With CF tunnel for preview
cloudflared tunnel run --token "$(jq -r .token ~/.credentials/cloudflare-tunnel-solnew.json)"
# Then visit: https://tokenshit.metasal.xyz
```

## Live

🚀 **https://tokenshit.com**

- 200 status ✓
- Google Analytics active ✓
- Database connected ✓
- APIs responding ✓

## Phase 1 Complete

- [x] Token explorer with search & filters
- [x] Risk scoring & analysis
- [x] Hit/Shit voting system
- [x] Live stats & leaderboard
- [x] OG image generation
- [x] Cloudflare Workers deployment
- [x] Google Analytics
- [x] GitHub repo setup
- [x] Brand assets collection

## Next Phase

- [ ] Token alerts & notifications
- [ ] Portfolio tracking
- [ ] Advanced charting
- [ ] Solana blockchain integration
- [ ] Mobile app

## License

MIT

---

Made with 💩 by Metasal
