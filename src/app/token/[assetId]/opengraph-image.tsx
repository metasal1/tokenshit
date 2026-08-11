import { ImageResponse } from "next/og";
import { loadMonoton } from "@/lib/og-font";
import { extractMint, resolveAssetMeta } from "@/lib/resolveMeta";

export const runtime = "nodejs";
export const alt = "TOKENSHIT";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function formatPrice(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  if (n >= 1)
    return `$${n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  if (n >= 0.0001) return `$${n.toPrecision(4)}`;
  return `$${n.toExponential(2)}`;
}

function formatChange(n: number | null | undefined): string {
  if (n == null) return "";
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

async function toDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "TokenShitOG/1.0" },
    });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 32 || buf.length > 2_500_000) return null;
    let ct = res.headers.get("content-type") || "image/png";
    if (ct.includes("svg")) return null; // satori flaky with svg
    if (!ct.startsWith("image/")) ct = "image/png";
    return `data:${ct};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

async function jupiterPrice(mint: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://api.jup.ag/price/v3?ids=${encodeURIComponent(mint)}`,
      {
        headers: {
          "x-api-key":
            process.env.JUP_API_KEY || "3309da44-211b-4acb-9d31-c36fb54d9459",
        },
      }
    );
    if (!res.ok) return null;
    const d = await res.json();
    const p = d?.[mint]?.usdPrice ?? d?.data?.[mint]?.price;
    return typeof p === "number" ? p : p != null ? Number(p) : null;
  } catch {
    return null;
  }
}

export default async function OGImage({
  params,
}: {
  params: Promise<{ assetId: string }>;
}) {
  const { assetId } = await params;

  let name = assetId;
  let symbol = "";
  let logoUrl = "";
  let price: number | null = null;
  let change24h: number | null = null;
  let riskScore: number | null = null;
  let riskLabel = "";

  const display = await resolveAssetMeta(assetId);
  name = display.name;
  symbol = display.symbol;
  logoUrl = display.logo;

  const API_BASE = "https://api.tokens.xyz/v1";
  const API_KEY = process.env.TOKENS_XYZ_API_KEY || "";

  try {
    const res = await fetch(
      `${API_BASE}/assets/${encodeURIComponent(assetId)}?include=profile,risk`,
      {
        headers: { "x-api-key": API_KEY },
        next: { revalidate: 300 },
      }
    );
    if (res.ok) {
      const data = await res.json();
      const asset = data.asset || data;
      const stats = asset.stats || {};
      const includes = data.includes || {};
      const risk = includes.risk?.ok ? includes.risk.data : {};

      if (asset.name && asset.name !== assetId) name = asset.name;
      if (asset.symbol) symbol = asset.symbol;
      logoUrl =
        asset.imageUrl ||
        asset.primaryVariant?.market?.logoURI ||
        logoUrl ||
        "";
      price = stats.price ?? null;
      change24h = stats.priceChange24hPercent ?? null;
      riskScore = risk?.marketScore?.score ?? null;
      riskLabel = risk?.marketScore?.label || "";
      // Prefer resolved display over null Tokens names
      if (!name || name === assetId || name.startsWith("solana-")) {
        name = display.name;
        symbol = display.symbol || symbol;
        logoUrl = display.logo || logoUrl;
      }
    }
  } catch {
    /* use display meta */
  }

  const mint = extractMint(assetId);
  if (price == null && mint) {
    price = await jupiterPrice(mint);
  }

  // Don't show garbage score box for pump tokens with no data
  const showScore =
    riskScore != null &&
    riskLabel &&
    !/insufficient/i.test(riskLabel) &&
    riskScore > 0;

  const logoData = logoUrl ? await toDataUrl(logoUrl) : null;

  const scoreColor =
    riskScore != null
      ? riskScore >= 70
        ? "#4ade80"
        : riskScore >= 40
          ? "#facc15"
          : "#ef4444"
      : "#71717a";

  const changeColor =
    change24h != null ? (change24h >= 0 ? "#4ade80" : "#ef4444") : "#71717a";

  // Keep title readable on OG
  let title = name;
  if (title.length > 28) title = `${title.slice(0, 26)}…`;
  const monoSym = (symbol || "").slice(0, 12);

  const monoton = await loadMonoton();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(135deg, #0a0a12 0%, #111 50%, #0a0a12 100%)",
          fontFamily: "sans-serif",
          padding: "48px 64px",
        }}
      >
        {/* Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            marginBottom: 36,
            fontFamily: "Monoton",
            letterSpacing: "0.02em",
          }}
        >
          <span
            style={{
              fontSize: 48,
              color: "#fff8e7",
              textShadow: "0 0 6px #fff8e7, 0 0 16px #f0c040",
            }}
          >
            TOKEN
          </span>
          <span
            style={{
              fontSize: 48,
              color: "#39ff14",
              textShadow: "0 0 6px #39ff14, 0 0 16px #39ff14, 0 0 32px #0fa",
            }}
          >
            $
          </span>
          <span
            style={{
              fontSize: 48,
              color: "#fff8e7",
              textShadow: "0 0 6px #fff8e7, 0 0 16px #f0c040",
            }}
          >
            HIT
          </span>
        </div>

        {/* Main row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flex: 1,
            gap: 36,
          }}
        >
          {logoData ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoData}
              width={160}
              height={160}
              style={{
                borderRadius: "50%",
                background: "#1a1a2e",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: 160,
                height: 160,
                borderRadius: "50%",
                background: "#1a1a2e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 56,
                fontWeight: 900,
                color: "#39ff14",
                border: "3px solid #222",
              }}
            >
              {(monoSym || title).slice(0, 2).toUpperCase()}
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              minWidth: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: title.length > 14 ? 48 : 64,
                  fontWeight: 900,
                  color: "#fff",
                  lineHeight: 1.1,
                }}
              >
                {title}
              </span>
              {monoSym ? (
                <span
                  style={{
                    fontSize: 28,
                    color: "#a1a1aa",
                    fontWeight: 700,
                    fontFamily: "monospace",
                  }}
                >
                  ${monoSym}
                </span>
              ) : null}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 20,
                marginTop: 16,
              }}
            >
              <span
                style={{
                  fontSize: 48,
                  fontWeight: 800,
                  color: "#fff",
                  fontFamily: "monospace",
                }}
              >
                {formatPrice(price)}
              </span>
              {change24h != null && (
                <span
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: changeColor,
                    fontFamily: "monospace",
                  }}
                >
                  {formatChange(change24h)}
                </span>
              )}
            </div>

            <span
              style={{
                marginTop: 18,
                fontSize: 22,
                color: "#71717a",
              }}
            >
              Every token is shit until proven otherwise
            </span>
          </div>

          {showScore ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "20px 28px",
                borderRadius: 20,
                border: `3px solid ${scoreColor}`,
                background: "rgba(0,0,0,0.45)",
              }}
            >
              <span style={{ fontSize: 16, color: "#71717a", marginBottom: 4 }}>
                $HIT
              </span>
              <span
                style={{
                  fontSize: 52,
                  fontWeight: 900,
                  color: scoreColor,
                  fontFamily: "monospace",
                }}
              >
                {riskScore}
              </span>
              {riskLabel ? (
                <span style={{ fontSize: 14, color: scoreColor, marginTop: 4 }}>
                  {riskLabel}
                </span>
              ) : null}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "24px 28px",
                borderRadius: 20,
                border: "3px solid #39ff14",
                background: "rgba(57,255,20,0.08)",
              }}
            >
              <span
                style={{
                  fontSize: 42,
                  fontWeight: 900,
                  color: "#39ff14",
                }}
              >
                HIT?
              </span>
              <span style={{ fontSize: 16, color: "#a1a1aa", marginTop: 6 }}>
                Vote now
              </span>
            </div>
          )}
        </div>
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
