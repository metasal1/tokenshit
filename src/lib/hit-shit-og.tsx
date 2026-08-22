/**
 * HIT / SHIT Open Graph cards — ImageResponse (1200×630).
 * Icons match brand cursors (target / face). Optional per-token card.
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
import { extractMint, resolveAssetMeta } from "@/lib/resolveMeta";

export type HitShitSide = "hit" | "shit";

const SHIT = BRAND.colors.shit; // #f87171

export type HitShitTokenOg = {
  /** Path segment after hit-/shit- e.g. trn-shit-so or mint */
  slug: string;
  name?: string;
  symbol?: string;
  logoDataUrl?: string | null;
};

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
      <circle cx={c} cy={c} r={c - stroke} stroke={GREEN} strokeWidth={stroke} />
      <circle
        cx={c}
        cy={c}
        r={c * 0.62}
        stroke={GREEN}
        strokeWidth={stroke * 0.85}
      />
      <circle cx={c} cy={c} r={c * 0.18} fill={GREEN} />
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
      <circle cx={c} cy={c} r={c - stroke} stroke={SHIT} strokeWidth={stroke} />
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

async function toDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; TokenShitOG/1.2; +https://tokenshit.com)",
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

/** Resolve slug → display + logo for OG */
export async function resolveTokenForHitShitOg(
  slug: string
): Promise<HitShitTokenOg> {
  const raw = decodeURIComponent(slug || "").trim();
  const candidates = [
    raw,
    raw.startsWith("solana-") ? raw : `solana-${raw}`,
    extractMint(raw) || "",
  ].filter(Boolean);

  let name = raw;
  let symbol = "";
  const logoUrls: string[] = [];

  for (const id of candidates) {
    try {
      const meta = await resolveAssetMeta(id);
      if (meta?.name && meta.name !== id) name = meta.name;
      if (meta?.symbol) symbol = meta.symbol;
      if (meta?.logo) logoUrls.push(meta.logo);
      if (meta?.logoCandidates) logoUrls.push(...meta.logoCandidates);
      if (name && name !== raw) break;
    } catch {
      /* next */
    }
  }

  const mint = extractMint(raw) || extractMint(`solana-${raw}`);
  if (mint) {
    logoUrls.unshift(
      `https://dd.dexscreener.com/ds-data/tokens/solana/${mint}.png`,
      `https://cdn.jsdelivr.net/gh/solana-labs/token-list@main/assets/mainnet/${mint}/logo.png`
    );
  }

  // Tokens.xyz direct
  const API_BASE = "https://api.tokens.xyz/v1";
  const API_KEY = process.env.TOKENS_XYZ_API_KEY || "";
  for (const id of candidates) {
    try {
      const res = await fetch(
        `${API_BASE}/assets/${encodeURIComponent(id)}?include=profile`,
        {
          headers: API_KEY ? { "x-api-key": API_KEY } : {},
          next: { revalidate: 300 },
        }
      );
      if (!res.ok) continue;
      const data = await res.json();
      const asset = data.asset || data;
      const n = (asset.name || asset.profile?.name || "").trim();
      const s = (asset.symbol || asset.profile?.symbol || "").trim();
      if (n) name = n;
      if (s) symbol = s;
      const tLogo =
        asset.imageUrl ||
        asset.logo ||
        asset.primaryVariant?.market?.logoURI ||
        "";
      if (tLogo) logoUrls.push(tLogo);
      break;
    } catch {
      /* */
    }
  }

  let logoDataUrl: string | null = null;
  for (const u of [...new Set(logoUrls.filter(Boolean))]) {
    logoDataUrl = await toDataUrl(u);
    if (logoDataUrl) break;
  }

  if ((!symbol || symbol === raw) && raw.length <= 12 && !/^[1-9A-HJ-NP]{20,}/.test(raw)) {
    symbol = raw.toUpperCase().replace(/^SOLANA-/, "");
  }

  return { slug: raw, name, symbol, logoDataUrl };
}

export async function renderHitShitOg(
  side: HitShitSide,
  token?: HitShitTokenOg | null
): Promise<ImageResponse> {
  const [monoton, inter] = await Promise.all([loadMonoton(), loadInter()]);
  const isHit = side === "hit";
  const label = isHit ? "HIT" : "SHIT";
  const accent = isHit ? GREEN : SHIT;
  const glow = isHit
    ? "0 0 40px rgba(57,255,20,0.55), 0 0 100px rgba(57,255,20,0.25)"
    : "0 0 40px rgba(248,113,113,0.55), 0 0 100px rgba(248,113,113,0.25)";
  const hasToken = Boolean(token?.slug);
  const titleName = (token?.symbol || token?.name || "").slice(0, 18);
  const subName = token?.name && token.name !== token.symbol ? token.name.slice(0, 36) : "";
  const sub = hasToken
    ? isHit
      ? `Vote HIT on ${titleName || "this token"}`
      : `Vote SHIT on ${titleName || "this token"}`
    : isHit
      ? "Green target · play the bull case"
      : "Red face · play the bear case";
  const cta = hasToken
    ? `tokenshit.com/${side}-${token!.slug}`
    : isHit
      ? "tokenshit.com/hit"
      : "tokenshit.com/shit";
  const sparkles = KOL_OG_ASSETS.sparkles;

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
            {label}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            gap: 48,
          }}
        >
          {/* side icon */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: hasToken ? 260 : 340,
              height: hasToken ? 260 : 340,
              borderRadius: 40,
              border: `4px solid ${accent}`,
              background: "rgba(18,18,26,0.95)",
              boxShadow: glow,
            }}
          >
            {isHit ? (
              <HitIcon size={hasToken ? 180 : 240} />
            ) : (
              <ShitIcon size={hasToken ? 180 : 240} />
            )}
          </div>

          {/* token logo when present */}
          {hasToken ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 220,
                height: 220,
                borderRadius: 36,
                border: "3px solid rgba(255,255,255,0.12)",
                background: "rgba(18,18,26,0.95)",
                overflow: "hidden",
              }}
            >
              {token?.logoDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={token.logoDataUrl}
                  width={200}
                  height={200}
                  alt=""
                  style={{ borderRadius: 28, objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    display: "flex",
                    fontFamily: "Monoton",
                    fontSize: 48,
                    color: CREAM,
                  }}
                >
                  {(titleName || "?").slice(0, 4)}
                </div>
              )}
            </div>
          ) : null}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              maxWidth: hasToken ? 420 : 520,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                fontFamily: "Monoton",
                fontSize: hasToken ? 88 : 120,
                color: accent,
                textShadow: isHit ? creamGlow(true) : glow,
                letterSpacing: 4,
                lineHeight: 1,
              }}
            >
              {label}
            </div>
            {hasToken && titleName ? (
              <div
                style={{
                  display: "flex",
                  fontFamily: "Inter",
                  fontSize: 44,
                  fontWeight: 800,
                  color: CREAM,
                }}
              >
                ${titleName}
              </div>
            ) : null}
            {hasToken && subName ? (
              <div
                style={{
                  display: "flex",
                  fontSize: 24,
                  color: "#a1a1aa",
                  fontFamily: "Inter",
                }}
              >
                {subName}
              </div>
            ) : null}
            <div
              style={{
                display: "flex",
                fontSize: 24,
                color: "#a1a1aa",
                fontFamily: "Inter",
              }}
            >
              {sub}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 22,
                color: CREAM,
                fontFamily: "Inter",
                marginTop: 4,
              }}
            >
              HIT or SHIT · tokenshit.com
            </div>
          </div>
        </div>

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
              fontSize: 22,
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
          "public, max-age=120, s-maxage=600, stale-while-revalidate=3600",
      },
    }
  );
}
