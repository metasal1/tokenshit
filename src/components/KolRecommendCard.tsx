"use client";

import { useCallback, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";
import { pickSolanaAddress } from "@/lib/privy-identity";
import { EmojiIcon } from "@/components/EmojiIcon";
import { MIN_KOL_FOLLOWERS } from "@/lib/shit-token";

type LookupOk = {
  ok: true;
  handle: string;
  followers: number;
  displayName: string | null;
  avatarUrl: string | null;
  verified: boolean;
  meetsMin: boolean;
  minFollowers: number;
};

export default function KolRecommendCard() {
  const { authenticated, user, getAccessToken } = usePrivy();
  const { wallets } = useWallets();
  const [raw, setRaw] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<"lookup" | "submit" | null>(null);
  const [lookup, setLookup] = useState<LookupOk | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [hp, setHp] = useState("");

  const twitter =
    user?.twitter?.username?.replace(/^@/, "").toLowerCase() || null;
  const wallet = pickSolanaAddress(wallets) || null;

  const doLookup = useCallback(async () => {
    setErr(null);
    setMsg(null);
    setLookup(null);
    const h = raw.trim();
    if (!h) {
      setErr("Paste an X handle or profile URL");
      return;
    }
    setBusy("lookup");
    try {
      const res = await fetch(
        `/api/kols/nominate?handle=${encodeURIComponent(h)}`,
        { cache: "no-store" }
      );
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.ok) {
        setErr(
          (j as { error?: string }).error ||
            `Lookup failed (${res.status})`
        );
        return;
      }
      setLookup(j as LookupOk);
      if (!(j as LookupOk).meetsMin) {
        setErr(
          `@${(j as LookupOk).handle} has ${(j as LookupOk).followers.toLocaleString()} followers — need ${MIN_KOL_FOLLOWERS.toLocaleString()}+`
        );
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Lookup failed");
    } finally {
      setBusy(null);
    }
  }, [raw]);

  const doSubmit = useCallback(async () => {
    setErr(null);
    setMsg(null);
    if (!authenticated || !twitter) {
      setErr("Sign in with X to submit a KOL");
      return;
    }
    if (!lookup?.meetsMin) {
      setErr(`KOL needs ${MIN_KOL_FOLLOWERS.toLocaleString()}+ followers`);
      return;
    }
    setBusy("submit");
    try {
      const token = authenticated ? await getAccessToken().catch(() => null) : null;
      const res = await fetch("/api/kols/nominate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          handle: lookup.handle,
          note: note.trim() || undefined,
          twitter: twitter || undefined,
          byX: twitter || undefined,
          wallet: wallet || undefined,
          source: "claim",
          ...(hp ? { website: hp } : {}),
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr((j as { error?: string }).error || `Submit failed (${res.status})`);
        return;
      }
      setMsg(
        (j as { message?: string }).message ||
          `@${lookup.handle} submitted for review`
      );
      setRaw("");
      setNote("");
      setLookup(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Submit failed");
    } finally {
      setBusy(null);
    }
  }, [lookup, note, twitter, wallet, authenticated, getAccessToken, hp]);

  return (
    <div className="relative rounded-xl border border-neon/35 bg-neon/[0.04] p-3.5 sm:p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-sm sm:text-base text-white flex items-center gap-1.5">
            <EmojiIcon size={18}>📢</EmojiIcon>
            Recommend a KOL
          </h3>
          <p className="text-xs text-zinc-500 mt-1 leading-snug">
            Drop their X handle or profile link. We look them up — need{" "}
            <span className="text-neon font-mono">
              {MIN_KOL_FOLLOWERS.toLocaleString()}+
            </span>{" "}
            followers. Metasal reviews before they go live.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          inputMode="url"
          placeholder="@handle or x.com/…"
          value={raw}
          onChange={(e) => {
            setRaw(e.target.value);
            setLookup(null);
            setErr(null);
            setMsg(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void doLookup();
            }
          }}
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-zinc-600"
        />
        <button
          type="button"
          disabled={busy !== null || !raw.trim()}
          onClick={() => void doLookup()}
          className="min-h-11 shrink-0 rounded-lg border border-zinc-600 px-4 text-sm font-semibold text-white hover:border-neon disabled:opacity-50"
        >
          {busy === "lookup" ? "Looking up…" : "Lookup"}
        </button>
      </div>

      {lookup && (
        <div
          className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${
            lookup.meetsMin
              ? "border-neon/40 bg-neon/10"
              : "border-amber-800/50 bg-amber-950/30"
          }`}
        >
          {lookup.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={lookup.avatarUrl.replace("_normal", "_bigger")}
              alt=""
              className="h-10 w-10 rounded-full bg-zinc-800"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-zinc-800" />
          )}
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-white truncate">
              {lookup.displayName || `@${lookup.handle}`}
              {lookup.verified ? (
                <span className="ml-1 text-sky-400 text-xs">✓</span>
              ) : null}
            </div>
            <div className="text-xs font-mono text-zinc-400">
              @{lookup.handle} · {lookup.followers.toLocaleString()} followers
            </div>
          </div>
          <div
            className={`text-[10px] font-orbitron uppercase font-bold ${
              lookup.meetsMin ? "text-neon" : "text-amber-400"
            }`}
          >
            {lookup.meetsMin ? "OK" : "LOW"}
          </div>
        </div>
      )}

      {lookup?.meetsMin && (
        <>
          <input
            type="text"
            placeholder="Optional note for admin"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={280}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-zinc-600"
          />
          <button
            type="button"
            disabled={busy !== null || !authenticated || !twitter}
            onClick={() => void doSubmit()}
            className="w-full min-h-11 rounded-lg bg-neon text-black text-sm font-bold hover:brightness-110 disabled:opacity-50 active:scale-[0.98]"
          >
            {busy === "submit"
              ? "Submitting…"
              : !authenticated || !twitter
                ? "Sign in with X to submit"
                : `Submit @${lookup.handle} for review`}
          </button>
          <p className="text-[10px] text-zinc-600 leading-snug">
            X login · 250+ followers · 5 noms/day · KOLs need 10k+ flw · admin
            review only (no auto-pay)
          </p>
          {/* honeypot — hidden from humans */}
          <input
            type="text"
            name="website"
            autoComplete="off"
            tabIndex={-1}
            aria-hidden
            className="absolute -left-[9999px] h-0 w-0 opacity-0"
            value={hp}
            onChange={(e) => setHp(e.target.value)}
          />
        </>
      )}

      {err && (
        <p className="text-xs text-amber-300/95 leading-snug break-words">{err}</p>
      )}
      {msg && (
        <p className="text-xs text-neon leading-snug break-words">{msg}</p>
      )}
    </div>
  );
}
