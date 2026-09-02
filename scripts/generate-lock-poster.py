#!/usr/bin/env python3
"""Square poster: 75,000,000 SH!T locked on Streamflow. Never mount on /play."""
from __future__ import annotations

import importlib.util
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
BRAND = ROOT / "public" / "brand"
OUT = ROOT / "public" / "posters"
OUT.mkdir(parents=True, exist_ok=True)

spec = importlib.util.spec_from_file_location(
    "play_poster", Path(__file__).parent / "generate-play-poster.py"
)
g = importlib.util.module_from_spec(spec)
assert spec.loader
spec.loader.exec_module(g)

AMT = "75,000,000"
ICONS = [
    "solana.png",
    "bitcoin.png",
    "ethereum.png",
    "sui.png",
    "dogecoin.png",
    "jupiter-exchange-solana.png",
]


def icon_row(img: Image.Image, y: int, size: int = 72) -> int:
    files = []
    for name in ICONS:
        p = BRAND / "token-icons" / name
        if p.exists():
            files.append(p)
    if not files:
        return y
    n = len(files)
    gap = 18
    total = n * size + (n - 1) * gap
    x0 = (g.S - total) // 2
    for i, p in enumerate(files):
        im = Image.open(p).convert("RGBA").resize((size, size), Image.Resampling.LANCZOS)
        # round-ish
        img.paste(im, (x0 + i * (size + gap), y), im)
    return y + size


def pill(
    d: ImageDraw.ImageDraw,
    y: int,
    text: str,
    font,
    fill,
    outline,
    fg,
) -> int:
    pw = g.tw(font, text) + 44
    ph = 48
    px = (g.S - pw) // 2
    d.rounded_rectangle([px, y, px + pw, y + ph], radius=24, fill=fill)
    d.rounded_rectangle([px, y, px + pw, y + ph], radius=24, outline=outline, width=2)
    pb = font.getbbox(text)
    d.text(
        (
            px + (pw - g.tw(font, text)) // 2 - pb[0],
            y + (ph - g.th(font, text)) // 2 - pb[1],
        ),
        text,
        font=font,
        fill=fg,
    )
    return y + ph


def build() -> Image.Image:
    S, M = g.S, g.M
    img = Image.new("RGBA", (S, S), (*g.BG, 255))
    glow = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([300, -160, 1280, 520], fill=(*g.GOLD, 32))
    gd.ellipse([-180, 520, 520, 1280], fill=(*g.NEON, 26))
    img = Image.alpha_composite(img, glow.filter(ImageFilter.GaussianBlur(72)))
    g.scatter_icons(img, __import__("random").Random(13))

    mark = g.load_logo_mark(88)
    g.paste(img, mark, 80, 80, 0.10)
    g.paste(img, mark, S - 80, 80, 0.10)

    d = ImageDraw.Draw(img)
    f_eye = g.fnt("Orbitron-Bold.ttf", 22)
    f_num = g.fnt("Orbitron-Bold.ttf", 86)
    f_hero = g.fnt("Monoton-Regular.ttf", 84)
    f_sub = g.fnt("Orbitron-Bold.ttf", 26)
    f_pill = g.fnt("Orbitron-Bold.ttf", 20)
    f_cta = g.fnt("Orbitron-Bold.ttf", 26)
    f_foot = g.fnt("Inter-Regular.ttf", 18)

    y = 56
    logo = g.load_logo_wide(max_w=560)
    g.paste(img, logo, S // 2, y + logo.height // 2)
    y += logo.height + 12
    mid = S // 2
    d.line([(mid - 110, y), (mid + 110, y)], fill=g.LINE, width=2)
    y += 20

    y = g.draw_centered(d, y, "LOCKED ON-CHAIN", f_eye, g.GOLD) + 14

    hb = f_num.getbbox(AMT)
    hx = g.center_x(f_num, AMT) - hb[0]
    hy = y - hb[1]
    for dx, dy in ((-2, 3), (2, 3), (0, 4)):
        d.text((hx + dx, hy + dy), AMT, font=f_num, fill=(0, 0, 0, 140))
    d.text((hx, hy), AMT, font=f_num, fill=g.NEON)
    y += (hb[3] - hb[1]) + 4

    y = g.draw_centered(d, y, "SH!T", f_hero, g.CREAM) + 6
    y = g.draw_centered(d, y, "TOKENSHIT", f_sub, g.GOLD) + 18

    y = pill(d, y, "75,000,000 SH!T LOCKED", f_pill, (28, 22, 8), g.GOLD, g.GOLD) + 14
    y = pill(d, y, "STREAMFLOW  |  ON-CHAIN", f_pill, (14, 28, 14), g.NEON, g.NEON) + 14
    y = pill(d, y, "CHECKABLE  |  IMMUTABLE", f_pill, (18, 18, 24), g.CREAM, g.CREAM) + 22

    y = icon_row(img, y, 70) + 22

    cta = "tokenshit.com"
    cw = g.tw(f_cta, cta) + 64
    ch = 56
    cx0 = (S - cw) // 2
    d.rounded_rectangle([cx0, y, cx0 + cw, y + ch], radius=16, fill=g.NEON)
    cb = f_cta.getbbox(cta)
    d.text(
        (
            cx0 + (cw - g.tw(f_cta, cta)) // 2 - cb[0],
            y + (ch - g.th(f_cta, cta)) // 2 - cb[1],
        ),
        cta,
        font=f_cta,
        fill=(8, 8, 10),
    )
    y += ch + 16
    g.draw_centered(
        d,
        min(y, S - M - g.th(f_foot, "x")),
        "Every token is SH!T until proven otherwise.",
        f_foot,
        g.DIM,
    )
    return img.convert("RGB")


def main() -> None:
    im = build()
    paths = (
        OUT / "lock-75m.png",
        OUT / "lock-75m-square.png",
        BRAND / "lock-75m-poster.png",
    )
    for p in paths:
        im.save(p, "PNG", optimize=True)
        print("wrote", p, p.stat().st_size)
    im2 = im.resize((2160, 2160), Image.Resampling.LANCZOS)
    p2 = BRAND / "lock-75m-poster@2x.png"
    im2.save(p2, "PNG", optimize=True)
    print("wrote", p2)


if __name__ == "__main__":
    main()
