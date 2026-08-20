#!/usr/bin/env python3
"""
Play rules poster — SQUARE ONLY (1080×1080).

Layout is a fixed vertical grid with measured text (getbbox), not free-float.
Fonts: Monoton (display) · Orbitron (labels) · Inter (body).
Emoji: /public/brand/emoji only — no poop.
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
BRAND = ROOT / "public" / "brand"
EMOJI = BRAND / "emoji"
FONTS = BRAND / "fonts"
OUT = ROOT / "public" / "posters"
OUT.mkdir(parents=True, exist_ok=True)

# canvas
S = 1080
M = 72  # outer margin
GUTTER = 28

BG = (10, 10, 15)
CREAM = (255, 248, 231)
NEON = (57, 255, 20)
GOLD = (240, 192, 64)
MUTED = (160, 160, 168)
DIM = (90, 90, 98)
LINE = (40, 40, 52)
CARD_BG = (16, 16, 24)


def fnt(file: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONTS / file), size)


def tw(font: ImageFont.ImageFont, text: str) -> int:
    b = font.getbbox(text)
    return int(b[2] - b[0])


def th(font: ImageFont.ImageFont, text: str) -> int:
    b = font.getbbox(text)
    return int(b[3] - b[1])


def center_x(font: ImageFont.ImageFont, text: str, canvas=S) -> int:
    return (canvas - tw(font, text)) // 2


def draw_centered(
    draw: ImageDraw.ImageDraw,
    y: int,
    text: str,
    font: ImageFont.ImageFont,
    fill,
) -> int:
    """Draw text centered; return y just below baseline box."""
    x = center_x(font, text)
    # getbbox top can be negative for Monoton — use anchor mm-ish via top
    b = font.getbbox(text)
    draw.text((x - b[0], y - b[1]), text, font=font, fill=fill)
    return y + (b[3] - b[1])


def emoji(cp: str, size: int) -> Image.Image | None:
    p = EMOJI / f"tw-{cp}.png"
    if not p.exists():
        # named hi-res
        names = {
            "1f3af": "target-512.png",
            "1f480": "skull-512.png",
            "1f3c6": "trophy-512.png",
            "2728": "sparkles-512.png",
            "1f525": "fire-512.png",
            "1f49a": "tw-1f49a.png",
        }
        alt = EMOJI / names.get(cp, "")
        if not alt.exists():
            return None
        p = alt
    im = Image.open(p).convert("RGBA")
    return im.resize((size, size), Image.Resampling.LANCZOS)


def paste(base: Image.Image, im: Image.Image | None, cx: int, cy: int, op=1.0):
    if im is None:
        return
    if op < 1:
        a = im.split()[-1].point(lambda p: int(p * op))
        im = im.copy()
        im.putalpha(a)
    base.alpha_composite(im, (cx - im.width // 2, cy - im.height // 2))


def build() -> Image.Image:
    img = Image.new("RGBA", (S, S), (*BG, 255))

    # soft radial glows (subtle)
    glow = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([520, -180, 1180, 480], fill=(*NEON, 32))
    gd.ellipse([-200, 620, 420, 1200], fill=(*GOLD, 22))
    glow = glow.filter(ImageFilter.GaussianBlur(70))
    img = Image.alpha_composite(img, glow)

    # very light corner icons (don't fight the type)
    for cp, xy, op in [
        ("1f3af", (96, 120), 0.12),
        ("1f480", (984, 120), 0.12),
        ("1f3c6", (96, 990), 0.12),
        ("2728", (984, 990), 0.12),
    ]:
        paste(img, emoji(cp, 72), xy[0], xy[1], op)

    d = ImageDraw.Draw(img)

    # --- fonts (tuned for 1080) ---
    f_brand = fnt("Orbitron-Bold.ttf", 22)
    f_eye = fnt("Orbitron-Bold.ttf", 18)
    f_hero = fnt("Monoton-Regular.ttf", 120)
    f_sub = fnt("Orbitron-Bold.ttf", 36)
    f_pill = fnt("Orbitron-Bold.ttf", 20)
    f_card_h = fnt("Orbitron-Bold.ttf", 18)
    f_rule = fnt("Inter-Bold.ttf", 26)
    f_rule_sub = fnt("Inter-Regular.ttf", 20)
    f_cta = fnt("Orbitron-Bold.ttf", 24)
    f_foot = fnt("Inter-Regular.ttf", 18)

    y = M

    # brand lockup TOKEN $ HIT (Orbitron — legible)
    brand_l = "TOKEN"
    brand_m = "$"
    brand_r = "HIT"
    gap = 6
    total = tw(f_brand, brand_l) + gap + tw(f_brand, brand_m) + gap + tw(f_brand, brand_r)
    bx = (S - total) // 2
    b = f_brand.getbbox(brand_l)
    d.text((bx - b[0], y - b[1]), brand_l, font=f_brand, fill=CREAM)
    bx += tw(f_brand, brand_l) + gap
    b = f_brand.getbbox(brand_m)
    d.text((bx - b[0], y - b[1]), brand_m, font=f_brand, fill=NEON)
    bx += tw(f_brand, brand_m) + gap
    b = f_brand.getbbox(brand_r)
    d.text((bx - b[0], y - b[1]), brand_r, font=f_brand, fill=CREAM)
    y += th(f_brand, "TOKEN") + 20

    # short center divider (avoids corner icons)
    mid = S // 2
    d.line([(mid - 120, y), (mid + 120, y)], fill=LINE, width=2)
    y += 24

    # eyebrow
    eye = "PLAY RULES  |  HOUSE PRIZE"
    y = draw_centered(d, y, eye, f_eye, NEON) + 18

    # HERO — SH!T  cream display, tiny gold bang accent feel via cream only
    hero = "SH!T"
    hb = f_hero.getbbox(hero)
    hx = center_x(f_hero, hero) - hb[0]
    hy = y - hb[1]
    # one soft dark edge for legibility — no neon flood
    for dx, dy in ((-2, 2), (2, 2), (0, 3)):
        d.text((hx + dx, hy + dy), hero, font=f_hero, fill=(0, 0, 0, 120))
    d.text((hx, hy), hero, font=f_hero, fill=CREAM)
    y += (hb[3] - hb[1]) + 8

    # OF THE DAY
    y = draw_centered(d, y, "OF THE DAY", f_sub, GOLD) + 28

    # prize pill
    pill = "SPARK 3,750/HR  |  DAY CAP 90K"
    pw = tw(f_pill, pill) + 48
    ph = 52
    px = (S - pw) // 2
    d.rounded_rectangle([px, y, px + pw, y + ph], radius=26, fill=(14, 28, 14))
    d.rounded_rectangle([px, y, px + pw, y + ph], radius=26, outline=NEON, width=2)
    pb = f_pill.getbbox(pill)
    d.text(
        (px + (pw - tw(f_pill, pill)) // 2 - pb[0], y + (ph - th(f_pill, pill)) // 2 - pb[1]),
        pill,
        font=f_pill,
        fill=NEON,
    )
    y += ph + 32

    # --- rules card ---
    rules = [
        ("1,000 $TOKENSHIT", "One ticket into the bag"),
        ("Call UP or DOWN", "Best % wins HIT · worst wins SHIT"),
        ("House spark", "We seed the bag every hour"),
        ("75% to winners", "Split by tickets · 25% house"),
    ]

    inner_x = M + 8
    inner_w = S - 2 * (M + 8)
    row_h = 68
    card_pad_y = 22
    header_h = 36
    card_h = card_pad_y + header_h + 12 + row_h * len(rules) + 12

    # card background
    d.rounded_rectangle(
        [inner_x, y, inner_x + inner_w, y + card_h],
        radius=24,
        fill=CARD_BG,
    )
    d.rounded_rectangle(
        [inner_x, y, inner_x + inner_w, y + card_h],
        radius=24,
        outline=(57, 255, 20, 55),
        width=2,
    )

    cy = y + card_pad_y
    draw_centered(d, cy, "HOW THE BAG WORKS", f_card_h, MUTED)
    cy += header_h

    # hairline under header
    d.line([(inner_x + 28, cy), (inner_x + inner_w - 28, cy)], fill=LINE, width=1)
    cy += 14

    text_left = inner_x + 36
    for i, (title, sub) in enumerate(rules):
        ry = cy + i * row_h
        # neon bullet
        d.ellipse([text_left, ry + 10, text_left + 10, ry + 20], fill=NEON)
        tx = text_left + 28
        tb = f_rule.getbbox(title)
        d.text((tx - tb[0], ry - tb[1]), title, font=f_rule, fill=CREAM)
        sb = f_rule_sub.getbbox(sub)
        d.text(
            (tx - sb[0], ry + 30 - sb[1]),
            sub,
            font=f_rule_sub,
            fill=MUTED,
        )
        if i < len(rules) - 1:
            ly = ry + row_h - 8
            d.line(
                [(text_left + 28, ly), (inner_x + inner_w - 36, ly)],
                fill=LINE,
                width=1,
            )

    y += card_h + 28

    # CTA
    cta = "tokenshit.com/play"
    cw = tw(f_cta, cta) + 56
    ch = 56
    cx0 = (S - cw) // 2
    d.rounded_rectangle([cx0, y, cx0 + cw, y + ch], radius=16, fill=NEON)
    cb = f_cta.getbbox(cta)
    d.text(
        (
            cx0 + (cw - tw(f_cta, cta)) // 2 - cb[0],
            y + (ch - th(f_cta, cta)) // 2 - cb[1],
        ),
        cta,
        font=f_cta,
        fill=(8, 8, 10),
    )
    y += ch + 18

    # footer tagline — reserved bottom band
    foot = "Every token is SH!T until proven otherwise."
    # pin near bottom with safe margin
    foot_y = S - M - th(f_foot, foot)
    if y > foot_y - 8:
        foot_y = y + 8
    draw_centered(d, foot_y, foot, f_foot, DIM)

    return img.convert("RGB")


def main():
    im = build()
    paths = [
        OUT / "play-square.png",
        OUT / "play-1200.png",  # keep familiar name
        BRAND / "play-poster.png",
    ]
    for p in paths:
        im.save(p, "PNG", optimize=True)
        print("wrote", p, p.stat().st_size)

    # also 2x master
    im2 = im.resize((2160, 2160), Image.Resampling.LANCZOS)
    p2 = OUT / "play-square@2x.png"
    im2.save(p2, "PNG", optimize=True)
    print("wrote", p2, p2.stat().st_size)


if __name__ == "__main__":
    main()
