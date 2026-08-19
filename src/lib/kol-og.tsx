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
import { fetchXUserPublic } from "@/lib/x-data";
import { normalizeKolHandle } from "@/lib/kol-noms";
import { KOL_OG_QUOTE } from "@/lib/kol-og-quote";

export { KOL_OG_QUOTE };
export const KOL_OG_SIZE = OG_SIZE;

const SITE = "https://tokenshit.com";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";

function sniffMime(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e) return "image/png";
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[8] === 0x57) return "image/webp";
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return "image/gif";
  return null;
}

async function fetchImageDataUrl(
  url: string,
  opts?: { size?: number }
): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        Referer: "https://x.com/",
      },
      redirect: "follow",
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    let buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 64 || buf.length > 4_000_000) return null;
    const head = buf.subarray(0, 20).toString("utf8");
    if (head.includes("<!DOCTYPE") || head.includes("<html")) return null;

    let mime = sniffMime(buf);
    const ct = (res.headers.get("content-type") || "").split(";")[0].trim();
    if (!mime && ct.startsWith("image/")) mime = ct;

    // Prefer PNG for Satori; convert when sharp available
    const want = opts?.size || 400;
    try {
      const sharp = (await import("sharp")).default;
      buf = Buffer.from(
        await sharp(buf)
          .resize(want, want, { fit: "cover" })
          .png()
          .toBuffer()
      );
      mime = "image/png";
    } catch {
      // CF worker may lack sharp — keep original bytes with correct MIME
      if (!mime || mime === "image/webp") {
        // Satori often chokes on webp without conversion
        return null;
      }
    }

    if (!mime) return null;
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

/** Build candidate PFP URLs from twitter CDN / unavatar */
function pfpCandidates(profileImageUrl: string | undefined | null, handle: string): string[] {
  const out: string[] = [];
  const u = (profileImageUrl || "").trim();
  if (u) {
    // strip query
    const base = u.split("?")[0];
    // Twitter size variants
    const stripped = base
      .replace(/_normal\.(jpg|jpeg|png|webp)$/i, ".$1")
      .replace(/_bigger\.(jpg|jpeg|png|webp)$/i, ".$1")
      .replace(/_mini\.(jpg|jpeg|png|webp)$/i, ".$1")
      .replace(/_x96\.(jpg|jpeg|png|webp)$/i, ".$1")
      .replace(/_400x400\.(jpg|jpeg|png|webp)$/i, ".$1");
    out.push(
      base.replace(/_normal\./i, "_400x400.").replace(/_bigger\./i, "_400x400."),
      base.replace(/_normal\./i, "_200x200.").replace(/_bigger\./i, "_200x200."),
      stripped,
      base
    );
  }
  // public proxies (no auth)
  const h = handle.replace(/^@/, "");
  out.push(
    `https://unavatar.io/twitter/${encodeURIComponent(h)}?fallback=false`,
    `https://unavatar.io/x/${encodeURIComponent(h)}?fallback=false`
  );
  // dedupe
  return [...new Set(out.filter(Boolean))];
}

async function loadBrandEmoji(name: string): Promise<string | null> {
  // prefer tw- unicode pack then named
  const paths = [
    `${SITE}/brand/emoji/${name}`,
    `${SITE}/brand/emoji/${name}.png`,
  ];
  for (const p of paths) {
    const d = await fetchImageDataUrl(p, { size: 128 });
    if (d) return d;
  }
  return null;
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
    const candidates = pfpCandidates(x.ok ? x.profileImageUrl : null, h);
    for (const c of candidates) {
      pfp = await fetchImageDataUrl(c, { size: 400 });
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

export async function renderKolLoveOg(rawHandle: string): Promise<ImageResponse> {
  const kol = await loadKolForOg(rawHandle);
  const [monoton, inter, poop, heart, fire, target, sparkles] =
    await Promise.all([
      loadMonoton(),
      loadInter(),
      loadBrandEmoji("tw-1f4a9.png"),
      loadBrandEmoji("tw-1f49a.png"),
      loadBrandEmoji("tw-1f525.png"),
      loadBrandEmoji("tw-1f3af.png"),
      loadBrandEmoji("sparkles-512.png"),
    ]);

  const fonts: {
    name: string;
    data: ArrayBuffer;
    weight: 400 | 700;
    style: "normal";
  }[] = [];
  if (monoton) {
    fonts.push({ name: "Monoton", data: monoton, weight: 400, style: "normal" });
  }
  if (inter) {
    fonts.push({
      name: "Inter",
      data: inter.regular,
      weight: 400,
      style: "normal",
    });
    fonts.push({ name: "Inter", data: inter.bold, weight: 700, style: "normal" });
  }

  const flw =
    kol.followers >= 1_000_000
      ? `${(kol.followers / 1_000_000).toFixed(1)}M`
      : kol.followers >= 1_000
        ? `${(kol.followers / 1_000).toFixed(1)}K`
        : String(kol.followers || "—");

  const Emoji = ({
    src,
    size = 48,
  }: {
    src: string | null;
    size?: number;
  }) =>
    src ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        width={size}
        height={size}
        style={{ width: size, height: size, objectFit: "contain" }}
      />
    ) : null;

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
        {/* glow blobs */}
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -60,
            width: 360,
            height: 360,
            borderRadius: 999,
            background: "rgba(57,255,20,0.14)",
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
            background: "rgba(240,192,64,0.1)",
            display: "flex",
          }}
        />

        {/* corner emojis */}
        <div
          style={{
            position: "absolute",
            top: 120,
            left: 56,
            display: "flex",
            opacity: 0.95,
          }}
        >
          <Emoji src={poop} size={56} />
        </div>
        <div
          style={{
            position: "absolute",
            top: 120,
            right: 56,
            display: "flex",
            opacity: 0.95,
          }}
        >
          <Emoji src={fire} size={56} />
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 48,
            left: 64,
            display: "flex",
            opacity: 0.9,
          }}
        >
          <Emoji src={target} size={48} />
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 48,
            right: 64,
            display: "flex",
            opacity: 0.9,
          }}
        >
          <Emoji src={sparkles} size={48} />
        </div>

        {/* brand */}
        <div
          style={{
            position: "absolute",
            top: 32,
            left: 48,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Emoji src={poop} size={36} />
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              fontFamily: monoton ? "Monoton" : "sans-serif",
              fontSize: 40,
              letterSpacing: 2,
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
        </div>

        <div
          style={{
            position: "absolute",
            top: 44,
            right: 48,
            display: "flex",
            color: "#71717a",
            fontSize: 20,
          }}
        >
          tokenshit.com/kols
        </div>

        {/* PFP ring */}
        <div
          style={{
            display: "flex",
            width: 228,
            height: 228,
            borderRadius: 999,
            border: `7px solid ${GREEN}`,
            boxShadow: "0 0 48px rgba(57,255,20,0.5)",
            overflow: "hidden",
            background: "#18181b",
            marginBottom: 28,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {kol.pfp ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={kol.pfp}
              width={228}
              height={228}
              style={{
                objectFit: "cover",
                width: 228,
                height: 228,
                borderRadius: 999,
              }}
            />
          ) : (
            <div
              style={{
                width: 228,
                height: 228,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <Emoji src={poop} size={72} />
            </div>
          )}
        </div>

        {/* quote row with hearts */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 18,
            maxWidth: 1040,
            padding: "0 32px",
          }}
        >
          <Emoji src={heart} size={44} />
          <div
            style={{
              display: "flex",
              color: CREAM,
              fontSize: 52,
              fontWeight: 700,
              textAlign: "center",
              lineHeight: 1.15,
              textShadow: creamGlow(false),
            }}
          >
            “{KOL_OG_QUOTE}”
          </div>
          <Emoji src={heart} size={44} />
        </div>

        {/* handle */}
        <div
          style={{
            display: "flex",
            marginTop: 24,
            alignItems: "center",
            gap: 14,
          }}
        >
          <Emoji src={target} size={32} />
          <span
            style={{
              color: GREEN,
              fontSize: 34,
              fontWeight: 700,
            }}
          >
            @{kol.handle}
          </span>
          {kol.verified ? (
            <span style={{ color: "#38bdf8", fontSize: 26 }}>✓</span>
          ) : null}
          <span style={{ color: "#71717a", fontSize: 24 }}>{flw} flw</span>
          <Emoji src={fire} size={32} />
        </div>

        {kol.name && kol.name.toLowerCase() !== kol.handle ? (
          <div
            style={{
              display: "flex",
              marginTop: 8,
              color: "#a1a1aa",
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
        "Cache-Control": "public, max-age=300, s-maxage=600, stale-while-revalidate=3600",
      },
    }
  );
}
