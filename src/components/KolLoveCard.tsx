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

function fmtFollowers(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n) || n <= 0) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export default function KolLoveCard({
  handle,
  name,
  followers,
  avatarUrl,
}: Props) {
  const [busy, setBusy] = useState<"copy" | "dl" | null>(null);
  const [msg, setMsg] = useState("");
  const [pngUrl, setPngUrl] = useState<string | null>(null);
  const [pngReady, setPngReady] = useState(false);
  const [pngErr, setPngErr] = useState(false);

  const h = handle.replace(/^@/, "");

  const cardApi = useMemo(
    () => `/api/kols/card/${encodeURIComponent(h)}?v=11`,
    [h]
  );

  const pageUrl = useMemo(() => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/kols/${h}`;
    }
    return `https://tokenshit.com/kols/${h}`;
  }, [h]);

  const shareText = useMemo(
    () => `${KOL_OG_QUOTE}\n\n@${h} on @Tokenshit_\n\n${pageUrl}`,
    [h, pageUrl]
  );

  const xShareUrl = useMemo(() => {
    const u = new URL("https://x.com/intent/tweet");
    u.searchParams.set("text", shareText);
    return u.toString();
  }, [shareText]);

  const tgShareUrl = useMemo(() => {
    const u = new URL("https://t.me/share/url");
    u.searchParams.set("url", pageUrl);
    u.searchParams.set("text", `${KOL_OG_QUOTE}\n\n@${h} on @Tokenshit_`);
    return u.toString();
  }, [h, pageUrl]);

  const avatarSrc =
    avatarUrl
      ?.replace("_normal", "_400x400")
      .replace("_bigger", "_400x400") ||
    `https://unavatar.io/twitter/${encodeURIComponent(h)}`;

  // Prefetch PNG in background (uses CDN/memory cache after first hit)
  useEffect(() => {
    let dead = false;
    let objectUrl: string | null = null;
    setPngReady(false);
    setPngErr(false);
    setPngUrl(null);

    (async () => {
      try {
        const res = await fetch(cardApi, {
          // allow browser HTTP cache — second visit is instant
          cache: "force-cache",
        });
        if (!res.ok) throw new Error(String(res.status));
        const blob = await res.blob();
        if (blob.size < 64) throw new Error("empty");
        objectUrl = URL.createObjectURL(blob);
        if (dead) {
          URL.revokeObjectURL(objectUrl);
          return;
        }
        setPngUrl(objectUrl);
        setPngReady(true);
      } catch {
        if (!dead) setPngErr(true);
      }
    })();

    return () => {
      dead = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [cardApi]);

  const getBlob = useCallback(async () => {
    if (pngUrl) {
      const r = await fetch(pngUrl);
      const b = await r.blob();
      if (b.size >= 64) return b;
    }
    const res = await fetch(cardApi, { cache: "force-cache" });
    if (!res.ok) throw new Error(`Image ${res.status}`);
    const blob = await res.blob();
    if (blob.size < 64) throw new Error("empty image");
    return blob.type === "image/png"
      ? blob
      : new Blob([await blob.arrayBuffer()], { type: "image/png" });
  }, [pngUrl, cardApi]);

  const download = useCallback(async () => {
    setBusy("dl");
    setMsg(pngReady ? "Saving…" : "Generating PNG…");
    try {
      const blob = await getBlob();
      const file = new File([blob], `tokenshit-kol-${h}.png`, {
        type: "image/png",
      });
      if (
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: `@${h} — ${KOL_OG_QUOTE}`,
          text: shareText,
          url: pageUrl,
        });
        setMsg("Shared ✓");
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tokenshit-kol-${h}.png`;
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
  }, [getBlob, h, pageUrl, shareText, pngReady]);

  const copyImage = useCallback(async () => {
    setBusy("copy");
    setMsg(pngReady ? "Copying…" : "Generating PNG…");
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
      const file = new File([blob], `tokenshit-kol-${h}.png`, {
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
  }, [getBlob, h, pageUrl, pngReady]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setMsg("Link copied ✓");
      window.setTimeout(() => setMsg(""), 1800);
    } catch {
      setMsg(pageUrl);
    }
  }, [pageUrl]);

  return (
    <div className="mx-auto w-full max-w-lg space-y-4">
      {/* Instant CSS card (no wait) — OG PNG loads behind for export */}
      <div className="relative overflow-hidden rounded-2xl border border-neon/30 bg-[#0a0a0f] shadow-[0_0_40px_rgba(57,255,20,0.08)] aspect-[1200/630]">
        {/* If PNG ready, prefer it (matches share exactly) */}
        {pngReady && pngUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pngUrl}
            alt={`@${h} — ${KOL_OG_QUOTE}`}
            className="absolute inset-0 h-full w-full object-cover"
            draggable
          />
        ) : (
          <div className="absolute inset-0 flex flex-col p-4 sm:p-5">
            {/* brand row */}
            <div className="flex items-center gap-2 mb-3">
              <span className="font-monoton text-lg sm:text-xl tracking-wide">
                <span className="neon-text">TOKEN</span>
                <span className="neon-dollar">$</span>
                <span className="neon-text">HIT</span>
              </span>
              <EmojiIcon size={18}>💚</EmojiIcon>
              <span className="ml-auto font-orbitron text-[9px] uppercase tracking-wider text-zinc-600">
                KOL card
              </span>
            </div>
            <div className="flex flex-1 items-center gap-3 sm:gap-4 min-h-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarSrc}
                alt=""
                className="h-20 w-20 sm:h-24 sm:w-24 rounded-full border-[3px] border-neon object-cover bg-zinc-900 shadow-[0_0_24px_rgba(57,255,20,0.35)] shrink-0"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const el = e.currentTarget;
                  if (!el.src.includes("unavatar.io")) {
                    el.src = `https://unavatar.io/twitter/${encodeURIComponent(h)}`;
                  }
                }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <EmojiIcon size={16}>💚</EmojiIcon>
                  <EmojiIcon size={14}>🔥</EmojiIcon>
                </div>
                <p className="text-[#fff8e7] font-bold text-base sm:text-lg leading-snug">
                  “{KOL_OG_QUOTE}”
                </p>
                <p className="mt-2 font-mono text-neon text-sm font-bold truncate">
                  @{h}
                </p>
                <p className="text-zinc-500 text-xs font-mono">
                  {name && name.toLowerCase() !== h.toLowerCase()
                    ? `${name} · `
                    : ""}
                  {fmtFollowers(followers)} flw
                </p>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-zinc-800 pt-2">
              <span className="text-[10px] text-zinc-600 font-mono truncate">
                Every KOL is shit until proven otherwise
              </span>
              {!pngErr && (
                <span className="text-[9px] text-zinc-600 font-orbitron uppercase tracking-wide animate-pulse shrink-0 ml-2">
                  PNG…
                </span>
              )}
            </div>
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
        />
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold text-white">
            {name || `@${h}`}
          </div>
          <div className="font-mono text-xs text-zinc-500">
            @{h}
            {followers != null ? ` · ${fmtFollowers(followers)} flw` : ""}
          </div>
        </div>
        <a
          href={`https://x.com/${h}`}
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
        <EmojiIcon size={18}>💚</EmojiIcon>
      </p>

      <div className="grid grid-cols-2 gap-2">
        <a
          href={xShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 text-white text-xs font-bold hover:bg-sky-400 active:scale-[0.98]"
        >
          <span className="font-sans font-black text-sm">𝕏</span>
          Share on X
        </a>
        <a
          href={tgShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-[#2AABEE] text-white text-xs font-bold hover:brightness-110 active:scale-[0.98]"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
            className="shrink-0"
          >
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.45 4.476-1.458z" />
          </svg>
          Telegram
        </a>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void copyImage()}
          className="min-h-11 rounded-xl bg-neon text-black text-xs font-bold disabled:opacity-50 active:scale-[0.98]"
        >
          {busy === "copy" ? "…" : "Copy image"}
        </button>
        <button
          type="button"
          disabled={busy !== null}
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
          Card shows instantly · PNG caches for share/copy
          {pngReady ? " · ready" : pngErr ? " · PNG slow/fail" : " · baking PNG…"}
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
