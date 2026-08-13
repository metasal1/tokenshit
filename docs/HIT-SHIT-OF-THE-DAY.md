# Hit / Shit of the Hour

**Main site feature** · **hourly** UTC · homepage hero

## Rules
- Stake **1,000 $TOKENSHIT** · HIT or SHIT · **real majors**
- Two pots · best % HIT · worst % SHIT (Tokens.xyz)
- **1 wallet = 1 VRF ticket** · unlimited stakes fill pot
- **25%** treasury · no winner → treasury
- Tie-break: **volume only**

## Round key
`YYYY-MM-DDTHH` UTC (DB column still `utc_day`)

## Cron (every hour :01)
```
POST /api/cron/day-game?action=hourly
Authorization: Bearer $CRON_SECRET
```

## Surfaces
- `/` homepage primary
- `/day` · `/hour`
- `/day/prev` last hour receipt
