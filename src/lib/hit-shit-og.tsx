/**
 * HIT / SHIT Open Graph cards — ImageResponse (1200×630).
 * Icons match brand cursors (target / face), never bare system emoji.
 */
import { ImageResponse } from "next/og";
import { loadInter, loadMonoton } from "@/lib/og-font";
import {
  CREAM,
  GREEN,
  OG_BG,
  OG_SIZE,
  creamGlow,
  dollarGlow,
} from "@/lib/og-brand";
import { KOL_OG_ASSETS } from "@/lib/kol-og-assets";
import { BRAND } from "@/lib/brand";

export type HitShitSide = "hit" | "shit";

const SHIT = BRAND.colors.shit; // #f87171

/** Green target — HIT */
function HitIcon({ size = 280 }: { size?: number }) {
  const s = size;
  const c = s / 2;
  const stroke = Math.max(6, Math.round(s * 0.045));
  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      fill="none"
      style={{ display: "flex" }}
    >
      <circle
        cx={c}
        cy={c}
        r={c - stroke}
        stroke={GREEN}
        strokeWidth={stroke}
      />
      <circle
        cx={c}
        cy={c}
        r={c * 0.62}
        stroke={GREEN}
        strokeWidth={stroke * 0.85}
      />
      <circle cx={c} cy={c} r={c * 0.18} fill={GREEN} />
      {/* crosshair ticks */}
      <line
        x1={c}
        y1={stroke * 0.5}
        x2={c}
        y2={c * 0.28}
        stroke={GREEN}
        strokeWidth={stroke}
        strokeLinecap="round"
      />
      <line
        x1={c}
        y1={s - c * 0.28}
        x2={c}
        y2={s - stroke * 0.5}
        stroke={GREEN}
        strokeWidth={stroke}
        strokeLinecap="round"
      />
      <line
        x1={stroke * 0.5}
        y1={c}
        x2={c * 0.28}
        y2={c}
        stroke={GREEN}
        strokeWidth={stroke}
        strokeLinecap="round"
      />
      <line
        x1={s - c * 0.28}
        y1={c}
        x2={s - stroke * 0.5}
        y2={c}
        stroke={GREEN}
        strokeWidth={stroke}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Red face — SHIT */
function ShitIcon({ size = 280 }: { size?: number }) {
  const s = size;
  const c = s / 2;
  const stroke = Math.max(6, Math.round(s * 0.05));
  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      fill="none"
      style={{ display: "flex" }}
    >
      <circle
        cx={c}
        cy={c}
        r={c - stroke}
        stroke={SHIT}
        strokeWidth={stroke}
      />
      <circle cx={c * 0.72} cy={c * 0.85} r={s * 0.055} fill={SHIT} />
      <circle cx={c * 1.28} cy={c * 0.85} r={s * 0.055} fill={SHIT} />
      <path
        d={`M ${c * 0.62} ${c * 1.28} Q ${c} ${c * 1.55} ${c * 1.38} ${c * 1.28}`}
        stroke={SHIT}
        strokeWidth={stroke}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function Wordmark() {
  return (
    <div
      style={{
        display: "flex",
        fontFamily: "Monoton",
        fontSize: 40,
        letterSpacing: 2,
      }}
    >
      <span style={{ color: CREAM, textShadow: creamGlow(true) }}>TOKEN</span>
      <span style={{ color: GREEN, textShadow: dollarGlow(true) }}>$</span>
      <span style={{ color: CREAM, textShadow: creamGlow(true) }}>HIT</span>
    </div>
  );
}

export async function renderHitShitOg(side: HitShitSide): Promise<ImageResponse> {
  const [monoton, inter] = await Promise.all([loadMonoton(), loadInter()]);
  const isHit = side === "hit";
  const label = isHit ? "HIT" : "SHIT";
  const accent = isHit ? GREEN : SHIT;
  const glow = isHit
    ? "0 0 40px rgba(57,255,20,0.55), 0 0 100px rgba(57,255,20,0.25)"
    : "0 0 40px rgba(248,113,113,0.55), 0 0 100px rgba(248,113,113,0.25)";
  const sub = isHit
    ? "Green target · play the bull case"
    : "Red face · play the bear case";
  const cta = isHit ? "tokenshit.com/hit" : "tokenshit.com/shit";
  const sparkles = KOL_OG_ASSETS.sparkles;
  const mark = isHit ? KOL_OG_ASSETS.target : KOL_OG_ASSETS.fire;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: OG_BG,
          padding: 48,
          fontFamily: "Inter",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* side-colored glows */}
        <div
          style={{
            position: "absolute",
            width: 560,
            height: 560,
            borderRadius: 999,
            background: isHit
              ? "rgba(57,255,20,0.16)"
              : "rgba(248,113,113,0.14)",
            top: -140,
            right: -100,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 420,
            height: 420,
            borderRadius: 999,
            background: "rgba(240,192,64,0.08)",
            bottom: -120,
            left: -80,
          }}
        />

        {/* header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {sparkles ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={sparkles} width={40} height={40} alt="" />
            ) : null}
            <Wordmark />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 999,
              border: `2px solid ${accent}`,
              background: "rgba(18,18,26,0.9)",
              color: accent,
              fontSize: 18,
              fontFamily: "Inter",
              fontWeight: 700,
              letterSpacing: 2,
            }}
          >
            PLAY
          </div>
        </div>

        {/* body */}
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            gap: 56,
          }}
        >
          {/* icon card */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 340,
              height: 340,
              borderRadius: 40,
              border: `4px solid ${accent}`,
              background: "rgba(18,18,26,0.95)",
              boxShadow: glow,
            }}
          >
            {isHit ? <HitIcon size={240} /> : <ShitIcon size={240} />}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              maxWidth: 520,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                fontFamily: "Monoton",
                fontSize: 120,
                color: accent,
                textShadow: isHit ? creamGlow(true) : glow,
                letterSpacing: 6,
                lineHeight: 1,
              }}
            >
              {mark && !isHit ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mark} width={88} height={88} alt="" />
              ) : null}
              {label}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 28,
                color: "#a1a1aa",
                fontFamily: "Inter",
              }}
            >
              {sub}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 24,
                color: CREAM,
                fontFamily: "Inter",
                marginTop: 8,
              }}
            >
              HIT or SHIT · every hour · winners split the pot
            </div>
          </div>
        </div>

        {/* footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              color: accent,
              fontSize: 24,
              fontFamily: "Inter",
              fontWeight: 700,
            }}
          >
            {cta}
          </div>
          <div
            style={{
              display: "flex",
              color: "#52525b",
              fontSize: 20,
              fontFamily: "Inter",
            }}
          >
            @tokenshit_
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Monoton", data: monoton, weight: 400, style: "normal" as const },
        ...(inter
          ? [
              {
                name: "Inter",
                data: inter.regular,
                weight: 400 as const,
                style: "normal" as const,
              },
              {
                name: "Inter",
                data: inter.bold,
                weight: 700 as const,
                style: "normal" as const,
              },
            ]
          : []),
      ],
      headers: {
        "Cache-Control":
          "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
