import { ImageResponse } from "next/og";
import { loadInter, loadMonoton } from "@/lib/og-font";
import {
  CREAM,
  DIM,
  GREEN,
  MUTED,
  OG_BG,
  OG_SIZE,
  TAGLINE,
  creamGlow,
  dollarGlow,
} from "@/lib/og-brand";
import { BRAND } from "@/lib/brand";
import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const alt = `${BRAND.nameDisplay} — ${BRAND.tagline}`;
export const size = OG_SIZE;
export const contentType = "image/png";

/** Scattered brand icons — emoji + optional $ mark stamps */
const SCATTER: {
  emoji: string;
  x: number;
  y: number;
  size: number;
  rotate: number;
  opacity: number;
}[] = [
  { emoji: "🎯", x: 72, y: 78, size: 52, rotate: -18, opacity: 0.92 },
  { emoji: "💀", x: 1040, y: 90, size: 48, rotate: 14, opacity: 0.9 },
  { emoji: "💩", x: 90, y: 480, size: 44, rotate: 10, opacity: 0.85 },
  { emoji: "🚀", x: 1050, y: 470, size: 50, rotate: -12, opacity: 0.9 },
  { emoji: "💎", x: 180, y: 160, size: 36, rotate: 8, opacity: 0.75 },
  { emoji: "🔥", x: 980, y: 180, size: 38, rotate: -8, opacity: 0.8 },
  { emoji: "⚡", x: 140, y: 360, size: 34, rotate: -22, opacity: 0.7 },
  { emoji: "🏆", x: 1000, y: 340, size: 36, rotate: 16, opacity: 0.75 },
  { emoji: "🟩", x: 250, y: 520, size: 28, rotate: 0, opacity: 0.55 },
  { emoji: "🔻", x: 880, y: 520, size: 28, rotate: 0, opacity: 0.55 },
  { emoji: "✨", x: 320, y: 100, size: 30, rotate: 0, opacity: 0.7 },
  { emoji: "☠️", x: 860, y: 100, size: 32, rotate: 20, opacity: 0.7 },
  { emoji: "🤑", x: 60, y: 280, size: 40, rotate: -6, opacity: 0.8 },
  { emoji: "📉", x: 1080, y: 280, size: 36, rotate: 8, opacity: 0.75 },
  { emoji: "🪙", x: 400, y: 70, size: 34, rotate: -10, opacity: 0.65 },
  { emoji: "🎲", x: 760, y: 70, size: 34, rotate: 12, opacity: 0.65 },
  { emoji: "💸", x: 420, y: 540, size: 38, rotate: -4, opacity: 0.7 },
  { emoji: "🤡", x: 740, y: 540, size: 36, rotate: 6, opacity: 0.7 },
];

async function loadMarkDataUrl(): Promise<string | null> {
  try {
    const p = path.join(process.cwd(), "public/brand/logo-mark.png");
    const buf = await readFile(p);
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function OGImage() {
  const [monoton, inter, mark] = await Promise.all([
    loadMonoton(),
    loadInter(),
    loadMarkDataUrl(),
  ]);
  const bodyFont = inter ? "Inter" : "sans-serif";
  const fonts: {
    name: string;
    data: ArrayBuffer;
    style: "normal";
    weight: 400 | 700;
  }[] = [{ name: "Monoton", data: monoton, style: "normal", weight: 400 }];
  if (inter) {
    fonts.push(
      { name: "Inter", data: inter.regular, style: "normal", weight: 400 },
      { name: "Inter", data: inter.bold, style: "normal", weight: 700 }
    );
  }

  /** Green $ mark stamps around edges */
  const dollarStamps = [
    { x: 200, y: 40, s: 56, r: -25, o: 0.35 },
    { x: 920, y: 50, s: 52, r: 20, o: 0.32 },
    { x: 40, y: 200, s: 48, r: 15, o: 0.28 },
    { x: 1100, y: 200, s: 48, r: -18, o: 0.28 },
    { x: 220, y: 560, s: 50, r: 12, o: 0.3 },
    { x: 900, y: 550, s: 54, r: -15, o: 0.3 },
    { x: 560, y: 30, s: 40, r: 5, o: 0.22 },
    { x: 560, y: 580, s: 40, r: -5, o: 0.22 },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: OG_BG,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* neon washes */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 70% 55% at 50% 42%, rgba(57,255,20,0.09) 0%, transparent 65%), radial-gradient(ellipse 50% 40% at 50% 55%, rgba(240,192,64,0.07) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* scattered emoji icons */}
        {SCATTER.map((s, i) => (
          <div
            key={`e-${i}`}
            style={{
              position: "absolute",
              left: s.x,
              top: s.y,
              fontSize: s.size,
              opacity: s.opacity,
              transform: `rotate(${s.rotate}deg)`,
              display: "flex",
              lineHeight: 1,
            }}
          >
            {s.emoji}
          </div>
        ))}

        {/* green $ monogram stamps (image if available) */}
        {mark
          ? dollarStamps.map((d, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`m-${i}`}
                src={mark}
                width={d.s}
                height={d.s}
                style={{
                  position: "absolute",
                  left: d.x,
                  top: d.y,
                  opacity: d.o,
                  transform: `rotate(${d.r}deg)`,
                  objectFit: "contain",
                }}
              />
            ))
          : dollarStamps.map((d, i) => (
              <div
                key={`d-${i}`}
                style={{
                  position: "absolute",
                  left: d.x,
                  top: d.y,
                  fontFamily: "Monoton",
                  fontSize: d.s,
                  color: GREEN,
                  opacity: d.o,
                  transform: `rotate(${d.r}deg)`,
                  display: "flex",
                  textShadow: dollarGlow(false),
                }}
              >
                $
              </div>
            ))}

        {/* center lockup — bare, brand guide */}
        <div
          style={{
            fontFamily: "Monoton",
            fontSize: 140,
            display: "flex",
            alignItems: "baseline",
            letterSpacing: "0.02em",
            lineHeight: 1,
            zIndex: 2,
          }}
        >
          <span style={{ color: CREAM, textShadow: creamGlow(true) }}>
            TOKEN
          </span>
          <span style={{ color: GREEN, textShadow: dollarGlow(true) }}>$</span>
          <span style={{ color: CREAM, textShadow: creamGlow(true) }}>HIT</span>
        </div>
        <p
          style={{
            color: MUTED,
            fontSize: 26,
            marginTop: 32,
            fontFamily: bodyFont,
            letterSpacing: "0.01em",
            fontWeight: 400,
            maxWidth: 860,
            textAlign: "center",
            zIndex: 2,
          }}
        >
          {TAGLINE}
        </p>
        <p
          style={{
            color: DIM,
            fontSize: 18,
            marginTop: 22,
            fontFamily: bodyFont,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            zIndex: 2,
          }}
        >
          tokenshit.com · ${BRAND.ticker}
        </p>
      </div>
    ),
    {
      ...size,
      fonts,
    }
  );
}
