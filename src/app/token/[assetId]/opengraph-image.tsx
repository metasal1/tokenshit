import { ImageResponse } from "next/og";
import { loadInter, loadMonoton } from "@/lib/og-font";
import { extractMint, resolveAssetMeta } from "@/lib/resolveMeta";

export const runtime = "nodejs";
export const alt = "TOKENSHIT";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Never scientific notation on OG */
function formatPrice(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1000) {
    return `${sign}$${abs.toLocaleString("en-US", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    })}`;
  }
  if (abs >= 1) {
    return `${sign}$${abs.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    })}`;
  }
  if (abs >= 0.0001) {
    return `${sign}$${abs.toFixed(6).replace(/\.?0+$/, "")}`;
  }
  // 3.73e-5 → 0.0000373
  const exp = Math.floor(Math.log10(abs));
  const decimals = Math.min(12, Math.max(6, -exp + 3));
  return `${sign}$${abs.toFixed(decimals).replace(/\.?0+$/, "")}`;
}

function formatChange(n: number | null | undefined): string {
  if (n == null) return "";
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

function looksLikeMintOrId(s: string): boolean {
  if (!s) return true;
  if (/^solana-/i.test(s)) return true;
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s)) return true;
  if (s.length > 28 && !/\s/.test(s)) return true;
  return false;
}

async function toDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; TokenShitOG/1.1; +https://tokenshit.com)",
        Accept: "image/*,*/*",
      },
      redirect: "follow",
    });
    if (!res.ok) return null;
    let buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 64 || buf.length > 3_000_000) return null;
    const head = buf.subarray(0, 16).toString("utf8");
    if (head.includes("<!DOCTYPE") || head.includes("<html")) return null;

    const isWebp = buf[0] === 0x52 && buf[1] === 0x49 && buf[8] === 0x57;
    const isPng = buf[0] === 0x89 && buf[1] === 0x50;
    const isJpeg = buf[0] === 0xff && buf[1] === 0xd8;
    if (isWebp || (!isPng && !isJpeg)) {
      try {
        const sharp = (await import("sharp")).default;
        buf = Buffer.from(await sharp(buf).resize(256, 256).png().toBuffer());
      } catch {
        if (!isPng && !isJpeg) return null;
      }
    }
    return `data:image/png;base64,${buf.toString("base64")}`;
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
      `https://lite-api.jup.ag/price/v3?ids=${encodeURIComponent(mint)}`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "TokenShitOG/1.1",
          ...(process.env.JUP_API_KEY
            ? { "x-api-key": process.env.JUP_API_KEY }
            : {}),
        },
      }
    );
    if (!res.ok) {
      // fallback api.jup.ag
      const r2 = await fetch(
        `https://api.jup.ag/price/v3?ids=${encodeURIComponent(mint)}`,
        {
          headers: {
            Accept: "application/json",
            ...(process.env.JUP_API_KEY
              ? { "x-api-key": process.env.JUP_API_KEY }
              : {}),
          },
        }
      );
      if (!r2.ok) return null;
      const d2 = await r2.json();
      const p2 = d2?.[mint]?.usdPrice ?? d2?.data?.[mint]?.price;
      return typeof p2 === "number" ? p2 : p2 != null ? Number(p2) : null;
    }
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
  const mint = extractMint(assetId);

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

  if (mint) {
    logoUrls.unshift(
      `https://dd.dexscreener.com/ds-data/tokens/solana/${mint}.png`,
      `https://cdn.jsdelivr.net/gh/solana-labs/token-list@main/assets/mainnet/${mint}/logo.png`
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

      const n = (asset.name || asset.profile?.name || "").trim();
      if (n && !looksLikeMintOrId(n)) name = n;
      const s = (asset.symbol || asset.profile?.symbol || "").trim();
      if (s && !looksLikeMintOrId(s)) symbol = s;
      const tLogo =
        asset.imageUrl ||
        asset.logo ||
        asset.primaryVariant?.market?.logoURI ||
        "";
      if (tLogo) logoUrls.push(tLogo);
      price = stats.price ?? null;
      change24h = stats.priceChange24hPercent ?? null;
      riskScore = risk?.marketScore?.score ?? null;
      riskLabel = risk?.marketScore?.label || "";
    }
  } catch {
    /* display meta */
  }

  // If name still looks like mint id, force resolveMeta / helius result
  if (looksLikeMintOrId(name)) {
    const clean = await resolveAssetMeta(assetId);
    if (!looksLikeMintOrId(clean.name)) {
      name = clean.name;
      if (clean.symbol) symbol = clean.symbol;
    } else if (mint) {
      // last resort short mint
      name = `${mint.slice(0, 4)}…${mint.slice(-4)}`;
    }
    if (clean.logo) logoUrls.push(clean.logo);
    if (clean.logoCandidates) logoUrls.push(...clean.logoCandidates);
  }

  if (price == null && mint) price = await jupiterPrice(mint);

  // Never show "Insufficient Data" badge on OG — use Vote CTA instead
  const showScore =
    riskScore != null &&
    riskScore > 0 &&
    riskLabel &&
    !/insufficient|unknown|n\/a/i.test(riskLabel);

  const logoData = await firstLogo([...new Set(logoUrls.filter(Boolean))]);

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
  if (looksLikeMintOrId(title) && mint) {
    title = `${mint.slice(0, 4)}…${mint.slice(-4)}`;
  }
  if (title.length > 22) title = `${title.slice(0, 20)}…`;
  const monoSym = (symbol && !looksLikeMintOrId(symbol) ? symbol : "").slice(
    0,
    12
  );

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
          background:
            "linear-gradient(145deg, #07070c 0%, #0c120e 40%, #0a0a12 100%)",
          fontFamily: bodyFont,
          padding: "48px 64px",
        }}
      >
        {/* Brand lockup */}
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
              fontSize: 44,
              color: "#e6ffe0",
              textShadow: "0 0 8px #39ff14, 0 0 20px #1a8a0a",
            }}
          >
            TOKEN
          </span>
          <span
            style={{
              fontSize: 44,
              color: "#39ff14",
              textShadow: "0 0 8px #39ff14, 0 0 22px #39ff14, 0 0 40px #0fa",
            }}
          >
            $
          </span>
          <span
            style={{
              fontSize: 44,
              color: "#e6ffe0",
              textShadow: "0 0 8px #39ff14, 0 0 20px #1a8a0a",
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
                border: "3px solid #2a2a3a",
              }}
            />
          ) : (
            <div
              style={{
                width: 168,
                height: 168,
                borderRadius: "50%",
                background: "#12121a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 48,
                fontWeight: 700,
                color: "#39ff14",
                border: "3px solid #2a2a3a",
                fontFamily: bodyFont,
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
              fontFamily: bodyFont,
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
                  fontSize: title.length > 14 ? 48 : 60,
                  fontWeight: 700,
                  color: "#ffffff",
                  lineHeight: 1.1,
                  fontFamily: bodyFont,
                }}
              >
                {title}
              </span>
              {monoSym ? (
                <span
                  style={{
                    fontSize: 26,
                    color: "#a1a1aa",
                    fontWeight: 700,
                    fontFamily: bodyFont,
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
                gap: 18,
                marginTop: 16,
              }}
            >
              <span
                style={{
                  fontSize: 44,
                  fontWeight: 700,
                  color: "#ffffff",
                  fontFamily: bodyFont,
                }}
              >
                {formatPrice(price)}
              </span>
              {change24h != null ? (
                <span
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: changeColor,
                    fontFamily: bodyFont,
                  }}
                >
                  {formatChange(change24h)}
                </span>
              ) : null}
            </div>

            <span
              style={{
                marginTop: 18,
                fontSize: 20,
                color: "#71717a",
                fontFamily: bodyFont,
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
                fontFamily: bodyFont,
              }}
            >
              <span style={{ fontSize: 14, color: "#71717a", marginBottom: 4 }}>
                $HIT
              </span>
              <span
                style={{
                  fontSize: 52,
                  fontWeight: 700,
                  color: scoreColor,
                  fontFamily: bodyFont,
                }}
              >
                {riskScore}
              </span>
              {riskLabel ? (
                <span style={{ fontSize: 13, color: scoreColor, marginTop: 4 }}>
                  {String(riskLabel).slice(0, 18)}
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
                background: "rgba(57,255,20,0.1)",
                fontFamily: bodyFont,
              }}
            >
              <span
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  color: "#39ff14",
                  fontFamily: bodyFont,
                }}
              >
                VOTE
              </span>
              <span
                style={{
                  fontSize: 16,
                  color: "#a1a1aa",
                  marginTop: 6,
                  fontFamily: bodyFont,
                }}
              >
                HIT or SHIT
              </span>
            </div>
          )}
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
