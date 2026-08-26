#!/usr/bin/env python3
"""
TOKEN$HIT OG pack — flying-emoji scatter + big centered route titles.

- BG #0a0a0f · scatter emoji · $ mark stamps
- Cream TOKEN / neon $ / cream HIT (Monoton)
- Route hero: huge Monoton, true center (anchor mm)
- Orbitron subtitle + URL

Run: python3 scripts/generate-og-pack.py
"""
from __future__ import annotations

import hashlib
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

SCATTER_EMOJI = [
    "1f3af",
    "1f480",
    "1f49a",
    "1f680",
    "1f48e",
    "1f525",
    "26a1",
    "1f3c6",
    "1f7e9",
    "1f53b",
    "2728",
    "2620",
    "1f911",
    "1f4c9",
    "1fa99",
    "1f3b2",
    "1f4b8",
    "1f921",
    "1f4b0",
    "1f31f",
]

LOCAL_EMOJI = [
    ROOT / "emoji/target-512.png",
    ROOT / "emoji/skull-512.png",
    ROOT / "emoji/fire-512.png",
    ROOT / "emoji/sparkles-512.png",
    ROOT / "emoji/trophy-512.png",
]

ROUTES = [
    ("default", None, "Every token is shit until proven otherwise", "tokenshit.com"),
    ("home", None, "Play · Vote · Claim on Solana", "tokenshit.com"),
    ("claim", "CLAIM", "Grab free $TOKENSHIT rewards", "tokenshit.com/claim"),
    ("claims", "CLAIM", "Grab free $TOKENSHIT rewards", "tokenshit.com/claim"),
    ("memes", "MEMES", "Make shit memes. Share the bag.", "tokenshit.com/memes"),
    ("play", "PLAY FOR PRIZES", "FREE  |  1 UP + 1 DOWN  |  10,000 / HR", "tokenshit.com/play"),
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
    ("day", "PLAY FOR PRIZES", "FREE  |  1 UP + 1 DOWN  |  10,000 / HR", "tokenshit.com/play"),
    ("hour", "PLAY FOR PRIZES", "FREE  |  1 UP + 1 DOWN  |  10,000 / HR", "tokenshit.com/play"),
]

CACHE = Path("/tmp/tokenshit-twemoji")
CACHE.mkdir(parents=True, exist_ok=True)


def load_font(name: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(ROOT / "fonts" / name), size)


def text_w(font: ImageFont.FreeTypeFont, text: str) -> int:
    bb = font.getbbox(text)
    return int(bb[2] - bb[0])


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
    icons: list[Image.Image] = []
    for p in LOCAL_EMOJI:
        if p.exists():
            try:
                icons.append(Image.open(p).convert("RGBA"))
            except Exception:
                pass
    return icons


def paste_rgba(
    base: Image.Image,
    overlay: Image.Image,
    x: int,
    y: int,
    opacity: float = 1.0,
    rotate: int = 0,
    size: int | None = None,
) -> None:
    im = overlay.copy()
    if size:
        im = im.resize((size, size), Image.Resampling.LANCZOS)
    if rotate:
        im = im.rotate(rotate, expand=True, resample=Image.Resampling.BICUBIC)
    if opacity < 1:
        a = im.split()[-1].point(lambda p: int(p * opacity))
        im.putalpha(a)
    px = int(x - im.width / 2)
    py = int(y - im.height / 2)
    base.alpha_composite(im, (px, py))


def scatter_positions(seed: str, n: int) -> list[tuple[int, int, int, int, float]]:
    rnd = random.Random(int(hashlib.sha256(seed.encode()).hexdigest()[:8], 16))
    bands = [
        (50, 200, 40, 160),
        (1000, 1150, 40, 160),
        (50, 200, 450, 590),
        (1000, 1150, 450, 590),
        (220, 980, 30, 100),
        (220, 980, 530, 600),
        (40, 140, 200, 420),
        (1060, 1160, 200, 420),
    ]
    pts: list[tuple[int, int, int, int, float]] = []
    for i in range(n):
        bx0, bx1, by0, by1 = bands[i % len(bands)]
        x = rnd.randint(bx0, bx1)
        y = rnd.randint(by0, by1)
        # keep center clear for type
        if 240 < x < 960 and 160 < y < 480:
            y = rnd.choice([rnd.randint(35, 110), rnd.randint(520, 595)])
        size = rnd.randint(30, 56)
        rot = rnd.randint(-22, 22)
        op = rnd.uniform(0.55, 0.9)
        pts.append((x, y, size, rot, op))
    return pts


def draw_brand_lockup(
    draw: ImageDraw.ImageDraw,
    mono: ImageFont.FreeTypeFont,
    center_y: int,
) -> None:
    """Cream TOKEN + neon $ + cream HIT, true horizontal center via anchor=mm."""
    parts = [
        ("TOKEN", CREAM, GOLD),
        ("$", NEON, (30, 140, 40)),
        ("HIT", CREAM, GOLD),
    ]
    widths = [text_w(mono, t) for t, _, _ in parts]
    total = sum(widths)
    x = (W - total) // 2
    for (t, color, gcol), tw in zip(parts, widths):
        cx = x + tw // 2
        for dx, dy in [(-3, 0), (3, 0), (0, -3), (0, 3), (-2, -2), (2, 2)]:
            draw.text(
                (cx + dx, center_y + dy),
                t,
                font=mono,
                fill=gcol,
                anchor="mm",
            )
        draw.text((cx, center_y), t, font=mono, fill=color, anchor="mm")
        x += tw


def fit_monoton(text: str, start: int = 160, min_size: int = 80, max_w: int = 1080) -> ImageFont.FreeTypeFont:
    size = start
    while size >= min_size:
        f = load_font("Monoton-Regular.ttf", size)
        if text_w(f, text) <= max_w:
            return f
        size -= 4
    return load_font("Monoton-Regular.ttf", min_size)


def make(
    key: str,
    route_title: str | None,
    subtitle: str,
    url: str,
    icons: list[Image.Image],
    twemoji: list[Image.Image],
) -> None:
    base = Image.new("RGBA", (W, H), (*BG, 255))

    wash = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    wd = ImageDraw.Draw(wash)
    wd.ellipse([W // 2 - 420, 80, W // 2 + 420, 480], fill=(*NEON, 22))
    wd.ellipse([W // 2 - 300, 220, W // 2 + 300, 520], fill=(*GOLD, 18))
    wash = wash.filter(ImageFilter.GaussianBlur(70))
    base = Image.alpha_composite(base, wash)

    pool = twemoji + icons
    pts = scatter_positions(key + subtitle, 16)
    for i, (x, y, size, rot, op) in enumerate(pts):
        if not pool:
            break
        paste_rgba(base, pool[i % len(pool)], x, y, opacity=op, rotate=rot, size=size)

    draw = ImageDraw.Draw(base)

    # Neon Monoton $ stamps (no logo-mark asset — incorrect art removed)
    dollar = load_font("Monoton-Regular.ttf", 64)
    for x, y, s, r, o in [
        (160, 50, 56, -25, 0.35),
        (1040, 55, 52, 20, 0.32),
        (55, 200, 48, 15, 0.28),
        (1145, 200, 48, -18, 0.28),
        (200, 580, 50, 12, 0.3),
        (1000, 575, 54, -15, 0.3),
        (80, 520, 36, 18, 0.25),
        (1120, 520, 36, -14, 0.25),
    ]:
        # temp layer for rotated $
        layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ld = ImageDraw.Draw(layer)
        f = load_font("Monoton-Regular.ttf", s)
        ld.text((x, y), "$", font=f, fill=(*NEON, int(255 * o)), anchor="mm")
        layer = layer.rotate(r, center=(x, y), resample=Image.Resampling.BICUBIC)
        base = Image.alpha_composite(base, layer)

    draw = ImageDraw.Draw(base)
    orbit_md = load_font("Orbitron-Bold.ttf", 30)
    orbit_sm = load_font("Orbitron-Bold.ttf", 24)

    if route_title:
        draw_brand_lockup(draw, load_font("Monoton-Regular.ttf", 64), 100)
        hero = fit_monoton(route_title, start=168, min_size=96, max_w=1100)
        hero_cy = 300
        for dx, dy in [(-5, 0), (5, 0), (0, -5), (0, 5), (-3, -3), (3, 3)]:
            draw.text(
                (W // 2 + dx, hero_cy + dy),
                route_title,
                font=hero,
                fill=(18, 90, 22),
                anchor="mm",
            )
        draw.text(
            (W // 2, hero_cy),
            route_title,
            font=hero,
            fill=NEON,
            anchor="mm",
        )
        sub_cy = 430
        url_cy = 490
    else:
        draw_brand_lockup(draw, load_font("Monoton-Regular.ttf", 132), 275)
        sub_cy = 420
        url_cy = 485

    sub_font = orbit_md
    if text_w(sub_font, subtitle) > 1020:
        sub_font = orbit_sm
    if text_w(sub_font, subtitle) > 1020 and " · " in subtitle:
        a, b = subtitle.split(" · ", 1)
        draw.text((W // 2, sub_cy - 16), a, font=sub_font, fill=MUTED, anchor="mm")
        draw.text((W // 2, sub_cy + 18), b, font=sub_font, fill=MUTED, anchor="mm")
        url_cy = sub_cy + 62
    else:
        draw.text((W // 2, sub_cy), subtitle, font=sub_font, fill=MUTED, anchor="mm")

    draw.text(
        (W // 2, url_cy),
        url.upper(),
        font=orbit_sm,
        fill=DIM,
        anchor="mm",
    )

    out = base.convert("RGB")
    path = OUT / f"{key}.png"
    out.save(path, "PNG", optimize=True)
    print(f"wrote {path.name} ({path.stat().st_size}) hero={route_title or 'LOCKUP'}")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    icons = load_local_icons()
    twemoji: list[Image.Image] = []
    print("fetching twemoji…")
    for cp in SCATTER_EMOJI:
        im = fetch_twemoji(cp)
        if im is not None:
            twemoji.append(im)
    print(f"icons local={len(icons)} twemoji={len(twemoji)}")

    for key, title, sub, url in ROUTES:
        make(key, title, sub, url, icons, twemoji)

    shutil.copy(OUT / "default.png", ROOT / "og-share.png")
    shutil.copy(OUT / "default.png", ROOT / "og-image.png")
    pub = ROOT.parent
    for alias in ["og.png", "twitter-image.png"]:
        try:
            shutil.copy(OUT / "default.png", pub / alias)
        except Exception:
            pass
    app_og = ROOT.parent.parent / "src" / "app" / "opengraph-image.png"
    if app_og.parent.exists():
        try:
            shutil.copy(OUT / "default.png", app_og)
        except Exception:
            pass
    print("done", len(list(OUT.glob("*.png"))), "ogs")


if __name__ == "__main__":
    main()
