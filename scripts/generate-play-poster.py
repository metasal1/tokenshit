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

import math
import random
import urllib.request

EMOJI_DIR = BRAND / "emoji"
TOKEN_CACHE = ROOT / "public" / "brand" / "token-icons"
TOKEN_CACHE.mkdir(parents=True, exist_ok=True)

# Brand emoji (Noto/tw via local brand assets — never bare system emoji)
SCATTER_EMOJI = [
    "1f3af",  # target
    "1f525",  # fire
    "1f3c6",  # trophy
    "2728",   # sparkles
    "1f31f",  # star
    "1f389",  # party
    "1f680",  # rocket
    "2b50",   # star
    "1f4b0",  # money bag
    "1f48e",  # gem
]

# Majors board icons (CoinGecko ids via simplr CDN)
TOKEN_ICONS = [
    ("solana", "SOL"),
    ("bitcoin", "BTC"),
    ("ethereum", "ETH"),
    ("binancecoin", "BNB"),
    ("dogecoin", "DOGE"),
    ("sui", "SUI"),
    ("avalanche-2", "AVAX"),
    ("chainlink", "LINK"),
    ("uniswap", "UNI"),
    ("aave", "AAVE"),
    ("near", "NEAR"),
    ("jupiter-exchange-solana", "JUP"),
]


def load_emoji(cp: str) -> Image.Image | None:
    local = EMOJI_DIR / f"tw-{cp}.png"
    aliases = {
        "1f3af": "target-512.png",
        "1f480": "skull-512.png",
        "1f525": "fire-512.png",
        "2728": "sparkles-512.png",
        "1f3c6": "trophy-512.png",
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


def load_token_icon(cg_id: str) -> Image.Image | None:
    dest = TOKEN_CACHE / f"{cg_id}.png"
    if dest.exists() and dest.stat().st_size > 200:
        try:
            return Image.open(dest).convert("RGBA")
        except Exception:
            pass
    urls = [
        f"https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/{cg_id}/standard.png",
        f"https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/{cg_id.split('-')[0][:5]}.png",
    ]
    # map common
    sym_map = {
        "binancecoin": "bnb",
        "avalanche-2": "avax",
        "jupiter-exchange-solana": "jup",
    }
    if cg_id in sym_map:
        urls.insert(0, f"https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/{sym_map[cg_id]}.png")
    for url in urls:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "TokenShitPoster/1.0"})
            with urllib.request.urlopen(req, timeout=12) as r:
                dest.write_bytes(r.read())
            if dest.stat().st_size > 200:
                return Image.open(dest).convert("RGBA")
        except Exception:
            continue
    return None


def paste_rgba(base, overlay, x, y, *, opacity=1.0, rotate=0, size=None, center=True):
    im = overlay.copy()
    if size:
        im = im.resize((size, size), Image.Resampling.LANCZOS)
    if rotate:
        im = im.rotate(rotate, expand=True, resample=Image.Resampling.BICUBIC)
    if opacity < 1:
        a = im.split()[-1].point(lambda p: int(p * opacity))
        im.putalpha(a)
    if center:
        px, py = int(x - im.width / 2), int(y - im.height / 2)
    else:
        px, py = int(x), int(y)
    base.alpha_composite(im, (max(0, px), max(0, py)))


def scatter_icons(img: Image.Image, rng: random.Random) -> None:
    """Always put token logos + brand emoji on posters."""
    # ring of token icons
    icons = []
    for cg, _sym in TOKEN_ICONS:
        im = load_token_icon(cg)
        if im is not None:
            icons.append(im)
    emojis = []
    for cp in SCATTER_EMOJI:
        em = load_emoji(cp)
        if em is not None:
            emojis.append(em)

    # corners + edges — avoid center card zone roughly y 280-780
    spots = [
        (90, 200), (990, 200), (70, 520), (1010, 520),
        (120, 900), (960, 900), (200, 160), (880, 160),
        (160, 780), (920, 780), (540, 980), (80, 360),
        (1000, 360), (300, 120), (780, 120), (540, 200),
    ]
    rng.shuffle(spots)
    i = 0
    for im in icons:
        if i >= len(spots):
            break
        x, y = spots[i]
        i += 1
        paste_rgba(img, im, x, y, size=rng.randint(52, 72), opacity=0.92, rotate=rng.randint(-18, 18))
    for em in emojis:
        if i >= len(spots):
            break
        x, y = spots[i]
        i += 1
        paste_rgba(img, em, x, y, size=rng.randint(36, 52), opacity=0.55, rotate=rng.randint(-25, 25))

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

    # ALWAYS token icons + brand emoji on posters
    scatter_icons(img, random.Random(42))

    # faint brand marks — top only
    mark = load_logo_mark(96)
    paste(img, mark, 88, 88, 0.10)
    paste(img, mark, S - 88, 88, 0.10)

    d = ImageDraw.Draw(img)

    f_eye = fnt("Orbitron-Bold.ttf", 18)
    f_hero = fnt("Monoton-Regular.ttf", 96)
    f_sub = fnt("Monoton-Regular.ttf", 52)
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

    y = draw_centered(d, y, "PLAY FOR PRIZES", f_eye, NEON) + 10

    # stacked product
    for line, font, fill in (
        ("PLAY", f_hero, NEON),
        ("FOR PRIZES", f_sub, CREAM),
    ):
        hb = font.getbbox(line)
        hx = center_x(font, line) - hb[0]
        hy = y - hb[1]
        for dx, dy in ((-2, 2), (2, 2), (0, 3)):
            d.text((hx + dx, hy + dy), line, font=font, fill=(0, 0, 0, 130))
        d.text((hx, hy), line, font=font, fill=fill)
        y += (hb[3] - hb[1]) + (4 if line == "PLAY" else 18)

    # prize pill
    pill = "FREE  |  1 UP + 1 DOWN  |  TOP 3 WIN"
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
        ("FREE to play", "No entry fee  |  1 UP + 1 DOWN per hour"),
        ("Hold 2,000 SH!T", "Claim follow + like + RT unlocks Play"),
        ("Follow @Tokenshit_", "Required before you Play"),
        ("Top 3 win", "Best 3 % = HIT  |  worst 3 % = SHIT"),
        ("30,000 prize / hour", "Winners split  |  no winners = jackpot rolls"),
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