"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { MAKE_PAYER, MAKE_FIRST_BUY_USD } from "@/lib/make-token";

type Status = {
  payer: string;
  sol: number;
  funded: boolean;
  firstBuyUsd: number;
  hitLeft: number | null;
  shitLeft: number | null;
};

const inputClass =
  "mt-1 w-full rounded-xl border border-border bg-zinc-950 px-3 py-3 text-base text-white outline-none focus:border-neon";

const MAX_IMAGE = 1_500_000;

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ""));
    r.onerror = () => reject(new Error("read failed"));
    r.readAsDataURL(blob);
  });
}

export default function MakeForm() {
  const { authenticated, getAccessToken, login } = usePrivy();
  const [status, setStatus] = useState<Status | null>(null);
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageData, setImageData] = useState("");
  const [desc, setDesc] = useState("");
  const [xHandle, setXHandle] = useState("");
  const [tg, setTg] = useState("");
  const [website, setWebsite] = useState("");
  const [side, setSide] = useState<"hit" | "shit">("shit");
  const [receive, setReceive] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/make", { cache: "no-store" });
      const data = (await res.json()) as Status;
      setStatus(data);
    } catch {
      setStatus({
        payer: MAKE_PAYER,
        sol: 0,
        funded: false,
        firstBuyUsd: MAKE_FIRST_BUY_USD,
        hitLeft: null,
        shitLeft: null,
      });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const takeImage = useCallback(async (blob: Blob, hint = "image") => {
    if (!blob.type.startsWith("image/")) {
      setMsg("Use a PNG, JPG, or WebP");
      return;
    }
    if (blob.size > MAX_IMAGE) {
      setMsg("Image too large (max 1.5MB)");
      return;
    }
    const data = await blobToDataUrl(blob);
    setImageData(data);
    setImageUrl("");
    setMsg(`${hint} ready`);
  }, []);

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.kind === "file") {
          const f = item.getAsFile();
          if (f) {
            e.preventDefault();
            void takeImage(f, "Pasted image");
            return;
          }
        }
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [takeImage]);

  const pasteImage = useCallback(async () => {
    try {
      if (!navigator.clipboard?.read) {
        setMsg("Paste an image with ⌘V");
        return;
      }
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const type = item.types.find((x) => x.startsWith("image/"));
        if (!type) continue;
        const blob = await item.getType(type);
        await takeImage(blob, "Pasted image");
        return;
      }
      setMsg("No image on clipboard");
    } catch {
      setMsg("Paste an image with ⌘V");
    }
  }, [takeImage]);

  const preview = imageData || imageUrl;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    if (!authenticated) {
      login();
      return;
    }
    if (!imageData && !imageUrl.trim()) {
      setMsg("Upload, paste, or paste a https image URL");
      return;
    }
    setBusy(true);
    try {
      const token = await getAccessToken();
      const res = await fetch("/api/make", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: name.trim(),
          symbol: symbol.trim(),
          imageUrl: imageUrl.trim(),
          imageData: imageData || undefined,
          description: desc.trim(),
          twitter: xHandle.trim(),
          telegram: tg.trim(),
          website: website.trim(),
          side,
          receive: receive.trim(),
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        code?: string;
        mint?: string;
      };
      if (!res.ok) {
        setMsg(data.error || data.code || "Launch failed");
        return;
      }
      setMsg(data.mint ? `Mint ${data.mint}` : "Submitted");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Launch failed");
    } finally {
      setBusy(false);
      void load();
    }
  };

  const payer = status?.payer || MAKE_PAYER;
  const funded = !!status?.funded;

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="rounded-2xl border border-border bg-zinc-950 p-4 space-y-2">
        <p className="font-orbitron text-[10px] uppercase tracking-wider text-zinc-500">
          Payer
        </p>
        <p className="font-mono text-xs break-all text-zinc-300">{payer}</p>
        <p className="text-sm text-zinc-400">
          {funded
            ? `Funded · ${status?.sol ?? 0} SOL`
            : `Send SOL here. Create + $${MAKE_FIRST_BUY_USD} first buy come from this wallet.`}
        </p>
      </div>

      <label className="block">
        <span className="font-orbitron text-[10px] uppercase tracking-wider text-zinc-500">
          Name
        </span>
        <input
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={32}
          required
          autoComplete="off"
        />
      </label>

      <label className="block">
        <span className="font-orbitron text-[10px] uppercase tracking-wider text-zinc-500">
          Ticker
        </span>
        <input
          className={inputClass}
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          maxLength={10}
          required
          autoComplete="off"
        />
      </label>

      <div>
        <span className="font-orbitron text-[10px] uppercase tracking-wider text-zinc-500">
          Image
        </span>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void takeImage(f, f.name);
            e.target.value = "";
          }}
        />
        <div
          className={`mt-1 rounded-xl border border-dashed p-4 text-center ${
            dragOver ? "border-neon bg-neon/10" : "border-border bg-zinc-950"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) void takeImage(f, f.name);
          }}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Token art"
              className="mx-auto mb-3 h-28 w-28 rounded-xl object-cover border border-border"
            />
          ) : null}
          <p className="text-sm text-zinc-400">Upload, drop, or paste (⌘V)</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              className="min-h-12 rounded-xl border border-border px-4 font-orbitron text-xs uppercase text-zinc-200"
              onClick={() => fileRef.current?.click()}
            >
              Upload
            </button>
            <button
              type="button"
              className="min-h-12 rounded-xl border border-border px-4 font-orbitron text-xs uppercase text-zinc-200"
              onClick={() => void pasteImage()}
            >
              Paste
            </button>
          </div>
        </div>
        <input
          className={`${inputClass} mt-2`}
          value={imageUrl}
          onChange={(e) => {
            setImageUrl(e.target.value);
            if (e.target.value.trim()) setImageData("");
          }}
          type="url"
          inputMode="url"
          placeholder="or paste https:// image URL"
          autoComplete="off"
        />
      </div>

      <label className="block">
        <span className="font-orbitron text-[10px] uppercase tracking-wider text-zinc-500">
          Description
        </span>
        <textarea
          className={`${inputClass} min-h-24 resize-y`}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          maxLength={500}
          rows={4}
        />
      </label>

      <label className="block">
        <span className="font-orbitron text-[10px] uppercase tracking-wider text-zinc-500">
          X
        </span>
        <input
          className={inputClass}
          value={xHandle}
          onChange={(e) => setXHandle(e.target.value)}
          placeholder="@handle or x.com/..."
          autoComplete="off"
        />
      </label>

      <label className="block">
        <span className="font-orbitron text-[10px] uppercase tracking-wider text-zinc-500">
          Telegram
        </span>
        <input
          className={inputClass}
          value={tg}
          onChange={(e) => setTg(e.target.value)}
          placeholder="t.me/... or @channel"
          autoComplete="off"
        />
      </label>

      <label className="block">
        <span className="font-orbitron text-[10px] uppercase tracking-wider text-zinc-500">
          Website
        </span>
        <input
          className={inputClass}
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          type="url"
          inputMode="url"
          placeholder="https://"
          autoComplete="off"
        />
      </label>

      <fieldset>
        <legend className="font-orbitron text-[10px] uppercase tracking-wider text-zinc-500">
          Mint
        </legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setSide("hit")}
            className={`min-h-12 rounded-xl border font-orbitron uppercase text-sm ${
              side === "hit"
                ? "border-neon bg-neon/15 text-neon"
                : "border-border text-zinc-400"
            }`}
          >
            HIT
            {status?.hitLeft != null ? ` · ${status.hitLeft}` : ""}
          </button>
          <button
            type="button"
            onClick={() => setSide("shit")}
            className={`min-h-12 rounded-xl border font-orbitron uppercase text-sm ${
              side === "shit"
                ? "border-neon bg-neon/15 text-neon"
                : "border-border text-zinc-400"
            }`}
          >
            SHIT
            {status?.shitLeft != null ? ` · ${status.shitLeft}` : ""}
          </button>
        </div>
      </fieldset>

      <label className="block">
        <span className="font-orbitron text-[10px] uppercase tracking-wider text-zinc-500">
          Wallet for free ${MAKE_FIRST_BUY_USD} buy
        </span>
        <input
          className={inputClass}
          value={receive}
          onChange={(e) => setReceive(e.target.value.trim())}
          required
          spellCheck={false}
          autoComplete="off"
          placeholder="Solana address"
        />
      </label>

      <button
        type="submit"
        disabled={busy}
        className="flex min-h-12 w-full items-center justify-center rounded-xl bg-neon px-4 font-orbitron text-sm uppercase tracking-wide text-black hover:brightness-110 disabled:opacity-50"
      >
        {busy ? "Working" : authenticated ? "Make token" : "Log in to make"}
      </button>
      {msg ? <p className="text-sm text-amber-300">{msg}</p> : null}
    </form>
  );
}
