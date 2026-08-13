"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { EmojiIcon } from "@/components/EmojiIcon";
import MemeStage from "@/components/MemeStage";
import {
  blankSrc,
  defaultBoxes,
  ensureMonotonFont,
  isDarkStyle,
  renderTokenshitMeme,
  renderTokenshitMemeBlob,
  type MemeBox,
  type MemeTemplate,
} from "@/lib/meme-render";

type FaceFilter = "all" | "toly" | "original";

const MAX_UPLOAD = 12 * 1024 * 1024;

function fileToDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ""));
    r.onerror = () => reject(new Error("read failed"));
    r.readAsDataURL(file);
  });
}

export default function MemeStudio() {
  const [items, setItems] = useState<MemeTemplate[]>([]);
  const [uploads, setUploads] = useState<MemeTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [face, setFace] = useState<FaceFilter>("all");
  const [selected, setSelected] = useState<MemeTemplate | null>(null);
  const [boxes, setBoxes] = useState<MemeBox[]>([]);
  const [texts, setTexts] = useState<string[]>([]);
  const [activeBox, setActiveBox] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void ensureMonotonFont();
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const params = new URLSearchParams({
        limit: "120",
        source: "all",
        face,
      });
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`/api/memes/templates?${params}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "failed");
      setItems((data.items || []) as MemeTemplate[]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [face, q]);

  useEffect(() => {
    load();
  }, [load]);

  const open = useCallback((t: MemeTemplate) => {
    setSelected(t);
    const n = Math.max(1, Math.min(8, t.lines || 2));
    const b =
      t.boxes && t.boxes.length
        ? t.boxes.map((x) => ({
            ...x,
            // preserve plain (dark) from API; otherwise light Monoton glow
            style: (isDarkStyle(x.style) ? "dark" : "light") as MemeBox["style"],
            fontScale: x.fontScale ?? 1,
          }))
        : defaultBoxes(n);
    setBoxes(b);
    setTexts(b.map(() => ""));
    setActiveBox(0);
  }, []);

  const openFromBlob = useCallback(
    async (blob: Blob, nameHint = "Upload") => {
      if (!blob.type.startsWith("image/")) {
        alert("Please use an image (PNG, JPG, WebP, GIF)");
        return;
      }
      if (blob.size > MAX_UPLOAD) {
        alert("Image too large (max 12MB)");
        return;
      }
      const dataUrl = await fileToDataUrl(blob);
      const id = `upload-${Date.now()}`;
      const tpl: MemeTemplate = {
        id,
        name: nameHint.replace(/\.[^.]+$/, "") || "Your image",
        blank: dataUrl,
        source: "local",
        lines: 2,
        featured: true,
        tag: "Upload",
        keywords: ["upload", "custom"],
        boxes: defaultBoxes(2),
      };
      setUploads((prev) => [tpl, ...prev].slice(0, 24));
      open(tpl);
    },
    [open]
  );

  const allTemplates = useMemo(
    () => [...uploads, ...items],
    [uploads, items]
  );

  const filtered = useMemo(() => {
    let list = allTemplates;
    if (face === "toly") {
      list = list.filter(
        (t) =>
          t.face === "toly" ||
          t.tag === "Toly" ||
          t.id.toLowerCase().includes("toly")
      );
    } else if (face === "original") {
      list = list.filter(
        (t) =>
          t.face !== "toly" &&
          t.tag !== "Toly" &&
          !t.id.toLowerCase().includes("toly")
      );
    }
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(needle) ||
          t.id.toLowerCase().includes(needle) ||
          (t.keywords || []).some((k) => k.toLowerCase().includes(needle))
      );
    }
    return list;
  }, [allTemplates, face, q]);

  const templateIndex = selected
    ? filtered.findIndex((t) => t.id === selected.id)
    : -1;

  const goTemplate = useCallback(
    (dir: -1 | 1) => {
      if (!filtered.length) return;
      const i =
        templateIndex < 0
          ? 0
          : (templateIndex + dir + filtered.length) % filtered.length;
      open(filtered[i]!);
    },
    [filtered, templateIndex, open]
  );

  const setTextAt = (i: number, v: string) => {
    setTexts((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });
  };

  const setFontScale = (v: number) => {
    if (activeBox < 0 || !boxes[activeBox]) return;
    setBoxes((prev) =>
      prev.map((b, i) => (i === activeBox ? { ...b, fontScale: v } : b))
    );
  };

  const setActiveTone = (dark: boolean) => {
    if (activeBox < 0 || !boxes[activeBox]) return;
    setBoxes((prev) =>
      prev.map((b, i) =>
        i === activeBox ? { ...b, style: dark ? "dark" : "light" } : b
      )
    );
  };

  const addBox = () => {
    if (boxes.length >= 8) return;
    const i = boxes.length;
    setBoxes((prev) => [
      ...prev,
      {
        id: `line-${i + 1}-${Date.now()}`,
        label: `Line ${i + 1}`,
        x: 0.1,
        y: 0.35 + (i % 3) * 0.12,
        w: 0.8,
        h: 0.16,
        style: "light",
        align: "center",
        fontScale: 1,
      },
    ]);
    setTexts((prev) => [...prev, ""]);
    setActiveBox(i);
  };

  const removeBox = () => {
    if (boxes.length <= 1) return;
    const idx = activeBox >= 0 ? activeBox : boxes.length - 1;
    setBoxes((prev) => prev.filter((_, i) => i !== idx));
    setTexts((prev) => prev.filter((_, i) => i !== idx));
    setActiveBox((i) => Math.max(0, Math.min(i, boxes.length - 2)));
  };

  async function download() {
    if (!selected) return;
    setExporting(true);
    try {
      const url = await renderTokenshitMeme(selected.blank, boxes, texts, {
        brand: true,
      });
      const a = document.createElement("a");
      a.href = url;
      a.download = `tokenshit-${selected.id}.png`;
      a.click();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }

  async function copyImage() {
    if (!selected) return;
    setExporting(true);
    try {
      const blob = await renderTokenshitMemeBlob(selected.blank, boxes, texts, {
        brand: true,
      });
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      alert("Copy failed — try Download");
    } finally {
      setExporting(false);
    }
  }

  function shareX() {
    const text = encodeURIComponent(
      `Talkin' $HIT  ·  tokenshit.com/memes\n@Tokenshit_`
    );
    window.open(`https://x.com/intent/tweet?text=${text}`, "_blank");
  }

  const featured = useMemo(
    () =>
      filtered.filter(
        (t) => t.featured && (t.tag === "Toly" || t.face === "toly" || t.tag === "Upload")
      ).slice(0, 24),
    [filtered]
  );
  const rest = useMemo(() => {
    const ids = new Set(featured.map((t) => t.id));
    return filtered.filter((t) => !ids.has(t.id));
  }, [filtered, featured]);

  return (
    <div
      className="mx-auto min-h-[70vh] w-full max-w-7xl px-3 sm:px-6 pb-20 pt-6"
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files?.[0];
        if (f) void openFromBlob(f, f.name);
      }}
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void openFromBlob(f, f.name);
          e.target.value = "";
        }}
      />

      {/* Header */}
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-monoton leading-none">
            <span className="neon-text">MEME</span>
            <span className="neon-dollar">$</span>
            <span className="neon-text">HIT</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-zinc-500">
            Pick a blank · type captions · drag & resize · light/dark Monoton.
            Blanks via{" "}
            <a
              href="https://memes.sal.fun"
              className="text-neon-blue hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              memes.sal.fun
            </a>
            .
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-2xl border border-neon/40 bg-neon/10 px-4 py-2.5 text-sm font-semibold text-neon hover:bg-neon/20"
          >
            Upload image
          </button>
          <Link
            href="/"
            className="rounded-2xl border border-white/10 px-4 py-2.5 text-sm text-zinc-400 hover:bg-white/5"
          >
            Home
          </Link>
        </div>
      </header>

      {dragOver && (
        <div className="mb-6 rounded-2xl border-2 border-dashed border-neon/50 bg-neon/5 py-10 text-center text-neon">
          Drop image to caption
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {(["all", "toly", "original"] as FaceFilter[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFace(f)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-colors ${
              face === f
                ? "border-neon bg-neon text-black"
                : "border-white/10 text-zinc-400 hover:border-white/25"
            }`}
          >
            {f === "all" ? "All" : f === "toly" ? "Toly" : "Non-Toly"}
          </button>
        ))}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search blanks…"
          className="min-w-[180px] flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-neon/40"
        />
      </div>

      {err && <p className="mb-4 text-sm text-red-400 font-mono">{err}</p>}
      {loading && (
        <p className="mb-4 text-sm text-zinc-500 flex items-center gap-2">
          <EmojiIcon size={14} className="animate-spin">
            💫
          </EmojiIcon>
          Loading blanks…
        </p>
      )}

      {featured.length > 0 && !q.trim() && face !== "original" && (
        <section className="mb-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-neon">
            Featured ({featured.length})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {featured.map((t) => (
              <TemplateCard key={t.id} t={t} onOpen={open} />
            ))}
          </div>
        </section>
      )}

      <p className="mb-4 text-xs uppercase tracking-[0.2em] text-zinc-600">
        {q.trim()
          ? `${filtered.length} matches`
          : `${rest.length} templates`}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {(q.trim() ? filtered : rest).map((t) => (
          <TemplateCard key={t.id} t={t} onOpen={open} />
        ))}
      </div>

      {/* Editor modal — same layout pattern as memes.sal.fun */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-0 backdrop-blur-sm md:items-center md:p-6">
          <div className="flex max-h-[100svh] w-full max-w-5xl flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-[#0a0a0a] md:max-h-[90svh] md:rounded-3xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 md:px-6">
              <div className="min-w-0">
                <div className="truncate text-lg font-bold text-white">
                  {selected.name}
                </div>
                <div className="text-xs text-zinc-500">
                  {templateIndex >= 0
                    ? `${templateIndex + 1}/${filtered.length}`
                    : selected.id}
                  {` · ${boxes.length} caption${boxes.length === 1 ? "" : "s"} · Monoton`}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goTemplate(-1)}
                  className="rounded-full border border-white/10 p-2 text-zinc-300 hover:bg-white/10"
                  aria-label="Previous"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => goTemplate(1)}
                  className="rounded-full border border-white/10 p-2 text-zinc-300 hover:bg-white/10"
                  aria-label="Next"
                >
                  ›
                </button>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-full border border-white/10 p-2 text-zinc-300 hover:bg-white/10"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="grid min-h-0 flex-1 gap-0 overflow-y-auto md:grid-cols-2">
              <div className="flex items-center justify-center bg-black p-4 md:p-8">
                <div className="relative w-full max-w-md">
                  <MemeStage
                    blankUrl={selected.blank}
                    boxes={boxes}
                    texts={texts}
                    activeIndex={activeBox}
                    onActiveChange={(i) =>
                      setActiveBox(i < 0 ? activeBox : i)
                    }
                    onBoxesChange={setBoxes}
                    onSwipe={goTemplate}
                  />
                  <p className="mt-2 text-center text-[11px] text-zinc-500">
                    Swipe / arrows · drag caption · corner resize · light/dark
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4 border-t border-white/10 p-4 md:border-l md:border-t-0 md:p-6">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Captions
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={removeBox}
                      disabled={boxes.length <= 1}
                      className="rounded-xl border border-white/10 px-2.5 py-1.5 text-xs font-semibold disabled:opacity-40 hover:bg-white/10"
                    >
                      − Remove
                    </button>
                    <button
                      type="button"
                      onClick={addBox}
                      disabled={boxes.length >= 8}
                      className="rounded-xl border border-neon/30 bg-neon/10 px-2.5 py-1.5 text-xs font-semibold text-neon disabled:opacity-40 hover:bg-neon/20"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {boxes.map((box, i) => (
                  <label
                    key={box.id}
                    className={`block rounded-2xl border p-3 ${
                      i === activeBox
                        ? "border-neon/40 bg-neon/5"
                        : "border-white/10"
                    }`}
                    onClick={() => setActiveBox(i)}
                  >
                    <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                      {box.label || `Line ${i + 1}`}
                    </span>
                    <textarea
                      value={texts[i] || ""}
                      onChange={(e) => setTextAt(i, e.target.value)}
                      onFocus={() => setActiveBox(i)}
                      rows={2}
                      placeholder={(
                        box.label || `Caption ${i + 1}`
                      ).toUpperCase()}
                      className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm uppercase outline-none ring-neon/40 focus:ring-2 text-white"
                      style={{ textTransform: "uppercase" }}
                      autoCapitalize="characters"
                      spellCheck={false}
                      dir="ltr"
                    />
                  </label>
                ))}

                {boxes[activeBox] && (
                  <>
                    <label className="block">
                      <span className="mb-1.5 flex items-center justify-between text-xs font-medium uppercase tracking-wider text-zinc-500">
                        <span>Font size</span>
                        <span className="text-zinc-400">
                          {Math.round(
                            (boxes[activeBox].fontScale ?? 1) * 100
                          )}
                          %
                        </span>
                      </span>
                      <input
                        type="range"
                        min={0.5}
                        max={2}
                        step={0.05}
                        value={boxes[activeBox].fontScale ?? 1}
                        onChange={(e) =>
                          setFontScale(Number(e.target.value))
                        }
                        className="w-full accent-[#39ff14]"
                      />
                    </label>

                    <div>
                      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                        Colour
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveTone(false)}
                          className={`flex-1 rounded-xl border px-3 py-2 text-xs font-semibold ${
                            !isDarkStyle(boxes[activeBox].style)
                              ? "border-neon bg-neon/15 text-cream"
                              : "border-white/10 text-zinc-400"
                          }`}
                          style={
                            !isDarkStyle(boxes[activeBox].style)
                              ? {
                                  color: "#fff8e7",
                                  textShadow:
                                    "0 0 10px rgba(240,192,64,0.7)",
                                }
                              : undefined
                          }
                        >
                          Light (glow)
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTone(true)}
                          className={`flex-1 rounded-xl border px-3 py-2 text-xs font-semibold ${
                            isDarkStyle(boxes[activeBox].style)
                              ? "border-zinc-300 bg-white text-black"
                              : "border-white/10 text-zinc-400"
                          }`}
                        >
                          Dark
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <div className="mt-auto flex flex-col gap-2 pt-2">
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => void download()}
                      disabled={exporting}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-neon px-4 py-3 text-sm font-bold text-black hover:bg-[#5fff3a] disabled:opacity-50"
                    >
                      Download image
                    </button>
                    <button
                      type="button"
                      onClick={() => void copyImage()}
                      disabled={exporting}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold hover:bg-white/10 disabled:opacity-50"
                    >
                      {copied ? "Copied" : "Copy image"}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={shareX}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-sm font-bold text-sky-200 hover:bg-sky-400/20"
                  >
                    𝕏 Share X
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TemplateCard({
  t,
  onOpen,
}: {
  t: MemeTemplate;
  onOpen: (t: MemeTemplate) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(t)}
      className="group overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 text-left transition hover:border-neon/40"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={blankSrc(t.blank)}
        alt={t.name}
        loading="lazy"
        className="aspect-square w-full object-cover transition group-hover:scale-[1.02]"
      />
      <div className="px-2.5 py-2">
        <div className="truncate text-xs font-semibold text-zinc-200">
          {t.name}
        </div>
        <div className="truncate text-[10px] text-zinc-600">
          {t.tag || t.face || t.source}
        </div>
      </div>
    </button>
  );
}
