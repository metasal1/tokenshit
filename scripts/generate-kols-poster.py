#!/usr/bin/env python3
"""KOL court posters — brand emoji pack + Monoton/Orbitron. Never bare system emoji."""
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
AMBER = (251, 191, 36)

SCATTER = [
    "1f3af", "1f480", "1f4a9", "1f525", "1f4b0", "1f389", "1f680",
    "2728", "2b50", "1f3c6", "1f49a", "2705", "1f449", "1f4af",
    "1f31f", "1f48e", "1f911", "1f451", "1f440", "1f575",  # detective if available
]


def load_font(name: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONTS / name), size)


def text_w(font: ImageFont.ImageFont, text: str) -> int:
    bb = font.getbbox(text)
    return int(bb[2] - bb[0])


def text_h(font: ImageFont.ImageFont, text: str) -> int:
    bb = font.getbbox(text)
    return int(bb[3] - bb[1])


def load_emoji(cp: str) -> Image.Image | None:
    local = EMOJI_DIR / f"tw-{cp}.png"
    if local.exists():
        return Image.open(local).convert("RGBA")
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
    dest = EMOJI_DIR / f"tw-{cp}.png"
    url = f"https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/{cp}.png"
    try:
        urllib.request.urlretrieve(url, dest)
        return Image.open(dest).convert("RGBA")
    except Exception:
        return None


def paste_rgba(base: Image.Image, im: Image.Image, xy: tuple[int, int]) -> None:
    base.alpha_composite(im, xy)


def draw_glow_text(img: Image.Image, xy, text, font, fill, glow, glow_r=12):
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    x, y = xy
    for r in range(glow_r, 0, -2):
        a = int(40 * (r / glow_r))
        d.text((x, y), text, font=font, fill=(*glow, a))
    blurred = layer.filter(ImageFilter.GaussianBlur(radius=glow_r // 2 + 2))
    img.alpha_composite(blurred)
    ImageDraw.Draw(img).text((x, y), text, font=font, fill=fill)


def scatter_emojis(img: Image.Image, seed: str, n: int = 28) -> None:
    rng = random.Random(int(hashlib.sha256(seed.encode()).hexdigest()[:8], 16))
    w, h = img.size
    for _ in range(n):
        cp = rng.choice(SCATTER)
        em = load_emoji(cp)
        if not em:
            continue
        sz = rng.randint(int(w * 0.04), int(w * 0.09))
        em = em.resize((sz, sz), Image.Resampling.LANCZOS)
        # avoid center card
        for _try in range(20):
            x = rng.randint(0, w - sz)
            y = rng.randint(0, h - sz)
            cx, cy = x + sz // 2, y + sz // 2
            # keep top hero + center card clean
            if cy < h * 0.52 and abs(cx - w // 2) < w * 0.38:
                continue
            if h * 0.42 < cy < h * 0.78 and abs(cx - w // 2) < w * 0.42:
                continue
            break
        else:
            continue
        # fade
        a = em.split()[3].point(lambda p: int(p * rng.uniform(0.35, 0.85)))
        em.putalpha(a)
        paste_rgba(img, em, (x, y))


def rounded_rect(draw, box, r, fill, outline=None, width=2):
    draw.rounded_rectangle(box, radius=r, fill=fill, outline=outline, width=width)


def make_poster(size: tuple[int, int], tag: str) -> Image.Image:
    w, h = size
    img = Image.new("RGBA", (w, h), (*BG, 255))
    scatter_emojis(img, f"kols-{tag}-{w}x{h}", n=22 if w >= 1000 else 16)
    draw = ImageDraw.Draw(img)

    # scale
    s = w / 1080
    # Story (9:16): bump type so stack fills frame
    tall = h / max(w, 1) >= 1.6
    if tall:
        s *= 1.12
    fs = lambda n: max(12, int(n * s))

    mono_sm = load_font("Monoton-Regular.ttf", fs(56))
    mono_lg = load_font("Monoton-Regular.ttf", fs(128))
    mono_xl = load_font("Monoton-Regular.ttf", fs(148))
    orb = load_font("Orbitron-Bold.ttf", fs(30))
    orb_sm = load_font("Orbitron-Bold.ttf", fs(22))
    inter = load_font("Inter-Bold.ttf", fs(40))
    inter_sm = load_font("Inter-Regular.ttf", fs(28))

    # Taller stories: start content higher in upper-middle (less empty void)
    y = int(h * (0.10 if h / w > 1.5 else 0.06))

    # eyebrow
    eye = "COMING SOON  |  NOMINATIONS OPEN"
    ew = text_w(orb_sm, eye)
    draw.text(((w - ew) // 2, y), eye, font=orb_sm, fill=MUTED)
    y += fs(36)

    # TOKEN$HIT lockup
    t1, dol, t2 = "TOKEN", "$", "HIT"
    f = mono_sm
    total = text_w(f, t1) + text_w(f, dol) + text_w(f, t2)
    x0 = (w - total) // 2
    draw_glow_text(img, (x0, y), t1, f, CREAM, GOLD, glow_r=10)
    x0 += text_w(f, t1)
    draw_glow_text(img, (x0, y), dol, f, NEON, NEON, glow_r=14)
    x0 += text_w(f, dol)
    draw_glow_text(img, (x0, y), t2, f, CREAM, GOLD, glow_r=10)
    y += fs(88)

    # KOL$ hero
    k1, kd, k2 = "KOL", "$", ""
    # just KOL$ big
    hero = "KOL$"
    # draw KOL cream + $ neon
    f = mono_xl if h > w else mono_lg
    tw_k = text_w(f, "KOL")
    tw_d = text_w(f, "$")
    hx = (w - tw_k - tw_d) // 2
    draw_glow_text(img, (hx, y), "KOL", f, CREAM, GOLD, glow_r=18)
    draw_glow_text(img, (hx + tw_k, y), "$", f, NEON, NEON, glow_r=22)
    y += fs(160)

    # feature row: target skull crown
    feats = [("1f3af", "HIT"), ("1f480", "SHIT"), ("1f451", "CT")]
    gap = fs(28)
    icons = []
    for cp, lab in feats:
        em = load_emoji(cp)
        if em:
            icons.append((em.resize((fs(96), fs(96)), Image.Resampling.LANCZOS), lab))
    if icons:
        row_w = sum(im.width for im, _ in icons) + gap * (len(icons) - 1)
        ix = (w - row_w) // 2
        for im, lab in icons:
            paste_rgba(img, im, (ix, y))
            lw = text_w(orb_sm, lab)
            draw.text(
                (ix + (im.width - lw) // 2, y + im.height + fs(6)),
                lab,
                font=orb_sm,
                fill=MUTED,
            )
            ix += im.width + gap
        y += fs(96) + fs(48)

    # tagline card
    pad = int(w * 0.08)
    card_top = y + fs(10)
    lines = [
        "Every KOL is shit",
        "until proven otherwise.",
    ]
    sub = "Nominate CT voices  |  HIT or SHIT"
    card_h = fs(260)
    rounded_rect(
        draw,
        (pad, card_top, w - pad, card_top + card_h),
        fs(28),
        (*CARD, 240),
        outline=(*NEON, 80),
        width=max(2, fs(3)),
    )
    cy = card_top + fs(28)
    for line in lines:
        lf = inter
        lw = text_w(lf, line)
        draw.text(((w - lw) // 2, cy), line, font=lf, fill=CREAM)
        cy += fs(52)
    sw = text_w(orb_sm, sub)
    draw.text(((w - sw) // 2, cy + fs(8)), sub, font=orb_sm, fill=NEON)

    y = card_top + card_h + fs(36)

    # CTA pill
    cta = "tokenshit.com/kols"
    cf = orb
    cw = text_w(cf, cta) + fs(64)
    ch = fs(72)
    cx0 = (w - cw) // 2
    rounded_rect(
        draw,
        (cx0, y, cx0 + cw, y + ch),
        ch // 2,
        (*NEON, 255),
    )
    # black text on neon
    draw.text(
        (cx0 + (cw - text_w(cf, cta)) // 2, y + (ch - text_h(cf, cta)) // 2 - fs(2)),
        cta,
        font=cf,
        fill=(0, 0, 0),
    )
    y += ch + fs(28)

    # footer
    foot = "SCOUT  |  NOMINATE  |  RATE"
    fw = text_w(orb_sm, foot)
    draw.text(((w - fw) // 2, min(y, h - fs(50))), foot, font=orb_sm, fill=DIM)

    # bottom brand strip safe
    url2 = "TOKEN$HIT  |  CT KOL COURT"
    u2w = text_w(orb_sm, url2)
    draw.text(((w - u2w) // 2, h - fs(42)), url2, font=orb_sm, fill=DIM)

    # Center content vertically on very tall canvases (avoid empty bottom half)
    if tall:
        # find non-bg bounding content (approx upper 70%)
        # shift scatter stays; only nudge mid stack by redrawing is heavy —
        # paste a slight vertical bias: crop empty bottom and pad top equally
        px = img.load()
        bg = BG
        # find last non-near-bg row above footer zone
        last = h - fs(80)
        for yy in range(h - fs(100), int(h * 0.35), -1):
            row_has = False
            for xx in range(0, w, 8):
                c = px[xx, yy]
                if abs(c[0]-bg[0])>12 or abs(c[1]-bg[1])>12 or abs(c[2]-bg[2])>12:
                    row_has = True
                    break
            if row_has:
                last = yy
                break
        # if content ends early, add more scatter lower third only
        if last < h * 0.62:
            scatter_emojis(img, f"kols-fill-{tag}-{w}x{h}", n=18)
            # re-draw footer on top
            draw = ImageDraw.Draw(img)
            fw = text_w(orb_sm, foot)
            draw.text(((w - fw) // 2, h - fs(70)), foot, font=orb_sm, fill=DIM)
            draw.text(((w - u2w) // 2, h - fs(42)), url2, font=orb_sm, fill=DIM)

    return img.convert("RGB")


def save(img: Image.Image, name: str, brand: str | None = None) -> Path:
    path = OUT / name
    img.save(path, "PNG", optimize=True)
    if brand:
        b = BRAND / brand
        shutil.copy(path, b)
        print("brand", b, img.size)
    print("wrote", path, img.size, path.stat().st_size)
    return path


def main():
    cache = Path("/Volumes/PRO-G40/MacHome-Offload/dotfiles/hermes/cache/images")
    cache.mkdir(parents=True, exist_ok=True)

    # Match jup-like / hit-shit campaign sizes
    # 1) 4:5 feed poster 1080x1350
    p45 = make_poster((1080, 1350), "45")
    save(p45, "kols-1080x1350.png", brand="kols-poster.png")
    save(p45, "kols-poster.png")
    p45_2 = p45.resize((2160, 2700), Image.Resampling.LANCZOS)
    save(p45_2, "kols-poster@2x.png", brand="kols-poster@2x.png")

    # 2) Full story 1080x1920
    pst = make_poster((1080, 1920), "story")
    save(pst, "kols-story.png")
    save(pst, "kols-1080x1920.png")

    # 3) Square 1080 + 1200
    psq = make_poster((1080, 1080), "square")
    save(psq, "kols-1080.png")
    psq12 = make_poster((1200, 1200), "square12")
    save(psq12, "kols-1200.png")

    # 4) OG / X banner 1200x630
    pog = make_poster((1200, 630), "og")
    save(pog, "kols-1200x630.png", brand="kols-banner.png")
    save(pog, "kols-og.png", brand="kols-og.png")
    pog2 = pog.resize((2400, 1260), Image.Resampling.LANCZOS)
    save(pog2, "kols-banner@2x.png", brand="kols-banner@2x.png")

    for src, dst in [
        (OUT / "kols-1080x1350.png", cache / "kols-poster.png"),
        (OUT / "kols-story.png", cache / "kols-story.png"),
        (OUT / "kols-1200.png", cache / "kols-square.png"),
        (OUT / "kols-1200x630.png", cache / "kols-banner.png"),
    ]:
        shutil.copy(src, dst)
        print("cache", dst, Image.open(src).size)


if __name__ == "__main__":
    main()
