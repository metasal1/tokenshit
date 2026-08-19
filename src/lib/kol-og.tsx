import { ImageResponse } from "next/og";
import { loadInter, loadMonoton } from "@/lib/og-font";
import { CREAM, GREEN, OG_BG, OG_SIZE, creamGlow, dollarGlow } from "@/lib/og-brand";
import { fetchXUserPublic } from "@/lib/x-data";
import { normalizeKolHandle } from "@/lib/kol-noms";

import { KOL_OG_QUOTE } from "@/lib/kol-og-quote";
export { KOL_OG_QUOTE };
export const KOL_OG_SIZE = OG_SIZE;

async function pfpDataUrl(url: string | undefined | null): Promise<string | null> {
  if (!url) return null;
  try {
    const hi = url.replace("_normal", "_400x400").replace("_bigger", "_400x400");
    const res = await fetch(hi, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; TokenShitOG/1.1; +https://tokenshit.com)",
        Accept: "image/*,*/*",
      },
      redirect: "follow",
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    let buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 64 || buf.length > 3_000_000) return null;
    const isWebp = buf[0] === 0x52 && buf[1] === 0x49 && buf[8] === 0x57;
    const isPng = buf[0] === 0x89 && buf[1] === 0x50;
    const isJpeg = buf[0] === 0xff && buf[1] === 0xd8;
    if (isWebp || (!isPng && !isJpeg)) {
      try {
        const sharp = (await import("sharp")).default;
        buf = Buffer.from(await sharp(buf).resize(400, 400).png().toBuffer());
      } catch {
        if (!isPng && !isJpeg) return null;
      }
    } else {
      try {
        const sharp = (await import("sharp")).default;
        buf = Buffer.from(await sharp(buf).resize(400, 400).png().toBuffer());
      } catch {
        /* use original */
      }
    }
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
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
    if (!x.ok) {
      return { handle, name: handle, followers: 0, pfp: null, verified: false };
    }
    const pfp = await pfpDataUrl(x.profileImageUrl);
    return {
      handle: (x.username || handle).replace(/^@/, "").toLowerCase(),
      name: x.name || handle,
      followers: Number(x.followers || 0),
      pfp,
      verified: !!x.verified || !!x.premium,
    };
  } catch {
    return { handle, name: handle, followers: 0, pfp: null, verified: false };
  }
}

export async function renderKolLoveOg(rawHandle: string): Promise<ImageResponse> {
  const kol = await loadKolForOg(rawHandle);
  const [monoton, inter] = await Promise.all([loadMonoton(), loadInter()]);

  const fonts: { name: string; data: ArrayBuffer; weight: 400 | 700; style: "normal" }[] =
    [];
  if (monoton) {
    fonts.push({ name: "Monoton", data: monoton, weight: 400, style: "normal" });
  }
  if (inter) {
    fonts.push({ name: "Inter", data: inter.regular, weight: 400, style: "normal" });
    fonts.push({ name: "Inter", data: inter.bold, weight: 700, style: "normal" });
  }

  const flw =
    kol.followers >= 1_000_000
      ? `${(kol.followers / 1_000_000).toFixed(1)}M`
      : kol.followers >= 1_000
        ? `${(kol.followers / 1_000).toFixed(1)}K`
        : String(kol.followers || "—");

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
        {/* neon glow blobs */}
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -60,
            width: 360,
            height: 360,
            borderRadius: 999,
            background: "rgba(57,255,20,0.12)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -100,
            left: -80,
            width: 400,
            height: 400,
            borderRadius: 999,
            background: "rgba(240,192,64,0.08)",
            display: "flex",
          }}
        />

        {/* brand */}
        <div
          style={{
            position: "absolute",
            top: 36,
            left: 48,
            display: "flex",
            alignItems: "baseline",
            fontFamily: monoton ? "Monoton" : "sans-serif",
            fontSize: 42,
            letterSpacing: 2,
          }}
        >
          <span style={{ color: CREAM, textShadow: creamGlow(true) }}>TOKEN</span>
          <span style={{ color: GREEN, textShadow: dollarGlow(true) }}>$</span>
          <span style={{ color: CREAM, textShadow: creamGlow(true) }}>HIT</span>
        </div>

        <div
          style={{
            position: "absolute",
            top: 48,
            right: 48,
            display: "flex",
            color: "#71717a",
            fontSize: 22,
            fontFamily: inter ? "Inter" : "sans-serif",
          }}
        >
          tokenshit.com/kols
        </div>

        {/* PFP */}
        <div
          style={{
            display: "flex",
            width: 220,
            height: 220,
            borderRadius: 999,
            border: `6px solid ${GREEN}`,
            boxShadow: "0 0 40px rgba(57,255,20,0.45)",
            overflow: "hidden",
            background: "#18181b",
            marginBottom: 36,
          }}
        >
          {kol.pfp ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={kol.pfp}
              width={220}
              height={220}
              style={{ objectFit: "cover", width: 220, height: 220 }}
            />
          ) : (
            <div
              style={{
                width: 220,
                height: 220,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: GREEN,
                fontSize: 72,
                fontWeight: 700,
              }}
            >
              ?
            </div>
          )}
        </div>

        {/* quote */}
        <div
          style={{
            display: "flex",
            color: CREAM,
            fontSize: 56,
            fontWeight: 700,
            textAlign: "center",
            maxWidth: 1000,
            lineHeight: 1.15,
            textShadow: creamGlow(false),
            padding: "0 40px",
          }}
        >
          “{KOL_OG_QUOTE}”
        </div>

        {/* handle */}
        <div
          style={{
            display: "flex",
            marginTop: 28,
            alignItems: "center",
            gap: 16,
          }}
        >
          <span
            style={{
              color: GREEN,
              fontSize: 36,
              fontWeight: 700,
              fontFamily: inter ? "Inter" : "sans-serif",
            }}
          >
            @{kol.handle}
          </span>
          {kol.verified ? (
            <span style={{ color: "#38bdf8", fontSize: 28 }}>✓</span>
          ) : null}
          <span style={{ color: "#71717a", fontSize: 26 }}>{flw} flw</span>
        </div>

        {kol.name && kol.name.toLowerCase() !== kol.handle ? (
          <div
            style={{
              display: "flex",
              marginTop: 10,
              color: "#a1a1aa",
              fontSize: 24,
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
    }
  );
}
