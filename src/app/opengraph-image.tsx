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

export const runtime = "nodejs";
export const alt = `${BRAND.nameDisplay} — ${BRAND.tagline}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OGImage() {
  const [monoton, inter] = await Promise.all([loadMonoton(), loadInter()]);
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
        }}
      >
        {/* subtle neon wash — no chrome box */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 70% 55% at 50% 42%, rgba(57,255,20,0.08) 0%, transparent 65%), radial-gradient(ellipse 50% 40% at 50% 55%, rgba(240,192,64,0.06) 0%, transparent 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            fontFamily: "Monoton",
            fontSize: 148,
            display: "flex",
            alignItems: "baseline",
            letterSpacing: "0.02em",
            lineHeight: 1,
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
            fontSize: 28,
            marginTop: 36,
            fontFamily: bodyFont,
            letterSpacing: "0.01em",
            fontWeight: 400,
            maxWidth: 900,
            textAlign: "center",
          }}
        >
          {TAGLINE}
        </p>
        <p
          style={{
            color: DIM,
            fontSize: 20,
            marginTop: 28,
            fontFamily: bodyFont,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
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
