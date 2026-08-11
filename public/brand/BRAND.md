# TOKENSHIT Brand Guide

Site: https://tokenshit.com  
Guide: https://tokenshit.com/brand  
Source: `src/lib/brand.ts`

## Wordmark

**TOKEN$HIT** — Monoton.

- `TOKEN` + `HIT` = neon green `#39ff14` with glow
- `$` = magenta neon `#ff00ff` (class `neon-dollar`)
- Bare logos only — no boxes on shares

## Tagline

> Every token is shit until proven otherwise.

## Colors

| Token | Hex | Role |
|-------|-----|------|
| background | `#0a0a0f` | Page |
| foreground | `#e4e4e7` | Body |
| neon | `#39ff14` | Primary / CTA |
| neon-blue | `#00d4ff` | Links |
| neon-purple | `#b94dff` | Selection |
| neon-magenta | `#ff00ff` | Dollar |
| card | `#12121a` | Surfaces |
| border | `#2a2a3a` | Dividers |
| hit | `#4ade80` | HIT vote |
| shit | `#f87171` | SHIT vote |

## Type

| Use | Family |
|-----|--------|
| Brand lockup | Monoton |
| Display / HUD | Orbitron |
| UI body | Geist |
| Prices / mints | Geist Mono |

Prices: plain decimals only (`$0.0000373`), never `3.73e-5`.

## Product

- Ticker: **$TOKENSHIT** (not $SHIT)
- X: [@Tokenshit_](https://x.com/Tokenshit_)
- Mint: `fEbiuDdZZ1QaWYpJFPqk23ZkaRnAyHg4aivhrCTshit`
- Treasury: `SHTy7yoA5uAZoevKT3BFcSeDeFaHEyqWc55uApd3MJB`

## Voice

Do: irreverent, short, CT-native, product links, HIT/SHIT verbs.  
Don't: hashtags on X, auto-post, lame daily meme spam, corporate announce-speak.

## Assets

| File | Path |
|------|------|
| Icon SVG | `/brand/icon.svg` |
| Square solid | `/brand/square-solid.png` |
| Square outline | `/brand/square-outline.png` |
| Square gradient | `/brand/square-gradient.png` |
| Logo | `/logo.jpg` |
| Neon logo | `/logo-neon.jpg` |
| Banner | `/banner.jpeg` |
| Treasury poster | `/posters/treasury-reloaded.png` |

## CSS

```css
--color-background: #0a0a0f;
--color-neon: #39ff14;
--color-neon-blue: #00d4ff;
--color-neon-purple: #b94dff;
--color-card: #12121a;
--color-border: #2a2a3a;
```

Primary CTA: `bg-neon text-black font-semibold`
