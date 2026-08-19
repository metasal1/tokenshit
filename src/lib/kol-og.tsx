import { ImageResponse } from "next/og";
import { loadInter, loadMonoton } from "@/lib/og-font";
import { CREAM, GREEN, OG_BG, OG_SIZE, creamGlow, dollarGlow } from "@/lib/og-brand";
import { fetchXUserPublic } from "@/lib/x-data";
import { normalizeKolHandle } from "@/lib/kol-noms";
import { KOL_OG_QUOTE } from "@/lib/kol-og-quote";
import { KOL_OG_ASSETS } from "@/lib/kol-og-assets";

export { KOL_OG_QUOTE };
export const KOL_OG_SIZE = OG_SIZE;

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";

async function toRgbaPngDataUrl(buf: Buffer, size?: number): Promise<string | null> {
  try {
    const sharp = (await import("sharp")).default;
    let pipe = sharp(buf).ensureAlpha();
    if (size) pipe = pipe.resize(size, size, { fit: "cover" });
    const out = await pipe.png().toBuffer();
    return `data:image/png;base64,${out.toString("base64")}`;
  } catch {
    if (buf[0] === 0x89 && buf[1] === 0x50)
      return `data:image/png;base64,${buf.toString("base64")}`;
    if (buf[0] === 0xff && buf[1] === 0xd8)
      return `data:image/jpeg;base64,${buf.toString("base64")}`;
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
    const head = buf.subarray(0, 16).toString("utf8");
    if (head.includes("<!DOCTYPE") || head.includes("<html")) return null;
    return buf;
  } catch {
    return null;
  }
}

function pfpCandidates(profileImageUrl: string | undefined | null, handle: string): string[] {
  const out: string[] = [];
  const u = (profileImageUrl || "").trim();
  if (u) {
    const base = u.split("?")[0];
    out.push(
      base.replace(/_normal\./i, "_400x400.").replace(/_bigger\./i, "_400x400."),
      base.replace(/_normal\./i, "_200x200.").replace(/_bigger\./i, "_200x200."),
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

export async function loadKolForOg(raw: string) {
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
    if (!x.ok) return { handle: h, name: h, followers: 0, pfp, verified: false };
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

/** Poster-style KOL love OG — matches token OG + KOL posters */
export async function renderKolLoveOg(rawHandle: string): Promise<ImageResponse> {
  const [kol, monoton, inter] = await Promise.all([
    loadKolForOg(rawHandle),
    loadMonoton(),
    loadInter(),
  ]);

  const bodyFont = inter ? "Inter" : "sans-serif";
  const fonts: { name: string; data: ArrayBuffer; style: "normal"; weight: 400 | 700 }[] = [];
  if (monoton) fonts.push({ name: "Monoton", data: monoton, style: "normal", weight: 400 });
  if (inter) {
    fonts.push(
      { name: "Inter", data: inter.regular, style: "normal", weight: 400 },
      { name: "Inter", data: inter.bold, style: "normal", weight: 700 }
    );
  }

  const flw =
    kol.followers >= 1_000_000
      ? `${(kol.followers / 1_000_000).toFixed(1)}M`
      : kol.followers >= 1_000
        ? `${(kol.followers / 1_000).toFixed(1)}K`
        : String(kol.followers || "—");

  const scatter = [
    { src: KOL_OG_ASSETS.poop, x: 40, y: 140, s: 42 },
    { src: KOL_OG_ASSETS.fire, x: 1100, y: 130, s: 44 },
    { src: KOL_OG_ASSETS.target, x: 70, y: 480, s: 40 },
    { src: KOL_OG_ASSETS.sparkles, x: 1080, y: 470, s: 42 },
    { src: KOL_OG_ASSETS.heart, x: 160, y: 560, s: 36 },
    { src: KOL_OG_ASSETS.poop, x: 1000, y: 560, s: 36 },
    { src: KOL_OG_ASSETS.fire, x: 200, y: 120, s: 32 },
    { src: KOL_OG_ASSETS.sparkles, x: 980, y: 200, s: 34 },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: OG_BG,
          fontFamily: bodyFont,
          padding: "44px 56px",
          position: "relative",
        }}
      >
        {/* soft glows like posters */}
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -40,
            width: 380,
            height: 380,
            borderRadius: 999,
            background: "rgba(57,255,20,0.12)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -100,
            left: -60,
            width: 400,
            height: 400,
            borderRadius: 999,
            background: "rgba(240,192,64,0.1)",
            display: "flex",
          }}
        />

        {/* scatter emojis (poster style) */}
        {scatter.map((e, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={e.src}
            width={e.s}
            height={e.s}
            style={{
              position: "absolute",
              left: e.x,
              top: e.y,
              width: e.s,
              height: e.s,
              opacity: 0.92,
              objectFit: "contain",
            }}
          />
        ))}

        {/* Brand lockup — same as token OG */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 28,
            gap: 14,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={KOL_OG_ASSETS.logo}
            width={48}
            height={48}
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              border: "2px solid #39ff14",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              fontFamily: monoton ? "Monoton" : bodyFont,
              letterSpacing: "0.02em",
            }}
          >
            <span
              style={{
                fontSize: 42,
                color: CREAM,
                textShadow: creamGlow(true),
                fontWeight: monoton ? 400 : 700,
              }}
            >
              TOKEN
            </span>
            <span
              style={{
                fontSize: 42,
                color: GREEN,
                textShadow: dollarGlow(true),
                fontWeight: monoton ? 400 : 700,
              }}
            >
              $
            </span>
            <span
              style={{
                fontSize: 42,
                color: CREAM,
                textShadow: creamGlow(true),
                fontWeight: monoton ? 400 : 700,
              }}
            >
              HIT
            </span>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={KOL_OG_ASSETS.poop}
            width={36}
            height={36}
            style={{ width: 36, height: 36, marginLeft: 8 }}
          />
          <div style={{ display: "flex", flex: 1 }} />
          <span style={{ color: "#71717a", fontSize: 20, fontWeight: 700 }}>
            KOL CARD
          </span>
        </div>

        {/* Main row: PFP + copy — token OG layout */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flex: 1,
            gap: 44,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 200,
              height: 200,
              borderRadius: "50%",
              border: "5px solid #39ff14",
              boxShadow: "0 0 40px rgba(57,255,20,0.45)",
              overflow: "hidden",
              background: "#12121a",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {kol.pfp ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={kol.pfp}
                width={200}
                height={200}
                style={{
                  width: 200,
                  height: 200,
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={KOL_OG_ASSETS.poop}
                width={88}
                height={88}
                style={{ width: 88, height: 88 }}
              />
            )}
          </div>

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
                alignItems: "center",
                gap: 12,
                marginBottom: 10,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={KOL_OG_ASSETS.heart}
                width={40}
                height={40}
                style={{ width: 40, height: 40 }}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={KOL_OG_ASSETS.fire}
                width={36}
                height={36}
                style={{ width: 36, height: 36 }}
              />
            </div>

            <div
              style={{
                display: "flex",
                color: CREAM,
                fontSize: 44,
                fontWeight: 700,
                lineHeight: 1.15,
                textShadow: creamGlow(false),
                maxWidth: 720,
              }}
            >
              “{KOL_OG_QUOTE}”
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginTop: 22,
              }}
            >
              <span
                style={{
                  color: GREEN,
                  fontSize: 34,
                  fontWeight: 700,
                  textShadow: dollarGlow(false),
                }}
              >
                @{kol.handle}
              </span>
              {kol.verified ? (
                <span style={{ color: "#38bdf8", fontSize: 26 }}>✓</span>
              ) : null}
              <span style={{ color: "#a1a1aa", fontSize: 24, fontWeight: 700 }}>
                {flw} flw
              </span>
            </div>

            {kol.name && kol.name.toLowerCase() !== kol.handle ? (
              <div
                style={{
                  display: "flex",
                  marginTop: 8,
                  color: "#d4d4d8",
                  fontSize: 22,
                }}
              >
                {kol.name}
              </div>
            ) : null}
          </div>
        </div>

        {/* footer bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 12,
            borderTop: "1px solid #2a2a3a",
            paddingTop: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={KOL_OG_ASSETS.target}
              width={28}
              height={28}
              style={{ width: 28, height: 28 }}
            />
            <span style={{ color: "#71717a", fontSize: 18 }}>
              Every KOL is shit until proven otherwise
            </span>
          </div>
          <span style={{ color: GREEN, fontSize: 18, fontWeight: 700 }}>
            tokenshit.com/kols/{kol.handle}
          </span>
        </div>
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
