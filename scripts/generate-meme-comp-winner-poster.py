#!/usr/bin/env python3
"""
MEME COMP winner announcement — SQUARE 1080 only.
Brand logos + emoji pack. Optional --handle @user
"""
from __future__ import annotations

import argparse
import math
import random
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
BRAND = ROOT / "public" / "brand"
EMOJI_DIR = BRAND / "emoji"
FONTS = BRAND / "fonts"
OUT = ROOT / "public" / "posters"
OUT.mkdir(parents=True, exist_ok=True)

S = 1080
BG = (10, 10, 15)
CREAM = (255, 248, 231)
NEON = (57, 255, 20)
GOLD = (240, 192, 64)
MUTED = (161, 161, 170)
DIM = (82, 82, 91)
CARD = (16, 16, 24)
LINE = (42, 42, 58)
SKY = (56, 189, 248)

SCATTER = [
    "1f3c6",
    "1f451",
    "1f525",
    "1f389",
    "2728",
    "1f4af",
    "1f31f",
    "1f48e",
    "1f3af",
    "1f480",
    "1f4b0",
    "1f49a",
    "2b50",
    "1f4f8",
    "1f3a8",
]


def fnt(name: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONTS / name), max(8, size))


def tw(font: ImageFont.ImageFont, text: str) -> int:
    if hasattr(font, "getlength"):
        return int(font.getlength(text))
    b = font.getbbox(text)
    return int(b[2] - b[0])


def th(font: ImageFont.ImageFont, text: str = "Ag") -> int:
    b = font.getbbox(text)
    return int(b[3] - b[1])


def load_emoji(cp: str) -> Image.Image | None:
    local = EMOJI_DIR / f"tw-{cp}.png"
    aliases = {
        "1f3c6": "trophy-512.png",
        "1f525": "fire-512.png",
        "2728": "sparkles-512.png",
        "1f3af": "target-512.png",
        "1f480": "skull-512.png",
    }
    for p in (local, EMOJI_DIR / aliases.get(cp, "")):
        if p and Path(p).exists() and Path(p).stat().st_size > 200:
            return Image.open(p).convert("RGBA")
    dest = EMOJI_DIR / f"tw-{cp}.png"
    url = f"https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/{cp}.png"
    try:
        urllib.request.urlretrieve(url, dest)
        return Image.open(dest).convert("RGBA")
    except Exception:
        return None


def paste_rgba(
    base: Image.Image,
    overlay: Image.Image,
    x: int,
    y: int,
    *,
    opacity: float = 1.0,
    rotate: int = 0,
) -> None:
    im = overlay.convert("RGBA")
    if rotate:
        im = im.rotate(rotate, expand=True, resample=Image.Resampling.BICUBIC)
    if opacity < 1:
        a = im.split()[-1].point(lambda p: int(p * opacity))
        im = im.copy()
        im.putalpha(a)
    base.alpha_composite(im, (int(x), int(y)))


def load_logo_wide(max_w: int) -> Image.Image:
    for name in ("logo-transparent.png", "logo-wide.png", "logo.png"):
        path = BRAND / name
        if path.exists():
            im = Image.open(path).convert("RGBA")
            break
    else:
        raise FileNotFoundError("brand logo missing")
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
    r = min(size / im.width, size / im.height)
    nw, nh = max(1, int(im.width * r)), max(1, int(im.height * r))
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.alpha_composite(im, ((size - nw) // 2, (size - nh) // 2))
    return canvas


def center_text(draw, y, text, font, fill) -> int:
    b = font.getbbox(text)
    x = (S - (b[2] - b[0])) // 2 - b[0]
    draw.text((x, y - b[1]), text, font=font, fill=fill)
    return y + (b[3] - b[1])


def build(handle: str | None = None, pfp_path: str | None = None, display_name: str | None = None) -> Image.Image:
    rng = random.Random(42)
    img = Image.new("RGBA", (S, S), (*BG, 255))

    glow = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([300, -180, 980, 380], fill=(*GOLD, 36))
    gd.ellipse([-120, 620, 420, 1180], fill=(*NEON, 26))
    gd.ellipse([700, 700, 1280, 1280], fill=(*GOLD, 18))
    img = Image.alpha_composite(img, glow.filter(ImageFilter.GaussianBlur(80)))

    # scatter emoji ring
    cx, cy = S / 2, S / 2
    for i, cp in enumerate(SCATTER * 2):
        em = load_emoji(cp)
        if not em:
            continue
        ang = (i / (len(SCATTER) * 2)) * math.tau + rng.uniform(-0.08, 0.08)
        rad = 430 + rng.uniform(-30, 40)
        size = rng.randint(44, 72)
        em2 = em.resize((size, size), Image.Resampling.LANCZOS)
        x = int(cx + math.cos(ang) * rad - size / 2)
        y = int(cy + math.sin(ang) * rad - size / 2)
        paste_rgba(img, em2, x, y, opacity=0.55 + rng.random() * 0.35, rotate=rng.randint(-20, 20))

    mark = load_logo_mark(88)
    paste_rgba(img, mark, 48, 48, opacity=0.14)
    paste_rgba(img, mark, S - 48 - 88, 48, opacity=0.14)

    d = ImageDraw.Draw(img)
    f_eye = fnt("Orbitron-Bold.ttf", 18)
    f_comp = fnt("Orbitron-Bold.ttf", 28)
    f_win = fnt("Monoton-Regular.ttf", 96)
    f_handle = fnt("Orbitron-Bold.ttf", 36)
    f_prize_l = fnt("Orbitron-Bold.ttf", 18)
    f_prize = fnt("Orbitron-Bold.ttf", 64)
    f_unit = fnt("Orbitron-Bold.ttf", 26)
    f_sub = fnt("Inter-Bold.ttf", 22)
    f_foot = fnt("Inter-Regular.ttf", 20)
    f_link = fnt("Orbitron-Bold.ttf", 22)

    y = 64
    logo = load_logo_wide(520)
    paste_rgba(img, logo, (S - logo.width) // 2, y)
    y += logo.height + 18

    y = center_text(d, y, "MEME COMPETITION", f_comp, NEON) + 8
    # underline
    uw = tw(f_comp, "MEME COMPETITION")
    d.rectangle([(S - uw) // 2, y, (S + uw) // 2, y + 3], fill=NEON)
    y += 28

    # big WINNER
    y = center_text(d, y, "WINNER", f_win, GOLD) + 10
    f_ann = fnt("Monoton-Regular.ttf", 52)
    y = center_text(d, y, "ANNOUNCED", f_ann, CREAM) + 22

    # profile photo
    if pfp_path:
        try:
            pfp = Image.open(pfp_path).convert("RGBA")
            size = 220
            pfp = pfp.resize((size, size), Image.Resampling.LANCZOS)
            # circular mask
            mask = Image.new("L", (size, size), 0)
            md = ImageDraw.Draw(mask)
            md.ellipse([0, 0, size - 1, size - 1], fill=255)
            # neon ring
            ring = Image.new("RGBA", (size + 16, size + 16), (0, 0, 0, 0))
            rd = ImageDraw.Draw(ring)
            rd.ellipse([0, 0, size + 15, size + 15], outline=(*NEON, 255), width=6)
            rd.ellipse([3, 3, size + 12, size + 12], outline=(*GOLD, 200), width=3)
            circ = Image.new("RGBA", (size, size), (0, 0, 0, 0))
            circ.paste(pfp, (0, 0), mask)
            rx = (S - (size + 16)) // 2
            img.alpha_composite(ring, (rx, y))
            img.alpha_composite(circ, (rx + 8, y + 8))
            y += size + 16 + 16
        except Exception as e:
            print("pfp failed", e)

    if display_name:
        y = center_text(d, y, display_name.upper(), f_handle, CREAM) + 10

    if handle:
        h = handle if handle.startswith("@") else f"@{handle}"
        # handle pill
        pad_x, pad_y = 28, 14
        hw = tw(f_handle, h) + pad_x * 2
        hh = th(f_handle) + pad_y * 2
        hx, hy = (S - hw) // 2, y
        d.rounded_rectangle(
            [hx, hy, hx + hw, hy + hh],
            radius=999,
            fill=(24, 24, 34, 255),
            outline=NEON,
            width=3,
        )
        bx = f_handle.getbbox(h)
        d.text(
            (hx + pad_x - bx[0], hy + pad_y - bx[1]),
            h,
            font=f_handle,
            fill=NEON,
        )
        y = hy + hh + 28
    else:
        y = center_text(d, y, "CONGRATS CHAMP", f_handle, NEON) + 28

    # prize card
    card_m = 70
    card_h = 210
    card = Image.new("RGBA", (S - card_m * 2, card_h), (0, 0, 0, 0))
    cd = ImageDraw.Draw(card)
    cd.rounded_rectangle(
        [0, 0, card.width - 1, card.height - 1],
        radius=28,
        fill=(*CARD, 245),
        outline=NEON,
        width=3,
    )
    # trophies
    trophy = load_emoji("1f3c6")
    if trophy:
        tsz = 56
        t = trophy.resize((tsz, tsz), Image.Resampling.LANCZOS)
        paste_rgba(card, t, 28, (card_h - tsz) // 2)
        paste_rgba(card, t, card.width - 28 - tsz, (card_h - tsz) // 2)

    cy0 = 28
    # label
    lab = "GRAND PRIZE"
    lb = f_prize_l.getbbox(lab)
    cd.text(
        ((card.width - (lb[2] - lb[0])) // 2 - lb[0], cy0 - lb[1]),
        lab,
        font=f_prize_l,
        fill=MUTED,
    )
    cy0 += 36
    prize = "1,000,000"
    pb = f_prize.getbbox(prize)
    cd.text(
        ((card.width - (pb[2] - pb[0])) // 2 - pb[0], cy0 - pb[1]),
        prize,
        font=f_prize,
        fill=NEON,
    )
    cy0 += 72
    unit = "$TOKENSHIT"
    ub = f_unit.getbbox(unit)
    cd.text(
        ((card.width - (ub[2] - ub[0])) // 2 - ub[0], cy0 - ub[1]),
        unit,
        font=f_unit,
        fill=CREAM,
    )
    img.alpha_composite(card, (card_m, y))
    y += card_h + 28

    y = center_text(d, y, "Best or most-liked under the thread", f_sub, MUTED) + 10
    y = center_text(d, y, "Paid from SHTy treasury", f_sub, DIM) + 36

    y = center_text(d, y, "tokenshit.com/memes", f_link, NEON) + 8
    y = center_text(d, y, "@tokenshit_", f_link, SKY)

    # bottom brand marks
    mark_s = load_logo_mark(64)
    paste_rgba(img, mark_s, S // 2 - 32, S - 88, opacity=0.9)

    return img.convert("RGB")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--handle", default="", help="Winner X handle e.g. @foo")
    ap.add_argument("--pfp", default="", help="Path to winner profile image")
    ap.add_argument("--name", default="", help="Display name e.g. ROYAN")
    ap.add_argument(
        "--out",
        default="",
        help="Optional output path (default public/posters + brand)",
    )
    args = ap.parse_args()
    handle = (args.handle or "").strip() or None
    if handle and not handle.startswith("@"):
        handle = "@" + handle.lstrip("@")

    pfp = (args.pfp or "").strip() or None
    name = (args.name or "").strip() or None
    img = build(handle, pfp, name)
    stem = "meme-comp-winner-poster"
    if handle:
        safe = handle.lstrip("@").lower()
        stem = f"meme-comp-winner-{safe}"

    paths = [
        OUT / f"{stem}.png",
        BRAND / f"{stem}.png",
        BRAND / "meme-comp-winner-poster.png",
        OUT / "meme-comp-winner-poster.png",
    ]
    if args.out:
        paths = [Path(args.out)] + paths

    written = []
    for p in paths:
        p.parent.mkdir(parents=True, exist_ok=True)
        img.save(p, "PNG", optimize=True)
        written.append(str(p))
        print("wrote", p, img.size)

    # @2x brand
    hi = img.resize((2160, 2160), Image.Resampling.LANCZOS)
    p2 = BRAND / "meme-comp-winner-poster@2x.png"
    hi.save(p2, "PNG", optimize=True)
    print("wrote", p2, hi.size)


if __name__ == "__main__":
    main()
