import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { loadInter, loadMonoton } from "@/lib/og-font";
import {
  CREAM,
  GREEN,
  OG_BG,
  OG_SIZE,
  creamGlow,
  dollarGlow,
} from "@/lib/og-brand";
import { fetchXUserPublic } from "@/lib/x-data";
import { normalizeKolHandle } from "@/lib/kol-noms";
import { KOL_OG_QUOTE } from "@/lib/kol-og-quote";

export { KOL_OG_QUOTE };
export const KOL_OG_SIZE = OG_SIZE;

const SITE = "https://tokenshit.com";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";

/** Force RGBA PNG data-URL — Satori rejects palette/webp often */
async function toRgbaPngDataUrl(
  buf: Buffer,
  size?: number
): Promise<string | null> {
  try {
    const sharp = (await import("sharp")).default;
    let pipe = sharp(buf).ensureAlpha();
    if (size) pipe = pipe.resize(size, size, { fit: "cover" });
    const out = await pipe.png().toBuffer();
    if (out.length < 32) return null;
    return `data:image/png;base64,${out.toString("base64")}`;
  } catch {
    // fallback: only if already PNG RGBA-ish
    if (buf[0] === 0x89 && buf[1] === 0x50) {
      return `data:image/png;base64,${buf.toString("base64")}`;
    }
    if (buf[0] === 0xff && buf[1] === 0xd8) {
      return `data:image/jpeg;base64,${buf.toString("base64")}`;
    }
    return null;
  }
}

async function fetchBuf(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: "image/*,*/*",
        Referer: "https://x.com/",
      },
      redirect: "follow",
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 32 || buf.length > 5_000_000) return null;
    const head = buf.subarray(0, 20).toString("utf8");
    if (head.includes("<!DOCTYPE") || head.includes("<html")) return null;
    return buf;
  } catch {
    return null;
  }
}

async function loadLocalPublic(rel: string): Promise<Buffer | null> {
  const candidates = [
    path.join(process.cwd(), "public", rel),
    path.join(process.cwd(), rel),
    path.join(process.cwd(), ".open-next", "assets", rel),
  ];
  for (const p of candidates) {
    try {
      const buf = await readFile(p);
      if (buf.length > 32) return buf;
    } catch {
      /* */
    }
  }
  return null;
}

async function loadAssetDataUrl(
  relOrUrl: string,
  size?: number
): Promise<string | null> {
  let buf: Buffer | null = null;
  if (relOrUrl.startsWith("http")) {
    buf = await fetchBuf(relOrUrl);
  } else {
    buf =
      (await loadLocalPublic(relOrUrl)) ||
      (await fetchBuf(`${SITE}/${relOrUrl.replace(/^\//, "")}`));
  }
  if (!buf) return null;
  return toRgbaPngDataUrl(buf, size);
}

function pfpCandidates(
  profileImageUrl: string | undefined | null,
  handle: string
): string[] {
  const out: string[] = [];
  const u = (profileImageUrl || "").trim();
  if (u) {
    const base = u.split("?")[0];
    out.push(
      base.replace(/_normal\./i, "_400x400.").replace(/_bigger\./i, "_400x400."),
      base.replace(/_normal\./i, "_200x200.").replace(/_bigger\./i, "_200x200."),
      base
        .replace(/_normal\.(jpg|jpeg|png|webp)$/i, ".$1")
        .replace(/_bigger\.(jpg|jpeg|png|webp)$/i, ".$1"),
      base
    );
  }
  const h = handle.replace(/^@/, "");
  out.push(
    `https://unavatar.io/twitter/${encodeURIComponent(h)}?fallback=false`,
    `https://unavatar.io/x/${encodeURIComponent(h)}?fallback=false`
  );
  return [...new Set(out.filter(Boolean))];
}

async function loadBrandKit(): Promise<{
  poop: string | null;
  heart: string | null;
  fire: string | null;
  target: string | null;
  sparkles: string | null;
  logo: string | null;
}> {
  // Prefer large RGBA assets (512) — tiny tw-* are palette mode and break Satori
  // og/ = pre-converted RGBA PNGs (Satori-safe)
  const [poop, heart, fire, target, sparkles, logo] = await Promise.all([
    loadAssetDataUrl("brand/emoji/og/tw-1f4a9.png", 128),
    loadAssetDataUrl("brand/emoji/og/tw-1f49a.png", 128),
    loadAssetDataUrl("brand/emoji/og/fire-512.png", 128),
    loadAssetDataUrl("brand/emoji/og/target-512.png", 128),
    loadAssetDataUrl("brand/emoji/og/sparkles-512.png", 128),
    loadAssetDataUrl("icon.png", 96).then(
      async (d) => d || loadAssetDataUrl("apple-icon.png", 96)
    ),
  ]);
  return { poop, heart, fire, target, sparkles, logo };
}

export async function loadKolForOg(raw: string): Promise<{
  handle: string;
  name: string;
  followers: number;
  pfp: string | null;
  verified: boolean;
}> {
  const handle = normalizeKolHandle(raw) || "unknown";
  try {
    const x = await fetchXUserPublic(handle);
    const h = ((x.ok && x.username) || handle).replace(/^@/, "").toLowerCase();
    let pfp: string | null = null;
    for (const c of pfpCandidates(x.ok ? x.profileImageUrl : null, h)) {
      const buf = await fetchBuf(c);
      if (!buf) continue;
      pfp = await toRgbaPngDataUrl(buf, 400);
      if (pfp) break;
    }
    if (!x.ok) {
      return { handle: h, name: h, followers: 0, pfp, verified: false };
    }
    return {
      handle: h,
      name: x.name || h,
      followers: Number(x.followers || 0),
      pfp,
      verified: !!x.verified || !!x.premium,
    };
  } catch {
    return { handle, name: handle, followers: 0, pfp: null, verified: false };
  }
}

function EmojiImg({
  src,
  size = 48,
}: {
  src: string | null | undefined;
  size?: number;
}) {
  if (!src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}

export async function renderKolLoveOg(
  rawHandle: string
): Promise<ImageResponse> {
  const [kol, brand, monoton, inter] = await Promise.all([
    loadKolForOg(rawHandle),
    loadBrandKit(),
    loadMonoton(),
    loadInter(),
  ]);

  const fonts: {
    name: string;
    data: ArrayBuffer;
    weight: 400 | 700;
    style: "normal";
  }[] = [];
  if (monoton) {
    fonts.push({
      name: "Monoton",
      data: monoton,
      weight: 400,
      style: "normal",
    });
  }
  if (inter) {
    fonts.push({
      name: "Inter",
      data: inter.regular,
      weight: 400,
      style: "normal",
    });
    fonts.push({
      name: "Inter",
      data: inter.bold,
      weight: 700,
      style: "normal",
    });
  }

  const flw =
    kol.followers >= 1_000_000
      ? `${(kol.followers / 1_000_000).toFixed(1)}M`
      : kol.followers >= 1_000
        ? `${(kol.followers / 1_000).toFixed(1)}K`
        : String(kol.followers || "—");

  const hasMonoton = Boolean(monoton);

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
          fontFamily: inter ? "Inter" : "sans-serif",
        }}
      >
        {/* bg glows */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -80,
            width: 420,
            height: 420,
            borderRadius: 999,
            background: "rgba(57,255,20,0.16)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -120,
            left: -90,
            width: 440,
            height: 440,
            borderRadius: 999,
            background: "rgba(240,192,64,0.12)",
            display: "flex",
          }}
        />

        {/* TOP BRAND BAR */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 96,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 40px",
            borderBottom: "2px solid rgba(57,255,20,0.25)",
            background: "rgba(0,0,0,0.35)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {brand.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={brand.logo}
                width={56}
                height={56}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  border: `2px solid ${GREEN}`,
                }}
              />
            ) : (
              <EmojiImg src={brand.poop} size={52} />
            )}
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                fontFamily: hasMonoton ? "Monoton" : "Inter",
                fontSize: hasMonoton ? 44 : 40,
                fontWeight: hasMonoton ? 400 : 700,
                letterSpacing: hasMonoton ? 2 : 1,
              }}
            >
              <span style={{ color: CREAM, textShadow: creamGlow(true) }}>
                TOKEN
              </span>
              <span style={{ color: GREEN, textShadow: dollarGlow(true) }}>
                $
              </span>
              <span style={{ color: CREAM, textShadow: creamGlow(true) }}>
                HIT
              </span>
            </div>
            <EmojiImg src={brand.poop} size={40} />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "#a1a1aa",
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            <EmojiImg src={brand.fire} size={28} />
            tokenshit.com
          </div>
        </div>

        {/* floating side emojis */}
        <div
          style={{
            position: "absolute",
            left: 40,
            top: 180,
            display: "flex",
            flexDirection: "column",
            gap: 28,
          }}
        >
          <EmojiImg src={brand.fire} size={64} />
          <EmojiImg src={brand.target} size={56} />
          <EmojiImg src={brand.poop} size={56} />
        </div>
        <div
          style={{
            position: "absolute",
            right: 40,
            top: 180,
            display: "flex",
            flexDirection: "column",
            gap: 28,
          }}
        >
          <EmojiImg src={brand.sparkles} size={64} />
          <EmojiImg src={brand.heart} size={56} />
          <EmojiImg src={brand.fire} size={56} />
        </div>

        {/* PFP */}
        <div
          style={{
            display: "flex",
            marginTop: 36,
            width: 210,
            height: 210,
            borderRadius: 999,
            border: `8px solid ${GREEN}`,
            boxShadow: "0 0 56px rgba(57,255,20,0.55)",
            overflow: "hidden",
            background: "#18181b",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {kol.pfp ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={kol.pfp}
              width={210}
              height={210}
              style={{
                objectFit: "cover",
                width: 210,
                height: 210,
                borderRadius: 999,
              }}
            />
          ) : (
            <EmojiImg src={brand.poop} size={96} />
          )}
        </div>

        {/* quote */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            marginTop: 28,
            maxWidth: 920,
            padding: "0 24px",
          }}
        >
          <EmojiImg src={brand.heart} size={48} />
          <div
            style={{
              display: "flex",
              color: CREAM,
              fontSize: 48,
              fontWeight: 700,
              textAlign: "center",
              lineHeight: 1.12,
              textShadow: creamGlow(true),
            }}
          >
            “{KOL_OG_QUOTE}”
          </div>
          <EmojiImg src={brand.poop} size={48} />
        </div>

        {/* handle pill */}
        <div
          style={{
            display: "flex",
            marginTop: 22,
            alignItems: "center",
            gap: 12,
            background: "rgba(57,255,20,0.1)",
            border: `2px solid ${GREEN}`,
            borderRadius: 999,
            padding: "10px 28px",
          }}
        >
          <EmojiImg src={brand.target} size={30} />
          <span style={{ color: GREEN, fontSize: 32, fontWeight: 700 }}>
            @{kol.handle}
          </span>
          {kol.verified ? (
            <span style={{ color: "#38bdf8", fontSize: 24 }}>✓</span>
          ) : null}
          <span style={{ color: "#a1a1aa", fontSize: 22 }}>{flw}</span>
          <EmojiImg src={brand.sparkles} size={30} />
        </div>

        {kol.name && kol.name.toLowerCase() !== kol.handle ? (
          <div
            style={{
              display: "flex",
              marginTop: 10,
              color: "#d4d4d8",
              fontSize: 22,
            }}
          >
            {kol.name}
          </div>
        ) : null}
      </div>
    ),
    {
      ...KOL_OG_SIZE,
      fonts: fonts.length ? fonts : undefined,
      headers: {
        "Cache-Control":
          "public, max-age=120, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
