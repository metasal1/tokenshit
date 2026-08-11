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
import { SHIT_MINT, SHIT_SYMBOL, TREASURY_ADDRESS } from "@/lib/shit-token";

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
            receiveFundsSubtitle: "Then buy $TOKENSHIT in one tap",
          },
        },
      });
      setMsg("Funding closed — when SOL lands, hit Buy.");
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
          feeAccount: qData.feeAccount,
          feeBps: qData.feeBps,
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
      setMsg(`Bought $TOKENSHIT · ${BUY_FEE_BPS / 100}% fee → treasury`);
      refreshQuote();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  if (!ready) return null;

  return (
    <section className="rounded-xl border border-border bg-card p-3.5 sm:p-5 space-y-3 sm:space-y-4">
      <SolanaFundingBootstrap />
      <div>
        <h2 className="text-base sm:text-lg font-bold text-foreground">
          Buy ${SHIT_SYMBOL}
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1 leading-snug">
          Card → SOL, then swap. Fee{" "}
          <span className="text-neon font-mono">{BUY_FEE_BPS / 100}%</span> →
          treasury.
        </p>
      </div>

      <div className="flex items-stretch gap-3">
        <label className="flex flex-col gap-1 text-xs text-zinc-500 flex-1 min-w-0">
          SOL amount
          <input
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            value={solAmount}
            onChange={(e) => setSolAmount(e.target.value)}
            className="w-full min-h-11 rounded-lg border border-zinc-700 bg-background px-3 py-2.5 text-base sm:text-sm text-white font-mono"
          />
        </label>
        <div className="flex flex-col justify-end pb-2.5 text-sm text-zinc-400 font-mono shrink-0">
          ≈ {quoteOut == null ? "…" : fmtShit(quoteOut)}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
        <button
          type="button"
          disabled={busy !== null}
          onClick={onFund}
          className="min-h-11 touch-manipulation rounded-lg border border-zinc-600 hover:border-neon text-white text-sm font-semibold py-3 transition-colors disabled:opacity-50 active:scale-[0.98]"
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
          className="min-h-11 touch-manipulation rounded-lg bg-neon text-black hover:brightness-110 text-sm font-semibold py-3 transition disabled:opacity-50 active:scale-[0.98]"
        >
          {busy === "buy"
            ? "Swapping…"
            : authenticated
              ? `Buy (−${BUY_FEE_BPS / 100}% fee)`
              : "Login to buy"}
        </button>
      </div>

      <p className="text-[10px] sm:text-[11px] text-zinc-600 font-mono break-all leading-relaxed">
        fee {SHIT_FEE_ATA.slice(0, 6)}… · treasury {TREASURY_ADDRESS.slice(0, 6)}…
      </p>

      {err && (
        <p className="text-sm text-red-400 break-words bg-red-950/30 border border-red-900/40 rounded-lg px-3 py-2">
          {err}
        </p>
      )}
      {msg && (
        <p className="text-sm text-green-400 break-words bg-green-950/30 border border-green-900/40 rounded-lg px-3 py-2">
          {msg}
        </p>
      )}
      {sig && (
        <a
          href={`https://solscan.io/tx/${sig}`}
          className="text-xs text-neon-blue hover:underline font-mono break-all"
          target="_blank"
          rel="noopener noreferrer"
        >
          tx {sig.slice(0, 12)}…{sig.slice(-8)}
        </a>
      )}

      <a
        href={jupiterBuyUrlWithFee()}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-zinc-500 hover:text-zinc-300 min-h-9 inline-flex items-center"
      >
        Fallback: Jupiter ↗
      </a>
    </section>
  );
}
