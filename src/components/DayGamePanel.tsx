"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets, useSignAndSendTransaction } from "@privy-io/react-auth/solana";
import { pickSolanaAddress } from "@/lib/privy-identity";
import { SHIT_MINT, SHIT_SYMBOL, TREASURY_ADDRESS } from "@/lib/shit-token";
import {
  b64ToBytes,
  encodeSigBs58,
  friendlySolanaSendError,
} from "@/lib/solana-send";
import Link from "next/link";

type Major = {
  assetId: string;
  name: string;
  symbol: string;
  logo: string;
  price: number;
};

type DayStatus = {
  enabled: boolean;
  utcDay: string;
  msToClose: number;
  nextCloseAt: string;
  stakeAmount: number;
  houseFeeBps: number;
  treasury: string;
  mint: string;
  round: {
    hitPot: number;
    shitPot: number;
    status: string;
  } | null;
  stats: {
    hitStakes: number;
    shitStakes: number;
    hitTickets: number;
    shitTickets: number;
  };
  majors: Major[];
  majorsCount: number;
};

function fmt(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function fmtCountdown(ms: number) {
  if (ms <= 0) return "00:00:00";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((x) => String(x).padStart(2, "0")).join(":");
}

/**
 * Build Token-2022 transfer of 1000 SHIT to treasury via server helper.
 * We POST to /api/day/build-transfer for a serialized tx when available;
 * fallback: instruct user — for v1 we build client-side minimal ix via API.
 */
async function fetchTransferTx(wallet: string): Promise<string> {
  const res = await fetch("/api/day/build-transfer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wallet }),
  });
  const data = await res.json();
  if (!res.ok || !data.transaction) {
    throw new Error(data.error || "Could not build stake transfer");
  }
  return data.transaction as string;
}

export default function DayGamePanel() {
  const { ready, authenticated, login, getAccessToken, user } = usePrivy();
  const { wallets } = useWallets();
  const { signAndSendTransaction } = useSignAndSendTransaction();
  const wallet = useMemo(
    () => pickSolanaAddress(wallets, user),
    [wallets, user]
  );

  const [status, setStatus] = useState<DayStatus | null>(null);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Major | null>(null);
  const [side, setSide] = useState<"hit" | "shit">("hit");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const load = useCallback(() => {
    fetch("/api/day", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setStatus(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
    const a = setInterval(load, 30_000);
    const b = setInterval(() => setTick((t) => t + 1), 1000);
    return () => {
      clearInterval(a);
      clearInterval(b);
    };
  }, [load]);

  const msLeft = Math.max(0, (status?.msToClose || 0) - tick * 0);

  // live countdown from nextCloseAt
  const countdown = useMemo(() => {
    if (!status?.nextCloseAt) return "—";
    const ms = Date.parse(status.nextCloseAt) - Date.now();
    return fmtCountdown(ms);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status?.nextCloseAt, tick]);

  const filtered = useMemo(() => {
    const list = status?.majors || [];
    const s = q.trim().toLowerCase();
    if (!s) return list.slice(0, 40);
    return list
      .filter(
        (m) =>
          m.symbol.toLowerCase().includes(s) ||
          m.name.toLowerCase().includes(s) ||
          m.assetId.toLowerCase().includes(s)
      )
      .slice(0, 40);
  }, [status?.majors, q]);

  async function stake() {
    setErr(null);
    setMsg(null);
    if (!authenticated) {
      login();
      return;
    }
    if (!wallet) {
      setErr("Need a Solana wallet linked to X");
      return;
    }
    if (!selected) {
      setErr("Pick a majors bag");
      return;
    }
    setBusy(true);
    try {
      // 1) build + sign transfer 1000 SHIT → treasury
      const rawTx = await fetchTransferTx(wallet);
      const txBytes = b64ToBytes(rawTx);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const walletObj = (wallets as any[])?.find((w) => w?.address === wallet) || (wallets as any[])?.[0];
      if (!walletObj) throw new Error("No wallet object");

      const result = await signAndSendTransaction({
        transaction: txBytes,
        wallet: walletObj,
        chain: "solana:mainnet",
        options: {
          sponsor: true,
          uiOptions: {
            showWalletUIs: true,
            description: `Stake 1,000 $${SHIT_SYMBOL} · ${side.toUpperCase()} ${selected.symbol || selected.name}`,
          },
        },
      });
      let signature: string | null = null;
      if (result?.signature instanceof Uint8Array) {
        signature = encodeSigBs58(result.signature);
      } else if (typeof result?.signature === "string") {
        signature = result.signature;
      }
      if (!signature) throw new Error("No signature from wallet");

      // 2) register stake
      const token = await getAccessToken();
      const res = await fetch("/api/day", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-privy-token": token || "",
        },
        body: JSON.stringify({
          wallet,
          assetId: selected.assetId,
          side,
          signature,
          accessToken: token,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Stake failed");
      setMsg(
        `Staked 1,000 $${SHIT_SYMBOL} ${side.toUpperCase()} on ${selected.symbol || selected.name}. HIT pot ${fmt(data.hitPot)} · SHIT pot ${fmt(data.shitPot)}`
      );
      load();
    } catch (e) {
      setErr(friendlySolanaSendError(e));
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return (
      <div className="rounded-2xl border border-border bg-card h-48 animate-pulse" />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-neon/35 bg-card p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Hit / Shit of the Day
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Stake 1,000 ${SHIT_SYMBOL} on a real major. Best % = HIT pot · worst % =
              SHIT pot. VRF picks one wallet. 25% treasury.
            </p>
          </div>
          <div className="text-right font-mono">
            <div className="text-[10px] uppercase text-zinc-500">UTC close</div>
            <div className="text-lg text-neon font-bold tabular-nums">
              {countdown}
            </div>
            <div className="text-[10px] text-zinc-600">{status?.utcDay}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-green-800/50 bg-green-950/30 p-3">
            <div className="text-[10px] uppercase text-green-500/80">HIT pot</div>
            <div className="text-xl font-bold text-green-400 font-mono">
              {fmt(status?.round?.hitPot || 0)}
            </div>
            <div className="text-[10px] text-zinc-500">
              {status?.stats.hitTickets || 0} wallets · {status?.stats.hitStakes || 0}{" "}
              stakes
            </div>
          </div>
          <div className="rounded-xl border border-red-800/50 bg-red-950/30 p-3">
            <div className="text-[10px] uppercase text-red-500/80">SHIT pot</div>
            <div className="text-xl font-bold text-red-400 font-mono">
              {fmt(status?.round?.shitPot || 0)}
            </div>
            <div className="text-[10px] text-zinc-500">
              {status?.stats.shitTickets || 0} wallets · {status?.stats.shitStakes || 0}{" "}
              stakes
            </div>
          </div>
        </div>

        <p className="text-[11px] text-zinc-600">
          Real majors only ({status?.majorsCount ?? "—"}). 1 wallet = 1 VRF ticket on
          the winning bag. Unlimited stakes still fill the pot.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSide("hit")}
            className={`flex-1 min-h-11 rounded-xl font-bold text-sm border-2 ${
              side === "hit"
                ? "border-green-500 bg-green-900/50 text-green-300"
                : "border-zinc-800 text-zinc-500"
            }`}
          >
            Call HIT
          </button>
          <button
            type="button"
            onClick={() => setSide("shit")}
            className={`flex-1 min-h-11 rounded-xl font-bold text-sm border-2 ${
              side === "shit"
                ? "border-red-500 bg-red-900/50 text-red-300"
                : "border-zinc-800 text-zinc-500"
            }`}
          >
            Call SHIT
          </button>
        </div>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter majors…"
          className="w-full rounded-xl border border-border bg-zinc-950 px-3 py-2.5 text-sm"
        />

        <div className="max-h-56 overflow-y-auto rounded-xl border border-border divide-y divide-border">
          {filtered.map((m) => {
            const on = selected?.assetId === m.assetId;
            return (
              <button
                key={m.assetId}
                type="button"
                onClick={() => setSelected(m)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-zinc-900 ${
                  on ? "bg-zinc-900 ring-1 ring-neon/40" : ""
                }`}
              >
                {m.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.logo} alt="" className="h-8 w-8 rounded-full bg-zinc-800" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-zinc-800" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-white truncate">
                    {m.symbol || m.name}
                  </div>
                  <div className="text-[11px] text-zinc-500 truncate">{m.name}</div>
                </div>
                <div className="text-xs font-mono text-zinc-400">
                  ${m.price < 1 ? m.price.toPrecision(3) : m.price.toFixed(2)}
                </div>
              </button>
            );
          })}
          {!filtered.length && (
            <div className="px-3 py-6 text-center text-sm text-zinc-600">
              No majors match
            </div>
          )}
        </div>

        {err && (
          <p className="text-sm text-red-400 bg-red-950/30 border border-red-900/40 rounded-lg px-3 py-2">
            {err}
          </p>
        )}
        {msg && (
          <p className="text-sm text-neon bg-neon/10 border border-neon/30 rounded-lg px-3 py-2">
            {msg}
          </p>
        )}

        <button
          type="button"
          disabled={busy || !status?.enabled}
          onClick={() => void stake()}
          className="w-full min-h-12 rounded-xl bg-neon text-black font-bold text-sm hover:brightness-110 disabled:opacity-50"
        >
          {!authenticated
            ? "Login with X to stake"
            : busy
              ? "Confirm in wallet…"
              : selected
                ? `Stake 1,000 $${SHIT_SYMBOL} · ${side.toUpperCase()} ${selected.symbol || selected.name}`
                : `Pick a bag · 1,000 $${SHIT_SYMBOL}`}
        </button>

        <div className="flex flex-wrap gap-3 text-[11px] text-zinc-600">
          <Link href="/day/yesterday" className="text-neon-blue hover:underline">
            Yesterday receipt
          </Link>
          <span>·</span>
          <a
            href={`https://sol.new/portfolio/${TREASURY_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Treasury
          </a>
          <span>·</span>
          <span className="font-mono">mint {SHIT_MINT.slice(0, 6)}…</span>
        </div>
      </div>
    </div>
  );
}
