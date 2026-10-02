/**
 * Canvas meme renderer for TOKENSHIT — Monoton light/dark captions.
 * Templates from https://memes.sol.new/api
 */

export type MemeBox = {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** light = cream+glow (default); dark/plain = dark fill */
  style?: "impact" | "plain" | "monoton" | "light" | "dark";
  align?: "center" | "left" | "right";
  fontScale?: number;
  /** Caption face. Default Monoton. */
  font?: "monoton" | "impact";
};

export type MemeTemplate = {
  id: string;
  name: string;
  blank: string;
  blankRaw?: string;
  source?: string;
  face?: string;
  tag?: string;
  lines: number;
  featured?: boolean;
  keywords?: string[];
  boxes?: MemeBox[];
  editorUrl?: string;
};

export const MEMES_API = "https://memes.sol.new";

const MONOTON_STACK =
  'Monoton, "Monoton Regular", cursive, system-ui, sans-serif';
const IMPACT_STACK =
  'Impact, ImpactMeme, Haettenschweiler, "Arial Black", sans-serif';

const CREAM = "#fff8e7";
const GOLD = "#f0c040";
const DARK = "#0a0a0f";
const NEON = "#39ff14";
const ORBITRON_STACK = 'Orbitron, "Orbitron Bold", sans-serif';

export function isDarkStyle(style?: string): boolean {
  return style === "plain" || style === "dark";
}

export async function ensureMonotonFont(): Promise<void> {
  if (typeof document === "undefined") return;
  try {
    await document.fonts.load(`400 64px ${MONOTON_STACK}`);
    if (document.fonts.check(`400 64px Monoton`)) return;
  } catch {
    /* continue */
  }
  try {
    const face = new FontFace(
      "Monoton",
      "url(/brand/fonts/Monoton-Regular.ttf)",
      { weight: "400", style: "normal" }
    );
    const loaded = await face.load();
    document.fonts.add(loaded);
    await document.fonts.load(`400 64px Monoton`);
  } catch {
    /* fall back */
  }
}

export async function ensureImpactFont(): Promise<void> {
  if (typeof document === "undefined") return;
  try {
    if (document.fonts.check(`400 64px ImpactMeme`)) return;
  } catch {
    /* load */
  }
  try {
    const face = new FontFace(
      "ImpactMeme",
      "url(/brand/fonts/Anton-Regular.ttf)",
      { weight: "400", style: "normal" }
    );
    const loaded = await face.load();
    document.fonts.add(loaded);
    await document.fonts.load(`400 64px ImpactMeme`);
  } catch {
    /* fall back */
  }
}

export async function ensureOrbitronFont(): Promise<void> {
  if (typeof document === "undefined") return;
  try {
    if (document.fonts.check(`700 48px Orbitron`)) return;
  } catch {
    /* load */
  }
  try {
    const face = new FontFace(
      "Orbitron",
      "url(/brand/fonts/Orbitron-Bold.ttf)",
      { weight: "700", style: "normal" }
    );
    const loaded = await face.load();
    document.fonts.add(loaded);
    await document.fonts.load(`700 48px Orbitron`);
  } catch {
    /* fall back */
  }
}

function captionFontCss(size: number, font?: MemeBox["font"]): string {
  if (font === "impact") return `900 ${size}px ${IMPACT_STACK}`;
  return `400 ${size}px ${MONOTON_STACK}`;
}

export function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const raw = text.replace(/\r/g, "").trim();
  if (!raw) return [];
  const paragraphs = raw.split("\n");
  const out: string[] = [];
  for (const para of paragraphs) {
    const words = para.trim().split(/\s+/).filter(Boolean);
    if (!words.length) {
      out.push("");
      continue;
    }
    let cur = words[0]!;
    for (let i = 1; i < words.length; i++) {
      const test = `${cur} ${words[i]}`;
      if (ctx.measureText(test).width <= maxWidth) cur = test;
      else {
        out.push(cur);
        cur = words[i]!;
      }
    }
    out.push(cur);
  }
  return out;
}

export function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxW: number,
  maxH: number,
  fontScale: number,
  font?: MemeBox["font"]
): number {
  let size = Math.min(maxH * 0.48, maxW * 0.16, 100) * fontScale;
  const min = 14;
  while (size > min) {
    ctx.font = captionFontCss(size, font);
    const lines = wrapLines(ctx, text, maxW * 0.94);
    const lineH = size * 1.2;
    const totalH = Math.max(lineH, lines.length * lineH);
    const widest = Math.max(
      0,
      ...lines.map((l) => (l ? ctx.measureText(l).width : 0))
    );
    if (totalH <= maxH * 0.94 && widest <= maxW * 0.96) return size;
    size -= 1;
  }
  return min;
}

export function drawMonotonBox(
  ctx: CanvasRenderingContext2D,
  box: MemeBox,
  text: string,
  imgW: number,
  imgH: number
) {
  const t = text.trim().toUpperCase();
  if (!t) return;

  const x = box.x * imgW;
  const y = box.y * imgH;
  const w = Math.max(8, box.w * imgW);
  const h = Math.max(8, box.h * imgH);
  const fontScale = box.fontScale ?? 1;
  const size = fitFontSize(ctx, t, w, h, fontScale, box.font);
  const dark = isDarkStyle(box.style);

  ctx.save();
  // Ensure no accidental mirror transforms
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.font = captionFontCss(size, box.font);
  ctx.textBaseline = "middle";
  const align = box.align || "center";
  ctx.textAlign = align;
  ctx.direction = "ltr";

  const lines = wrapLines(ctx, t, w * 0.94);
  const lineH = size * 1.2;
  const blockH = lines.length * lineH;
  let cy = y + h / 2 - blockH / 2 + lineH / 2;
  const cx =
    align === "left"
      ? x + w * 0.05
      : align === "right"
        ? x + w * 0.95
        : x + w / 2;

  for (const line of lines) {
    if (!line) {
      cy += lineH;
      continue;
    }
    ctx.lineJoin = "round";
    ctx.miterLimit = 2;

    if (box.font === "impact") {
      ctx.shadowBlur = 0;
      ctx.lineWidth = Math.max(4, size * 0.12);
      ctx.strokeStyle = dark ? CREAM : "#000000";
      ctx.fillStyle = dark ? DARK : "#ffffff";
      ctx.strokeText(line, cx, cy, w * 0.96);
      ctx.fillText(line, cx, cy, w * 0.96);
    } else if (dark) {
      ctx.shadowBlur = 0;
      ctx.lineWidth = Math.max(1.5, size * 0.04);
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.fillStyle = DARK;
      ctx.strokeText(line, cx, cy, w * 0.96);
      ctx.fillText(line, cx, cy, w * 0.96);
    } else {
      ctx.shadowColor = GOLD;
      ctx.shadowBlur = Math.max(12, size * 0.45);
      ctx.fillStyle = CREAM;
      ctx.fillText(line, cx, cy, w * 0.96);

      ctx.shadowColor = "rgba(57, 255, 20, 0.35)";
      ctx.shadowBlur = Math.max(6, size * 0.22);
      ctx.fillText(line, cx, cy, w * 0.96);

      ctx.shadowBlur = 0;
      ctx.lineWidth = Math.max(2, size * 0.06);
      ctx.strokeStyle = "rgba(0,0,0,0.55)";
      ctx.strokeText(line, cx, cy, w * 0.96);
      ctx.fillStyle = CREAM;
      ctx.fillText(line, cx, cy, w * 0.96);
    }
    cy += lineH;
  }
  ctx.restore();
}

function markText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  align: CanvasTextAlign,
  baseline: CanvasTextBaseline
) {
  ctx.font = `500 ${size}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.lineWidth = Math.max(0.6, size * 0.06);
  ctx.strokeStyle = "rgba(0,0,0,0.18)";
  ctx.fillStyle = "rgba(255,255,255,0.28)";
  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);
}

function drawWatermark(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  username?: string | null
) {
  ctx.save();
  const size = Math.max(7, Math.round(Math.min(w, h) * 0.012));
  const pad = Math.max(5, Math.round(Math.min(w, h) * 0.01));
  markText(ctx, "tokenshit.com/memes", pad, h - pad, size, "left", "bottom");
  const handle = (username || "").trim();
  if (handle) {
    const label = handle.startsWith("@") ? handle : `@${handle}`;
    markText(ctx, label, w - pad, pad, size, "right", "top");
  }
  ctx.restore();
}

/** Thick cream/gold + neon-$ glow, same as .neon-text / .neon-dollar. Copy/download only. */
function glowStrokeRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  lineW: number,
  color: string,
  halo: string,
  layers: number[]
) {
  ctx.save();
  ctx.lineJoin = "round";
  ctx.strokeStyle = color;
  ctx.lineWidth = lineW;
  for (const blur of layers) {
    ctx.shadowColor = halo;
    ctx.shadowBlur = blur;
    ctx.strokeRect(x, y, w, h);
  }
  ctx.shadowBlur = 0;
  ctx.strokeRect(x, y, w, h);
  ctx.restore();
}

function glowFillText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fill: string,
  halo: string
) {
  ctx.save();
  ctx.fillStyle = fill;
  for (const blur of [11, 19, 40, 80]) {
    ctx.shadowColor = halo;
    ctx.shadowBlur = blur;
    ctx.fillText(text, x, y);
  }
  ctx.shadowBlur = 0;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function wrapCertifiedFrame(src: HTMLCanvasElement): HTMLCanvasElement {
  const w = src.width;
  const h = src.height;
  const m = Math.min(w, h);
  const pad = Math.max(32, Math.round(m * 0.06));
  const plaque = Math.max(40, Math.round(m * 0.08));
  const out = document.createElement("canvas");
  out.width = w + pad * 2;
  out.height = h + pad * 2 + plaque;
  const ctx = out.getContext("2d");
  if (!ctx) return src;

  ctx.fillStyle = DARK;
  ctx.fillRect(0, 0, out.width, out.height);

  const creamW = Math.max(12, Math.round(pad * 0.38));
  const creamX = creamW / 2;
  glowStrokeRect(
    ctx,
    creamX,
    creamX,
    out.width - creamW,
    out.height - creamW,
    creamW,
    CREAM,
    GOLD,
    [12, 28, 56, 90]
  );

  const neonW = Math.max(4, Math.round(pad * 0.14));
  const inset = creamW + neonW;
  glowStrokeRect(
    ctx,
    inset,
    inset,
    out.width - inset * 2,
    out.height - inset * 2,
    neonW,
    NEON,
    "#00ffaa",
    [8, 22, 48]
  );

  ctx.drawImage(src, pad, pad, w, h);

  const barY = pad + h + plaque * 0.2;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const certSize = Math.max(12, Math.round(plaque * 0.28));
  ctx.font = `700 ${certSize}px ${ORBITRON_STACK}`;
  glowFillText(ctx, "CERTIFIED", out.width / 2, barY, CREAM, GOLD);

  const lockSize = Math.max(18, Math.round(plaque * 0.44));
  ctx.font = `400 ${lockSize}px ${MONOTON_STACK}`;
  const token = "TOKEN";
  const hit = "HIT";
  const dollar = "$";
  const tw = ctx.measureText(token).width;
  const dw = ctx.measureText(dollar).width;
  const hw = ctx.measureText(hit).width;
  const total = tw + dw + hw;
  let x = (out.width - total) / 2;
  const ly = barY + plaque * 0.4;
  glowFillText(ctx, token, x + tw / 2, ly, CREAM, GOLD);
  x += tw;
  glowFillText(ctx, dollar, x + dw / 2, ly, NEON, "#00ffaa");
  x += dw;
  glowFillText(ctx, hit, x + hw / 2, ly, CREAM, GOLD);

  return out;
}

export function defaultBoxes(n: number): MemeBox[] {
  if (n <= 0) return [];
  if (n === 1) {
    return [
      {
        id: "caption",
        label: "Caption",
        x: 0.04,
        y: 0.76,
        w: 0.92,
        h: 0.2,
        style: "light",
        align: "center",
        fontScale: 1,
      },
    ];
  }
  if (n === 2) {
    return [
      {
        id: "top",
        label: "Top text",
        x: 0.04,
        y: 0.02,
        w: 0.92,
        h: 0.2,
        style: "light",
        align: "center",
        fontScale: 1,
      },
      {
        id: "bottom",
        label: "Bottom text",
        x: 0.04,
        y: 0.78,
        w: 0.92,
        h: 0.2,
        style: "light",
        align: "center",
        fontScale: 1,
      },
    ];
  }
  const boxes: MemeBox[] = [];
  for (let i = 0; i < n; i++) {
    const band = 0.9 / n;
    boxes.push({
      id: `line-${i + 1}`,
      label: `Line ${i + 1}`,
      x: 0.04,
      y: 0.04 + i * (0.92 / n),
      w: 0.92,
      h: band * 0.85,
      style: "light",
      align: "center",
      fontScale: 1,
    });
  }
  return boxes;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Same-origin proxy → CORS ok; needed for canvas export
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load blank`));
    img.src = url;
  });
}

/**
 * Always same-origin for canvas (memes.sol.new has no ACAO on images).
 * Mirrors memes.sol.new `proxiedBlank`.
 */
export function blankSrc(url: string): string {
  if (!url) return url;
  if (url.startsWith("data:") || url.startsWith("blob:")) return url;
  // already proxied
  if (url.startsWith("/api/memes/blank")) return url;
  // relative local
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  try {
    const u = new URL(url, "https://tokenshit.com");
    if (
      typeof window !== "undefined" &&
      u.origin === window.location.origin
    ) {
      return u.pathname + u.search;
    }
    if (u.hostname === "tokenshit.com" || u.hostname === "www.tokenshit.com") {
      return u.pathname + u.search;
    }
    return `/api/memes/blank?url=${encodeURIComponent(u.toString())}`;
  } catch {
    return `/api/memes/blank?url=${encodeURIComponent(url)}`;
  }
}

/** Alias used by studio open() — same as blankSrc */
export function proxiedBlank(url: string): string {
  return blankSrc(url);
}

export async function renderTokenshitMeme(
  blankUrl: string,
  boxes: MemeBox[],
  texts: string[],
  opts?: { brand?: boolean; username?: string | null; frame?: boolean }
): Promise<string> {
  const canvas = await renderTokenshitMemeCanvas(blankUrl, boxes, texts, opts);
  try {
    return canvas.toDataURL("image/png");
  } catch {
    throw new Error(
      "Canvas export blocked (CORS). Blank must be same-origin proxied."
    );
  }
}

async function renderTokenshitMemeCanvas(
  blankUrl: string,
  boxes: MemeBox[],
  texts: string[],
  opts?: { brand?: boolean; username?: string | null; frame?: boolean }
): Promise<HTMLCanvasElement> {
  await Promise.all([
    ensureMonotonFont(),
    ensureImpactFont(),
    opts?.frame ? ensureOrbitronFont() : Promise.resolve(),
  ]);
  const src = blankSrc(blankUrl);
  const img = await loadImage(src);
  const imgW = img.naturalWidth || img.width;
  const imgH = img.naturalHeight || img.height;
  let extraL = 0;
  let extraT = 0;
  let extraR = 0;
  let extraB = 0;
  for (const box of boxes) {
    extraL = Math.max(extraL, -box.x);
    extraT = Math.max(extraT, -box.y);
    extraR = Math.max(extraR, box.x + box.w - 1);
    extraB = Math.max(extraB, box.y + box.h - 1);
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(imgW * (1 + extraL + extraR)));
  canvas.height = Math.max(1, Math.round(imgH * (1 + extraT + extraB)));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unsupported");
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = DARK;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const ox = extraL * imgW;
  const oy = extraT * imgH;
  ctx.drawImage(img, ox, oy, imgW, imgH);
  ctx.save();
  ctx.translate(ox, oy);
  boxes.forEach((box, i) => {
    drawMonotonBox(ctx, box, texts[i] || "", imgW, imgH);
  });
  if (opts?.brand !== false) drawWatermark(ctx, imgW, imgH, opts?.username);
  ctx.restore();
  if (opts?.frame) return wrapCertifiedFrame(canvas);
  return canvas;
}

export async function renderTokenshitMemeBlob(
  blankUrl: string,
  boxes: MemeBox[],
  texts: string[],
  opts?: { brand?: boolean; username?: string | null; frame?: boolean }
): Promise<Blob> {
  const canvas = await renderTokenshitMemeCanvas(blankUrl, boxes, texts, {
    ...opts,
    frame: opts?.frame !== false,
  });
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/png")
  );
  if (blob && blob.size > 0) return blob;
  // fallback dataURL path
  const dataUrl = canvas.toDataURL("image/png");
  const res = await fetch(dataUrl);
  const b = await res.blob();
  if (b.type === "image/png") return b;
  return new Blob([await b.arrayBuffer()], { type: "image/png" });
}
