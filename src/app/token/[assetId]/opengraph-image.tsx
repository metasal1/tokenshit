import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "TokenShit";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const API_BASE = "https://api.tokens.xyz/v1";
const API_KEY = process.env.TOKENS_XYZ_API_KEY!;

function formatPrice(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1) return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (n >= 0.0001) return `$${n.toPrecision(4)}`;
  return `$${n.toExponential(2)}`;
}

function formatChange(n: number | null | undefined): string {
  if (n == null) return "";
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

export default async function OGImage({ params }: { params: Promise<{ assetId: string }> }) {
  const { assetId } = await params;

  let name = assetId;
  let symbol = "";
  let logo = "";
  let price: number | null = null;
  let change24h: number | null = null;
  let riskScore: number | null = null;
  let riskLabel = "";

  try {
    const res = await fetch(`${API_BASE}/assets/${encodeURIComponent(assetId)}?include=profile,risk`, {
      headers: { "x-api-key": API_KEY },
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const data = await res.json();
      const asset = data.asset || data;
      const stats = asset.stats || {};
      const includes = data.includes || {};
      const risk = includes.risk?.ok ? includes.risk.data : {};

      name = asset.name || assetId;
      symbol = asset.symbol || "";
      logo = asset.imageUrl || asset.primaryVariant?.market?.logoURI || "";
      price = stats.price ?? null;
      change24h = stats.priceChange24hPercent ?? null;
      riskScore = risk?.marketScore?.score ?? null;
      riskLabel = risk?.marketScore?.label || "";
    }
  } catch {}

  const scoreColor = riskScore != null
    ? riskScore >= 70 ? "#4ade80" : riskScore >= 40 ? "#facc15" : "#ef4444"
    : "#71717a";

  const changeColor = change24h != null
    ? change24h >= 0 ? "#4ade80" : "#ef4444"
    : "#71717a";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0a0a12 0%, #111 50%, #0a0a12 100%)",
          fontFamily: "sans-serif",
          padding: "60px 80px",
        }}
      >
        {/* Top bar — branding */}
        <div style={{ display: "flex", alignItems: "baseline", marginBottom: 40 }}>
          <span style={{ fontSize: 36, fontWeight: 900, color: "#fff8e7" }}>TOKEN</span>
          <span style={{ fontSize: 36, fontWeight: 900, color: "#39ff14", textShadow: "0 0 20px rgba(57,255,20,0.6)" }}>$</span>
          <span style={{ fontSize: 36, fontWeight: 900, color: "#fff8e7" }}>HIT</span>
          <span style={{ fontSize: 28, marginLeft: 10 }}>💩</span>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
          {/* Logo */}
          {logo ? (
            <img
              src={logo}
              width={140}
              height={140}
              style={{ borderRadius: "50%", background: "#1a1a2e", marginRight: 40 }}
            />
          ) : (
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: "50%",
                background: "#1a1a2e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 48,
                fontWeight: 900,
                color: "#555",
                marginRight: 40,
              }}
            >
              {symbol.slice(0, 2)}
            </div>
          )}

          {/* Info */}
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
              <span style={{ fontSize: 64, fontWeight: 900, color: "#fff" }}>{name}</span>
              <span style={{ fontSize: 32, color: "#71717a", fontWeight: 600 }}>{symbol}</span>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: 20, marginTop: 10 }}>
              <span style={{ fontSize: 52, fontWeight: 800, color: "#fff", fontFamily: "monospace" }}>
                {formatPrice(price)}
              </span>
              {change24h != null && (
                <span style={{ fontSize: 28, fontWeight: 700, color: changeColor, fontFamily: "monospace" }}>
                  {formatChange(change24h)}
                </span>
              )}
            </div>
          </div>

          {/* Risk score */}
          {riskScore != null && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "20px 30px",
                borderRadius: 20,
                border: `3px solid ${scoreColor}`,
                background: "rgba(0,0,0,0.4)",
              }}
            >
              <span style={{ fontSize: 18, color: "#71717a", marginBottom: 4 }}>Score</span>
              <span style={{ fontSize: 56, fontWeight: 900, color: scoreColor, fontFamily: "monospace" }}>
                {riskScore}
              </span>
              {riskLabel && (
                <span style={{ fontSize: 16, color: scoreColor, marginTop: 4 }}>{riskLabel}</span>
              )}
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
