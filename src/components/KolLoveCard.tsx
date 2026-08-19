"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { EmojiIcon } from "@/components/EmojiIcon";
import { KOL_OG_QUOTE } from "@/lib/kol-og-quote";

type Props = {
  handle: string;
  name?: string | null;
  followers?: number | null;
  avatarUrl?: string | null;
};

const LOAD_LINES = [
  "Summoning PFP…",
  "Sprinkling brand emojis…",
  "Neon-locking TOKEN$HIT…",
  "Asking if they love Tokenshit…",
  "Printing shitpost OG…",
  "Almost legendary…",
];

export default function KolLoveCard({
  handle,
  name,
  followers,
  avatarUrl,
}: Props) {
  const [busy, setBusy] = useState<"copy" | "dl" | null>(null);
  const [msg, setMsg] = useState("");
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [lineIdx, setLineIdx] = useState(0);

  const cardApi = useMemo(() => {
    const h = encodeURIComponent(handle.replace(/^@/, ""));
    return `/api/kols/card/${h}?v=7`;
  }, [handle]);

  const ogPath = useMemo(() => {
    const h = encodeURIComponent(handle.replace(/^@/, ""));
    return `/kols/${h}/opengraph-image?v=7`;
  }, [handle]);

  const pageUrl = useMemo(() => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/kols/${handle}`;
    }
    return `https://tokenshit.com/kols/${handle}`;
  }, [handle]);

  // Fun loader tick
  useEffect(() => {
    if (!loading) return;
    const t = window.setInterval(() => {
      setLineIdx((i) => (i + 1) % LOAD_LINES.length);
    }, 900);
    return () => window.clearInterval(t);
  }, [loading]);

  // Generate / fetch card as blob (shows loader while OG renders)
  useEffect(() => {
    let dead = false;
    let objectUrl: string | null = null;
    setLoading(true);
    setErr(null);
    setImgUrl(null);

    (async () => {
      try {
        // Prefer API card route; fallback opengraph-image
        let res = await fetch(cardApi, { cache: "no-store" });
        if (!res.ok) {
          res = await fetch(ogPath, { cache: "no-store" });
        }
        if (!res.ok) throw new Error(`Card failed (${res.status})`);
        const blob = await res.blob();
        if (blob.size < 64) throw new Error("Empty card");
        objectUrl = URL.createObjectURL(blob);
        if (dead) {
          URL.revokeObjectURL(objectUrl);
          return;
        }
        setImgUrl(objectUrl);
        setLoading(false);
      } catch (e) {
        if (!dead) {
          setErr(e instanceof Error ? e.message : "Could not generate card");
          setLoading(false);
        }
      }
    })();

    return () => {
      dead = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [cardApi, ogPath]);

  const getBlob = useCallback(async () => {
    if (imgUrl) {
      const r = await fetch(imgUrl);
      const b = await r.blob();
      if (b.size >= 64) return b;
    }
    const res = await fetch(cardApi, { cache: "no-store" });
    if (!res.ok) throw new Error(`Image ${res.status}`);
    const blob = await res.blob();
    if (blob.size < 64) throw new Error("empty image");
    return blob.type === "image/png"
      ? blob
      : new Blob([await blob.arrayBuffer()], { type: "image/png" });
  }, [imgUrl, cardApi]);

  const download = useCallback(async () => {
    setBusy("dl");
    setMsg("Preparing…");
    try {
      const blob = await getBlob();
      const file = new File([blob], `tokenshit-kol-${handle}.png`, {
        type: "image/png",
      });
      if (
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: `@${handle} — ${KOL_OG_QUOTE}`,
          text: `${KOL_OG_QUOTE} — @${handle} on TOKEN$HIT`,
          url: pageUrl,
        });
        setMsg("Shared ✓");
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tokenshit-kol-${handle}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setMsg("Downloaded ✓");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Download failed");
    } finally {
      setBusy(null);
      window.setTimeout(() => setMsg(""), 2000);
    }
  }, [getBlob, handle, pageUrl]);

  const copyImage = useCallback(async () => {
    setBusy("copy");
    setMsg("Copying…");
    try {
      const blob = await getBlob();
      if (
        typeof ClipboardItem !== "undefined" &&
        navigator.clipboard &&
        typeof navigator.clipboard.write === "function"
      ) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": Promise.resolve(blob) }),
        ]);
        setMsg("Image copied ✓");
        return;
      }
      const file = new File([blob], `tokenshit-kol-${handle}.png`, {
        type: "image/png",
      });
      if (
        typeof navigator.share === "function" &&
        navigator.canShare?.({ files: [file] })
      ) {
        await navigator.share({ files: [file], url: pageUrl });
        setMsg("Shared ✓");
        return;
      }
      setMsg("Long-press image to copy");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Copy failed");
    } finally {
      setBusy(null);
      window.setTimeout(() => setMsg(""), 2200);
    }
  }, [getBlob, handle, pageUrl]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setMsg("Link copied ✓");
      window.setTimeout(() => setMsg(""), 1800);
    } catch {
      setMsg(pageUrl);
    }
  }, [pageUrl]);

  const avatarSrc =
    avatarUrl?.replace("_normal", "_400x400").replace("_bigger", "_400x400") ||
    `https://unavatar.io/twitter/${encodeURIComponent(handle)}`;

  const flw =
    followers != null && followers > 0
      ? followers >= 1_000_000
        ? `${(followers / 1_000_000).toFixed(1)}M`
        : followers >= 1_000
          ? `${(followers / 1_000).toFixed(1)}K`
          : followers.toLocaleString()
      : null;

  return (
    <div className="mx-auto w-full max-w-lg space-y-4">
      {/* Card preview 1200/630 aspect */}
      <div className="relative overflow-hidden rounded-2xl border border-neon/30 bg-zinc-950 shadow-[0_0_40px_rgba(57,255,20,0.08)] aspect-[1200/630]">
        {imgUrl && !loading ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgUrl}
            alt={`@${handle} — ${KOL_OG_QUOTE}`}
            className="absolute inset-0 h-full w-full object-cover"
            draggable
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0a0a0f] px-6">
            <div className="flex items-center gap-2 animate-pulse">
              <EmojiIcon size={36}>💩</EmojiIcon>
              <EmojiIcon size={32}>🔥</EmojiIcon>
              <EmojiIcon size={36}>💚</EmojiIcon>
              <EmojiIcon size={32}>✨</EmojiIcon>
            </div>
            <p className="font-monoton text-2xl tracking-wide">
              <span className="neon-text">KOL</span>
              <span className="neon-dollar">$</span>
            </p>
            <p className="font-mono text-xs text-neon animate-pulse text-center">
              {err ? err : LOAD_LINES[lineIdx]}
            </p>
            {!err && (
              <div className="mt-1 h-1.5 w-44 overflow-hidden rounded-full bg-zinc-800">
                <div className="h-full w-2/3 animate-pulse rounded-full bg-neon shadow-[0_0_12px_#39ff14]" />
              </div>
            )}
            {err && (
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  setErr(null);
                  // remount effect via query bump
                  window.location.reload();
                }}
                className="mt-2 rounded-lg border border-neon/40 px-3 py-1.5 text-xs text-neon"
              >
                Retry
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 px-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarSrc}
          alt=""
          className="h-12 w-12 rounded-full border border-neon/40 bg-zinc-900 object-cover"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const el = e.currentTarget;
            if (!el.src.includes("unavatar.io")) {
              el.src = `https://unavatar.io/twitter/${encodeURIComponent(handle)}`;
            }
          }}
        />
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold text-white">
            {name || `@${handle}`}
          </div>
          <div className="font-mono text-xs text-zinc-500">
            @{handle}
            {flw ? ` · ${flw} flw` : ""}
          </div>
        </div>
        <a
          href={`https://x.com/${handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-zinc-700 px-2.5 py-1.5 text-[11px] text-zinc-300 hover:border-neon"
        >
          X ↗
        </a>
      </div>

      <p className="flex items-center justify-center gap-2 text-center font-mono text-sm text-[#fff8e7]/90">
        <EmojiIcon size={18}>💚</EmojiIcon>
        “{KOL_OG_QUOTE}”
        <EmojiIcon size={18}>💩</EmojiIcon>
      </p>

      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          disabled={busy !== null || loading || !imgUrl}
          onClick={() => void copyImage()}
          className="min-h-11 rounded-xl bg-neon text-black text-xs font-bold disabled:opacity-50 active:scale-[0.98]"
        >
          {busy === "copy" ? "…" : "Copy image"}
        </button>
        <button
          type="button"
          disabled={busy !== null || loading || !imgUrl}
          onClick={() => void download()}
          className="min-h-11 rounded-xl border border-neon/50 text-neon text-xs font-bold disabled:opacity-50 active:scale-[0.98]"
        >
          {busy === "dl" ? "…" : "Download"}
        </button>
        <button
          type="button"
          onClick={() => void copyLink()}
          className="min-h-11 rounded-xl border border-zinc-600 text-zinc-200 text-xs font-semibold active:scale-[0.98]"
        >
          Copy link
        </button>
      </div>

      {msg ? (
        <p className="text-center font-mono text-xs text-neon">{msg}</p>
      ) : (
        <p className="text-center text-[11px] text-zinc-600">
          Share the link — OG shows this card
        </p>
      )}

      <a
        href="/claim"
        className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-3 text-sm text-zinc-300 hover:border-neon/40"
      >
        <EmojiIcon size={16}>📢</EmojiIcon>
        Recommend more KOLs
      </a>
    </div>
  );
}
