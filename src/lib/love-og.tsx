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
import { KOL_OG_ASSETS } from "@/lib/kol-og-assets";

export const LOVE_OG_QUOTE = "I LOVE TOKENSHIT";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";

async function pfpDataUrl(url: string | null | undefined): Promise<string | null> {
  if (!url) return null;
  try {
    const u = url
      .replace("_normal", "_400x400")
      .replace("_bigger", "_400x400");
    const res = await fetch(u, {
      headers: { "User-Agent": UA, Accept: "image/*", Referer: "https://x.com/" },
      signal: AbortSignal.timeout(2500),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 32) return null;
    const isPng = buf[0] === 0x89 && buf[1] === 0x50;
    const isJpeg = buf[0] === 0xff && buf[1] === 0xd8;
    if (!isPng && !isJpeg) return null;
    return `data:${isPng ? "image/png" : "image/jpeg"};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function loadLoveReferrer(raw?: string | null) {
  const h = (raw || "").replace(/^@/, "").trim().toLowerCase();
  if (!h || !/^[a-z0-9_]{1,15}$/.test(h)) {
    return { handle: null as string | null, name: null as string | null, pfp: null as string | null };
  }
  try {
    const x = await fetchXUserPublic(h);
    if (!x.ok) return { handle: h, name: h, pfp: null };
    const pfp = await pfpDataUrl(x.profileImageUrl);
    return {
      handle: (x.username || h).replace(/^@/, "").toLowerCase(),
      name: x.name || h,
      pfp,
    };
  } catch {
    return { handle: h, name: h, pfp: null };
  }
}

export async function renderLoveOg(ref?: string | null): Promise<ImageResponse> {
  const [refUser, monoton, inter] = await Promise.all([
    loadLoveReferrer(ref),
    loadMonoton(),
    loadInter(),
  ]);

  const fonts: {
    name: string;
    data: ArrayBuffer;
    style: "normal";
    weight: 400 | 700;
  }[] = [];
  if (monoton)
    fonts.push({ name: "Monoton", data: monoton, style: "normal", weight: 400 });
  if (inter) {
    fonts.push(
      { name: "Inter", data: inter.regular, style: "normal", weight: 400 },
      { name: "Inter", data: inter.bold, style: "normal", weight: 700 }
    );
  }

  const heart = KOL_OG_ASSETS.heart;
  const fire = KOL_OG_ASSETS.fire;
  const sparkles = KOL_OG_ASSETS.sparkles;
  const hasRef = !!refUser.handle;

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
          fontFamily: inter ? "Inter" : "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: 999,
            background: "rgba(57,255,20,0.14)",
            top: -140,
            right: -100,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: 999,
            background: "rgba(240,192,64,0.1)",
            bottom: -120,
            left: -80,
          }}
        />

        {/* brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {heart ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heart} width={40} height={40} alt="" />
          ) : null}
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
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            gap: 40,
            marginTop: 12,
          }}
        >
          {/* referrer pfp */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              width: 280,
            }}
          >
            <div
              style={{
                display: "flex",
                width: 200,
                height: 200,
                borderRadius: 999,
                border: `6px solid ${GREEN}`,
                overflow: "hidden",
                background: "#12121a",
                boxShadow: `0 0 40px ${GREEN}66`,
              }}
            >
              {refUser.pfp ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={refUser.pfp}
                  width={200}
                  height={200}
                  alt=""
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    height: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 72,
                    color: GREEN,
                    fontFamily: "Monoton",
                  }}
                >
                  💚
                </div>
              )}
            </div>
            {hasRef ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    color: CREAM,
                    fontSize: 26,
                    fontWeight: 700,
                    maxWidth: 260,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {refUser.name}
                </div>
                <div
                  style={{
                    display: "flex",
                    color: GREEN,
                    fontSize: 22,
                    fontFamily: "Inter",
                    fontWeight: 700,
                  }}
                >
                  @{refUser.handle}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", color: "#71717a", fontSize: 20 }}>
                tokenshit.com/love
              </div>
            )}
          </div>

          {/* quote */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              gap: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: "#a1a1aa",
                fontSize: 18,
                letterSpacing: 3,
              }}
            >
              {sparkles ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={sparkles} width={28} height={28} alt="" />
              ) : null}
              LOVE DROP · 67 PLAYS GAS
            </div>
            <div
              style={{
                display: "flex",
                fontFamily: "Monoton",
                fontSize: 56,
                color: CREAM,
                textShadow: creamGlow(true),
                lineHeight: 1.05,
              }}
            >
              I LOVE
            </div>
            <div
              style={{
                display: "flex",
                fontFamily: "Monoton",
                fontSize: 56,
                letterSpacing: 2,
              }}
            >
              <span style={{ color: CREAM, textShadow: creamGlow(true) }}>TOKEN</span>
              <span style={{ color: GREEN, textShadow: dollarGlow(true) }}>$</span>
              <span style={{ color: CREAM, textShadow: creamGlow(true) }}>HIT</span>
            </div>
            {hasRef ? (
              <div
                style={{
                  display: "flex",
                  color: "#a1a1aa",
                  fontSize: 22,
                  marginTop: 8,
                }}
              >
                via @{refUser.handle} · join the bag
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  color: "#a1a1aa",
                  fontSize: 22,
                  marginTop: 8,
                }}
              >
                Tweet it. Claim gas. Play $HIT OF THE DAY.
              </div>
            )}
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
              alignItems: "center",
              gap: 8,
              color: "#52525b",
              fontSize: 20,
            }}
          >
            {fire ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fire} width={24} height={24} alt="" />
            ) : null}
            tokenshit.com/love
            {hasRef ? `?ref=${refUser.handle}` : ""}
          </div>
          <div style={{ display: "flex", color: GREEN, fontSize: 18 }}>
            @tokenshit_
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts,
      headers: {
        "Cache-Control":
          "public, max-age=300, s-maxage=600, stale-while-revalidate=3600",
      },
    }
  );
}
