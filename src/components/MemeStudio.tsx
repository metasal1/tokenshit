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
  proxiedBlank,
  renderTokenshitMeme,
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
  const [preview, setPreview] = useState("");
  const [imgLoading, setImgLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyMsg, setCopyMsg] = useState("Copy image");
  const [statusMsg, setStatusMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void ensureMonotonFont();
  }, []);

  // Lock body scroll while editor open (mobile)
  useEffect(() => {
    if (!selected) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [selected]);

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

  // Deep link ?t=id&top=&bottom=
  useEffect(() => {
    if (typeof window === "undefined" || !items.length) return;
    const sp = new URLSearchParams(window.location.search);
    const tid = sp.get("t");
    if (!tid) return;
    const match =
      items.find((t) => t.id === tid) ||
      uploads.find((t) => t.id === tid);
    if (!match) return;
    open(match);
    const top = sp.get("top");
    const bottom = sp.get("bottom");
    if (top || bottom) {
      setTexts((prev) => {
        const next = [...prev];
        if (top != null) next[0] = top;
        if (bottom != null) next[1] = bottom;
        return next;
      });
    }
    // only once per id load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const open = useCallback((t: MemeTemplate) => {
    const tpl = { ...t, blank: proxiedBlank(t.blank) };
    setSelected(tpl);
    const n = Math.max(1, Math.min(8, tpl.lines || 2));
    const b =
      tpl.boxes && tpl.boxes.length
        ? tpl.boxes.map((x) => ({
            ...x,
            style: (isDarkStyle(x.style) ? "dark" : "light") as MemeBox["style"],
            fontScale: x.fontScale ?? 1,
          }))
        : defaultBoxes(n);
    setBoxes(b);
    setTexts(b.map(() => ""));
    setActiveBox(0);
    setPreview("");
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

  // Keep PNG dataURL preview (same as memes.sal.fun) for reliable export
  useEffect(() => {
    if (!selected) {
      setPreview("");
      return;
    }
    let cancelled = false;
    const t = window.setTimeout(() => {
      void (async () => {
        setImgLoading(true);
        try {
          const url = await renderTokenshitMeme(selected.blank, boxes, texts, {
            brand: true,
          });
          if (!cancelled) setPreview(url);
        } catch (e) {
          console.error("preview render failed", e);
          if (!cancelled) setPreview("");
        } finally {
          if (!cancelled) setImgLoading(false);
        }
      })();
    }, 120);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [selected, texts, boxes]);

  /** Exact method from memes.sal.fun — prefer cached preview dataURL */
  const getMemeBlob = useCallback(async (): Promise<Blob> => {
    if (!selected) throw new Error("No meme selected");
    const dataUrl = preview.startsWith("data:")
      ? preview
      : await renderTokenshitMeme(selected.blank, boxes, texts, {
          brand: true,
        });
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    if (blob.type === "image/png") return blob;
    return new Blob([await blob.arrayBuffer()], { type: "image/png" });
  }, [preview, selected, boxes, texts]);

  const shareCaption = useCallback(() => {
    const lines = texts.map((t) => (t || "").trim()).filter(Boolean);
    if (lines.length) return lines.map((l) => l.toUpperCase()).join(" / ");
    return selected?.name || "TOKEN$HIT meme";
  }, [texts, selected]);

  const buildShareUrl = useCallback(() => {
    if (!selected || typeof window === "undefined") return "";
    if (selected.id.startsWith("upload-")) {
      return `${window.location.origin}/memes`;
    }
    const params = new URLSearchParams();
    params.set("t", selected.id);
    texts.forEach((tx, i) => {
      const v = (tx || "").trim();
      if (!v) return;
      if (i === 0) params.set("top", v);
      else if (i === 1) params.set("bottom", v);
      else params.set(`c${i}`, v);
    });
    return `${window.location.origin}/memes?${params.toString()}`;
  }, [selected, texts]);

  const shareNativeImage = useCallback(
    async (text: string, url: string) => {
      if (!selected) return false;
      try {
        const blob = await getMemeBlob();
        const file = new File([blob], `${selected.id}-meme.png`, {
          type: "image/png",
        });
        if (
          typeof navigator.share === "function" &&
          typeof navigator.canShare === "function" &&
          navigator.canShare({ files: [file] })
        ) {
          await navigator.share({
            files: [file],
            title: selected.name,
            text,
            url,
          });
          return true;
        }
      } catch (e) {
        if ((e as Error)?.name === "AbortError") return true;
      }
      return false;
    },
    [selected, getMemeBlob]
  );

  /** Ported from memes.sal.fun download() */
  const download = useCallback(async () => {
    if (!selected) return;
    setExporting(true);
    try {
      const blob = await getMemeBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selected.id}-meme.png`;
      a.type = "image/png";
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);

      if (
        typeof navigator !== "undefined" &&
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function"
      ) {
        const file = new File([blob], `${selected.id}-meme.png`, {
          type: "image/png",
        });
        if (navigator.canShare({ files: [file] })) {
          const ua = navigator.userAgent || "";
          if (/iPhone|iPad|iPod|Android/i.test(ua)) {
            try {
              await navigator.share({
                files: [file],
                title: selected.name,
              });
            } catch {
              /* user cancelled share */
            }
          }
        }
      }
      setStatusMsg("Saved");
      window.setTimeout(() => setStatusMsg(""), 1600);
    } catch (e) {
      console.error(e);
      alert("Could not save image");
    } finally {
      setExporting(false);
    }
  }, [selected, getMemeBlob]);

  /** Ported from memes.sal.fun copyImage() */
  const copyImage = useCallback(async () => {
    if (!selected) return;
    setExporting(true);
    try {
      const blob = await getMemeBlob();
      if (
        typeof ClipboardItem !== "undefined" &&
        navigator.clipboard &&
        typeof navigator.clipboard.write === "function"
      ) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopyMsg("Image copied");
        setCopied(true);
        window.setTimeout(() => {
          setCopied(false);
          setCopyMsg("Copy image");
        }, 1600);
        return;
      }
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
      setCopyMsg("Opened image");
      setCopied(true);
      window.setTimeout(() => {
        setCopied(false);
        setCopyMsg("Copy image");
      }, 1600);
    } catch (e) {
      console.error(e);
      try {
        const blob = await getMemeBlob();
        const file = new File([blob], `${selected.id}-meme.png`, {
          type: "image/png",
        });
        if (navigator.share) {
          await navigator.share({ files: [file], title: selected.name });
          return;
        }
      } catch {
        /* ignore */
      }
      alert("Copy image not supported in this browser — use Download image");
    } finally {
      setExporting(false);
    }
  }, [selected, getMemeBlob]);

  /** Ported from memes.sal.fun shareToX() */
  const shareX = useCallback(async () => {
    if (!selected) return;
    setExporting(true);
    try {
      const url = buildShareUrl();
      const text = shareCaption();
      if (await shareNativeImage(text, url)) return;
      const intent = new URL("https://twitter.com/intent/tweet");
      intent.searchParams.set("text", text);
      if (url) intent.searchParams.set("url", url);
      window.open(intent.toString(), "_blank", "noopener,noreferrer");
    } finally {
      setExporting(false);
    }
  }, [selected, buildShareUrl, shareCaption, shareNativeImage]);

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
      className="mx-auto min-h-[70vh] w-full max-w-7xl px-3 sm:px-6 pb-[max(5rem,env(safe-area-inset-bottom))] pt-4 sm:pt-6"
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

      {/* Editor modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/85 md:items-center md:p-6">
          <div className="flex h-[100dvh] w-full max-w-5xl flex-col overflow-hidden border-white/10 bg-[#0a0a0a] md:h-auto md:max-h-[90svh] md:rounded-3xl md:border">
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2.5 pt-[max(0.65rem,env(safe-area-inset-top))] md:px-6 md:py-3 md:pt-3">
              <div className="min-w-0 pr-2">
                <div className="truncate text-base font-bold text-white sm:text-lg">
                  {selected.name}
                </div>
                <div className="text-[11px] text-zinc-500">
                  {templateIndex >= 0
                    ? `${templateIndex + 1}/${filtered.length}`
                    : selected.id}
                  {` · ${boxes.length} caption${boxes.length === 1 ? "" : "s"}`}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => goTemplate(-1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-xl text-zinc-300 hover:bg-white/10"
                  aria-label="Previous"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => goTemplate(1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-xl text-zinc-300 hover:bg-white/10"
                  aria-label="Next"
                >
                  ›
                </button>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-lg text-zinc-300 hover:bg-white/10"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="grid min-h-0 flex-1 gap-0 overflow-y-auto overscroll-contain md:grid-cols-2">
              <div className="flex items-center justify-center bg-black p-3 sm:p-4 md:p-8">
                <div className="relative w-full max-w-md">
                  {(imgLoading || (!preview && selected)) && (
                    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center rounded-xl bg-black/30">
                      <EmojiIcon size={22} className="animate-spin">
                        💫
                      </EmojiIcon>
                    </div>
                  )}
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
                    Drag captions · corner to resize · light/dark
                    {preview.startsWith("data:") ? " · ready to save" : ""}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-white/10 p-3 pb-[max(1rem,env(safe-area-inset-bottom))] md:gap-4 md:border-l md:border-t-0 md:p-6">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Captions
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={removeBox}
                      disabled={boxes.length <= 1}
                      className="min-h-10 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold disabled:opacity-40 hover:bg-white/10"
                    >
                      − Remove
                    </button>
                    <button
                      type="button"
                      onClick={addBox}
                      disabled={boxes.length >= 8}
                      className="min-h-10 rounded-xl border border-neon/30 bg-neon/10 px-3 py-2 text-xs font-semibold text-neon disabled:opacity-40 hover:bg-neon/20"
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
                      className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-base uppercase outline-none ring-neon/40 focus:ring-2 text-white"
                      style={{ textTransform: "uppercase", fontSize: "16px" }}
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
                        className="w-full accent-[#39ff14] h-8"
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
                          className={`min-h-11 flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold ${
                            !isDarkStyle(boxes[activeBox].style)
                              ? "border-neon bg-neon/15"
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
                          Light
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTone(true)}
                          className={`min-h-11 flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold ${
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

                {statusMsg && (
                  <p className="text-center text-xs text-neon font-medium">
                    {statusMsg}
                  </p>
                )}

                {/* Sticky action bar on mobile */}
                <div className="sticky bottom-0 z-10 -mx-3 mt-auto border-t border-white/10 bg-[#0a0a0a]/95 px-3 pt-3 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:pt-2 md:backdrop-blur-none">
                  <div className="flex flex-col gap-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:pb-0">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => void download()}
                        disabled={exporting || !preview.startsWith("data:")}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-neon px-3 py-3 text-sm font-bold text-black hover:bg-[#5fff3a] disabled:opacity-50"
                      >
                        {exporting ? "…" : "Download image"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void copyImage()}
                        disabled={exporting || !preview.startsWith("data:")}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/15 px-3 py-3 text-sm font-semibold hover:bg-white/10 disabled:opacity-50"
                      >
                        {copied ? copyMsg : "Copy image"}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => void shareX()}
                      disabled={exporting || !preview.startsWith("data:")}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-sm font-bold text-sky-200 hover:bg-sky-400/20 disabled:opacity-50"
                    >
                      𝕏 Share X
                    </button>
                    <p className="text-center text-[10px] text-zinc-600 pb-1">
                      Wait for “ready to save”, then Download / Copy / Share
                    </p>
                  </div>
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
