"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  useFundWallet,
  useSolanaFundingPlugin,
  useSignAndSendTransaction,
  useSignTransaction,
  useWallets,
} from "@privy-io/react-auth/solana";
import { jupiterBuyUrlWithFee } from "@/lib/buy-fee";
import { SHIT_SYMBOL } from "@/lib/shit-token";
import { BalanceSkeleton } from "@/components/StatLoader";
import {
  b64ToBytes,
  encodeSigBs58,
  friendlySolanaSendError,
  isPrepareFailure,
  sendRawBase64,
} from "@/lib/solana-send";
import { pickSolanaAddress } from "@/lib/privy-identity";

function SolanaFundingBootstrap() {
  useSolanaFundingPlugin();
  return null;
}

function fmtShit(n: number) {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)
    return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function encodeSig(sigBytes: Uint8Array): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const bs58 = require("bs58");
    const enc = bs58.encode || bs58.default?.encode;
    if (typeof enc === "function") return enc(Buffer.from(sigBytes));
  } catch {
    /* fall through */
  }
  // base58 alphabet fallback
  const ALPHABET =
    "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let zeros = 0;
  while (zeros < sigBytes.length && sigBytes[zeros] === 0) zeros++;
  const size = ((sigBytes.length - zeros) * 138) / 100 + 1;
  const b = new Uint8Array(size);
  let length = 0;
  for (let i = zeros; i < sigBytes.length; i++) {
    let carry = sigBytes[i];
    let j = 0;
    for (let k = size - 1; k >= 0; k--, j++) {
      if (carry === 0 && j >= length) break;
      carry += 256 * b[k];
      b[k] = carry % 58;
      carry = (carry / 58) | 0;
    }
    length = j;
  }
  let out = "1".repeat(zeros);
  for (let i = size - length; i < size; i++) out += ALPHABET[b[i]];
  return out;
}

export default function BuyShitPanel() {
  const { ready, authenticated, user, login } = usePrivy();
  const { fundWallet } = useFundWallet();
  const { wallets } = useWallets();
  const { signAndSendTransaction } = useSignAndSendTransaction();
  const { signTransaction } = useSignTransaction();

  const [solAmount, setSolAmount] = useState("0.1");
  const [busy, setBusy] = useState<"fund" | "buy" | null>(null);
  const [quoteOut, setQuoteOut] = useState<number | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [sig, setSig] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const walletAddress = useMemo(() => {
    // Prefer embedded / first solana wallet
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const list = (wallets || []) as any[];
    const preferred =
      list.find((w) => w?.standardWallet?.name || w?.walletClientType) ||
      list[0];
    return (
      preferred?.address ||
      user?.wallet?.address ||
      null
    ) as string | null;
  }, [wallets, user]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const walletObj = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const list = (wallets || []) as any[];
    if (!list.length) return null;
    if (walletAddress) {
      const m = list.find((w) => w?.address === walletAddress);
      if (m) return m;
    }
    return list[0];
  }, [wallets, walletAddress]);

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
    setQuoteLoading(true);
    try {
      const res = await fetch(
        `/api/buy?amountLamports=${lamports}&slippageBps=150&fee=0`
      );
      const data = await res.json();
      if (!res.ok) {
        setQuoteOut(null);
        return;
      }
      const out = Number(data.quote?.outAmount || 0);
      setQuoteOut(out / 1e6);
    } catch {
      setQuoteOut(null);
    } finally {
      setQuoteLoading(false);
    }
  }, [lamports]);

  useEffect(() => {
    const t = setTimeout(refreshQuote, 280);
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
    if (!walletAddress || !walletObj) {
      setErr("No Solana wallet ready — log in again.");
      return;
    }
    if (lamports <= 0) {
      setErr("Enter a SOL amount > 0");
      return;
    }

    setBusy("buy");
    try {
      const qRes = await fetch(
        `/api/buy?amountLamports=${lamports}&slippageBps=150&fee=0`
      );
      const qData = await qRes.json();
      if (!qRes.ok || !qData.quote) {
        throw new Error(
          typeof qData.error === "string"
            ? qData.error
            : "Quote failed — try again"
        );
      }

      const sRes = await fetch("/api/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteResponse: qData.quote,
          userPublicKey: walletAddress,
          fee: false,
        }),
      });
      const sData = await sRes.json();
      if (!sRes.ok || !sData.swapTransaction) {
        throw new Error(
          typeof sData.error === "string"
            ? sData.error
            : "Swap build failed — try again"
        );
      }

      const raw = sData.swapTransaction as string;
      const txBytes = b64ToBytes(raw);

      let signature: string | null = null;
      try {
        try {
          const result = await signAndSendTransaction({
            transaction: txBytes,
            wallet: walletObj,
            chain: "solana:mainnet",
            options: {
              sponsor: true,
              uiOptions: {
                showWalletUIs: true,
                description: "Network fees sponsored by TOKEN$HIT",
              },
            },
          });
          const sigBytes = result?.signature;
          if (sigBytes instanceof Uint8Array) signature = encodeSigBs58(sigBytes);
          else if (typeof result?.signature === "string")
            signature = result.signature;
        } catch {
          const result = await signAndSendTransaction({
            transaction: txBytes,
            wallet: walletObj,
            chain: "solana:mainnet",
            options: { uiOptions: { showWalletUIs: true } },
          });
          const sigBytes = result?.signature;
          if (sigBytes instanceof Uint8Array) signature = encodeSigBs58(sigBytes);
          else if (typeof result?.signature === "string")
            signature = result.signature;
        }
      } catch (e) {
        if (!isPrepareFailure(e)) throw e;
        const signed = await signTransaction({
          transaction: txBytes,
          wallet: walletObj,
          chain: "solana:mainnet",
          options: { uiOptions: { showWalletUIs: true } },
        });
        if (!(signed?.signedTransaction instanceof Uint8Array)) throw e;
        signature = await sendRawBase64(signed.signedTransaction, {
          skipPreflight: true,
        });
      }

      setSig(signature);
      setMsg(`Bought $${SHIT_SYMBOL}`);
      void refreshQuote();
    } catch (e) {
      const m = friendlySolanaSendError(e);
      if (/insufficient|0x1|lamport|fees/i.test(m)) {
        setErr("Not enough SOL — add SOL first, then buy.");
      } else if (/User rejected|denied|cancel/i.test(m)) {
        setErr("Cancelled.");
      } else if (/5663005|lookup tables unknown|address lookup/i.test(m)) {
        setErr("Wallet couldn’t load the swap route — refresh and try again.");
      } else {
        setErr(m);
      }
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
          Add SOL (card) · swap to ${SHIT_SYMBOL} in one tap.
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
        <div className="flex flex-col justify-end pb-2.5 text-sm text-zinc-400 font-mono shrink-0 min-w-[5.5rem] text-right">
          {quoteLoading || (lamports > 0 && quoteOut == null) ? (
            <BalanceSkeleton className="h-4 w-16 ml-auto" />
          ) : (
            <>≈ {quoteOut == null ? "—" : fmtShit(quoteOut)}</>
          )}
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
          disabled={busy !== null || lamports <= 0}
          onClick={onBuy}
          className="min-h-11 touch-manipulation rounded-lg bg-neon text-black hover:brightness-110 text-sm font-semibold py-3 transition disabled:opacity-50 active:scale-[0.98]"
        >
          {busy === "buy"
            ? "Swapping…"
            : authenticated
              ? `Buy $${SHIT_SYMBOL}`
              : "Login to buy"}
        </button>
      </div>

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
        Open in Jupiter ↗
      </a>
    </section>
  );
}
