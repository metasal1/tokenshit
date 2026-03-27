import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "TokenShit — Every token is shit until proven otherwise";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
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
          background: "linear-gradient(135deg, #0a0a12 0%, #111 50%, #0a0a12 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 120,
            fontWeight: 900,
            display: "flex",
            alignItems: "baseline",
          }}
        >
          <span style={{ color: "#fff8e7", textShadow: "0 0 40px rgba(240,192,64,0.5)" }}>
            TOKEN
          </span>
          <span style={{ color: "#39ff14", textShadow: "0 0 60px rgba(57,255,20,0.8), 0 0 120px rgba(0,255,170,0.4)" }}>
            $
          </span>
          <span style={{ color: "#fff8e7", textShadow: "0 0 40px rgba(240,192,64,0.5)" }}>
            HIT
          </span>
          <span style={{ fontSize: 90, marginLeft: 20 }}>💩</span>
        </div>
        <p style={{ color: "#71717a", fontSize: 32, marginTop: 20 }}>
          Every token is shit until proven otherwise
        </p>
      </div>
    ),
    { ...size }
  );
}
