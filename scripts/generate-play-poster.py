#!/usr/bin/env python3
"""
Play rules poster — SQUARE 1080 only.
Uses brand logos from /public/brand (wide wordmark + square mark).
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
BRAND = ROOT / "public" / "brand"
FONTS = BRAND / "fonts"
OUT = ROOT / "public" / "posters"
OUT.mkdir(parents=True, exist_ok=True)

S = 1080
M = 72

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


def center_x(font: ImageFont.ImageFont, text: str) -> int:
    return (S - tw(font, text)) // 2


def draw_centered(draw, y, text, font, fill) -> int:
    b = font.getbbox(text)
    x = center_x(font, text) - b[0]
    draw.text((x, y - b[1]), text, font=font, fill=fill)
    return y + (b[3] - b[1])


def load_logo_wide(max_w: int) -> Image.Image:
    # Transparent wordmark only — logo-wide has baked #0a0a0f bars
    for name in ("logo-transparent.png", "logo-wide.png", "logo.png"):
        path = BRAND / name
        if path.exists():
            im = Image.open(path).convert("RGBA")
            break
    else:
        raise FileNotFoundError("brand logo missing")
    # Drop near-bg opaque pixels so baked dark bars vanish
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a > 200 and r < 20 and g < 20 and b < 25:
                px[x, y] = (0, 0, 0, 0)
    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)
    ratio = max_w / im.width
    nh = max(1, int(im.height * ratio))
    return im.resize((max_w, nh), Image.Resampling.LANCZOS)


def load_logo_mark(size: int) -> Image.Image:
    for name in (
        "logo-square-transparent.png",
        "icon-512.png",
        "tokenshit-clear.png",
        "logo-square.png",
    ):
        p = BRAND / name
        if p.exists():
            im = Image.open(p).convert("RGBA")
            break
    else:
        raise FileNotFoundError("brand square logo missing")
    px = im.load()
    w, h = im.size
    for yy in range(h):
        for xx in range(w):
            r, g, b, a = px[xx, yy]
            if a > 200 and r < 20 and g < 20 and b < 25:
                px[xx, yy] = (0, 0, 0, 0)
    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)
    # fit into size box keeping aspect
    r = min(size / im.width, size / im.height)
    nw, nh = max(1, int(im.width * r)), max(1, int(im.height * r))
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.alpha_composite(im, ((size - nw) // 2, (size - nh) // 2))
    return canvas


def paste(base: Image.Image, im: Image.Image, cx: int, cy: int, opacity=1.0):
    if opacity < 1:
        a = im.split()[-1].point(lambda p: int(p * opacity))
        im = im.copy()
        im.putalpha(a)
    base.alpha_composite(im, (int(cx - im.width / 2), int(cy - im.height / 2)))


def build() -> Image.Image:
    img = Image.new("RGBA", (S, S), (*BG, 255))

    # atmosphere
    glow = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([480, -200, 1200, 420], fill=(*NEON, 28))
    gd.ellipse([-220, 640, 400, 1220], fill=(*GOLD, 20))
    img = Image.alpha_composite(img, glow.filter(ImageFilter.GaussianBlur(72)))

    # faint brand marks — top only
    mark = load_logo_mark(96)
    paste(img, mark, 88, 88, 0.10)
    paste(img, mark, S - 88, 88, 0.10)

    d = ImageDraw.Draw(img)

    f_eye = fnt("Orbitron-Bold.ttf", 18)
    f_hero = fnt("Monoton-Regular.ttf", 112)
    f_sub = fnt("Orbitron-Bold.ttf", 34)
    f_pill = fnt("Orbitron-Bold.ttf", 20)
    f_card_h = fnt("Orbitron-Bold.ttf", 18)
    f_rule = fnt("Inter-Bold.ttf", 26)
    f_rule_sub = fnt("Inter-Regular.ttf", 20)
    f_cta = fnt("Orbitron-Bold.ttf", 24)
    f_foot = fnt("Inter-Regular.ttf", 18)

    y = M

    # === BRAND WIDE LOGO (hero identity) ===
    logo = load_logo_wide(max_w=640)
    paste(img, logo, S // 2, y + logo.height // 2)
    y += logo.height + 14

    # short rule under logo
    mid = S // 2
    d.line([(mid - 100, y), (mid + 100, y)], fill=LINE, width=2)
    y += 22

    y = draw_centered(d, y, "PLAY RULES  |  FREE HOUR", f_eye, NEON) + 16

    # product line
    hero = "SH!T"
    hb = f_hero.getbbox(hero)
    hx = center_x(f_hero, hero) - hb[0]
    hy = y - hb[1]
    for dx, dy in ((-2, 2), (2, 2), (0, 3)):
        d.text((hx + dx, hy + dy), hero, font=f_hero, fill=(0, 0, 0, 130))
    d.text((hx, hy), hero, font=f_hero, fill=CREAM)
    y += (hb[3] - hb[1]) + 6

    y = draw_centered(d, y, "OF THE HOUR", f_sub, GOLD) + 24

    # prize pill
    pill = "FREE PLAY  |  10,000 / HR  |  JACKPOT ROLLS"
    pw = tw(f_pill, pill) + 48
    ph = 50
    px = (S - pw) // 2
    d.rounded_rectangle([px, y, px + pw, y + ph], radius=25, fill=(14, 28, 14))
    d.rounded_rectangle([px, y, px + pw, y + ph], radius=25, outline=NEON, width=2)
    pb = f_pill.getbbox(pill)
    d.text(
        (
            px + (pw - tw(f_pill, pill)) // 2 - pb[0],
            y + (ph - th(f_pill, pill)) // 2 - pb[1],
        ),
        pill,
        font=f_pill,
        fill=NEON,
    )
    y += ph + 26

    # rules card
    rules = [
        ("FREE to play", "No stake  |  lock up to 5 bags at once"),
        ("Hold 10,000 $TOKENSHIT", "Keep your claims  |  don't dump"),
        ("Follow @Tokenshit_", "Required before you Play"),
        ("Call UP or DOWN", "Best % = HIT  |  worst % = SHIT"),
        ("10,000 prize / hour", "Winners split  |  no winners = jackpot rolls"),
    ]

    inner_x = M + 4
    inner_w = S - 2 * (M + 4)
    row_h = 56
    card_pad_y = 18
    header_h = 30
    card_h = card_pad_y + header_h + 10 + row_h * len(rules) + 10

    d.rounded_rectangle(
        [inner_x, y, inner_x + inner_w, y + card_h], radius=24, fill=CARD_BG
    )
    d.rounded_rectangle(
        [inner_x, y, inner_x + inner_w, y + card_h],
        radius=24,
        outline=(57, 255, 20, 50),
        width=2,
    )

    cy = y + card_pad_y
    draw_centered(d, cy, "HOW FREE PLAY WORKS", f_card_h, MUTED)
    cy += header_h
    d.line([(inner_x + 28, cy), (inner_x + inner_w - 28, cy)], fill=LINE, width=1)
    cy += 10

    text_left = inner_x + 32
    for i, (title, sub) in enumerate(rules):
        ry = cy + i * row_h
        d.ellipse([text_left, ry + 6, text_left + 10, ry + 16], fill=NEON)
        tx = text_left + 26
        tb = f_rule.getbbox(title)
        d.text((tx - tb[0], ry - tb[1]), title, font=f_rule, fill=CREAM)
        sb = f_rule_sub.getbbox(sub)
        d.text((tx - sb[0], ry + 26 - sb[1]), sub, font=f_rule_sub, fill=MUTED)
        if i < len(rules) - 1:
            ly = ry + row_h - 6
            d.line([(tx, ly), (inner_x + inner_w - 36, ly)], fill=LINE, width=1)

    y += card_h + 18

    foot = "Every token is SH!T until proven otherwise."
    foot_h = th(f_foot, foot)
    foot_y = S - M - foot_h

    # CTA block sits above footer with clear gap
    cta = "tokenshit.com/play"
    cw = tw(f_cta, cta) + 56
    ch = 52
    mark_sm = load_logo_mark(40)
    block_h = 40 + 10 + ch  # mark + gap + button
    block_top = foot_y - 18 - block_h
    if block_top < y:
        block_top = y

    paste(img, mark_sm, S // 2, block_top + 20)
    by = block_top + 40 + 8
    cx0 = (S - cw) // 2
    d.rounded_rectangle([cx0, by, cx0 + cw, by + ch], radius=16, fill=NEON)
    cb = f_cta.getbbox(cta)
    d.text(
        (
            cx0 + (cw - tw(f_cta, cta)) // 2 - cb[0],
            by + (ch - th(f_cta, cta)) // 2 - cb[1],
        ),
        cta,
        font=f_cta,
        fill=(8, 8, 10),
    )
    draw_centered(d, foot_y, foot, f_foot, DIM)

    return img.convert("RGB")


def main():
    im = build()
    for p in (
        OUT / "play-square.png",
        OUT / "play-1200.png",
        OUT / "play-poster.png",
        BRAND / "play-poster.png",
    ):
        im.save(p, "PNG", optimize=True)
        print("wrote", p, p.stat().st_size)
    im2 = im.resize((2160, 2160), Image.Resampling.LANCZOS)
    p2 = OUT / "play-square@2x.png"
    im2.save(p2, "PNG", optimize=True)
    print("wrote", p2)
    # also brand 2x
    p3 = BRAND / "play-poster@2x.png"
    im2.save(p3, "PNG", optimize=True)
    print("wrote", p3)


if __name__ == "__main__":
    main()