"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function UnsubscribeForm() {
  const params = useSearchParams();
  const prefill = (params.get("email") || "").trim();
  const [email, setEmail] = useState(prefill);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Enter a valid email");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || `Unsubscribe failed (${res.status})`);
        setBusy(false);
        return;
      }
      setDone(true);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-xl border border-neon/40 bg-neon/5 p-6 text-center">
        <p className="font-orbitron text-sm font-bold text-neon">
          You are off the list
        </p>
        <p className="mt-2 text-sm text-zinc-400">
          {email.trim().toLowerCase()} will not get TOKENSHIT list mail.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="mb-2 block font-orbitron text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          Email
        </span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          className="min-h-11 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-base text-zinc-100 outline-none focus:border-neon"
          placeholder="you@email.com"
        />
      </label>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="min-h-11 w-full rounded-md bg-neon px-6 py-3 font-orbitron text-sm font-bold text-black hover:brightness-110 disabled:opacity-60"
      >
        {busy ? "Working..." : "UNSUBSCRIBE"}
      </button>
    </form>
  );
}
