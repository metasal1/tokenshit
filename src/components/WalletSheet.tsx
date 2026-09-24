"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import ShareRefButton from "@/components/ShareRefButton";
import { SHIT_MINT, SHIT_SYMBOL } from "@/lib/shit-token";
import { parseWalletBalances } from "@/lib/wallet-balance-parse";

type Balances = {
  sol: number;
  usdc: number;
  shit: number;
};

function shortAddr(a: string) {
  if (!a || a.length < 12) return a;
  return `${a.slice(0, 4)}…${a.slice(-4)}`;
}

function fmtTok(n: number) {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}K`;
  if (n >= 1) return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (n > 0) return n.toFixed(4);
  return "0";
}

type Props = {
  address: string;
  twitterUsername?: string;
  onClose: () => void;
  children?: ReactNode;
};

/**
 * Compact wallet sheet — SOL + $TOKENSHIT + USDC, votes, ref share, quick links.
 * Does not use getAssetsByOwner (blocked on /api/rpc allowlist).
 */
export default function WalletSheet({
  address,
  twitterUsername,
  onClose,
  children,
}: Props) {
  const [bal, setBal] = useState<Balances | null>(null);
  const [loadingBal, setLoadingBal] = useState(true);
  const [totalUserVotes, setTotalUserVotes] = useState(0);
  const [loadingVotes, setLoadingVotes] = useState(true);
  const [copied, setCopied] = useState(false);
  const [entered, setEntered] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoadingBal(true);
    fetch(`/api/wallet/balances?address=${encodeURIComponent(address)}`, {
      cache: "no-store",
    })
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (!alive) return;
        const next = ok ? parseWalletBalances(d) : null;
        if (next) setBal(next);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoadingBal(false);
      });
    return () => {
      alive = false;
    };
  }, [address]);

  useEffect(() => {
    if (!twitterUsername) {
      setLoadingVotes(false);
      return;
    }
    let alive = true;
    setLoadingVotes(true);
    fetch(`/api/user-votes?username=${encodeURIComponent(twitterUsername)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        setTotalUserVotes(
          typeof d.total === "number"
            ? d.total
            : Array.isArray(d.votes)
              ? d.votes.length
              : 0
        );
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoadingVotes(false);
      });
    return () => {
      alive = false;
    };
  }, [twitterUsername]);

  const copyAddress = useCallback(() => {
    void navigator.clipboard.writeText(address);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [address]);

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(address)}&bgcolor=0a0a0f&color=39ff14&margin=8`;
  const lowSol = bal != null && bal.sol < 0.01;
  const canPlay = bal != null && bal.shit >= 1000;

  // Enter animation next frame
  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const requestClose = useCallback(() => {
    if (exiting) return;
    setExiting(true);
    setEntered(false);
    window.setTimeout(() => onClose(), 260);
  }, [exiting, onClose]);

  // Escape closes + lock body scroll (sheet is portaled to body)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [requestClose]);

  const sheet = (
    <div
      className={`fixed inset-0 z-[200] flex items-end justify-center bg-black/75 backdrop-blur-sm sm:items-center sm:p-4 ${
        exiting ? "wallet-backdrop-out" : entered ? "wallet-backdrop-in" : "opacity-0"
      }`}
      onClick={requestClose}
      role="presentation"
    >
      <div
        className={`max-h-[min(88vh,640px)] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-2xl border border-zinc-700/80 bg-zinc-950 p-4 shadow-2xl will-change-transform sm:mx-4 sm:rounded-2xl sm:p-5 ${
          exiting
            ? "wallet-sheet-out"
            : entered
              ? "wallet-sheet-in"
              : "translate-y-full opacity-0 sm:translate-y-3"
        }`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Your wallet"
      >
        {/* drag affordance */}
        <div className="mb-2 flex justify-center sm:hidden" aria-hidden>
          <span className="h-1 w-10 rounded-full bg-zinc-700" />
        </div>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="font-orbitron text-sm font-bold uppercase tracking-wide text-white">
            Your wallet
          </h3>
          <button
            type="button"
            onClick={requestClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white"
            aria-label="Close"
          >
            <span className="text-xl leading-none">&times;</span>
          </button>
        </div>

        {/* QR + address */}
        <div className="mb-4 flex gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrUrl}
            alt="Receive QR"
            className="h-[100px] w-[100px] shrink-0 rounded-xl border border-zinc-800 bg-black"
            width={100}
            height={100}
          />
          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                Solana
              </p>
              <button
                type="button"
                onClick={copyAddress}
                className="flex w-full items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-2 text-left transition hover:border-neon/40"
              >
                <span className="min-w-0 flex-1 font-mono text-xs text-zinc-200">
                  {shortAddr(address)}
                </span>
                <span className="shrink-0 text-[10px] font-bold uppercase text-neon">
                  {copied ? "Copied" : "Copy"}
                </span>
              </button>
              <p className="mt-1 break-all font-mono text-[9px] leading-tight text-zinc-600">
                {address}
              </p>
            </div>
          </div>
        </div>

        {/* Balances */}
        <div className="mb-3 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 px-2.5 py-2">
            <p className="text-[9px] uppercase tracking-wide text-zinc-500">SOL</p>
            <p className={`font-mono text-sm font-bold ${lowSol ? "text-amber-300" : "text-white"}`}>
              {loadingBal ? "…" : bal ? bal.sol.toFixed(4) : "—"}
            </p>
          </div>
          <div className="rounded-xl border border-neon/25 bg-neon/5 px-2.5 py-2">
            <p className="text-[9px] uppercase tracking-wide text-neon/80">${SHIT_SYMBOL}</p>
            <p className="font-mono text-sm font-bold text-neon">
              {loadingBal ? "…" : bal ? fmtTok(bal.shit) : "—"}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 px-2.5 py-2">
            <p className="text-[9px] uppercase tracking-wide text-zinc-500">USDC</p>
            <p className="font-mono text-sm font-bold text-white">
              {loadingBal ? "…" : bal ? fmtTok(bal.usdc) : "—"}
            </p>
          </div>
        </div>

        {lowSol && (
          <p className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-[11px] text-amber-200">
            Low SOL for fees — buy SOL or use Buy on Swap.
          </p>
        )}

        {/* Quick actions — keep play one tap away */}
        <div className="mb-4 grid grid-cols-3 gap-2">
          <Link
            href="/play"
            onClick={onClose}
            className="flex min-h-11 flex-col items-center justify-center rounded-xl bg-neon px-2 py-2 text-center text-xs font-black text-black active:scale-[0.98]"
          >
            Play
            <span className="text-[9px] font-medium opacity-70">
              {canPlay ? "ready" : "need 1k"}
            </span>
          </Link>
          <Link
            href="/claim"
            onClick={onClose}
            className="flex min-h-11 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 px-2 text-xs font-bold text-white hover:border-zinc-500"
          >
            Claim
          </Link>
          <Link
            href="/swap"
            onClick={onClose}
            className="flex min-h-11 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 px-2 text-xs font-bold text-white hover:border-zinc-500"
          >
            Buy
          </Link>
        </div>

        <p className="mb-3 text-center text-[10px] text-zinc-600">
          On Play: tap bag once · <span className="text-zinc-400">double-tap to lock</span>
        </p>

        {/* Mint copy */}
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(SHIT_MINT);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
          }}
          className="mb-4 w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-2 py-1.5 text-left"
        >
          <span className="text-[9px] uppercase text-zinc-500">Mint · tap copy</span>
          <p className="truncate font-mono text-[10px] text-zinc-400">{SHIT_MINT}</p>
        </button>

        {/* Vote count only — never dump full history in wallet */}
        {twitterUsername && (
          <div className="mb-3 flex items-center justify-between border-t border-zinc-800 pt-3 text-xs text-zinc-500">
            <span>Votes cast</span>
            <span className="font-mono font-bold tabular-nums text-zinc-300">
              {loadingVotes ? "…" : totalUserVotes.toLocaleString()}
            </span>
          </div>
        )}

        {/* Ref share */}
        <div className="border-t border-zinc-800 pt-3">
          <ShareRefButton
            handle={twitterUsername || null}
            path="/"
            variant="full"
            className="!border-0 !bg-transparent !p-0 !rounded-none"
          />
        </div>

        {children}
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(sheet, document.body);
}
