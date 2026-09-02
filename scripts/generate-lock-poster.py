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


def build() -> Image.Image:
    S, M = g.S, g.M
    img = Image.new("RGBA", (S, S), (*g.BG, 255))
    glow = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([380, -200, 1220, 480], fill=(*g.GOLD, 28))
    gd.ellipse([-220, 640, 400, 1280], fill=(*g.NEON, 22))
    img = Image.alpha_composite(img, glow.filter(ImageFilter.GaussianBlur(72)))
    g.scatter_icons(img, __import__("random").Random(13))

    mark = g.load_logo_mark(96)
    g.paste(img, mark, 88, 88, 0.10)
    g.paste(img, mark, S - 88, 88, 0.10)

    d = ImageDraw.Draw(img)
    f_eye = g.fnt("Orbitron-Bold.ttf", 22)
    f_num = g.fnt("Orbitron-Bold.ttf", 78)
    f_hero = g.fnt("Monoton-Regular.ttf", 88)
    f_sub = g.fnt("Orbitron-Bold.ttf", 28)
    f_pill = g.fnt("Orbitron-Bold.ttf", 18)
    f_cta = g.fnt("Orbitron-Bold.ttf", 24)
    f_foot = g.fnt("Inter-Regular.ttf", 18)

    y = M
    logo = g.load_logo_wide(max_w=620)
    g.paste(img, logo, S // 2, y + logo.height // 2)
    y += logo.height + 16
    mid = S // 2
    d.line([(mid - 100, y), (mid + 100, y)], fill=g.LINE, width=2)
    y += 26

    y = g.draw_centered(d, y, "LOCKED ON-CHAIN", f_eye, g.GOLD) + 18

    hb = f_num.getbbox(AMT)
    hx = g.center_x(f_num, AMT) - hb[0]
    hy = y - hb[1]
    for dx, dy in ((-2, 3), (2, 3), (0, 4)):
        d.text((hx + dx, hy + dy), AMT, font=f_num, fill=(0, 0, 0, 140))
    d.text((hx, hy), AMT, font=f_num, fill=g.NEON)
    y += (hb[3] - hb[1]) + 6

    y = g.draw_centered(d, y, "SH!T", f_hero, g.CREAM) + 8
    y = g.draw_centered(d, y, "TOKENSHIT  |  STREAMFLOW", f_sub, g.GOLD) + 24

    pill = "75,000,000 SH!T LOCKED"
    pw = g.tw(f_pill, pill) + 48
    ph = 50
    px = (S - pw) // 2
    d.rounded_rectangle([px, y, px + pw, y + ph], radius=25, fill=(28, 22, 8))
    d.rounded_rectangle(
        [px, y, px + pw, y + ph], radius=25, outline=g.GOLD, width=2
    )
    pb = f_pill.getbbox(pill)
    d.text(
        (
            px + (pw - g.tw(f_pill, pill)) // 2 - pb[0],
            y + (ph - g.th(f_pill, pill)) // 2 - pb[1],
        ),
        pill,
        font=f_pill,
        fill=g.GOLD,
    )
    y += ph + 22

    y = g.draw_centered(d, y, "ON-CHAIN  |  CHECKABLE", f_pill, g.MUTED)

    foot = "Every token is SH!T until proven otherwise."
    foot_h = g.th(f_foot, foot)
    foot_y = S - M - foot_h
    cta = "tokenshit.com"
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
