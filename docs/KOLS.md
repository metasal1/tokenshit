# /kols — CT KOL vote court (plan)

**Status:** Coming soon placeholder live · full product not built  
**Route:** `/kols` · nav label **KOLs** (More menu)

## Product

Users rate **Crypto Twitter KOLs** the same energy as bags:

- Tagline angle: *Every KOL is shit until proven otherwise.*
- Vote sides: **HIT** 🎯 / **SHIT** 💀 (Noto pack only)
- Not financial advice; culture / clout court, not price talk for Foundation RT

## v1 scope

| Piece | Spec |
|-------|------|
| Identity | X handle `@…` + display name + avatar |
| Source | Manual curated seed list first; optional X lookup later |
| Vote | Same Privy + Turso pattern as token votes (`vote` table or `kol_votes`) |
| UX | Random KOL card · Next KOL · leaderboards HIT/SHIT |
| Anti-farm | Same X≥100 + rate limits as claims/votes where applicable |
| SEO | `/kols` + per-KOL `/kols/[handle]` OG later |

## Data model (proposed)

```sql
CREATE TABLE IF NOT EXISTS kols (
  handle TEXT PRIMARY KEY,       -- lowercase no @
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  x_user_id TEXT,
  followers INTEGER,
  tier TEXT,                     -- mega / mid / micro
  tags TEXT,                     -- json array
  active INTEGER DEFAULT 1,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS kol_votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  handle TEXT NOT NULL,
  vote TEXT NOT NULL,            -- hit | shit
  device_id TEXT,
  username TEXT,                 -- privy/x
  voted_at TEXT DEFAULT (date('now')),
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_kol_votes_handle ON kol_votes(handle);
CREATE UNIQUE INDEX IF NOT EXISTS idx_kol_votes_once
  ON kol_votes(handle, COALESCE(username, device_id), voted_at);
```

## Seed list (examples — expand before launch)

Curate ~50–100 CT names (Solana-first bias OK):  
e.g. ecosystem hosts, traders, builders, meme accounts — **no** Foundation impersonation.

## Ship phases

1. **Now** — `/kols` coming soon + nav  
2. **Seed** — admin CSV / JSON of handles + avatars  
3. **Vote API** — `POST /api/kol/vote` + random card UI  
4. **Boards** — top HIT / SHIT KOLs on `/kols/boards` or tab  
5. **Claims hook (optional)** — one-time “voted 10 KOLs” claim kind  
6. **X enrich** — followers/avatar refresh via existing X cascade (cost-aware)

## Non-goals (v1)

- Paying KOLs  
- Implying Solana Foundation endorsement  
- Price / CA CTAs on KOL cards  
- Scraping X without rate budget

## Nav

- **More** menu: KOLs (not primary dock)  
- Primary CTA stays Play · Claim · Memes · Refer  

## Copy

- Page: **KOLs** · *Rate CT voices. HIT or SHIT.*  
- Coming soon: *Court is assembling. Curating the first roster.*


## Nominations (live)

- UI: `/kols` · `KolNominateForm`
- API: `POST /api/kols/nominate` `{ handle, note?, byX? }`
- Table: `kol_nominations` (pending → accepted/live/rejected)
- Limits: 8/day per X scout · 5/day anon IP
- TG ping on new nom
- **No payout on submit** — pay-on-accept later
