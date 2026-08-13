"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { EmojiIcon } from "@/components/EmojiIcon";
import {
  blankSrc,
  defaultBoxes,
  ensureMonotonFont,
  renderTokenshitMeme,
  type MemeBox,
  type MemeTemplate,
} from "@/lib/meme-render";

type FaceFilter = "all" | "toly" | "original";

export default function MemeStudio() {
  const [items, setItems] = useState<MemeTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [face, setFace] = useState<FaceFilter>("all");
  const [selected, setSelected] = useState<MemeTemplate | null>(null);
  const [boxes, setBoxes] = useState<MemeBox[]>([]);
  const [texts, setTexts] = useState<string[]>(["", ""]);
  const [preview, setPreview] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [fontReady, setFontReady] = useState(false);

  useEffect(() => {
    ensureMonotonFont().then(() => setFontReady(true));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const params = new URLSearchParams({
        limit: "100",
        source: "all",
        face,
      });
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`/api/memes/templates?${params}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "failed");
      const list = (data.items || []) as MemeTemplate[];
      setItems(list);
      if (!selected && list[0]) selectTemplate(list[0]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [face, q]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load();
  }, [load]);

  function selectTemplate(t: MemeTemplate) {
    setSelected(t);
    const n = Math.max(1, Math.min(8, t.lines || 2));
    const b =
      t.boxes && t.boxes.length
        ? t.boxes.map((x) => ({
            ...x,
            style: "monoton" as const,
            fontScale: x.fontScale ?? 1,
          }))
        : defaultBoxes(n);
    setBoxes(b);
    setTexts((prev) => {
      const next = b.map((_, i) => prev[i] || "");
      return next;
    });
  }

  // Live preview
  useEffect(() => {
    if (!selected || !fontReady) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      setBusy(true);
      try {
        const url = await renderTokenshitMeme(
          selected.blank,
          boxes,
          texts,
          { brand: true }
        );
        if (!cancelled) setPreview(url);
      } catch {
        if (!cancelled) setPreview("");
      } finally {
        if (!cancelled) setBusy(false);
      }
    }, 180);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [selected, boxes, texts, fontReady]);

  const filtered = useMemo(() => {
    if (!q.trim()) return items;
    const needle = q.trim().toLowerCase();
    return items.filter(
      (t) =>
        t.name.toLowerCase().includes(needle) ||
        t.id.toLowerCase().includes(needle) ||
        (t.keywords || []).some((k) => k.toLowerCase().includes(needle))
    );
  }, [items, q]);

  async function download() {
    if (!preview) return;
    const a = document.createElement("a");
    a.href = preview;
    a.download = `tokenshit-${selected?.id || "meme"}.png`;
    a.click();
  }

  async function shareX() {
    const text = encodeURIComponent(
      `Talkin' $HIT  ·  tokenshit.com/memes\n@Tokenshit_`
    );
    window.open(`https://x.com/intent/tweet?text=${text}`, "_blank");
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-3 sm:px-4 pt-4 pb-16 space-y-5">
      <header className="rounded-2xl border border-border bg-card p-5 space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-monoton leading-none">
              <span className="neon-text">MEME</span>
              <span className="neon-dollar">$</span>
              <span className="neon-text">HIT</span>
            </h1>
            <p className="text-sm text-zinc-500 mt-2">
              Blanks from{" "}
              <a
                href="https://memes.sal.fun"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neon-blue hover:underline"
              >
                memes.sal.fun
              </a>
              . Captions default to{" "}
              <strong className="text-zinc-300">Monoton</strong> with cream +
              gold glow.
            </p>
          </div>
          <Link
            href="/"
            className="text-xs text-zinc-500 hover:text-neon-blue"
          >
            ← Home
          </Link>
        </div>
      </header>

      <div className="flex flex-wrap gap-2 items-center">
        {(["all", "toly", "original"] as FaceFilter[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFace(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              face === f
                ? "border-neon bg-neon/15 text-neon"
                : "border-border text-zinc-400 hover:border-zinc-500"
            }`}
          >
            {f === "all" ? "All" : f === "toly" ? "Toly" : "Non-Toly"}
          </button>
        ))}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search blanks…"
          className="flex-1 min-w-[160px] rounded-lg border border-border bg-zinc-950 px-3 py-1.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-neon/50"
        />
      </div>

      {err && (
        <p className="text-sm text-red-400 font-mono">{err}</p>
      )}

      <div className="grid lg:grid-cols-[1fr_320px] gap-5">
        {/* Editor */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-zinc-950 overflow-hidden">
            <div className="relative aspect-square sm:aspect-auto sm:min-h-[420px] flex items-center justify-center bg-black">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt="Meme preview"
                  className="max-h-[70vh] w-full object-contain"
                />
              ) : selected ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={blankSrc(selected.blank)}
                  alt={selected.name}
                  className="max-h-[70vh] w-full object-contain opacity-80"
                />
              ) : (
                <div className="text-zinc-600 text-sm py-20">
                  Pick a blank
                </div>
              )}
              {busy && (
                <div className="absolute top-3 right-3 text-xs text-zinc-400 flex items-center gap-1">
                  <EmojiIcon size={14} className="animate-spin">
                    💫
                  </EmojiIcon>
                  render
                </div>
              )}
            </div>
          </div>

          {selected && (
            <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-white">
                    {selected.name}
                  </div>
                  <div className="text-[11px] font-mono text-zinc-600">
                    {selected.id}
                    {selected.tag ? ` · ${selected.tag}` : ""}
                  </div>
                </div>
                <div className="text-[10px] uppercase tracking-wide text-neon">
                  Monoton + glow
                </div>
              </div>

              {boxes.map((box, i) => (
                <label key={box.id} className="block space-y-1">
                  <span className="text-[11px] text-zinc-500">
                    {box.label || `Line ${i + 1}`}
                  </span>
                  <textarea
                    value={texts[i] || ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      setTexts((prev) => {
                        const next = [...prev];
                        next[i] = v;
                        return next;
                      });
                    }}
                    rows={2}
                    autoCapitalize="characters"
                    placeholder="TYPE IN ALL CAPS…"
                    className="w-full rounded-lg border border-border bg-zinc-950 px-3 py-2 text-sm text-white font-monoton placeholder:font-sans placeholder:text-zinc-600 focus:outline-none focus:border-neon/40 resize-y min-h-[48px]"
                    style={{
                      textShadow:
                        "0 0 12px rgba(240,192,64,0.55), 0 0 2px rgba(255,248,231,0.8)",
                      color: "#fff8e7",
                    }}
                  />
                </label>
              ))}

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={download}
                  disabled={!preview}
                  className="px-4 py-2 rounded-lg bg-neon text-black text-sm font-semibold disabled:opacity-40"
                >
                  Download PNG
                </button>
                <button
                  type="button"
                  onClick={shareX}
                  className="px-4 py-2 rounded-lg border border-zinc-600 text-sm text-zinc-200 hover:border-sky-500"
                >
                  Share on X
                </button>
                {selected.editorUrl && (
                  <a
                    href={selected.editorUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg border border-border text-sm text-zinc-400 hover:text-neon-blue"
                  >
                    Open on memes.sal.fun
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Template grid */}
        <div className="space-y-2">
          <div className="text-[11px] uppercase tracking-wide text-zinc-500">
            Blanks
            {loading ? " · loading…" : ` · ${filtered.length}`}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2 max-h-[70vh] overflow-y-auto pr-1">
            {filtered.map((t) => {
              const active = selected?.id === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => selectTemplate(t)}
                  className={`rounded-xl border overflow-hidden text-left transition-colors ${
                    active
                      ? "border-neon ring-1 ring-neon/40"
                      : "border-border hover:border-zinc-500"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={blankSrc(t.blank)}
                    alt={t.name}
                    loading="lazy"
                    className="w-full aspect-square object-cover bg-zinc-950"
                  />
                  <div className="px-2 py-1.5 bg-card">
                    <div className="text-[11px] text-zinc-200 truncate font-medium">
                      {t.name}
                    </div>
                    <div className="text-[10px] text-zinc-600 truncate">
                      {t.tag || t.face || t.source}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
