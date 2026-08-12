"use client";

import { useState } from "react";
import { sfx } from "@/lib/sfx";

/** Public email capture — no Privy required (webview-safe). */
export default function EmailCaptureCard({
  source = "claim-public",
  className = "",
}: {
  source?: string;
  className?: string;
}) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [already, setAlready] = useState(false);
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
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, source }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || `Signup failed (${res.status})`);
        setBusy(false);
        return;
      }
      setAlready(Boolean(data.alreadySignedUp));
      setDone(true);
      try {
        sfx.chime();
      } catch {}
      try {
        localStorage.setItem(
          "tokenshit_email_state",
          JSON.stringify({ collected: true })
        );
      } catch {}
    } catch {
      setError("Network error — try again");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div
        className={`rounded-xl border border-neon/40 bg-neon/5 p-4 ${className}`}
      >
        <p className="text-sm font-semibold text-neon">
          {already ? "You’re already on the list" : "You’re in"}
        </p>
        <p className="text-xs text-zinc-400 mt-1">
          {already
            ? "Already on the list — claim 5,000 $TOKENSHIT on /claim if you have not."
            : "On the list. Login with X → Claim → list 5k."}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className={`rounded-xl border border-border bg-card p-4 space-y-3 ${className}`}
    >
      <div>
        <h3 className="text-sm font-bold text-white">
          Join the list · 5,000 $TOKENSHIT
        </h3>
        <p className="text-xs text-zinc-500 mt-0.5">
          Email signup works in Telegram / in-app browsers. Then claim 5k on
          /claim after login with X.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(null);
          }}
          placeholder="you@email.com"
          disabled={busy}
          className="flex-1 min-h-11 rounded-lg bg-zinc-900 border border-zinc-700 px-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-neon"
        />
        <button
          type="submit"
          disabled={busy || !email}
          className="min-h-11 px-4 rounded-lg bg-neon text-black text-sm font-bold disabled:opacity-50 active:scale-[0.98]"
        >
          {busy ? "…" : "Sign up"}
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </form>
  );
}
