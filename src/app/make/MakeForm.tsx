"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { MAKE_PAYER, MAKE_FIRST_BUY_USD, MAKE_MIN_HOLD } from "@/lib/make-token";

type Status = {
  payer: string;
  sol: number;
  funded: boolean;
  firstBuyUsd: number;
  needHold: number;
  hold: number;
  qualified: boolean;
  hitLeft: number | null;
  shitLeft: number | null;
};

type Step =
  | "gate"
  | "name"
  | "ticker"
  | "image"
  | "desc"
  | "x"
  | "tg"
  | "web"
  | "side"
  | "receive"
  | "review";

const FLOW: Step[] = [
  "gate",
  "name",
  "ticker",
  "image",
  "desc",
  "x",
  "tg",
  "web",
  "side",
  "receive",
  "review",
];

const inputClass =
  "w-full bg-transparent border-0 border-b-2 border-zinc-700 px-0 py-3 text-2xl sm:text-3xl text-white outline-none focus:border-neon placeholder:text-zinc-700";

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
  const [step, setStep] = useState<Step>("gate");
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
  const focusRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const load = useCallback(async () => {
    try {
      const headers: Record<string, string> = {};
      if (authenticated) {
        const token = await getAccessToken();
        if (token) headers.Authorization = `Bearer ${token}`;
      }
      const res = await fetch("/api/make", { cache: "no-store", headers });
      const data = (await res.json()) as Status;
      setStatus(data);
    } catch {
      setStatus({
        payer: MAKE_PAYER,
        sol: 0,
        funded: false,
        firstBuyUsd: MAKE_FIRST_BUY_USD,
        needHold: MAKE_MIN_HOLD,
        hold: 0,
        qualified: false,
        hitLeft: null,
        shitLeft: null,
      });
    }
  }, [authenticated, getAccessToken]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    focusRef.current?.focus();
  }, [step]);

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
      if (step !== "image") return;
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
  }, [takeImage, step]);

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

  const idx = FLOW.indexOf(step);
  const qn = Math.max(0, idx);
  const totalQ = FLOW.length;
  const go = (s: Step) => {
    setMsg("");
    setStep(s);
  };
  const next = () => {
    const i = FLOW.indexOf(step);
    if (i < FLOW.length - 1) go(FLOW[i + 1]!);
  };
  const prev = () => {
    const i = FLOW.indexOf(step);
    if (i > 0) go(FLOW[i - 1]!);
  };

  const canAdvance = (): boolean => {
    if (step === "gate") return !!authenticated && !!status?.qualified;
    if (step === "name") return name.trim().length > 0;
    if (step === "ticker") return symbol.trim().length > 0;
    if (step === "image") return Boolean(imageData || imageUrl.trim());
    if (step === "receive") return receive.trim().length >= 32;
    return true;
  };

  const onEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (step === "desc") {
        e.preventDefault();
        next();
        return;
      }
      if (step === "review") return;
      e.preventDefault();
      if (canAdvance()) next();
    }
    if (e.key === "Backspace" && !name && step !== "name") {
      /* keep */
    }
  };

  const submitLaunch = async () => {
    setMsg("");
    if (!authenticated) {
      login();
      return;
    }
    if (!status?.qualified) {
      setMsg(`Hold ${MAKE_MIN_HOLD.toLocaleString()} TOKENSHIT to make`);
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
  const need = status?.needHold ?? MAKE_MIN_HOLD;
  const hold = status?.hold ?? 0;
  const qualified = !!status?.qualified;
  const preview = imageData || imageUrl;

  const okBtn = (label = "OK") => (
    <button
      type="button"
      onClick={() => canAdvance() && next()}
      disabled={!canAdvance()}
      className="mt-6 inline-flex min-h-12 items-center gap-3 rounded-xl bg-neon px-5 font-orbitron text-sm uppercase tracking-wide text-black hover:brightness-110 disabled:opacity-40"
    >
      {label}
      <span className="text-[10px] font-sans normal-case tracking-normal text-black/60">
        press Enter
      </span>
    </button>
  );

  const q = (n: number, title: string, body: React.ReactNode) => (
    <div className="min-h-[58vh] flex flex-col justify-center" onKeyDown={onEnter}>
      <p className="font-orbitron text-xs text-neon mb-4">{n} →</p>
      <h2 className="font-monoton text-3xl sm:text-4xl leading-none text-white mb-6">
        {title}
      </h2>
      {body}
    </div>
  );

  return (
    <div className="relative">
      <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-neon transition-all"
          style={{ width: `${(qn / (totalQ - 1)) * 100}%` }}
        />
      </div>

      {step === "gate" && (
        <div className="min-h-[58vh] flex flex-col justify-center space-y-6">
          <h2 className="font-monoton text-3xl sm:text-5xl leading-none">
            <span className="neon-text">MAKE</span>
          </h2>
          <p className="text-lg text-zinc-400 max-w-md">
            We pay the launch. Hold {need.toLocaleString()} TOKENSHIT. Your
            wallet gets the first ${MAKE_FIRST_BUY_USD} buy free.
          </p>
          <p className="font-mono text-xs break-all text-zinc-500">Payer {payer}</p>
          <p className="text-base text-zinc-300">
            You have {Math.floor(hold).toLocaleString()} / {need.toLocaleString()}
          </p>
          {!authenticated ? (
            <button
              type="button"
              onClick={() => login()}
              className="min-h-12 w-fit rounded-xl bg-neon px-6 font-orbitron text-sm uppercase text-black"
            >
              Log in
            </button>
          ) : !qualified ? (
            <p className="text-base text-zinc-400">
              Buy on{" "}
              <Link href="/swap" className="text-neon hover:underline">
                /swap
              </Link>{" "}
              then come back.
            </p>
          ) : (
            okBtn("Start")
          )}
        </div>
      )}

      {step === "name" &&
        q(
          1,
          "Name the token",
          <>
            <input
              ref={(el) => {
                focusRef.current = el;
              }}
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={32}
              autoComplete="off"
              placeholder="Type here..."
            />
            {okBtn()}
          </>
        )}

      {step === "ticker" &&
        q(
          2,
          "Ticker",
          <>
            <input
              ref={(el) => {
                focusRef.current = el;
              }}
              className={inputClass}
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              maxLength={10}
              autoComplete="off"
              placeholder="SHIT"
            />
            {okBtn()}
          </>
        )}

      {step === "image" &&
        q(
          3,
          "Add art",
          <>
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
              className={`rounded-xl border border-dashed p-6 text-center ${
                dragOver ? "border-neon bg-neon/10" : "border-zinc-700"
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
                  className="mx-auto mb-3 h-32 w-32 rounded-xl object-cover"
                />
              ) : (
                <p className="text-zinc-500">Upload, drop, or paste (⌘V)</p>
              )}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  className="min-h-12 rounded-xl border border-border px-4 font-orbitron text-xs uppercase"
                  onClick={() => fileRef.current?.click()}
                >
                  Upload
                </button>
                <button
                  type="button"
                  className="min-h-12 rounded-xl border border-border px-4 font-orbitron text-xs uppercase"
                  onClick={() => void pasteImage()}
                >
                  Paste
                </button>
              </div>
            </div>
            <input
              className={`${inputClass} mt-6 text-base`}
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                if (e.target.value.trim()) setImageData("");
              }}
              type="url"
              inputMode="url"
              placeholder="or https:// image URL"
              autoComplete="off"
            />
            {okBtn()}
          </>
        )}

      {step === "desc" &&
        q(
          4,
          "Description",
          <>
            <textarea
              ref={(el) => {
                focusRef.current = el;
              }}
              className={`${inputClass} min-h-28 resize-none text-xl`}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              maxLength={500}
              placeholder="Optional. Enter to skip."
            />
            {okBtn(desc.trim() ? "OK" : "Skip")}
          </>
        )}

      {step === "x" &&
        q(
          5,
          "X handle",
          <>
            <input
              ref={(el) => {
                focusRef.current = el;
              }}
              className={inputClass}
              value={xHandle}
              onChange={(e) => setXHandle(e.target.value)}
              placeholder="@handle  (optional)"
              autoComplete="off"
            />
            {okBtn(xHandle.trim() ? "OK" : "Skip")}
          </>
        )}

      {step === "tg" &&
        q(
          6,
          "Telegram",
          <>
            <input
              ref={(el) => {
                focusRef.current = el;
              }}
              className={inputClass}
              value={tg}
              onChange={(e) => setTg(e.target.value)}
              placeholder="t.me/...  (optional)"
              autoComplete="off"
            />
            {okBtn(tg.trim() ? "OK" : "Skip")}
          </>
        )}

      {step === "web" &&
        q(
          7,
          "Website",
          <>
            <input
              ref={(el) => {
                focusRef.current = el;
              }}
              className={inputClass}
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              type="url"
              inputMode="url"
              placeholder="https://  (optional)"
              autoComplete="off"
            />
            {okBtn(website.trim() ? "OK" : "Skip")}
          </>
        )}

      {step === "side" &&
        q(
          8,
          "HIT or SHIT mint?",
          <div className="grid grid-cols-2 gap-3 max-w-md">
            <button
              type="button"
              onClick={() => {
                setSide("hit");
                next();
              }}
              className={`min-h-16 rounded-xl border font-orbitron uppercase text-lg ${
                side === "hit"
                  ? "border-neon bg-neon/15 text-neon"
                  : "border-zinc-700 text-zinc-400"
              }`}
            >
              HIT
              {status?.hitLeft != null ? ` · ${status.hitLeft}` : ""}
            </button>
            <button
              type="button"
              onClick={() => {
                setSide("shit");
                next();
              }}
              className={`min-h-16 rounded-xl border font-orbitron uppercase text-lg ${
                side === "shit"
                  ? "border-neon bg-neon/15 text-neon"
                  : "border-zinc-700 text-zinc-400"
              }`}
            >
              SHIT
              {status?.shitLeft != null ? ` · ${status.shitLeft}` : ""}
            </button>
          </div>
        )}

      {step === "receive" &&
        q(
          9,
          `Wallet for the free $${MAKE_FIRST_BUY_USD} buy`,
          <>
            <input
              ref={(el) => {
                focusRef.current = el;
              }}
              className={`${inputClass} text-base sm:text-xl font-mono`}
              value={receive}
              onChange={(e) => setReceive(e.target.value.trim())}
              spellCheck={false}
              autoComplete="off"
              placeholder="Solana address"
            />
            {okBtn()}
          </>
        )}

      {step === "review" && (
        <div className="min-h-[58vh] flex flex-col justify-center space-y-4">
          <p className="font-orbitron text-xs text-neon">10 →</p>
          <h2 className="font-monoton text-3xl leading-none">Review</h2>
          <ul className="text-base text-zinc-300 space-y-1">
            <li>{name} / {symbol}</li>
            <li>{side.toUpperCase()} mint</li>
            <li className="font-mono text-xs break-all">{receive}</li>
            {desc ? <li className="text-zinc-500">{desc}</li> : null}
          </ul>
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-20 w-20 rounded-xl object-cover" />
          ) : null}
          <button
            type="button"
            disabled={busy}
            onClick={() => void submitLaunch()}
            className="mt-4 min-h-12 w-fit rounded-xl bg-neon px-6 font-orbitron text-sm uppercase text-black disabled:opacity-50"
          >
            {busy ? "Working" : "Make token"}
          </button>
        </div>
      )}

      {step !== "gate" ? (
        <button
          type="button"
          onClick={prev}
          className="mt-8 text-xs font-orbitron uppercase tracking-wider text-zinc-500 hover:text-white"
        >
          Back
        </button>
      ) : null}
      {msg ? <p className="mt-4 text-sm text-amber-300">{msg}</p> : null}
    </div>
  );
}
