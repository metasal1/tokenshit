# TOKENSHIT Brand Guide

Site: https://tokenshit.com  
Guide: https://tokenshit.com/brand  
Source: `src/lib/brand.ts`

## Wordmark (dark mode — canonical)

**TOKEN$HIT** — Monoton.

| Part | Color | CSS |
|------|--------|-----|
| `TOKEN` + `HIT` | cream `#fff8e7` + gold glow `#f0c040` | `.neon-text` |
| `$` | neon green `#39ff14` (+ `#0fa` glow) | `.neon-dollar` |
| Background | `#0a0a0f` | page |

**Do not** paint TOKEN/HIT green or `$` magenta. Bare logos only — no boxes on shares.

## Tagline

> Every token is shit until proven otherwise.

## Colors

| Token | Hex | Role |
|-------|-----|------|
| background | `#0a0a0f` | Page |
| foreground | `#e4e4e7` | Body |
| wordmark | `#fff8e7` | TOKEN / HIT |
| wordmarkGlow | `#f0c040` | Wordmark halo |
| neon / wordmarkDollar | `#39ff14` | `$` + primary CTA |
| neon-blue | `#00d4ff` | Links |
| neon-purple | `#b94dff` | Selection |
| card | `#12121a` | Surfaces |
| border | `#2a2a3a` | Dividers |
| hit | `#4ade80` | HIT vote |
| shit | `#f87171` | SHIT vote |

## Type

| Use | Family |
|-----|--------|
| Brand lockup | **Monoton** |
| Secondary / nav / menus / HUD | **Orbitron** (`font-orbitron`) |
| UI body | Geist |
| Prices / mints | Geist Mono |
| Icons / emoji / confetti | **Noto Color Emoji** (`.emoji` / `EmojiIcon`) |

CSS stack for icons:

```css
.emoji, .font-emoji {
  font-family: "Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji",
    "Segoe UI Symbol";
  font-variant-emoji: emoji;
}
```

Never bare system emoji in UI, posters, emails, TG, or X — always Noto via `.emoji` / `EmojiIcon`.

Prices: plain decimals only (`$0.0000373`), never `3.73e-5`.

## Product

- Ticker: **$TOKENSHIT** (not $SHIT)
- X: [@Tokenshit_](https://x.com/Tokenshit_)
- Typefully social set: **326045**
- Mint: `fEbiuDdZZ1QaWYpJFPqk23ZkaRnAyHg4aivhrCTshit`
- Treasury: `SHTy7yoA5uAZoevKT3BFcSeDeFaHEyqWc55uApd3MJB`

## Voice

Do: irreverent, short, CT-native, product links, HIT/SHIT verbs.  
Don't: hashtags on X, auto-post, lame daily meme spam, corporate announce-speak.

## Assets (PNG)

| File | Path |
|------|------|
| Logo dark 1600×480 | `/brand/logo.png` |
| Logo transparent | `/brand/logo-transparent.png` |
| Logo wide 2400×600 | `/brand/logo-wide.png` |
| Logo square 1024 | `/brand/logo-square.png` |
| Logo square transparent | `/brand/logo-square-transparent.png` |
| Root alias | `/logo.png` |
| Icon SVG | `/brand/icon.svg` |
| X banner 1500×500 | `/brand/x-banner.jpg` |
| OG / social 1200×630 | `/brand/og-image.png` |
| OG share (wide lockup) | `/brand/og-share.png` |
| Favicon | `/favicon.ico` |
| App icon (Next) | `/icon.png` |
| Apple touch icon | `/apple-icon.png` |
| PWA icon 192 | `/icons/icon-192.png` |
| PWA icon 512 | `/icons/icon-512.png` |
| Maskable 192 | `/icons/maskable-192.png` |
| Maskable 512 | `/icons/maskable-512.png` |
| Hit/Shit hour poster 1080×1350 | `/brand/hit-shit-hour-poster.png` |
| Hit/Shit hour poster @2x 2160×2700 | `/brand/hit-shit-hour-poster@2x.png` |
| Hit/Shit hour banner 1200×630 | `/brand/hit-shit-hour-banner.png` |
| Hit/Shit hour banner @2x 2400×1260 | `/brand/hit-shit-hour-banner@2x.png` |
| Jupiter like claim poster 1080×1350 | `/brand/jup-like-claim-poster.png` |
| Jupiter like claim @2x | `/brand/jup-like-claim-poster@2x.png` |
| Jupiter like feed/story/og | `/posters/jup-like-claim-*.png` |
| Jupiter logo (PNG) | `/brand/jupiter-logo.png` |
| Noto emoji PNGs (icons) | `/brand/emoji/` |
| Brand fonts (Monoton etc.) | `/brand/fonts/` |
| Dynamic OG | `/opengraph-image` · `/twitter-image` |

## CSS

```css
/* Wordmark */
.neon-text   { color: #fff8e7; /* cream */ }
.neon-dollar { color: #39ff14; /* green $ */ }

/* Theme */
--color-background: #0a0a0f;
--color-neon: #39ff14;
--color-neon-blue: #00d4ff;
--color-neon-purple: #b94dff;
--color-card: #12121a;
--color-border: #2a2a3a;
```

Primary CTA: `bg-neon text-black font-semibold`
