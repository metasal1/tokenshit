import { ImageResponse } from "next/og";
import { loadInter, loadMonoton } from "@/lib/og-font";
import { CREAM, GREEN, OG_BG, OG_SIZE, creamGlow, dollarGlow } from "@/lib/og-brand";
import { tursoExecute } from "@/lib/turso";
import { KOL_OG_ASSETS } from "@/lib/kol-og-assets";

export const runtime = "nodejs";
export const alt = "TOKEN$HIT Stats";
export const size = OG_SIZE;
export const contentType = "image/png";
export const revalidate = 300;

async function counts() {
  try {
    const [votes, devices, today] = await Promise.all([
      tursoExecute("SELECT COUNT(*) FROM votes", []),
      tursoExecute("SELECT COUNT(DISTINCT device_id) FROM votes", []),
      tursoExecute(
        "SELECT COUNT(*) FROM votes WHERE voted_at = date('now')",
        []
      ),
    ]);
    return {
      votes: Number(votes.rows[0]?.[0] ?? 0),
      devices: Number(devices.rows[0]?.[0] ?? 0),
      today: Number(today.rows[0]?.[0] ?? 0),
    };
  } catch {
    return { votes: 0, devices: 0, today: 0 };
  }
}

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("en-US");
}

export default async function Image() {
  const [monoton, inter, c] = await Promise.all([
    loadMonoton(),
    loadInter(),
    counts(),
  ]);
  const poop = KOL_OG_ASSETS.poop;
  const target = KOL_OG_ASSETS.target;
  const fire = KOL_OG_ASSETS.fire;

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
        {/* glows */}
        <div
          style={{
            position: "absolute",
            width: 520,
            height: 520,
            borderRadius: 999,
            background: "rgba(57,255,20,0.12)",
            top: -120,
            right: -80,
            filter: "blur(8px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 420,
            height: 420,
            borderRadius: 999,
            background: "rgba(240,192,64,0.1)",
            bottom: -100,
            left: -60,
          }}
        />

        {/* brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {poop ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={poop} width={44} height={44} alt="" />
          ) : null}
          <div
            style={{
              display: "flex",
              fontFamily: "Monoton",
              fontSize: 42,
              letterSpacing: 2,
            }}
          >
            <span style={{ color: CREAM, textShadow: creamGlow(true) }}>TOKEN</span>
            <span style={{ color: GREEN, textShadow: dollarGlow(true) }}>$</span>
            <span style={{ color: CREAM, textShadow: creamGlow(true) }}>HIT</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
            gap: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontFamily: "Monoton",
              fontSize: 96,
              color: CREAM,
              textShadow: creamGlow(true),
              letterSpacing: 4,
            }}
          >
            {target ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={target} width={72} height={72} alt="" />
            ) : null}
            STATS
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              color: "#a1a1aa",
              fontFamily: "Inter",
            }}
          >
            The numbers behind the shit
          </div>

          {/* KPI row */}
          <div style={{ display: "flex", gap: 18, marginTop: 12 }}>
            {[
              { label: "VOTES", value: fmt(c.votes), color: GREEN },
              { label: "VISITORS", value: fmt(c.devices), color: CREAM },
              { label: "TODAY", value: fmt(c.today), color: "#fbbf24" },
            ].map((k) => (
              <div
                key={k.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  padding: "18px 22px",
                  borderRadius: 18,
                  border: "2px solid rgba(57,255,20,0.35)",
                  background: "rgba(18,18,26,0.9)",
                  minWidth: 200,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: 14,
                    color: "#71717a",
                    letterSpacing: 2,
                    fontFamily: "Inter",
                  }}
                >
                  {k.label}
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: 44,
                    fontWeight: 800,
                    color: k.color,
                    fontFamily: "Inter",
                  }}
                >
                  {k.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#52525b", fontSize: 22 }}>
            {fire ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fire} width={28} height={28} alt="" />
            ) : null}
            tokenshit.com/stats
          </div>
          <div style={{ display: "flex", color: GREEN, fontSize: 20 }}>
            HIT · SHIT · SHARE
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
          "public, max-age=120, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
