"use client";

import { useMemo, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { EmojiIcon } from "@/components/EmojiIcon";

function extractTwitter(user: ReturnType<typeof usePrivy>["user"]): string | null {
  if (!user) return null;
  const acc = user.twitter as { username?: string } | undefined;
  if (acc?.username) return acc.username;
  const linked = user.linkedAccounts || [];
  for (const a of linked) {
    const x = a as { type?: string; username?: string };
    if (
      (x.type === "twitter_oauth" || x.type === "twitter") &&
      x.username
    ) {
      return x.username;
    }
  }
  return null;
}

export default function KolNominateForm() {
  const { user, login, ready, authenticated } = usePrivy();
  const [handle, setHandle] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const byX = useMemo(() => extractTwitter(user), [user]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    setErr(null);
    try {
      const res = await fetch("/api/kols/nominate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle,
          note: note.trim() || undefined,
          byX: byX || undefined,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        message?: string;
        handle?: string;
        already?: boolean;
      };
      if (!res.ok) {
        setErr(data.error || "Could not submit");
        return;
      }
      setMsg(data.message || "Submitted");
      if (!data.already) {
        setHandle("");
        setNote("");
      }
    } catch {
      setErr("Network error — try again");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={(e) => void submit(e)}
      className="space-y-3 rounded-2xl border border-neon/25 bg-zinc-950/80 p-4"
    >
      <div className="flex items-start gap-2">
        <EmojiIcon size={22}>🕵️</EmojiIcon>
        <div>
          <h2 className="font-orbitron text-sm uppercase tracking-wide text-zinc-100">
            Nominate a KOL
          </h2>
          <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500">
            Paste an X handle. We review — first scout credit when we go live.
            No pay on submit (anti-farm).
          </p>
        </div>
      </div>

      <label className="block">
        <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          Handle
        </span>
        <input
          type="text"
          inputMode="text"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="@someone"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          className="min-h-11 w-full rounded-xl border border-zinc-700 bg-black/60 px-3 text-base text-zinc-100 placeholder:text-zinc-600 focus:border-neon/50 focus:outline-none"
          maxLength={80}
          required
        />
      </label>

      <label className="block">
        <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          Why them? (optional)
        </span>
        <input
          type="text"
          placeholder="Solana CT · alpha · shitposter…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="min-h-11 w-full rounded-xl border border-zinc-700 bg-black/60 px-3 text-base text-zinc-100 placeholder:text-zinc-600 focus:border-neon/50 focus:outline-none"
          maxLength={280}
        />
      </label>

      {ready && authenticated && byX ? (
        <p className="font-mono text-[10px] text-zinc-500">
          Scouting as <span className="text-neon">@{byX}</span>
        </p>
      ) : (
        <button
          type="button"
          onClick={() => login()}
          className="text-left font-mono text-[10px] text-zinc-500 underline-offset-2 hover:text-zinc-300 hover:underline"
        >
          Login with X to get scout credit (optional)
        </button>
      )}

      {err ? (
        <p className="rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-xs text-red-300">
          {err}
        </p>
      ) : null}
      {msg ? (
        <p className="rounded-lg border border-neon/30 bg-neon/10 px-3 py-2 text-xs text-neon">
          {msg}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy || !handle.trim()}
        className="min-h-11 w-full rounded-xl bg-neon font-bold text-black transition hover:bg-neon/90 disabled:opacity-40"
      >
        {busy ? "Sending…" : "Submit nomination"}
      </button>
    </form>
  );
}
