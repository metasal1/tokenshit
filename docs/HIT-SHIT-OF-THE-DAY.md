# THE HOUR

**Canonical name:** THE HOUR  
**Nav:** Hour  
**URL:** https://tokenshit.com/hour  

## One-liner
Call **HIT** or **SHIT**. Stake the hour.

## Rules
- Stake **1,000 $TOKENSHIT** · real majors  
- Best % → **HIT pot** · worst % → **SHIT pot**  
- **1 wallet = 1 VRF ticket**  
- **25%** house · empty pot → treasury  
- Cadence: **every UTC hour** (`YYYY-MM-DDTHH`)

## Surfaces
| Path | Role |
|------|------|
| `/hour` | **Canonical play page** |
| `/` | Homepage hero embeds the game |
| `/hour/prev` | Last hour receipt |
| `/hour/{YYYY-MM-DDTHH}` | Receipt |
| `/winners` | Past HIT / SHIT winners |
| `/day/*` | **Legacy redirects → /hour** |

## API (internal — stable)
- `GET/POST /api/day`
- `GET /api/day/winners?side=hit|shit`
- `POST /api/cron/day-game?action=hourly`

## Brand
- Display title: **THE HOUR** (Monoton lockup optional)  
- Nav label: **Hour** (Orbitron)  
- Do not say “Day game” or “Hit/Shit of the Day” in UI.
