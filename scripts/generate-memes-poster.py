#!/usr/bin/env python3
"""Square poster: WELCOME TO THE TOKENSHIT MEME STUDIO. Never mount on /play."""
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

ICONS = [
    "solana.png",
    "bitcoin.png",
    "ethereum.png",
    "sui.png",
    "dogecoin.png",
    "jupiter-exchange-solana.png",
]


def icon_row(img: Image.Image, y: int, size: int = 68) -> int:
    files = []
    for name in ICONS:
        p = BRAND / "token-icons" / name
        if p.exists():
            files.append(p)
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


def pill(d: ImageDraw.ImageDraw, y: int, text: str, font, fill, outline, fg) -> int:
    pw = g.tw(font, text) + 44
    ph = 50
    px = (g.S - pw) // 2
    d.rounded_rectangle([px, y, px + pw, y + ph], radius=25, fill=fill)
    d.rounded_rectangle([px, y, px + pw, y + ph], radius=25, outline=outline, width=2)
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


def shadow_line(d, y, text, font, fill) -> int:
    hb = font.getbbox(text)
    hx = g.center_x(font, text) - hb[0]
    hy = y - hb[1]
    for dx, dy in ((-2, 2), (2, 2), (0, 3)):
        d.text((hx + dx, hy + dy), text, font=font, fill=(0, 0, 0, 130))
    d.text((hx, hy), text, font=font, fill=fill)
    return y + (hb[3] - hb[1])


def scatter_edges(img: Image.Image) -> None:
    rng = __import__("random").Random(21)
    spots = [
        (70, 210),
        (1010, 210),
        (60, 430),
        (1020, 430),
        (80, 640),
        (1000, 640),
        (140, 980),
        (940, 980),
        (200, 130),
        (880, 130),
    ]
    icons = []
    for cg, _sym in g.TOKEN_ICONS:
        im = g.load_token_icon(cg)
        if im is not None:
            icons.append(im)
    emojis = []
    for cp in g.SCATTER_EMOJI:
        em = g.load_emoji(cp)
        if em is not None:
            emojis.append(em)
    i = 0
    for im in icons[:8]:
        if i >= len(spots):
            break
        x, y = spots[i]
        i += 1
        g.paste_rgba(img, im, x, y, size=rng.randint(48, 64), opacity=0.88, rotate=rng.randint(-16, 16))
    for em in emojis[:6]:
        if i >= len(spots):
            break
        x, y = spots[i]
        i += 1
        g.paste_rgba(img, em, x, y, size=rng.randint(32, 44), opacity=0.5, rotate=rng.randint(-20, 20))


def build() -> Image.Image:
    S, M = g.S, 56
    img = Image.new("RGBA", (S, S), (*g.BG, 255))
    glow = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([260, -180, 1240, 480], fill=(*g.NEON, 30))
    gd.ellipse([-200, 560, 480, 1280], fill=(*g.GOLD, 22))
    img = Image.alpha_composite(img, glow.filter(ImageFilter.GaussianBlur(72)))
    scatter_edges(img)

    mark = g.load_logo_mark(88)
    g.paste(img, mark, 80, 80, 0.10)
    g.paste(img, mark, S - 80, 80, 0.10)

    d = ImageDraw.Draw(img)
    f_welcome = g.fnt("Orbitron-Bold.ttf", 26)
    f_hero = g.fnt("Monoton-Regular.ttf", 72)
    f_sub = g.fnt("Monoton-Regular.ttf", 54)
    f_pill = g.fnt("Orbitron-Bold.ttf", 20)
    f_cta = g.fnt("Orbitron-Bold.ttf", 24)
    f_foot = g.fnt("Inter-Regular.ttf", 18)

    y = 48
    logo = g.load_logo_wide(max_w=540)
    g.paste(img, logo, S // 2, y + logo.height // 2)
    y += logo.height + 10
    mid = S // 2
    d.line([(mid - 110, y), (mid + 110, y)], fill=g.LINE, width=2)
    y += 16

    y = g.draw_centered(d, y, "WELCOME TO THE", f_welcome, g.GOLD) + 6
    y = shadow_line(d, y, "TOKENSHIT", f_hero, g.NEON) + 2
    y = shadow_line(d, y, "MEME STUDIO", f_sub, g.CREAM) + 18

    y = pill(d, y, "PASTE  |  CMD+V  |  UPLOAD", f_pill, (14, 28, 14), g.NEON, g.NEON) + 14
    y = pill(d, y, "FACE PACKS  |  TOLY ELON TRUMP", f_pill, (28, 22, 8), g.GOLD, g.GOLD) + 14
    y = pill(d, y, "COPY IMAGE ONLY", f_pill, (18, 18, 24), g.CREAM, g.CREAM) + 18

    y = icon_row(img, y, 72) + 18
    y = pill(d, y, "DEEPLINK A FACE OR A MEME", f_pill, (14, 28, 14), g.NEON, g.NEON) + 22

    cta = "tokenshit.com/memes"
    cw = g.tw(f_cta, cta) + 56
    ch = 54
    mark_sm = g.load_logo_mark(36)
    g.paste(img, mark_sm, S // 2, y + 18)
    y += 36
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
    foot = "Every token is SH!T until proven otherwise."
    g.draw_centered(d, min(y, S - M - g.th(f_foot, foot)), foot, f_foot, g.DIM)
    return img.convert("RGB")


def main() -> None:
    im = build()
    paths = (
        OUT / "memes-studio.png",
        OUT / "memes-studio-square.png",
        BRAND / "memes-poster.png",
    )
    for p in paths:
        im.save(p, "PNG", optimize=True)
        print("wrote", p, p.stat().st_size)
    im2 = im.resize((2160, 2160), Image.Resampling.LANCZOS)
    p2 = BRAND / "memes-poster@2x.png"
    im2.save(p2, "PNG", optimize=True)
    print("wrote", p2)


if __name__ == "__main__":
    main()
