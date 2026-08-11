"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  useFundWallet,
  useSolanaFundingPlugin,
  useSignAndSendTransaction,
  useWallets,
} from "@privy-io/react-auth/solana";
import {
  BUY_FEE_BPS,
  SHIT_FEE_ATA,
  jupiterBuyUrlWithFee,
} from "@/lib/buy-fee";
import { SHIT_MINT, TREASURY_ADDRESS } from "@/lib/shit-token";

function SolanaFundingBootstrap() {
  useSolanaFundingPlugin();
  return null;
}

function fmtShit(n: number) {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function BuyShitPanel() {
  const { ready, authenticated, user, login } = usePrivy();
  const { fundWallet } = useFundWallet();
  const { wallets } = useWallets();
  const { signAndSendTransaction } = useSignAndSendTransaction();

  const [solAmount, setSolAmount] = useState("0.1");
  const [busy, setBusy] = useState<"fund" | "buy" | null>(null);
  const [quoteOut, setQuoteOut] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [sig, setSig] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const walletAddress = useMemo(() => {
    const w = wallets?.[0];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyW = w as any;
    return (
      anyW?.address ||
      user?.wallet?.address ||
      null
    ) as string | null;
  }, [wallets, user]);

  const lamports = useMemo(() => {
    const n = Number(solAmount);
    if (!Number.isFinite(n) || n <= 0) return 0;
    return Math.floor(n * 1e9);
  }, [solAmount]);

  const refreshQuote = useCallback(async () => {
    if (lamports <= 0) {
      setQuoteOut(null);
      return;
    }
    try {
      const res = await fetch(
        `/api/buy?amountLamports=${lamports}&slippageBps=100`
      );
      const data = await res.json();
      if (!res.ok) {
        setQuoteOut(null);
        return;
      }
      const out = Number(data.quote?.outAmount || 0);
      // 6 decimals
      setQuoteOut(out / 1e6);
    } catch {
      setQuoteOut(null);
    }
  }, [lamports]);

  useEffect(() => {
    const t = setTimeout(refreshQuote, 300);
    return () => clearTimeout(t);
  }, [refreshQuote]);

  async function onFund() {
    setErr(null);
    setMsg(null);
    if (!authenticated) {
      login();
      return;
    }
    if (!walletAddress) {
      setErr("No Solana wallet yet — log in again to create one.");
      return;
    }
    setBusy("fund");
    try {
      await fundWallet({
        address: walletAddress,
        options: {
          chain: "solana:mainnet",
          amount: solAmount || "0.1",
          asset: "native-currency",
          defaultFundingMethod: "card",
          card: { preferredProvider: "moonpay" },
          uiConfig: {
            receiveFundsTitle: "Add SOL",
            receiveFundsSubtitle: "Then buy $SHIT in one tap",
          },
        },
      });
      setMsg("Funding flow closed — when SOL arrives, hit Buy $SHIT.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  async function onBuy() {
    setErr(null);
    setMsg(null);
    setSig(null);
    if (!authenticated) {
      login();
      return;
    }
    if (!walletAddress) {
      setErr("No Solana wallet.");
      return;
    }
    if (lamports <= 0) {
      setErr("Enter a SOL amount > 0");
      return;
    }

    setBusy("buy");
    try {
      const qRes = await fetch(
        `/api/buy?amountLamports=${lamports}&slippageBps=100`
      );
      const qData = await qRes.json();
      if (!qRes.ok || !qData.quote) {
        throw new Error(qData.error || "Quote failed");
      }

      const sRes = await fetch("/api/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteResponse: qData.quote,
          userPublicKey: walletAddress,
        }),
      });
      const sData = await sRes.json();
      if (!sRes.ok || !sData.swapTransaction) {
        throw new Error(sData.error || "Swap build failed");
      }

      // Deserialize base64 tx → Uint8Array for Privy
      const txBytes = Uint8Array.from(atob(sData.swapTransaction), (c) =>
        c.charCodeAt(0)
      );

      // Find wallet object
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const wallet = (wallets as any[])?.[0];
      if (!wallet) {
        throw new Error("Privy Solana wallet not ready");
      }

      const result = await signAndSendTransaction({
        transaction: txBytes,
        wallet,
        chain: "solana:mainnet",
        options: {
          uiOptions: {
            showWalletUIs: true,
          },
        },
      });

      const sigBytes = result?.signature;
      let signature: string | null = null;
      if (sigBytes && sigBytes instanceof Uint8Array) {
        // base58 encode
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const bs58 = require("bs58");
          const enc = bs58.encode || bs58.default?.encode;
          signature = enc(Buffer.from(sigBytes));
        } catch {
          signature = Buffer.from(sigBytes).toString("hex");
        }
      }

      setSig(signature);
      setMsg(`Bought $SHIT · ${BUY_FEE_BPS / 100}% fee → treasury`);
      refreshQuote();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  if (!ready) return null;

  return (
    <section className="rounded-xl border border-border bg-card p-5 space-y-4">
      <SolanaFundingBootstrap />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Buy $SHIT</h2>
          <p className="text-sm text-zinc-500 mt-1">
            Card → SOL (Privy/MoonPay), then swap to $SHIT. Platform fee{" "}
            <span className="text-neon font-mono">{BUY_FEE_BPS / 100}%</span>{" "}
            goes to treasury.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          SOL amount
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={solAmount}
            onChange={(e) => setSolAmount(e.target.value)}
            className="w-28 rounded-md border border-zinc-700 bg-background px-3 py-2 text-sm text-white font-mono"
          />
        </label>
        <div className="text-sm text-zinc-400 pb-2 font-mono">
          ≈ {quoteOut == null ? "…" : fmtShit(quoteOut)} $SHIT
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <button
          type="button"
          disabled={busy !== null}
          onClick={onFund}
          className="rounded-md border border-zinc-600 hover:border-neon text-white text-sm font-semibold py-2.5 transition-colors disabled:opacity-50"
        >
          {busy === "fund"
            ? "Opening card…"
            : authenticated
              ? "Add SOL (card)"
              : "Login to fund"}
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={onBuy}
          className="rounded-md bg-neon text-black hover:brightness-110 text-sm font-semibold py-2.5 transition disabled:opacity-50"
        >
          {busy === "buy"
            ? "Swapping…"
            : authenticated
              ? `Buy $SHIT (−${BUY_FEE_BPS / 100}% fee)`
              : "Login to buy"}
        </button>
      </div>

      <p className="text-[11px] text-zinc-600 font-mono break-all">
        fee → {SHIT_FEE_ATA.slice(0, 8)}… (treasury {TREASURY_ADDRESS.slice(0, 6)}…)
        · mint {SHIT_MINT.slice(0, 8)}…
      </p>

      {err && <p className="text-sm text-red-400">{err}</p>}
      {msg && <p className="text-sm text-green-400">{msg}</p>}
      {sig && (
        <a
          href={`https://solscan.io/tx/${sig}`}
          className="text-xs text-neon-blue hover:underline font-mono break-all"
          target="_blank"
          rel="noopener noreferrer"
        >
          tx {sig}
        </a>
      )}

      <a
        href={jupiterBuyUrlWithFee()}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-zinc-500 hover:text-zinc-300"
      >
        Fallback: open Jupiter ↗
      </a>
    </section>
  );
}
