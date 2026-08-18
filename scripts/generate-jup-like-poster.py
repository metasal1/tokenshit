#!/usr/bin/env python3
"""
Jupiter VRFD like-claim posters — brand emoji pack + big Jup logo.

Always uses /public/brand/emoji (Twemoji/Noto pack) — never bare system emoji.
Fonts: Monoton + Orbitron from /public/brand/fonts.

Run: python3 scripts/generate-jup-like-poster.py
"""
from __future__ import annotations

import hashlib
import random
import shutil
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
BRAND = ROOT / "public" / "brand"
EMOJI_DIR = BRAND / "emoji"
FONTS = BRAND / "fonts"
OUT = ROOT / "public" / "posters"
OUT.mkdir(parents=True, exist_ok=True)

BG = (10, 10, 15)
CREAM = (255, 248, 231)
NEON = (57, 255, 20)
GOLD = (240, 192, 64)
MUTED = (161, 161, 170)
DIM = (82, 82, 91)
CARD = (18, 18, 26)

# Brand pack codes used across site posters / EmojiIcon set
SCATTER = [
    "1f3af",  # target
    "1f480",  # skull
    "1f4a9",  # poop
    "1f525",  # fire
    "1f4b0",  # moneybag
    "1f389",  # party
    "1f680",  # rocket
    "2728",   # sparkles
    "2b50",   # star
    "1f3c6",  # trophy
    "1f49a",  # green heart (like)
    "2705",   # check
    "1f449",  # point right
    "1fa90",  # ringed planet
    "1f4af",  # 100
    "1f31f",  # glowing star
    "1f48e",  # gem
    "1f911",  # money mouth
]

# Big feature icons in hero row
FEATURE = [
    ("1f49a", "LIKE"),
    ("1f3af", "HIT"),
    ("1f4b0", "5K"),
]


def load_font(name: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONTS / name), size)


def text_w(font: ImageFont.FreeTypeFont, text: str) -> int:
    bb = font.getbbox(text)
    return int(bb[2] - bb[0])


def load_emoji(cp: str) -> Image.Image | None:
    """Prefer site pack /brand/emoji/tw-*.png then hi-res brand icons."""
    local = EMOJI_DIR / f"tw-{cp}.png"
    if local.exists():
        return Image.open(local).convert("RGBA")
    # hi-res named
    aliases = {
        "1f3af": "target-512.png",
        "1f480": "skull-512.png",
        "1f525": "fire-512.png",
        "2728": "sparkles-512.png",
        "1f3c6": "trophy-512.png",
    }
    if cp in aliases:
        p = EMOJI_DIR / aliases[cp]
        if p.exists():
            return Image.open(p).convert("RGBA")
    # fetch twemoji into brand pack (keep collection growing)
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
    opacity: float = 1.0,
    rotate: int = 0,
    size: int | None = None,
) -> None:
    im = overlay.copy()
    if size:
        im = im.resize((size, size), Image.Resampling.LANCZOS)
    if rotate:
        im = im.rotate(rotate, expand=True, resample=Image.Resampling.BICUBIC)
    if opacity < 1:
        a = im.split()[-1].point(lambda p: int(p * opacity))
        im.putalpha(a)
    px = int(x - im.width / 2)
    py = int(y - im.height / 2)
    base.alpha_composite(im, (max(0, px), max(0, py)))


def load_jupiter(size: int) -> Image.Image:
    """Big Jupiter logo — cache under brand for reuse."""
    cache = BRAND / "jupiter-logo.png"
    if not cache.exists():
        # Prefer hi-res rasterized official SVG
        svg_urls = [
            "https://jup.ag/svg/jupiter-logo.svg",
            "https://static.jup.ag/jup/icon.svg",
        ]
        png_urls = [
            "https://static.jup.ag/jup/icon.png",
        ]
        tmp_svg = Path("/tmp/jup-poster-logo.svg")
        tmp_png = Path("/tmp/jup-poster-logo.png")
        got = False
        for u in svg_urls:
            try:
                urllib.request.urlretrieve(u, tmp_svg)
                import subprocess

                subprocess.check_call(
                    [
                        "rsvg-convert",
                        "-w",
                        "1024",
                        "-h",
                        "1024",
                        str(tmp_svg),
                        "-o",
                        str(tmp_png),
                    ],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                )
                shutil.copy(tmp_png, cache)
                got = True
                break
            except Exception:
                continue
        if not got:
            for u in png_urls:
                try:
                    urllib.request.urlretrieve(u, cache)
                    got = True
                    break
                except Exception:
                    pass
        if not got:
            # neon circle fallback with J
            im = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
            d = ImageDraw.Draw(im)
            d.ellipse([40, 40, 984, 984], fill=(57, 255, 20, 40), outline=(*NEON, 255), width=24)
            d.text((512, 512), "J", font=load_font("Monoton-Regular.ttf", 420), fill=(*NEON, 255), anchor="mm")
            im.save(cache)
    im = Image.open(cache).convert("RGBA")
    return im.resize((size, size), Image.Resampling.LANCZOS)


def glow_text(
    base: Image.Image,
    xy: tuple[int, int],
    text: str,
    font: ImageFont.FreeTypeFont,
    fill: tuple[int, int, int],
    glow: tuple[int, int, int],
    anchor: str = "mm",
    strength: int = 4,
) -> None:
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    ld = ImageDraw.Draw(layer)
    for dx, dy in [(-3, 0), (3, 0), (0, -3), (0, 3), (-2, -2), (2, 2), (0, 0)]:
        ld.text((xy[0] + dx, xy[1] + dy), text, font=font, fill=(*glow, 160), anchor=anchor)
    layer = layer.filter(ImageFilter.GaussianBlur(strength))
    base.alpha_composite(layer)
    ImageDraw.Draw(base).text(xy, text, font=font, fill=(*fill, 255), anchor=anchor)


def scatter(base: Image.Image, seed: str, w: int, h: int, clear: tuple[int, int, int, int]) -> None:
    rnd = random.Random(int(hashlib.sha256(seed.encode()).hexdigest()[:8], 16))
    icons = [im for cp in SCATTER if (im := load_emoji(cp)) is not None]
    if not icons:
        return
    cx0, cy0, cx1, cy1 = clear
    n = 22 if h > w else 16
    for i in range(n):
        for _ in range(40):
            x = rnd.randint(int(w * 0.05), int(w * 0.95))
            y = rnd.randint(int(h * 0.05), int(h * 0.95))
            if cx0 < x < cx1 and cy0 < y < cy1:
                continue
            size = rnd.randint(int(min(w, h) * 0.04), int(min(w, h) * 0.075))
            rot = rnd.randint(-28, 28)
            op = rnd.uniform(0.45, 0.88)
            paste_rgba(base, icons[i % len(icons)], x, y, opacity=op, rotate=rot, size=size)
            break


def make(w: int, h: int, name: str) -> Path:
    base = Image.new("RGBA", (w, h), (*BG, 255))

    # neon wash
    wash = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    wd = ImageDraw.Draw(wash)
    wd.ellipse([w // 2 - w // 2.2, -h // 8, w // 2 + w // 2.2, h // 2.2], fill=(*NEON, 28))
    wd.ellipse([w // 2 - w // 3, h // 3, w // 2 + w // 3, h], fill=(*GOLD, 14))
    wash = wash.filter(ImageFilter.GaussianBlur(max(40, w // 18)))
    base = Image.alpha_composite(base, wash)

    # soft grid
    g = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gd = ImageDraw.Draw(g)
    step = max(36, w // 28)
    for x in range(0, w, step):
        gd.line([(x, 0), (x, h)], fill=(*NEON, 12), width=1)
    for y in range(0, h, step):
        gd.line([(0, y), (w, y)], fill=(*NEON, 10), width=1)
    base.alpha_composite(g)

    # clear center for type + jup logo
    clear = (int(w * 0.12), int(h * 0.08), int(w * 0.88), int(h * 0.78))
    scatter(base, name + str(w), w, h, clear)

    draw = ImageDraw.Draw(base)

    # corner brackets
    pad = int(w * 0.04)
    L = int(w * 0.1)
    t = max(3, w // 200)
    for pts in [
        [(pad, pad + L), (pad, pad), (pad + L, pad)],
        [(w - pad - L, pad), (w - pad, pad), (w - pad, pad + L)],
        [(pad, h - pad - L), (pad, h - pad), (pad + L, h - pad)],
        [(w - pad - L, h - pad), (w - pad, h - pad), (w - pad, h - pad - L)],
    ]:
        draw.line(pts, fill=(*NEON, 255), width=t)

    y = int(h * 0.07)

    # brand lockup small
    mono_sm = load_font("Monoton-Regular.ttf", max(28, w // 28))
    parts = [("TOKEN", CREAM, GOLD), ("$", NEON, (30, 140, 40)), ("HIT", CREAM, GOLD)]
    widths = [text_w(mono_sm, t) for t, _, _ in parts]
    x = (w - sum(widths)) // 2
    for (txt, col, gcol), tw in zip(parts, widths):
        cx = x + tw // 2
        for dx, dy in [(-2, 0), (2, 0), (0, -2), (0, 2)]:
            draw.text((cx + dx, y + dy), txt, font=mono_sm, fill=gcol, anchor="mm")
        draw.text((cx, y), txt, font=mono_sm, fill=col, anchor="mm")
        x += tw

    y += int(h * 0.055)
    orb = load_font("Orbitron-Bold.ttf", max(16, w // 42))
    draw.text((w // 2, y), "×  JUPITER VRFD", font=orb, fill=MUTED, anchor="mm")

    # BIG JUPITER LOGO
    jup_size = int(min(w, h) * (0.28 if h / w > 1.3 else 0.32 if h < w * 0.7 else 0.30))
    jup = load_jupiter(jup_size)
    # glow ring behind logo
    ring = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    rd = ImageDraw.Draw(ring)
    jy = y + int(h * 0.04) + jup_size // 2
    r = jup_size // 2 + int(w * 0.02)
    rd.ellipse([w // 2 - r, jy - r, w // 2 + r, jy + r], fill=(*NEON, 35))
    ring = ring.filter(ImageFilter.GaussianBlur(24))
    base.alpha_composite(ring)
    paste_rgba(base, jup, w // 2, jy, opacity=1.0, size=jup_size)

    # feature emoji row under logo
    fy = jy + jup_size // 2 + int(h * 0.035)
    gap = int(w * 0.14)
    start_x = w // 2 - gap
    for i, (cp, _) in enumerate(FEATURE):
        em = load_emoji(cp)
        if em:
            paste_rgba(base, em, start_x + i * gap, fy, size=int(min(w, h) * 0.07))

    # main headline
    hy = fy + int(h * 0.07)
    mono_big = load_font("Monoton-Regular.ttf", max(48, w // 11))
    mono_mid = load_font("Monoton-Regular.ttf", max(40, w // 13))
    for line, fnt, col, gcol in [
        ("LIKE", mono_big, CREAM, GOLD),
        ("$TOKENSHIT", mono_mid, NEON, (30, 140, 40)),
        ("ON JUPITER", mono_big, CREAM, GOLD),
    ]:
        # shrink if needed
        f = fnt
        sz = int(getattr(fnt, "size", 48))
        while text_w(f, line) > int(w * 0.9) and sz > 28:
            sz -= 4
            f = load_font("Monoton-Regular.ttf", sz)
        glow_text(base, (w // 2, hy), line, f, col, gcol, strength=5)
        hy += int(sz * 0.95)

    hy += int(h * 0.01)
    # reward pill with money emoji
    reward = "GET  5,000  $TOKENSHIT"
    fr = load_font("Orbitron-Bold.ttf", max(22, w // 28))
    tw = text_w(fr, reward)
    pill_h = int(fr.size * 1.9)
    px0 = (w - tw) // 2 - 50
    py0 = hy - pill_h // 3
    px1 = (w + tw) // 2 + 50
    py1 = py0 + pill_h
    pill = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    pd = ImageDraw.Draw(pill)
    pd.rounded_rectangle([px0, py0, px1, py1], radius=20, fill=(*NEON, 32), outline=(*NEON, 255), width=3)
    base.alpha_composite(pill)
    money = load_emoji("1f4b0")
    if money:
        paste_rgba(base, money, px0 + 28, (py0 + py1) // 2, size=int(pill_h * 0.55))
    ImageDraw.Draw(base).text((w // 2 + 10, (py0 + py1) // 2), reward, font=fr, fill=(*NEON, 255), anchor="mm")

    # steps card with emoji bullets
    steps = [
        ("1f449", "Open verified.jup.ag"),
        ("1f440", "Sign in with the SAME X"),
        ("1f49a", "Like $TOKENSHIT"),
        ("2705", "Claim on tokenshit.com/claim"),
    ]
    # ensure 1f440 exists
    load_emoji("1f440")
    fs = load_font("Orbitron-Bold.ttf", max(18, w // 38))
    line_h = int(fs.size * 1.55)
    card_pad = int(w * 0.045)
    em_sz = int(fs.size * 1.35)
    max_line_w = max(text_w(fs, s) for _, s in steps) + em_sz + 24
    card_w = min(int(w * 0.88), max_line_w + card_pad * 2)
    card_h = len(steps) * line_h + card_pad * 2
    cy0 = py1 + int(h * 0.03)
    # if overflow (story tall is fine; og short shrink)
    if cy0 + card_h > h - int(h * 0.12):
        # compress
        fs = load_font("Orbitron-Bold.ttf", max(14, w // 48))
        line_h = int(fs.size * 1.45)
        em_sz = int(fs.size * 1.3)
        card_h = len(steps) * line_h + card_pad * 2
        cy0 = min(cy0, h - int(h * 0.12) - card_h)

    cx0 = (w - card_w) // 2
    card = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    cd = ImageDraw.Draw(card)
    cd.rounded_rectangle(
        [cx0, cy0, cx0 + card_w, cy0 + card_h],
        radius=22,
        fill=(*CARD, 245),
        outline=(*NEON, 90),
        width=2,
    )
    base.alpha_composite(card)

    sy = cy0 + card_pad + line_h // 2
    for cp, label in steps:
        em = load_emoji(cp)
        if em:
            paste_rgba(base, em, cx0 + card_pad + em_sz // 2, sy, size=em_sz)
        ImageDraw.Draw(base).text(
            (cx0 + card_pad + em_sz + 14, sy),
            label,
            font=fs,
            fill=(*CREAM, 255),
            anchor="lm",
        )
        sy += line_h

    # footer
    foot_y = h - int(h * 0.07)
    ff = load_font("Orbitron-Bold.ttf", max(20, w // 32))
    glow_text(base, (w // 2, foot_y - int(h * 0.025)), "tokenshit.com/claim", ff, NEON, (30, 140, 40), strength=3)
    # emoji row footer
    for i, cp in enumerate(["1f49a", "2705", "1f525"]):
        em = load_emoji(cp)
        if em:
            paste_rgba(
                base,
                em,
                w // 2 + (i - 1) * int(w * 0.08),
                foot_y + int(h * 0.01),
                size=int(min(w, h) * 0.045),
            )

    path = OUT / name
    base.convert("RGB").save(path, "PNG", optimize=True)
    print(f"wrote {path} {w}x{h} ({path.stat().st_size // 1024}kb)")
    return path


def main() -> None:
    make(1200, 1200, "jup-like-claim-1200.png")
    make(1080, 1920, "jup-like-claim-story.png")
    make(1200, 630, "jup-like-claim-og.png")
    # also brand folder @1x/@2x for press kit parity
    make(1080, 1350, "jup-like-claim-poster.png")
    p = OUT / "jup-like-claim-poster.png"
    shutil.copy(p, BRAND / "jup-like-claim-poster.png")
    make(2160, 2700, "jup-like-claim-poster@2x.png")
    shutil.copy(OUT / "jup-like-claim-poster@2x.png", BRAND / "jup-like-claim-poster@2x.png")
    print("done")


if __name__ == "__main__":
    main()
