#!/usr/bin/env python3
"""
TOKEN$HIT OG pack — original flying-emoji scatter design.

- BG #0a0a0f
- Cream TOKEN/HIT (#fff8e7) + green $ (#39ff14) Monoton lockup
- Orbitron tagline / URL / route badge
- Random-ish scatter of brand emoji + green $ mark stamps
- Per-route title/subtitle; same visual system

Run: python3 scripts/generate-og-pack.py
"""
from __future__ import annotations

import hashlib
import io
import math
import random
import shutil
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1] / "public" / "brand"
OUT = ROOT / "og"
W, H = 1200, 630

BG = (10, 10, 15)
CREAM = (255, 248, 231)
NEON = (57, 255, 20)
GOLD = (240, 192, 64)
MUTED = (161, 161, 170)
DIM = (82, 82, 91)

# emoji codepoints for scatter (twemoji)
SCATTER_EMOJI = [
    "1f3af",  # 🎯
    "1f480",  # 💀
    "1f4a9",  # 💩
    "1f680",  # 🚀
    "1f48e",  # 💎
    "1f525",  # 🔥
    "26a1",   # ⚡
    "1f3c6",  # 🏆
    "1f7e9",  # 🟩
    "1f53b",  # 🔻
    "2728",   # ✨
    "2620",   # ☠️
    "1f911",  # 🤑
    "1f4c9",  # 📉
    "1fa99",  # 🪙
    "1f3b2",  # 🎲
    "1f4b8",  # 💸
    "1f921",  # 🤡
    "1f4b0",  # 💰
    "1f31f",  # 🌟
]

# brand pack PNGs (preferred when present)
LOCAL_EMOJI = {
    "target": ROOT / "emoji/target-512.png",
    "skull": ROOT / "emoji/skull-512.png",
    "fire": ROOT / "emoji/fire-512.png",
    "sparkles": ROOT / "emoji/sparkles-512.png",
    "trophy": ROOT / "emoji/trophy-512.png",
}

ROUTES = [
    ("default", None, "Every token is shit until proven otherwise", "tokenshit.com"),
    ("home", None, "Play · Vote · Claim on Solana", "tokenshit.com"),
    ("claim", "CLAIM", "Grab free $TOKENSHIT rewards", "tokenshit.com/claim"),
    ("claims", "CLAIM", "Grab free $TOKENSHIT rewards", "tokenshit.com/claim"),
    ("memes", "MEMES", "Make shit memes. Share the bag.", "tokenshit.com/memes"),
    ("play", "PLAY", "$SHIT OF THE DAY · hourly pot", "tokenshit.com/play"),
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
    ("day", "PLAY", "$SHIT OF THE DAY · hourly pot", "tokenshit.com/play"),
    ("hour", "PLAY", "$SHIT OF THE DAY · hourly pot", "tokenshit.com/play"),
]

CACHE = Path("/tmp/tokenshit-twemoji")
CACHE.mkdir(parents=True, exist_ok=True)


def load_font(name: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(ROOT / "fonts" / name), size)


def fetch_twemoji(cp: str) -> Image.Image | None:
    dest = CACHE / f"{cp}.png"
    if not dest.exists():
        url = f"https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/{cp}.png"
        try:
            urllib.request.urlretrieve(url, dest)
        except Exception:
            return None
    try:
        return Image.open(dest).convert("RGBA")
    except Exception:
        return None


def load_local_icons() -> list[Image.Image]:
    icons = []
    for p in LOCAL_EMOJI.values():
        if p.exists():
            try:
                icons.append(Image.open(p).convert("RGBA"))
            except Exception:
                pass
    return icons


def paste_rgba(base: Image.Image, overlay: Image.Image, x: int, y: int, opacity=1.0, rotate=0, size=None):
    im = overlay.copy()
    if size:
        im = im.resize((size, size), Image.Resampling.LANCZOS)
    if rotate:
        im = im.rotate(rotate, expand=True, resample=Image.Resampling.BICUBIC)
    if opacity < 1:
        a = im.split()[-1].point(lambda p: int(p * opacity))
        im.putalpha(a)
    # center on x,y
    px = int(x - im.width / 2)
    py = int(y - im.height / 2)
    base.alpha_composite(im, (px, py))


def draw_lockup(draw: ImageDraw.ImageDraw, mono: ImageFont.FreeTypeFont, y: int):
    """Cream TOKEN + green $ + cream HIT centered."""
    parts = [("TOKEN", CREAM), ("$", NEON), ("HIT", CREAM)]
    widths = []
    for t, _ in parts:
        bb = mono.getbbox(t)
        widths.append(bb[2] - bb[0])
    total = sum(widths)
    x = (W - total) // 2
    # gold/green glow via multi-pass
    for t, color in parts:
        bb = mono.getbbox(t)
        tw = bb[2] - bb[0]
        if color == CREAM:
            for dx, dy in [(-3, 0), (3, 0), (0, -3), (0, 3), (-2, -2), (2, 2)]:
                draw.text((x + dx, y + dy), t, font=mono, fill=(240, 192, 64, 90))
            draw.text((x, y), t, font=mono, fill=CREAM)
        else:
            for dx, dy in [(-3, 0), (3, 0), (0, -3), (0, 3)]:
                draw.text((x + dx, y + dy), t, font=mono, fill=(20, 140, 30, 120))
            draw.text((x, y), t, font=mono, fill=NEON)
        x += tw


def scatter_positions(seed: str, n: int) -> list[tuple[int, int, int, int, float]]:
    """Deterministic pseudo-random positions avoiding center lockup band."""
    rnd = random.Random(int(hashlib.sha256(seed.encode()).hexdigest()[:8], 16))
    pts = []
    # Prefer edge bands
    bands = [
        (40, 200, 40, 200),      # TL
        (1000, 1160, 40, 200),   # TR
        (40, 220, 400, 580),     # BL
        (980, 1160, 400, 580),   # BR
        (250, 950, 30, 120),     # top mid edges
        (250, 950, 500, 600),    # bottom mid
        (30, 160, 220, 400),     # left mid
        (1040, 1170, 220, 400),  # right mid
    ]
    for i in range(n):
        bx0, bx1, by0, by1 = bands[i % len(bands)]
        x = rnd.randint(bx0, bx1)
        y = rnd.randint(by0, by1)
        # keep out of center text box
        if 280 < x < 920 and 200 < y < 430:
            y = rnd.choice([rnd.randint(40, 150), rnd.randint(480, 590)])
        size = rnd.randint(28, 54)
        rot = rnd.randint(-24, 24)
        op = rnd.uniform(0.55, 0.92)
        pts.append((x, y, size, rot, op))
    return pts


def make(key: str, route_title: str | None, subtitle: str, url: str, mark: Image.Image | None, icons: list[Image.Image], twemoji: list[Image.Image]):
    base = Image.new("RGBA", (W, H), (*BG, 255))
    draw = ImageDraw.Draw(base)

    # soft neon + gold washes
    wash = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    wd = ImageDraw.Draw(wash)
    wd.ellipse([W // 2 - 420, 80, W // 2 + 420, 480], fill=(*NEON, 22))
    wd.ellipse([W // 2 - 300, 220, W // 2 + 300, 520], fill=(*GOLD, 18))
    wash = wash.filter(ImageFilter.GaussianBlur(70))
    base = Image.alpha_composite(base, wash)

    # scatter emoji
    pool = twemoji + icons
    if not pool:
        pool = icons
    pts = scatter_positions(key + subtitle, 18)
    rnd = random.Random(key)
    for i, (x, y, size, rot, op) in enumerate(pts):
        icon = pool[i % len(pool)] if pool else None
        if icon is None:
            continue
        paste_rgba(base, icon, x, y, opacity=op, rotate=rot, size=size)

    # green $ mark stamps
    if mark:
        stamps = [
            (200, 55, 56, -25, 0.35),
            (980, 60, 52, 20, 0.32),
            (70, 220, 48, 15, 0.28),
            (1130, 220, 48, -18, 0.28),
            (240, 575, 50, 12, 0.3),
            (960, 565, 54, -15, 0.3),
            (600, 40, 40, 5, 0.22),
            (600, 590, 40, -5, 0.22),
            (150, 520, 36, 18, 0.25),
            (1050, 520, 36, -14, 0.25),
        ]
        for x, y, s, r, o in stamps:
            paste_rgba(base, mark, x, y, opacity=o, rotate=r, size=s)

    draw = ImageDraw.Draw(base)

    # optional Orbitron route badge above lockup
    orbit = load_font("Orbitron-Bold.ttf", 28)
    orbit_sm = load_font("Orbitron-Bold.ttf", 20)
    mono = load_font("Monoton-Regular.ttf", 118 if not route_title else 100)

    if route_title:
        bb = orbit.getbbox(route_title)
        tw = bb[2] - bb[0]
        # neon pill
        px = (W - tw) // 2 - 18
        py = 150
        draw.rounded_rectangle(
            [px, py, px + tw + 36, py + 40],
            radius=10,
            outline=NEON,
            width=2,
            fill=(18, 18, 26, 200),
        )
        draw.text((px + 18, py + 8), route_title, font=orbit, fill=NEON)
        lockup_y = 210
    else:
        lockup_y = 200

    draw_lockup(draw, mono, lockup_y)

    # Orbitron subtitle
    sub_font = load_font("Orbitron-Bold.ttf", 22 if len(subtitle) > 42 else 24)
    # wrap if needed
    sb = sub_font.getbbox(subtitle)
    sw = sb[2] - sb[0]
    sy = lockup_y + (150 if not route_title else 135)
    draw.text(((W - sw) // 2, sy), subtitle, font=sub_font, fill=MUTED)

    # Orbitron url
    ub = orbit_sm.getbbox(url.upper())
    uw = ub[2] - ub[0]
    draw.text(((W - uw) // 2, sy + 42), url.upper(), font=orbit_sm, fill=DIM)

    out = base.convert("RGB")
    path = OUT / f"{key}.png"
    out.save(path, "PNG", optimize=True)
    print(f"wrote {path.name} ({path.stat().st_size})")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    mark = None
    for p in [ROOT / "logo-mark.png", ROOT / "logo-mark-dark.png"]:
        if p.exists():
            mark = Image.open(p).convert("RGBA")
            break

    icons = load_local_icons()
    twemoji: list[Image.Image] = []
    print("fetching twemoji…")
    for cp in SCATTER_EMOJI:
        im = fetch_twemoji(cp)
        if im:
            twemoji.append(im)
    print(f"icons local={len(icons)} twemoji={len(twemoji)}")

    for key, title, sub, url in ROUTES:
        make(key, title, sub, url, mark, icons, twemoji)

    # canonical share cards = default scatter lockup
    shutil.copy(OUT / "default.png", ROOT / "og-share.png")
    shutil.copy(OUT / "default.png", ROOT / "og-image.png")
    # public aliases if present
    pub = ROOT.parent.parent / "public"
    for alias in ["og.png", "twitter-image.png"]:
        dest = pub / alias
        try:
            shutil.copy(OUT / "default.png", dest)
        except Exception:
            pass
    # app-dir static og if used
    app_og = ROOT.parent.parent / "src" / "app" / "opengraph-image.png"
    if app_og.parent.exists():
        try:
            shutil.copy(OUT / "default.png", app_og)
        except Exception:
            pass
    print("done", len(list(OUT.glob("*.png"))), "ogs + refreshed og-share")


if __name__ == "__main__":
    main()
