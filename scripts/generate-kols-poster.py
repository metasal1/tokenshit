#!/usr/bin/env python3
"""KOL scout posters — polished brand pack (Monoton/Orbitron + emoji assets)."""
from __future__ import annotations

import hashlib
import math
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
CACHE = Path("/Volumes/PRO-G40/MacHome-Offload/dotfiles/hermes/cache/images")
CACHE.mkdir(parents=True, exist_ok=True)

BG = (10, 10, 15)
CREAM = (255, 248, 231)
NEON = (57, 255, 20)
GOLD = (240, 192, 64)
MUTED = (161, 161, 170)
DIM = (82, 82, 91)
CARD = (18, 18, 26)
CARD2 = (24, 24, 34)
LINE = (42, 42, 58)

SCATTER = [
    "1f3af",
    "1f480",
    "1f4a9",
    "1f525",
    "1f4b0",
    "1f389",
    "1f680",
    "2728",
    "2b50",
    "1f3c6",
    "1f49a",
    "2705",
    "1f4af",
    "1f31f",
    "1f48e",
    "1f451",
    "1f440",
    "1f50d",
]


def load_font(name: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONTS / name), max(8, size))


def tw(font: ImageFont.ImageFont, text: str) -> int:
    if hasattr(font, "getlength"):
        return int(font.getlength(text))
    bb = font.getbbox(text)
    return int(bb[2] - bb[0])


def th(font: ImageFont.ImageFont, text: str = "Ag") -> int:
    bb = font.getbbox(text)
    return int(bb[3] - bb[1])


def load_emoji(cp: str) -> Image.Image | None:
    local = EMOJI_DIR / f"tw-{cp}.png"
    aliases = {
        "1f3af": "target-512.png",
        "1f480": "skull-512.png",
        "1f525": "fire-512.png",
        "2728": "sparkles-512.png",
        "1f3c6": "trophy-512.png",
        "1f4a9": "poop-512.png",
    }
    for p in (local, EMOJI_DIR / aliases.get(cp, "")):
        if p and p.exists() and p.stat().st_size > 200:
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
    size: int | None = None,
    center: bool = True,
) -> None:
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


def radial_glow(
    img: Image.Image,
    cx: float,
    cy: float,
    radius: float,
    color: tuple[int, int, int],
    alpha: int = 70,
) -> None:
    w, h = img.size
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    # cheap radial via blurred ellipse
    d = ImageDraw.Draw(layer)
    r = int(radius)
    d.ellipse(
        [cx - r, cy - r, cx + r, cy + r],
        fill=(*color, alpha),
    )
    layer = layer.filter(ImageFilter.GaussianBlur(radius=max(20, r // 3)))
    img.alpha_composite(layer)


def glow_text(
    base: Image.Image,
    xy: tuple[int, int],
    text: str,
    font: ImageFont.FreeTypeFont,
    fill: tuple[int, int, int],
    glow: tuple[int, int, int],
    *,
    anchor: str = "mm",
    strength: int = 5,
) -> None:
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    ld = ImageDraw.Draw(layer)
    for dx, dy in [(-4, 0), (4, 0), (0, -4), (0, 4), (-3, -3), (3, 3), (0, 0)]:
        ld.text(
            (xy[0] + dx, xy[1] + dy),
            text,
            font=font,
            fill=(*glow, 150),
            anchor=anchor,
        )
    layer = layer.filter(ImageFilter.GaussianBlur(strength))
    base.alpha_composite(layer)
    ImageDraw.Draw(base).text(xy, text, font=font, fill=(*fill, 255), anchor=anchor)


def draw_wordmark(base: Image.Image, cx: int, cy: int, size: int) -> None:
    f = load_font("Monoton-Regular.ttf", size)
    t1, dol, t2 = "TOKEN", "$", "HIT"
    total = tw(f, t1) + tw(f, dol) + tw(f, t2)
    x = cx - total // 2
    # TOKEN
    glow_text(base, (x + tw(f, t1) // 2, cy), t1, f, CREAM, GOLD, anchor="mm", strength=4)
    x += tw(f, t1)
    glow_text(base, (x + tw(f, dol) // 2, cy), dol, f, NEON, NEON, anchor="mm", strength=6)
    x += tw(f, dol)
    glow_text(base, (x + tw(f, t2) // 2, cy), t2, f, CREAM, GOLD, anchor="mm", strength=4)


def rounded(draw: ImageDraw.ImageDraw, box, r, fill=None, outline=None, width=2):
    draw.rounded_rectangle(box, radius=r, fill=fill, outline=outline, width=width)


def scatter(
    base: Image.Image,
    seed: str,
    clear: tuple[int, int, int, int],
    n: int = 18,
) -> None:
    rnd = random.Random(int(hashlib.sha256(seed.encode()).hexdigest()[:8], 16))
    w, h = base.size
    icons = [im for cp in SCATTER if (im := load_emoji(cp)) is not None]
    if not icons:
        return
    cx0, cy0, cx1, cy1 = clear
    for i in range(n):
        for _ in range(50):
            x = rnd.randint(int(w * 0.04), int(w * 0.96))
            y = rnd.randint(int(h * 0.04), int(h * 0.96))
            if cx0 < x < cx1 and cy0 < y < cy1:
                continue
            size = rnd.randint(int(min(w, h) * 0.035), int(min(w, h) * 0.07))
            rot = rnd.randint(-22, 22)
            op = rnd.uniform(0.28, 0.62)
            paste_rgba(base, icons[i % len(icons)], x, y, opacity=op, rotate=rot, size=size)
            break


def chip(
    base: Image.Image,
    cx: int,
    cy: int,
    w: int,
    h: int,
    emoji_cp: str,
    label: str,
    sub: str,
) -> None:
    draw = ImageDraw.Draw(base)
    r = h // 4
    rounded(
        draw,
        (cx - w // 2, cy - h // 2, cx + w // 2, cy + h // 2),
        r,
        fill=(*CARD2, 245),
        outline=(*LINE, 255),
        width=max(2, h // 40),
    )
    # top neon hairline
    draw.rounded_rectangle(
        (cx - w // 2 + 4, cy - h // 2 + 3, cx + w // 2 - 4, cy - h // 2 + max(4, h // 28)),
        radius=2,
        fill=(*NEON, 90),
    )
    em = load_emoji(emoji_cp)
    if em:
        paste_rgba(base, em, cx, cy - h // 6, size=int(h * 0.36))
    lf = load_font("Orbitron-Bold.ttf", max(12, h // 6))
    sf = load_font("Orbitron-Bold.ttf", max(10, h // 9))
    glow_text(base, (cx, cy + h // 8), label, lf, CREAM, GOLD, anchor="mm", strength=2)
    ImageDraw.Draw(base).text((cx, cy + h // 3), sub, font=sf, fill=(*MUTED, 255), anchor="mm")


def make_poster(size: tuple[int, int], tag: str) -> Image.Image:
    w, h = size
    img = Image.new("RGBA", (w, h), (*BG, 255))
    aspect = h / max(w, 1)
    tall = aspect >= 1.55
    wide = aspect <= 0.58
    s = w / 1080.0
    if tall:
        s *= 1.02
    if wide:
        s *= 0.62

    def fs(n: float) -> int:
        return max(9, int(n * s))

    # atmosphere
    radial_glow(img, w * 0.5, h * 0.22, w * 0.55, GOLD, alpha=38)
    radial_glow(img, w * 0.5, h * 0.55, w * 0.7, NEON, alpha=28)
    radial_glow(img, w * 0.15, h * 0.85, w * 0.35, (185, 77, 255), alpha=18)
    radial_glow(img, w * 0.85, h * 0.12, w * 0.3, NEON, alpha=16)

    # content safe zone (keep scatter out)
    if wide:
        clear = (int(w * 0.08), int(h * 0.06), int(w * 0.92), int(h * 0.92))
    else:
        clear = (int(w * 0.1), int(h * 0.08), int(w * 0.9), int(h * 0.88))
    scatter(img, f"kol-scout-{tag}-{w}x{h}", clear, n=12 if wide else 16)

    # subtle vignette
    vig = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    vd = ImageDraw.Draw(vig)
    for i in range(40):
        a = int(6 * (i / 40))
        vd.rectangle([i, i, w - 1 - i, h - 1 - i], outline=(0, 0, 0, a))
    img.alpha_composite(vig)

    draw = ImageDraw.Draw(img)

    # vertical stack from center of gravity
    # Build mid stack into a group and center it for tall canvases
    # --- top lockup ---
    y = int(h * (0.07 if not wide else 0.06))

    # small poop brand tick
    poop = load_emoji("1f4a9")
    if poop and not wide:
        paste_rgba(img, poop, w // 2, y + fs(10), size=fs(36), opacity=0.9)
        y += fs(48)
    elif wide:
        y += fs(4)

    draw_wordmark(img, w // 2, y + fs(22), fs(44 if not wide else 36))
    y += fs(58 if not wide else 48)

    # thin divider
    dw = int(w * 0.22)
    draw.rounded_rectangle(
        (w // 2 - dw // 2, y, w // 2 + dw // 2, y + max(2, fs(3))),
        radius=2,
        fill=(*NEON, 120),
    )
    y += fs(28 if not wide else 18)

    # eyebrow
    orb_xs = load_font("Orbitron-Bold.ttf", fs(22 if not wide else 16))
    eye = "BECOME A KOL SCOUT"
    glow_text(img, (w // 2, y + fs(12)), eye, orb_xs, MUTED, DIM, anchor="mm", strength=1)
    y += fs(40 if not wide else 28)

    # hero SCOUT
    hero_sz = fs(148 if tall else (120 if not wide else 72))
    # fit check
    while tw(load_font("Monoton-Regular.ttf", hero_sz), "SCOUT") > w * 0.88 and hero_sz > 40:
        hero_sz = int(hero_sz * 0.92)
    hero_f = load_font("Monoton-Regular.ttf", hero_sz)
    glow_text(
        img,
        (w // 2, y + hero_sz // 2),
        "SCOUT",
        hero_f,
        CREAM,
        GOLD,
        anchor="mm",
        strength=8,
    )
    y += hero_sz + fs(8)

    # KOL$ micro lockup under hero
    ksz = fs(40 if not wide else 26)
    kf = load_font("Monoton-Regular.ttf", ksz)
    k1, kd, k2 = "KOL", "$", ""
    # just KOL$
    kt = tw(kf, "KOL") + tw(kf, "$")
    kx = w // 2 - kt // 2
    glow_text(img, (kx + tw(kf, "KOL") // 2, y + ksz // 2), "KOL", kf, CREAM, GOLD, anchor="mm", strength=3)
    glow_text(
        img,
        (kx + tw(kf, "KOL") + tw(kf, "$") // 2, y + ksz // 2),
        "$",
        kf,
        NEON,
        NEON,
        anchor="mm",
        strength=4,
    )
    y += ksz + fs(28 if not wide else 16)

    # bounty pill
    pill_h = fs(64 if not wide else 40)
    pill_txt = "2,500  $TOKENSHIT"
    pf = load_font("Orbitron-Bold.ttf", fs(26 if not wide else 16))
    pill_w = tw(pf, pill_txt) + fs(72)
    px0 = w // 2 - pill_w // 2
    # outer glow
    glow_layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow_layer)
    gd.rounded_rectangle(
        (px0 - 6, y - 4, px0 + pill_w + 6, y + pill_h + 4),
        radius=pill_h // 2 + 4,
        fill=(*NEON, 50),
    )
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(10))
    img.alpha_composite(glow_layer)
    draw = ImageDraw.Draw(img)
    rounded(
        draw,
        (px0, y, px0 + pill_w, y + pill_h),
        pill_h // 2,
        fill=(*NEON, 255),
    )
    # money emoji left of text inside pill
    money = load_emoji("1f4b0")
    if money:
        paste_rgba(img, money, px0 + fs(28), y + pill_h // 2, size=fs(28 if not wide else 18))
    ImageDraw.Draw(img).text(
        (w // 2 + fs(8), y + pill_h // 2),
        pill_txt,
        font=pf,
        fill=(0, 0, 0, 255),
        anchor="mm",
    )
    y += pill_h + fs(18 if not wide else 10)

    # when line
    when_f = load_font("Orbitron-Bold.ttf", fs(18 if not wide else 13))
    when = "WHEN YOUR 10K+ KOL GETS ACCEPTED"
    ImageDraw.Draw(img).text(
        (w // 2, y + fs(10)),
        when,
        font=when_f,
        fill=(*MUTED, 255),
        anchor="mm",
    )
    y += fs(36 if not wide else 24)

    # main glass card
    pad = int(w * (0.09 if not wide else 0.06))
    card_h = fs(200 if not wide else 120)
    if tall:
        card_h = fs(220)
    rounded(
        draw,
        (pad, y, w - pad, y + card_h),
        fs(24),
        fill=(*CARD, 235),
        outline=(*NEON, 70),
        width=max(2, fs(2)),
    )
    # inner top highlight
    draw.rounded_rectangle(
        (pad + fs(8), y + fs(6), w - pad - fs(8), y + fs(10)),
        radius=2,
        fill=(*CREAM, 25),
    )

    line1 = "Spot CT voices."
    line2 = "Get paid when they land."
    if wide:
        lf = load_font("Inter-Bold.ttf", fs(28))
        cy = y + card_h // 2 - fs(16)
        for line in (line1, line2):
            ImageDraw.Draw(img).text(
                (w // 2, cy), line, font=lf, fill=(*CREAM, 255), anchor="mm"
            )
            cy += fs(32)
    else:
        lf = load_font("Inter-Bold.ttf", fs(44 if tall else 40))
        cy = y + fs(52)
        for line in (line1, line2):
            ImageDraw.Draw(img).text(
                (w // 2, cy), line, font=lf, fill=(*CREAM, 255), anchor="mm"
            )
            cy += fs(56)
        # small supporting
        sf = load_font("Orbitron-Bold.ttf", fs(18))
        ImageDraw.Draw(img).text(
            (w // 2, y + card_h - fs(36)),
            "HIT · SHIT  ·  COURT COMING",
            font=sf,
            fill=(*DIM, 255),
            anchor="mm",
        )
    y += card_h + fs(32 if not wide else 18)

    # three chips
    if not wide:
        chip_w = int((w - pad * 2 - fs(24)) / 3)
        chip_h = fs(150 if tall else 136)
        gap = fs(12)
        total = chip_w * 3 + gap * 2
        x0 = (w - total) // 2 + chip_w // 2
        specs = [
            ("1f50d", "FIND", "CT handles"),
            ("1f4b0", "2.5K", "scout pay"),
            ("1f451", "LAND", "10k+ KOLs"),
        ]
        for i, (cp, lab, sub) in enumerate(specs):
            chip(img, x0 + i * (chip_w + gap), y + chip_h // 2, chip_w, chip_h, cp, lab, sub)
        y += chip_h + fs(36)
    else:
        # compact horizontal labels
        specs = [("1f50d", "FIND"), ("1f4b0", "2.5K"), ("1f451", "LAND")]
        gap = fs(40)
        icons = []
        for cp, lab in specs:
            em = load_emoji(cp)
            if em:
                icons.append((em, lab))
        if icons:
            row_w = sum(fs(70) for _ in icons) + gap * (len(icons) - 1)
            ix = w // 2 - row_w // 2
            of = load_font("Orbitron-Bold.ttf", fs(14))
            for em, lab in icons:
                paste_rgba(img, em, ix + fs(28), y + fs(16), size=fs(36), opacity=0.95)
                ImageDraw.Draw(img).text(
                    (ix + fs(28), y + fs(48)), lab, font=of, fill=(*MUTED, 255), anchor="mm"
                )
                ix += fs(70) + gap
            y += fs(70)

    # CTA
    cta = "tokenshit.com/kols"
    cf = load_font("Orbitron-Bold.ttf", fs(28 if not wide else 18))
    cta_w = tw(cf, cta) + fs(64)
    cta_h = fs(72 if not wide else 44)
    # keep CTA on canvas
    if y + cta_h > h - fs(70):
        y = h - fs(70) - cta_h
    cx0 = w // 2 - cta_w // 2
    # soft shadow
    sh = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle(
        (cx0, y + fs(4), cx0 + cta_w, y + cta_h + fs(4)),
        radius=cta_h // 2,
        fill=(0, 0, 0, 100),
    )
    sh = sh.filter(ImageFilter.GaussianBlur(6))
    img.alpha_composite(sh)
    draw = ImageDraw.Draw(img)
    rounded(draw, (cx0, y, cx0 + cta_w, y + cta_h), cta_h // 2, fill=(*NEON, 255))
    ImageDraw.Draw(img).text(
        (w // 2, y + cta_h // 2),
        cta,
        font=cf,
        fill=(0, 0, 0, 255),
        anchor="mm",
    )
    y += cta_h + fs(22)

    # footer
    if y < h - fs(50):
        ff = load_font("Orbitron-Bold.ttf", fs(16 if not wide else 12))
        ImageDraw.Draw(img).text(
            (w // 2, h - fs(36)),
            "FIND  ·  NOMINATE  ·  CASH OUT",
            font=ff,
            fill=(*DIM, 255),
            anchor="mm",
        )

    return img.convert("RGB")


def save(img: Image.Image, name: str, brand: str | None = None) -> Path:
    path = OUT / name
    img.save(path, "PNG", optimize=True)
    if brand:
        b = BRAND / brand
        shutil.copy(path, b)
        print("brand", b.name, img.size)
    print("wrote", path.name, img.size, path.stat().st_size)
    return path


def main() -> None:
    p45 = make_poster((1080, 1350), "45")
    save(p45, "kols-1080x1350.png", brand="kols-poster.png")
    save(p45, "kols-poster.png")
    save(
        p45.resize((2160, 2700), Image.Resampling.LANCZOS),
        "kols-poster@2x.png",
        brand="kols-poster@2x.png",
    )

    pst = make_poster((1080, 1920), "story")
    save(pst, "kols-story.png")
    save(pst, "kols-1080x1920.png")

    psq = make_poster((1080, 1080), "square")
    save(psq, "kols-1080.png")
    psq12 = make_poster((1200, 1200), "square12")
    save(psq12, "kols-1200.png")

    pog = make_poster((1200, 630), "og")
    save(pog, "kols-1200x630.png", brand="kols-banner.png")
    save(pog, "kols-og.png", brand="kols-og.png")
    save(
        pog.resize((2400, 1260), Image.Resampling.LANCZOS),
        "kols-banner@2x.png",
        brand="kols-banner@2x.png",
    )

    for src, dst in [
        (OUT / "kols-1080x1350.png", CACHE / "kols-poster.png"),
        (OUT / "kols-story.png", CACHE / "kols-story.png"),
        (OUT / "kols-1200.png", CACHE / "kols-square.png"),
        (OUT / "kols-1200x630.png", CACHE / "kols-banner.png"),
    ]:
        shutil.copy(src, dst)
        print("cache", dst.name)


if __name__ == "__main__":
    main()
