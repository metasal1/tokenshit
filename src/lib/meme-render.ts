/**
 * Canvas meme renderer for TOKENSHIT — Monoton + cream/gold glow captions.
 * Templates/blanks from https://memes.sal.fun/api
 */

export type MemeBox = {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  style?: "impact" | "plain" | "monoton";
  align?: "center" | "left" | "right";
  fontScale?: number;
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

export const MEMES_API = "https://memes.sal.fun";

const MONOTON_STACK =
  'Monoton, "Monoton Regular", cursive, system-ui, sans-serif';

/** Brand caption colors (BRAND.md) */
const CREAM = "#fff8e7";
const GOLD = "#f0c040";
const NEON = "#39ff14";

export async function ensureMonotonFont(): Promise<void> {
  if (typeof document === "undefined") return;
  try {
    // Prefer site font if already loaded via next/font
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
    /* fall back to system stack */
  }
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
  fontScale: number
): number {
  // Monoton is wide — slightly smaller base than Impact
  let size = Math.min(maxH * 0.48, maxW * 0.16, 100) * fontScale;
  const min = 14;
  while (size > min) {
    ctx.font = `400 ${size}px ${MONOTON_STACK}`;
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
  const size = fitFontSize(ctx, t, w, h, fontScale);
  ctx.font = `400 ${size}px ${MONOTON_STACK}`;
  ctx.textBaseline = "middle";
  const align = box.align || "center";
  ctx.textAlign = align;

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
    ctx.save();
    ctx.lineJoin = "round";
    ctx.miterLimit = 2;

    // Outer gold glow (brand wordmarkGlow)
    ctx.shadowColor = GOLD;
    ctx.shadowBlur = Math.max(12, size * 0.45);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = CREAM;
    ctx.fillText(line, cx, cy, w * 0.96);

    // Second pass tighter neon-ish halo on $ vibe
    ctx.shadowColor = "rgba(57, 255, 20, 0.35)";
    ctx.shadowBlur = Math.max(6, size * 0.22);
    ctx.fillStyle = CREAM;
    ctx.fillText(line, cx, cy, w * 0.96);

    // Crisp cream fill + subtle dark edge for legibility
    ctx.shadowBlur = 0;
    ctx.lineWidth = Math.max(2, size * 0.06);
    ctx.strokeStyle = "rgba(0,0,0,0.55)";
    ctx.strokeText(line, cx, cy, w * 0.96);
    ctx.fillStyle = CREAM;
    ctx.fillText(line, cx, cy, w * 0.96);

    ctx.restore();
    cy += lineH;
  }
}

const LOGO_MARK_SRC = "/brand/logo-mark.png";
/** Cache logo between renders in the same session */
let logoMarkPromise: Promise<HTMLImageElement> | null = null;

function loadLogoMark(): Promise<HTMLImageElement> {
  if (!logoMarkPromise) {
    logoMarkPromise = loadImage(LOGO_MARK_SRC).catch((err) => {
      logoMarkPromise = null;
      throw err;
    });
  }
  return logoMarkPromise;
}

/**
 * TOKENSHIT logo watermark (bottom-right) + site handle (bottom-left).
 * Always on when brand is enabled — logo is required on every meme.
 */
async function drawWatermark(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
) {
  ctx.save();

  // Text brand strip — bottom left
  const corner = Math.max(11, Math.round(Math.min(w, h) * 0.022));
  ctx.font = `600 ${corner}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  ctx.fillStyle = "rgba(255,255,255,0.28)";
  ctx.strokeStyle = "rgba(0,0,0,0.28)";
  ctx.lineWidth = 1.5;
  ctx.strokeText("tokenshit.com/memes", 10, h - 8);
  ctx.fillText("tokenshit.com/memes", 10, h - 8);
  ctx.font = `500 ${Math.max(9, corner - 2)}px system-ui, sans-serif`;
  ctx.fillStyle = "rgba(57,255,20,0.4)";
  ctx.fillText("@Tokenshit_", 10, h - 8 - corner - 2);

  // Logo mark — bottom right (required)
  try {
    const logo = await loadLogoMark();
    const target = Math.max(36, Math.round(Math.min(w, h) * 0.12));
    const pad = Math.max(8, Math.round(Math.min(w, h) * 0.02));
    const lw = target;
    const lh = target * (logo.naturalHeight / Math.max(1, logo.naturalWidth));
    const x = w - lw - pad;
    const y = h - lh - pad;

    // Soft plate so logo reads on busy memes
    const platePad = Math.round(target * 0.12);
    ctx.fillStyle = "rgba(0,0,0,0.38)";
    const pr = Math.max(6, Math.round(target * 0.14));
    roundRect(
      ctx,
      x - platePad,
      y - platePad,
      lw + platePad * 2,
      lh + platePad * 2,
      pr
    );
    ctx.fill();

    ctx.globalAlpha = 0.92;
    ctx.drawImage(logo, x, y, lw, lh);
    ctx.globalAlpha = 1;
  } catch {
    // Fallback wordmark if logo fails to load
    ctx.font = `700 ${Math.max(14, Math.round(Math.min(w, h) * 0.04))}px system-ui, sans-serif`;
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "rgba(57,255,20,0.85)";
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.lineWidth = 2;
    const label = "TOKEN$HIT";
    ctx.strokeText(label, w - 10, h - 10);
    ctx.fillText(label, w - 10, h - 10);
  }

  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
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
        style: "monoton",
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
        style: "monoton",
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
        style: "monoton",
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
      style: "monoton",
      align: "center",
      fontScale: 1,
    });
  }
  return boxes;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load blank`));
    img.src = url;
  });
}

/** Prefer CORS proxy for non-sal.fun blanks */
export function blankSrc(url: string): string {
  if (!url) return url;
  if (url.startsWith("data:") || url.startsWith("blob:")) return url;
  try {
    const u = new URL(url);
    if (
      u.hostname === "memes.sal.fun" ||
      u.hostname.endsWith(".sal.fun") ||
      u.hostname === "tokenshit.com"
    ) {
      return url;
    }
    return `/api/memes/blank?url=${encodeURIComponent(url)}`;
  } catch {
    return url;
  }
}

export async function renderTokenshitMeme(
  blankUrl: string,
  boxes: MemeBox[],
  texts: string[],
  _opts?: { brand?: boolean }
): Promise<string> {
  await ensureMonotonFont();
  const img = await loadImage(blankSrc(blankUrl));
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unsupported");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  boxes.forEach((box, i) => {
    drawMonotonBox(ctx, box, texts[i] || "", canvas.width, canvas.height);
  });
  // TOKENSHIT logo watermark is mandatory on every meme export
  await drawWatermark(ctx, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}
