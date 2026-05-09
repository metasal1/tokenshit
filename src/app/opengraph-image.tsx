import { ImageResponse } from "next/og";
import { loadMonoton } from "@/lib/og-font";

export const runtime = "nodejs";
export const alt = "TokenShit — Every token is shit until proven otherwise";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const monoton = await loadMonoton();

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
        }}
      >
        <div
          style={{
            fontFamily: "Monoton",
            fontSize: 180,
            display: "flex",
            alignItems: "baseline",
            letterSpacing: "0.02em",
          }}
        >
          <span style={{ color: "#fff8e7", textShadow: "0 0 8px #fff8e7, 0 0 24px #fff8e7, 0 0 60px #f0c040, 0 0 100px #f0c040" }}>
            TOKEN
          </span>
          <span style={{ color: "#39ff14", textShadow: "0 0 8px #39ff14, 0 0 24px #39ff14, 0 0 60px #0fa, 0 0 120px #0fa" }}>
            $
          </span>
          <span style={{ color: "#fff8e7", textShadow: "0 0 8px #fff8e7, 0 0 24px #fff8e7, 0 0 60px #f0c040, 0 0 100px #f0c040" }}>
            HIT
          </span>
        </div>
        <p
          style={{
            color: "#a1a1aa",
            fontSize: 32,
            marginTop: 40,
            fontFamily: "sans-serif",
            letterSpacing: "0.02em",
          }}
        >
          Every token is shit until proven otherwise
        </p>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Monoton",
          data: monoton,
          style: "normal",
          weight: 400,
        },
      ],
    }
  );
}
