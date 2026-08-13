# $SHIT OF THE DAY

**Canonical name:** `$SHIT OF THE DAY`  
**Nav:** Play  
**URL:** https://tokenshit.com/play  

## One-liner
Call **HIT** or **SHIT**. Stake the bag.

## Rules
- Stake **1,000 $TOKENSHIT** · real majors  
- Best % → **HIT pot** · worst % → **SHIT pot**  
- **1 wallet = 1 VRF ticket**  
- **25%** house · empty pot → treasury  
- Rounds: UTC hour keys under the hood (`YYYY-MM-DDTHH`)

## Surfaces
| Path | Role |
|------|------|
| `/play` | **Canonical play page** |
| `/` | Homepage hero embeds the game |
| `/play/prev` | Last round receipt |
| `/play/{key}` | Receipt |
| `/winners` | Past HIT / SHIT winners (not in main nav) |
| `/hour/*`, `/day/*` | Legacy → `/play` |

## API (internal — stable)
- `GET/POST /api/day`
- `GET /api/day/winners?side=hit|shit`
- `POST /api/cron/day-game?action=hourly`

## Brand
- Name: **$SHIT OF THE DAY**  
- Nav: **Play** (Orbitron)  
- Do not use “THE HOUR” / “Hit of the Day” mix in UI.
