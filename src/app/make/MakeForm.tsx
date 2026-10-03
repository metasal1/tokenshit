"use client";

import { useCallback, useEffect, useState } from "react";
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

export default function MakeForm() {
  const { authenticated, getAccessToken, login } = usePrivy();
  const [status, setStatus] = useState<Status | null>(null);
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [side, setSide] = useState<"hit" | "shit">("shit");
  const [receive, setReceive] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    if (!authenticated) {
      login();
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
          side,
          receive: receive.trim(),
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        code?: string;
        payer?: string;
        mint?: string;
        sig?: string;
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

      <label className="block">
        <span className="font-orbitron text-[10px] uppercase tracking-wider text-zinc-500">
          Image URL
        </span>
        <input
          className={inputClass}
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
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
