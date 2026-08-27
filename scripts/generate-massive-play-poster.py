#!/usr/bin/env python3
"""Square poster: massive tokens available to play. Never mount on /play."""
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

N = "30"


def build() -> Image.Image:
    S, M = g.S, g.M
    img = Image.new("RGBA", (S, S), (*g.BG, 255))
    glow = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([380, -200, 1220, 480], fill=(*g.NEON, 32))
    gd.ellipse([-220, 640, 460, 1280], fill=(*g.GOLD, 20))
    img = Image.alpha_composite(img, glow.filter(ImageFilter.GaussianBlur(72)))
    g.scatter_icons(img, __import__("random").Random(11))

    mark = g.load_logo_mark(96)
    g.paste(img, mark, 88, 88, 0.10)
    g.paste(img, mark, S - 88, 88, 0.10)

    d = ImageDraw.Draw(img)
    f_eye = g.fnt("Orbitron-Bold.ttf", 20)
    f_num = g.fnt("Orbitron-Bold.ttf", 120)
    f_hero = g.fnt("Monoton-Regular.ttf", 56)
    f_sub = g.fnt("Orbitron-Bold.ttf", 26)
    f_pill = g.fnt("Orbitron-Bold.ttf", 18)
    f_cta = g.fnt("Orbitron-Bold.ttf", 24)
    f_foot = g.fnt("Inter-Regular.ttf", 18)

    y = M
    logo = g.load_logo_wide(max_w=620)
    g.paste(img, logo, S // 2, y + logo.height // 2)
    y += logo.height + 16
    mid = S // 2
    d.line([(mid - 100, y), (mid + 100, y)], fill=g.LINE, width=2)
    y += 24

    y = g.draw_centered(d, y, "MASSIVE PLAY BOARD", f_eye, g.NEON) + 10

    hb = f_num.getbbox(N)
    hx = g.center_x(f_num, N) - hb[0]
    hy = y - hb[1]
    for dx, dy in ((-2, 4), (2, 4), (0, 5)):
        d.text((hx + dx, hy + dy), N, font=f_num, fill=(0, 0, 0, 140))
    d.text((hx, hy), N, font=f_num, fill=g.NEON)
    y += (hb[3] - hb[1]) + 4

    y = g.draw_centered(d, y, "TOKENS", f_hero, g.CREAM) + 6
    y = g.draw_centered(d, y, "TO PLAY", f_sub, g.CREAM) + 12
    y = g.draw_centered(d, y, "SOL  BTC  ETH  HYPE  SUI  ZORA", f_pill, g.GOLD) + 22

    pill = "MASSIVE AMOUNT OF TOKENS AVAILABLE"
    pw = g.tw(f_pill, pill) + 44
    ph = 48
    px = (S - pw) // 2
    d.rounded_rectangle([px, y, px + pw, y + ph], radius=24, fill=(14, 28, 14))
    d.rounded_rectangle(
        [px, y, px + pw, y + ph], radius=24, outline=g.NEON, width=2
    )
    pb = f_pill.getbbox(pill)
    d.text(
        (
            px + (pw - g.tw(f_pill, pill)) // 2 - pb[0],
            y + (ph - g.th(f_pill, pill)) // 2 - pb[1],
        ),
        pill,
        font=f_pill,
        fill=g.NEON,
    )
    y += ph + 22

    y = g.draw_centered(d, y, "PLAY FOR PRIZES", f_sub, g.CREAM) + 8
    y = g.draw_centered(
        d, y, "FREE  |  1 UP + 1 DOWN  |  TOP 3 WIN", f_pill, g.MUTED
    )

    foot = "Every token is SH!T until proven otherwise."
    foot_h = g.th(f_foot, foot)
    foot_y = S - M - foot_h
    cta = "tokenshit.com/play"
    cw = g.tw(f_cta, cta) + 56
    ch = 52
    mark_sm = g.load_logo_mark(40)
    block_h = 40 + 10 + ch
    block_top = foot_y - 18 - block_h
    if block_top < y + 12:
        block_top = y + 12
    g.paste(img, mark_sm, S // 2, block_top + 20)
    by = block_top + 48
    cx0 = (S - cw) // 2
    d.rounded_rectangle([cx0, by, cx0 + cw, by + ch], radius=16, fill=g.NEON)
    cb = f_cta.getbbox(cta)
    d.text(
        (
            cx0 + (cw - g.tw(f_cta, cta)) // 2 - cb[0],
            by + (ch - g.th(f_cta, cta)) // 2 - cb[1],
        ),
        cta,
        font=f_cta,
        fill=(8, 8, 10),
    )
    g.draw_centered(d, foot_y, foot, f_foot, g.DIM)
    return img.convert("RGB")


def main() -> None:
    im = build()
    paths = (
        OUT / "massive-play.png",
        OUT / "massive-play-square.png",
        BRAND / "massive-play-poster.png",
    )
    for p in paths:
        im.save(p, "PNG", optimize=True)
        print("wrote", p, p.stat().st_size)
    im2 = im.resize((2160, 2160), Image.Resampling.LANCZOS)
    p2 = BRAND / "massive-play-poster@2x.png"
    im2.save(p2, "PNG", optimize=True)
    print("wrote", p2)


if __name__ == "__main__":
    main()
