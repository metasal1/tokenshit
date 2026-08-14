#!/usr/bin/env python3
"""Regenerate matching OG pack → public/brand/og/*.png + og-share.png
Requires: Pillow + public/brand/fonts/{Monoton,Orbitron,Inter}
Run: python3 scripts/generate-og-pack.py
"""
from __future__ import annotations
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import shutil

ROOT = Path(__file__).resolve().parents[1] / "public" / "brand"
OUT = ROOT / "og"
W, H = 1200, 630
BG = (10, 10, 15)
CREAM = (255, 248, 231)
NEON = (57, 255, 20)
CARD = (18, 18, 26)
GOLD = (240, 192, 64)
MUTED = (161, 161, 170)

ROUTES = [
    ("default", "TOKEN$HIT", "Every token is shit until proven otherwise", "tokenshit.com"),
    ("home", "TOKEN$HIT", "Play · Vote · Claim on Solana", "tokenshit.com"),
    ("claim", "CLAIM", "Grab free $TOKENSHIT rewards", "tokenshit.com/claim"),
    ("claims", "CLAIM", "Grab free $TOKENSHIT rewards", "tokenshit.com/claim"),
    ("memes", "MEMES", "Make shit memes. Share the bag.", "tokenshit.com/memes"),
    ("play", "$SHIT OF THE DAY", "Play the hourly pot · HIT or SHIT", "tokenshit.com/play"),
    ("whales", "WHALES", "Top 50 holders · movements", "tokenshit.com/whales"),
    ("winners", "WINNERS", "Hourly pot winners & VRF", "tokenshit.com/winners"),
    ("swap", "SWAP", "Trade $TOKENSHIT on Solana", "tokenshit.com/swap"),
    ("stats", "STATS", "Network pulse · token metrics", "tokenshit.com/stats"),
    ("seeker", "SEEKER", "Install on Solana Mobile Seeker", "tokenshit.com/seeker"),
    ("brand", "BRAND", "Logos · colors · press kit", "tokenshit.com/brand"),
    ("referrals", "REFER", "Share your link · earn $TOKENSHIT", "tokenshit.com/referrals"),
    ("search", "SEARCH", "Find any Solana token · HIT or SHIT", "tokenshit.com/search"),
    ("terms", "TERMS", "Rules of the shitshow", "tokenshit.com/terms"),
    ("privacy", "PRIVACY", "How we handle your data", "tokenshit.com/privacy"),
    ("day", "$SHIT OF THE DAY", "Play the hourly pot · HIT or SHIT", "tokenshit.com/play"),
    ("hour", "$SHIT OF THE DAY", "Play the hourly pot · HIT or SHIT", "tokenshit.com/play"),
]


def fit_title(text: str, font_path: Path, max_w=1000, start=88, min_size=40):
    size = start
    while size >= min_size:
        f = ImageFont.truetype(str(font_path), size)
        bb = f.getbbox(text)
        if bb[2] - bb[0] <= max_w:
            return f
        size -= 4
    return ImageFont.truetype(str(font_path), min_size)


def make(key, title, subtitle, url, logo):
    orbit_md = ImageFont.truetype(str(ROOT / "fonts/Orbitron-Bold.ttf"), 28)
    orbit_sm = ImageFont.truetype(str(ROOT / "fonts/Orbitron-Bold.ttf"), 22)
    orbit_lg = ImageFont.truetype(str(ROOT / "fonts/Orbitron-Bold.ttf"), 42)
    inter = ImageFont.truetype(str(ROOT / "fonts/Inter-Regular.ttf"), 26)

    im = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(im)
    for x in range(0, W, 40):
        draw.line([(x, 0), (x, H)], fill=(20, 22, 30), width=1)
    for y in range(0, H, 40):
        draw.line([(0, y), (W, y)], fill=(20, 22, 30), width=1)

    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    g = ImageDraw.Draw(glow)
    g.ellipse([-120, -80, 420, 360], fill=(*NEON, 40))
    g.ellipse([W - 380, H - 300, W + 80, H + 80], fill=(*GOLD, 28))
    glow = glow.filter(ImageFilter.GaussianBlur(60))
    im = Image.alpha_composite(im.convert("RGBA"), glow).convert("RGB")
    draw = ImageDraw.Draw(im)

    draw.rectangle([0, 0, W, 8], fill=NEON)
    draw.rectangle([0, H - 8, W, H], fill=NEON)
    margin = 48
    draw.rounded_rectangle(
        [margin, margin + 12, W - margin, H - margin - 12],
        radius=28,
        outline=NEON,
        width=3,
    )

    lx, ly = margin + 36, margin + 48
    if logo:
        mark = logo.copy()
        mark.thumbnail((96, 96), Image.Resampling.LANCZOS)
        im.paste(mark, (lx, ly), mark if mark.mode == "RGBA" else None)
        text_x = lx + mark.width + 24
    else:
        draw.ellipse([lx, ly, lx + 88, ly + 88], outline=NEON, width=3)
        draw.text((lx + 22, ly + 12), "$", font=orbit_lg, fill=NEON)
        text_x = lx + 112
    draw.text((text_x, ly + 8), "TOKEN$HIT", font=orbit_md, fill=CREAM)
    draw.text((text_x, ly + 44), "SOLANA", font=orbit_sm, fill=MUTED)

    tfont = fit_title(title, ROOT / "fonts/Monoton-Regular.ttf")
    bb = tfont.getbbox(title)
    tw, th = bb[2] - bb[0], bb[3] - bb[1]
    tx, ty = (W - tw) // 2, H // 2 - th // 2 - 10
    for dx, dy in [(-2, 0), (2, 0), (0, -2), (0, 2)]:
        draw.text((tx + dx, ty + dy), title, font=tfont, fill=(30, 120, 20))
    draw.text((tx, ty), title, font=tfont, fill=NEON)

    sb = inter.getbbox(subtitle)
    sw = sb[2] - sb[0]
    draw.text(((W - sw) // 2, ty + th + 28), subtitle, font=inter, fill=CREAM)

    ub = orbit_sm.getbbox(url)
    uw = ub[2] - ub[0]
    px, py = (W - uw) // 2 - 20, H - margin - 70
    draw.rounded_rectangle(
        [px, py, px + uw + 40, py + 44], radius=22, fill=CARD, outline=NEON, width=2
    )
    draw.text((px + 20, py + 10), url, font=orbit_sm, fill=NEON)

    path = OUT / f"{key}.png"
    im.save(path, "PNG", optimize=True)
    print("wrote", path.name, path.stat().st_size)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    logo = None
    for p in [ROOT / "logo-mark.png", ROOT / "logo-square.png", ROOT / "logo.png"]:
        if p.exists():
            logo = Image.open(p).convert("RGBA")
            break
    for row in ROUTES:
        make(*row, logo=logo)
    shutil.copy(OUT / "default.png", ROOT / "og-share.png")
    shutil.copy(OUT / "default.png", ROOT / "og-image.png")
    print("done", len(list(OUT.glob("*.png"))), "ogs")


if __name__ == "__main__":
    main()
