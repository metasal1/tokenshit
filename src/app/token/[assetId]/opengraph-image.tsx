import { ImageResponse } from "next/og";
import { loadInter, loadMonoton } from "@/lib/og-font";
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
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; TokenShitOG/1.0; +https://tokenshit.com)",
        Accept: "image/*,*/*",
      },
      redirect: "follow",
    });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 64 || buf.length > 3_000_000) return null;
    // reject HTML/error bodies
    const head = buf.subarray(0, 16).toString("utf8");
    if (head.includes("<!DOCTYPE") || head.includes("<html")) return null;

    let ct = (res.headers.get("content-type") || "").split(";")[0].trim();
    // sniff
    if (buf[0] === 0x89 && buf[1] === 0x50) ct = "image/png";
    else if (buf[0] === 0xff && buf[1] === 0xd8) ct = "image/jpeg";
    else if (buf[0] === 0x52 && buf[1] === 0x49) ct = "image/webp"; // RIFF
    else if (buf[0] === 0x3c) return null; // <svg or xml
    if (!ct.startsWith("image/")) ct = "image/png";
    return `data:${ct};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

async function firstLogo(urls: string[]): Promise<string | null> {
  for (const u of urls) {
    if (!u) continue;
    const d = await toDataUrl(u);
    if (d) return d;
  }
  return null;
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

  const display = await resolveAssetMeta(assetId);
  let name = display.name;
  let symbol = display.symbol;
  let price: number | null = null;
  let change24h: number | null = null;
  let riskScore: number | null = null;
  let riskLabel = "";

  const logoUrls: string[] = [
    ...(display.logoCandidates || []),
    display.logo,
  ].filter(Boolean);

  const mint = extractMint(assetId);
  if (mint) {
    logoUrls.unshift(
      `https://dd.dexscreener.com/ds-data/tokens/solana/${mint}.png`
    );
  }

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

      if (asset.name && asset.name !== assetId && !String(asset.name).startsWith("solana-")) {
        name = asset.name;
      }
      if (asset.symbol) symbol = asset.symbol;
      const tLogo =
        asset.imageUrl || asset.primaryVariant?.market?.logoURI || "";
      if (tLogo) logoUrls.push(tLogo);
      price = stats.price ?? null;
      change24h = stats.priceChange24hPercent ?? null;
      riskScore = risk?.marketScore?.score ?? null;
      riskLabel = risk?.marketScore?.label || "";
    }
  } catch {
    /* display meta */
  }

  if (price == null && mint) price = await jupiterPrice(mint);

  const showScore =
    riskScore != null &&
    riskLabel &&
    !/insufficient/i.test(riskLabel) &&
    riskScore > 0;

  const logoData = await firstLogo([...new Set(logoUrls)]);

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

  let title = name;
  if (title.length > 22) title = `${title.slice(0, 20)}…`;
  const monoSym = (symbol || "").slice(0, 12);

  const [monoton, inter] = await Promise.all([loadMonoton(), loadInter()]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(135deg, #0a0a12 0%, #111118 45%, #0a0a12 100%)",
          fontFamily: "Inter",
          padding: "48px 64px",
        }}
      >
        {/* Brand — Monoton only here */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            marginBottom: 40,
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

        <div
          style={{
            display: "flex",
            alignItems: "center",
            flex: 1,
            gap: 40,
          }}
        >
          {logoData ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoData}
              width={168}
              height={168}
              style={{
                borderRadius: "50%",
                background: "#1a1a2e",
                objectFit: "cover",
                border: "3px solid #222",
              }}
            />
          ) : (
            <div
              style={{
                width: 168,
                height: 168,
                borderRadius: "50%",
                background: "#1a1a2e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 56,
                fontWeight: 700,
                color: "#39ff14",
                border: "3px solid #222",
                fontFamily: "Inter",
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
              fontFamily: "Inter",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 16,
              }}
            >
              <span
                style={{
                  fontSize: title.length > 12 ? 52 : 64,
                  fontWeight: 700,
                  color: "#ffffff",
                  lineHeight: 1.1,
                  fontFamily: "Inter",
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
                    fontFamily: "Inter",
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
                marginTop: 18,
              }}
            >
              <span
                style={{
                  fontSize: 48,
                  fontWeight: 700,
                  color: "#ffffff",
                  fontFamily: "Inter",
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
                    fontFamily: "Inter",
                  }}
                >
                  {formatChange(change24h)}
                </span>
              )}
            </div>

            <span
              style={{
                marginTop: 20,
                fontSize: 22,
                color: "#71717a",
                fontFamily: "Inter",
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
                fontFamily: "Inter",
              }}
            >
              <span style={{ fontSize: 16, color: "#71717a", marginBottom: 4 }}>
                $HIT
              </span>
              <span
                style={{
                  fontSize: 52,
                  fontWeight: 700,
                  color: scoreColor,
                  fontFamily: "Inter",
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
                fontFamily: "Inter",
              }}
            >
              <span
                style={{
                  fontSize: 40,
                  fontWeight: 700,
                  color: "#39ff14",
                  fontFamily: "Inter",
                }}
              >
                HIT?
              </span>
              <span
                style={{
                  fontSize: 16,
                  color: "#a1a1aa",
                  marginTop: 6,
                  fontFamily: "Inter",
                }}
              >
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
        { name: "Monoton", data: monoton, style: "normal", weight: 400 },
        { name: "Inter", data: inter.regular, style: "normal", weight: 400 },
        { name: "Inter", data: inter.bold, style: "normal", weight: 700 },
      ],
    }
  );
}
