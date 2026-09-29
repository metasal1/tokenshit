#!/usr/bin/env python3
"""Square posters: TOKENSHIT member chat + sticker pack. Never mount on /play."""
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


def pill(d, y, text, font, fill, outline, fg) -> int:
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


def icon_row(img: Image.Image, y: int, size: int = 68) -> int:
    names = [
        "solana.png",
        "bitcoin.png",
        "ethereum.png",
        "jupiter-exchange-solana.png",
        "dogecoin.png",
        "sui.png",
    ]
    files = [BRAND / "token-icons" / n for n in names if (BRAND / "token-icons" / n).exists()]
    if not files:
        return y
    n = len(files)
    gap = 16
    total = n * size + (n - 1) * gap
    x0 = (g.S - total) // 2
    for i, p in enumerate(files):
        im = Image.open(p).convert("RGBA").resize((size, size), Image.Resampling.LANCZOS)
        img.paste(im, (x0 + i * (size + gap), y), im)
    return y + size


def build(kind: str) -> Image.Image:
    S, M = g.S, g.M
    img = Image.new("RGBA", (S, S), (*g.BG, 255))
    glow = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    if kind == "chat":
        gd.ellipse([280, -180, 1260, 500], fill=(*g.NEON, 28))
        gd.ellipse([-200, 560, 500, 1320], fill=(*g.GOLD, 30))
        seed = 21
        eye = "MEMBER CHAT"
        hero = "JOIN"
        sub = "TOKENSHIT"
        p1, p2, p3 = "TELEGRAM", "HOLDERS  |  BUILDERS", "ALPHA IN THE ROOM"
        cta = "tokenshit.com/chat"
    else:
        gd.ellipse([280, -180, 1260, 500], fill=(*g.GOLD, 30))
        gd.ellipse([-200, 560, 500, 1320], fill=(*g.NEON, 26))
        seed = 22
        eye = "STICKER PACK"
        hero = "ADD"
        sub = "STICKERS"
        p1, p2, p3 = "TOKENSHIT PACK", "ADDSTICKERS", "TOKENSHIT_by_Metasal"
        cta = "tokenshit.com/stickers"
    img = Image.alpha_composite(img, glow.filter(ImageFilter.GaussianBlur(72)))
    g.scatter_icons(img, __import__("random").Random(seed))

    mark = g.load_logo_mark(88)
    g.paste(img, mark, 80, 80, 0.10)
    g.paste(img, mark, S - 80, 80, 0.10)

    d = ImageDraw.Draw(img)
    f_eye = g.fnt("Orbitron-Bold.ttf", 22)
    f_hero = g.fnt("Monoton-Regular.ttf", 92)
    f_sub = g.fnt("Monoton-Regular.ttf", 72)
    f_pill = g.fnt("Orbitron-Bold.ttf", 20)
    f_cta = g.fnt("Orbitron-Bold.ttf", 24)
    f_foot = g.fnt("Inter-Regular.ttf", 18)

    y = 56
    logo = g.load_logo_wide(max_w=560)
    g.paste(img, logo, S // 2, y + logo.height // 2)
    y += logo.height + 12
    mid = S // 2
    d.line([(mid - 110, y), (mid + 110, y)], fill=g.LINE, width=2)
    y += 20

    y = g.draw_centered(d, y, eye, f_eye, g.GOLD) + 10
    y = g.draw_centered(d, y, hero, f_hero, g.CREAM) + 2
    y = g.draw_centered(d, y, sub, f_sub, g.NEON) + 16

    y = pill(d, y, p1, f_pill, (14, 28, 14), g.NEON, g.NEON) + 12
    y = pill(d, y, p2, f_pill, (28, 22, 8), g.GOLD, g.GOLD) + 12
    y = pill(d, y, p3, f_pill, (18, 18, 24), g.CREAM, g.CREAM) + 20

    y = icon_row(img, y, 68) + 22

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


def save(kind: str) -> None:
    im = build(kind)
    paths = (
        OUT / f"{kind}.png",
        OUT / f"{kind}-square.png",
        BRAND / f"{kind}-poster.png",
    )
    for p in paths:
        im.save(p, "PNG", optimize=True)
        print("wrote", p, p.stat().st_size)
    im2 = im.resize((2160, 2160), Image.Resampling.LANCZOS)
    p2 = BRAND / f"{kind}-poster@2x.png"
    im2.save(p2, "PNG", optimize=True)
    print("wrote", p2)


def main() -> None:
    save("chat")
    save("stickers")


if __name__ == "__main__":
    main()
