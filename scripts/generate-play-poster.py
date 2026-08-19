#!/usr/bin/env python3
"""Play rules + prize posters — house spark bag, SH!T OF THE DAY."""
from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
BRAND = ROOT / "public" / "brand"
EMOJI = BRAND / "emoji"
FONTS = BRAND / "fonts"
OUT = ROOT / "public" / "posters"
OUT.mkdir(parents=True, exist_ok=True)

BG = (10, 10, 15)
CREAM = (255, 248, 231)
NEON = (57, 255, 20)
GOLD = (240, 192, 64)
RED = (255, 80, 100)
GREEN = (80, 230, 120)
MUTED = (161, 161, 170)
DIM = (82, 82, 91)
CARD = (18, 18, 28, 230)


def font(name: str, size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    p = FONTS / name
    try:
        return ImageFont.truetype(str(p), size)
    except Exception:
        return ImageFont.load_default()


def load_emoji(stem: str, size: int) -> Image.Image | None:
    for base in (EMOJI, BRAND):
        for name in (f"{stem}-512.png", f"{stem}.png", f"tw-{stem}.png"):
            p = base / name
            if p.exists():
                im = Image.open(p).convert("RGBA")
                im = im.resize((size, size), Image.Resampling.LANCZOS)
                return im
    # tw codepoints
    aliases = {
        "skull": "tw-1f480.png",
        "trophy": "tw-1f3c6.png",
        "target": "tw-1f3af.png",
        "sparkles": "tw-1f31f.png",
        "fire": "fire-512.png",
        "gem": "tw-1f48e.png",
        "crown": "tw-1f451.png",
        "heart": "tw-1f49a.png",
    }
    fn = aliases.get(stem)
    if fn and (EMOJI / fn).exists():
        im = Image.open(EMOJI / fn).convert("RGBA")
        return im.resize((size, size), Image.Resampling.LANCZOS)
    if fn and (BRAND / fn).exists():
        im = Image.open(BRAND / fn).convert("RGBA")
        return im.resize((size, size), Image.Resampling.LANCZOS)
    return None


def paste(base: Image.Image, im: Image.Image | None, xy: tuple[int, int], opacity=1.0):
    if im is None:
        return
    if opacity < 1:
        a = im.split()[-1].point(lambda p: int(p * opacity))
        im = im.copy()
        im.putalpha(a)
    base.alpha_composite(im, xy)


def glow_text(draw, xy, text, font_, fill, glow_color, r=10):
    x, y = xy
    for i in range(r, 0, -2):
        alpha = int(40 * (i / r))
        # approximate glow via offset strokes
        for dx, dy in ((-i, 0), (i, 0), (0, -i), (0, i), (-i // 2, -i // 2), (i // 2, i // 2)):
            draw.text((x + dx, y + dy), text, font=font_, fill=(*glow_color, alpha) if len(glow_color) == 3 else glow_color)
    draw.text((x, y), text, font=font_, fill=fill)


def rounded_rect(draw, box, radius, fill):
    draw.rounded_rectangle(box, radius=radius, fill=fill)


def make_poster(w: int, h: int, tag: str) -> Image.Image:
    rng = random.Random(42 + w + h)
    img = Image.new("RGBA", (w, h), (*BG, 255))
    # atmosphere
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.ellipse([int(w * 0.45), -int(h * 0.25), int(w * 1.15), int(h * 0.45)], fill=(*NEON, 38))
    od.ellipse([-int(w * 0.2), int(h * 0.55), int(w * 0.45), int(h * 1.15)], fill=(*GOLD, 28))
    od.ellipse([int(w * 0.2), int(h * 0.25), int(w * 0.75), int(h * 0.7)], fill=(*RED, 12))
    overlay = overlay.filter(ImageFilter.GaussianBlur(max(40, w // 18)))
    img = Image.alpha_composite(img, overlay)

    # vignette
    vig = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    vd = ImageDraw.Draw(vig)
    for i in range(40):
        a = int(8 * (i / 40))
        vd.rectangle([i, i, w - 1 - i, h - 1 - i], outline=(0, 0, 0, a))
    img = Image.alpha_composite(img, vig)

    # scatter icons outside center
    icons = []
    for stem, sz in [
        ("target", int(w * 0.07)),
        ("skull", int(w * 0.065)),
        ("trophy", int(w * 0.07)),
        ("sparkles", int(w * 0.055)),
        ("fire", int(w * 0.06)),
        ("gem", int(w * 0.055)),
        ("crown", int(w * 0.06)),
        ("heart", int(w * 0.05)),
    ]:
        im = load_emoji(stem, sz)
        if im:
            icons.append(im)
    for im in icons:
        for _ in range(2):
            x = rng.randint(int(w * 0.02), int(w * 0.88))
            y = rng.randint(int(h * 0.02), int(h * 0.92))
            # keep center card clear
            cx, cy = w / 2, h / 2
            if abs(x - cx) < w * 0.28 and abs(y - cy) < h * 0.32:
                continue
            paste(img, im, (x, y), opacity=rng.uniform(0.12, 0.28))

    d = ImageDraw.Draw(img)
    pad = int(w * 0.07)
    y = int(h * 0.06)

    f_brand = font("Monoton-Regular.ttf", max(28, int(w * 0.055)))
    f_eye = font("Orbitron-Bold.ttf", max(14, int(w * 0.028)))
    f_hero = font("Monoton-Regular.ttf", max(48, int(w * 0.11)))
    f_sub = font("Monoton-Regular.ttf", max(32, int(w * 0.07)))
    f_body = font("Orbitron-Bold.ttf", max(15, int(w * 0.032)))
    f_small = font("Orbitron-Bold.ttf", max(12, int(w * 0.026)))
    f_rule = font("Inter-Bold.ttf", max(16, int(w * 0.034)))
    f_rule_sm = font("Inter-Regular.ttf", max(14, int(w * 0.03)))

    # brand
    bx = pad
    d.text((bx, y), "TOKEN", font=f_brand, fill=CREAM)
    bb = d.textbbox((bx, y), "TOKEN", font=f_brand)
    d.text((bb[2] + 4, y), "$", font=f_brand, fill=NEON)
    bb2 = d.textbbox((bb[2] + 4, y), "$", font=f_brand)
    d.text((bb2[2] + 4, y), "HIT", font=f_brand, fill=CREAM)
    y = bb[3] + int(h * 0.025)

    # eyebrow
    eye = "NEW RULES  ·  HOUSE SPARK  ·  REAL PRIZE"
    eb = d.textbbox((0, 0), eye, font=f_eye)
    d.text(((w - (eb[2] - eb[0])) // 2, y), eye, font=f_eye, fill=NEON)
    y += (eb[3] - eb[1]) + int(h * 0.02)

    # hero SH!T
    hero = "SH!T"
    hb = d.textbbox((0, 0), hero, font=f_hero)
    hx = (w - (hb[2] - hb[0])) // 2
    # glow layers
    for r in range(14, 0, -2):
        for ang in range(0, 360, 45):
            dx = int(r * 0.35 * math.cos(math.radians(ang)))
            dy = int(r * 0.35 * math.sin(math.radians(ang)))
            d.text((hx + dx, y + dy), hero, font=f_hero, fill=(*NEON, 18))
    d.text((hx, y), hero, font=f_hero, fill=CREAM)
    y += (hb[3] - hb[1]) - int(h * 0.01)

    of_day = "OF THE DAY"
    ob = d.textbbox((0, 0), of_day, font=f_sub)
    d.text(((w - (ob[2] - ob[0])) // 2, y), of_day, font=f_sub, fill=GOLD)
    y += (ob[3] - ob[1]) + int(h * 0.03)

    # prize pill
    pill = "HOUSE SPARK  3,750 / HR   ·   CAP  90K / DAY"
    pb = d.textbbox((0, 0), pill, font=f_small)
    pw, ph = pb[2] - pb[0] + 36, pb[3] - pb[1] + 22
    px = (w - pw) // 2
    rounded_rect(d, [px, y, px + pw, y + ph], radius=ph // 2, fill=(20, 40, 18, 240))
    d.rounded_rectangle([px, y, px + pw, y + ph], radius=ph // 2, outline=(*NEON, 200), width=2)
    d.text((px + 18, y + 10), pill, font=f_small, fill=NEON)
    y += ph + int(h * 0.035)

    # rules card
    card_m = pad - 4
    rules = [
        ("1,000 $TOKENSHIT", "one ticket · play the bag"),
        ("UP or DOWN", "best % takes HIT pot · worst SHIT pot"),
        ("House spark", "bag starts with house tokens every hour"),
        ("75% winners", "split across winning tickets · 25% house"),
    ]
    line_h = int(h * 0.055)
    card_h = int(h * 0.08) + line_h * len(rules) + int(h * 0.02)
    card_y0 = y
    # glass card
    card = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    cd = ImageDraw.Draw(card)
    rounded_rect(cd, [card_m, card_y0, w - card_m, card_y0 + card_h], radius=28, fill=CARD)
    cd.rounded_rectangle(
        [card_m, card_y0, w - card_m, card_y0 + card_h],
        radius=28,
        outline=(57, 255, 20, 60),
        width=2,
    )
    img = Image.alpha_composite(img, card)
    d = ImageDraw.Draw(img)

    cy = card_y0 + int(h * 0.028)
    title = "HOW THE BAG WORKS"
    tb = d.textbbox((0, 0), title, font=f_body)
    d.text(((w - (tb[2] - tb[0])) // 2, cy), title, font=f_body, fill=CREAM)
    cy += (tb[3] - tb[1]) + int(h * 0.02)

    for head, sub in rules:
        d.text((card_m + 28, cy), "▸", font=f_rule, fill=NEON)
        d.text((card_m + 52, cy), head, font=f_rule, fill=CREAM)
        hb2 = d.textbbox((card_m + 52, cy), head, font=f_rule)
        d.text((hb2[2] + 12, cy + 2), sub, font=f_rule_sm, fill=MUTED)
        cy += line_h

    y = card_y0 + card_h + int(h * 0.04)

    # three chips
    chips = [
        ("PLAY", NEON),
        ("SPARK", GOLD),
        ("SPLIT", GREEN),
    ]
    chip_w = int((w - pad * 2 - 24) / 3)
    chip_h = int(h * 0.055)
    for i, (label, col) in enumerate(chips):
        cx0 = pad + i * (chip_w + 12)
        rounded_rect(d, [cx0, y, cx0 + chip_w, y + chip_h], radius=16, fill=(16, 16, 24, 230))
        d.rounded_rectangle([cx0, y, cx0 + chip_w, y + chip_h], radius=16, outline=(*col, 160), width=2)
        lb = d.textbbox((0, 0), label, font=f_body)
        d.text(
            (cx0 + (chip_w - (lb[2] - lb[0])) // 2, y + (chip_h - (lb[3] - lb[1])) // 2 - 2),
            label,
            font=f_body,
            fill=col,
        )
    y += chip_h + int(h * 0.045)

    # CTA
    cta = "tokenshit.com/play"
    cb = d.textbbox((0, 0), cta, font=f_body)
    d.text(((w - (cb[2] - cb[0])) // 2, y), cta, font=f_body, fill=NEON)
    y += (cb[3] - cb[1]) + int(h * 0.02)

    foot = "Every token is SH!T until proven otherwise"
    fb = d.textbbox((0, 0), foot, font=f_small)
    d.text(((w - (fb[2] - fb[0])) // 2, min(y, h - int(h * 0.06))), foot, font=f_small, fill=DIM)

    # tag corner
    d.text((pad, h - int(h * 0.04)), f"@tokenshit_  ·  {tag}", font=f_small, fill=DIM)

    return img.convert("RGB")


def main():
    specs = [
        (1080, 1350, "play-1080x1350.png", "4:5"),
        (1080, 1920, "play-story.png", "story"),
        (1200, 1200, "play-1200.png", "1:1"),
        (1200, 630, "play-1200x630.png", "og"),
        (1080, 1080, "play-poster.png", "sq"),
    ]
    for w, h, name, tag in specs:
        im = make_poster(w, h, tag)
        path = OUT / name
        im.save(path, "PNG", optimize=True)
        print("wrote", path, path.stat().st_size)
        # brand copies
        if name == "play-1080x1350.png":
            im.save(BRAND / "play-poster.png", "PNG", optimize=True)
        if name == "play-1200x630.png":
            (BRAND / "og").mkdir(exist_ok=True)
            im.save(BRAND / "og" / "play.png", "PNG", optimize=True)
            im.save(OUT / "play-og.png", "PNG", optimize=True)


if __name__ == "__main__":
    main()
