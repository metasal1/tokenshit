/**
 * Canvas meme renderer for TOKENSHIT — Monoton light/dark captions.
 * Templates from https://memes.sal.fun/api
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

const CREAM = "#fff8e7";
const GOLD = "#f0c040";
const DARK = "#0a0a0f";

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
  const dark = isDarkStyle(box.style);

  ctx.save();
  // Ensure no accidental mirror transforms
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.font = `400 ${size}px ${MONOTON_STACK}`;
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

    if (dark) {
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

function drawWatermark(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  const corner = Math.max(11, Math.round(Math.min(w, h) * 0.022));
  ctx.font = `600 ${corner}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.strokeStyle = "rgba(0,0,0,0.18)";
  ctx.lineWidth = 1;
  ctx.strokeText("tokenshit.com/memes", 8, h - 6);
  ctx.fillText("tokenshit.com/memes", 8, h - 6);
  ctx.font = `500 ${Math.max(9, corner - 2)}px system-ui, sans-serif`;
  ctx.fillStyle = "rgba(57,255,20,0.28)";
  ctx.fillText("@Tokenshit_", 8, h - 6 - corner - 2);
  ctx.restore();
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
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load blank`));
    img.src = url;
  });
}

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
  opts?: { brand?: boolean }
): Promise<string> {
  await ensureMonotonFont();
  const img = await loadImage(blankSrc(blankUrl));
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unsupported");
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  boxes.forEach((box, i) => {
    drawMonotonBox(ctx, box, texts[i] || "", canvas.width, canvas.height);
  });
  if (opts?.brand !== false) drawWatermark(ctx, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}

export async function renderTokenshitMemeBlob(
  blankUrl: string,
  boxes: MemeBox[],
  texts: string[],
  opts?: { brand?: boolean }
): Promise<Blob> {
  const dataUrl = await renderTokenshitMeme(blankUrl, boxes, texts, opts);
  const res = await fetch(dataUrl);
  return res.blob();
}
