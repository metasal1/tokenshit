"use client";

import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { EmojiIcon } from "@/components/EmojiIcon";
import { KOL_SCOUT_REWARD_SHIT, MIN_KOL_FOLLOWERS } from "@/lib/shit-token";

type Props = {
  open: boolean;
  onClose: () => void;
  prefillHandle?: string;
};

export default function KolRecommendModal({ open, onClose, prefillHandle = "" }: Props) {
  const { authenticated, user, login } = usePrivy();
  const [raw, setRaw] = useState(prefillHandle.replace(/^@/, ""));
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<"lookup" | "submit" | null>(null);
  const [lookup, setLookup] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const twitter = user?.twitter?.username?.replace(/^@/, "").toLowerCase() || null;

  async function doLookupPrefilled(h: string) {
    if (!h) return;
    setErr(null); setMsg(null); setLookup(null);
    setBusy("lookup");
    try {
      const res = await fetch(`/api/kols/nominate?handle=${encodeURIComponent(h)}`, { cache: "no-store" });
      const j = await res.json();
      if (res.ok && j.ok) { setLookup(j); } 
      else { setErr(j.error || "Lookup failed"); }
    } catch {}
    finally { setBusy(null); }
  }

  useEffect(() => {
    if (open && prefillHandle) {
      const clean = prefillHandle.replace(/^@/, "");
      if (clean && !lookup) {
        setRaw(clean);
        // fire lookup
        setTimeout(() => { void doLookupPrefilled(clean); }, 80);
      }
    }
  }, [open, prefillHandle]);

  if (!open) return null;

  async function doLookup() {
    setErr(null);
    setMsg(null);
    setLookup(null);
    const h = raw.trim();
    if (!h) {
      setErr("Paste an X handle");
      return;
    }
    setBusy("lookup");
    try {
      const res = await fetch(`/api/kols/nominate?handle=${encodeURIComponent(h)}`, { cache: "no-store" });
      const j = await res.json();
      if (!res.ok || !j.ok) {
        setErr(j.error || `Lookup failed`);
        return;
      }
      setLookup(j);
      if (!j.meetsMin) {
        setErr(`@${j.handle} has ${j.followers.toLocaleString()} followers — needs ${MIN_KOL_FOLLOWERS.toLocaleString()}+`);
      }
    } catch (e: any) {
      setErr(e?.message || "Lookup failed");
    } finally {
      setBusy(null);
    }
  }

  async function doSubmit() {
    setErr(null);
    setMsg(null);
    if (!authenticated || !twitter) {
      setErr("Sign in with X first");
      return;
    }
    if (!lookup?.meetsMin) return;

    setBusy("submit");
    try {
      const res = await fetch("/api/kols/nominate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle: lookup.handle,
          note: note.trim() || undefined,
          byX: twitter,
          source: "kols-page",
        }),
      });
      const j = await res.json();
      if (!res.ok) {
        setErr(j.error || "Submit failed");
        return;
      }
      setMsg(j.message || `@${lookup.handle} nominated — thanks!`);
      setTimeout(() => {
        onClose();
        setRaw("");
        setNote("");
        setLookup(null);
        setMsg(null);
      }, 900);
    } catch (e: any) {
      setErr(e?.message || "Submit failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-3xl border border-neon/40 bg-card p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-orbitron text-[10px] uppercase tracking-[0.2em] text-neon">Recommend</p>
            <h3 className="text-xl font-semibold">Nominate a KOL</h3>
          </div>
          <button onClick={onClose} className="text-xl leading-none text-zinc-400 hover:text-white">×</button>
        </div>

        <p className="text-xs text-zinc-400 mb-4">
          Need {MIN_KOL_FOLLOWERS.toLocaleString()}+ followers. Earn {KOL_SCOUT_REWARD_SHIT.toLocaleString()} $TOKENSHIT when accepted.
        </p>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="@handle or x.com/…"
            value={raw}
            onChange={(e) => { setRaw(e.target.value); setLookup(null); setErr(null); setMsg(null); }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void doLookup(); } }}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
          />

          <button
            onClick={() => void doLookup()}
            disabled={busy !== null || !raw.trim()}
            className="w-full rounded-lg border border-zinc-600 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {busy === "lookup" ? "Looking up…" : "Lookup on X"}
          </button>

          {lookup && (
            <div className={`flex gap-3 rounded-xl border p-3 ${lookup.meetsMin ? "border-neon/40 bg-neon/5" : "border-amber-800/50 bg-amber-950/30"}`}>
              {lookup.avatarUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={lookup.avatarUrl.replace("_normal","_bigger")} className="h-11 w-11 rounded-full" alt="" referrerPolicy="no-referrer" />
              )}
              <div className="min-w-0 flex-1 text-sm">
                <div className="font-semibold truncate">{lookup.displayName || `@${lookup.handle}`}</div>
                <div className="text-xs text-zinc-400">@{lookup.handle} · {lookup.followers.toLocaleString()} followers</div>
              </div>
              <div className={lookup.meetsMin ? "text-neon text-xs" : "text-amber-400 text-xs"}>{lookup.meetsMin ? "OK" : "LOW"}</div>
            </div>
          )}

          {lookup?.meetsMin && (
            <>
              <input
                type="text"
                placeholder="Why this KOL? (optional note)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                maxLength={200}
              />

              <button
                onClick={() => void doSubmit()}
                disabled={busy !== null || !authenticated}
                className="w-full rounded-xl bg-neon py-2.5 text-sm font-bold text-black disabled:opacity-50"
              >
                {busy === "submit"
                  ? "Submitting…"
                  : !authenticated
                  ? "Sign in with X to submit"
                  : `Submit @${lookup.handle} · earn ${KOL_SCOUT_REWARD_SHIT}`}
              </button>

              {!authenticated && (
                <button onClick={() => login()} className="text-xs text-neon underline">Login with X</button>
              )}
            </>
          )}

          {err && <p className="text-xs text-amber-400">{err}</p>}
          {msg && <p className="text-xs text-neon">{msg}</p>}
        </div>

        <p className="mt-4 text-[10px] text-center text-zinc-500">X required • 5 noms / day per account • paid only on accept</p>
      </div>
    </div>
  );
}
