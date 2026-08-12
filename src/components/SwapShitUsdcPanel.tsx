"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  useSignAndSendTransaction,
  useWallets,
} from "@privy-io/react-auth/solana";
import { SHIT_MINT, SHIT_SYMBOL, SHIT_DECIMALS } from "@/lib/shit-token";
import { BalanceSkeleton } from "@/components/StatLoader";
import { EmojiIcon } from "@/components/EmojiIcon";

/** Circle USDC mainnet */
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const USDC_DECIMALS = 6;
const USDC_SYMBOL = "USDC";

type Side = "shit" | "usdc";

function encodeSig(sigBytes: Uint8Array): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const bs58 = require("bs58");
    const enc = bs58.encode || bs58.default?.encode;
    if (typeof enc === "function") return enc(Buffer.from(sigBytes));
  } catch {
    /* fall through */
  }
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

function fmtOut(n: number, dec: number) {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  return n.toLocaleString(undefined, {
    maximumFractionDigits: Math.min(4, dec),
  });
}

export default function SwapShitUsdcPanel() {
  const { ready, authenticated, user, login } = usePrivy();
  const { wallets } = useWallets();
  const { signAndSendTransaction } = useSignAndSendTransaction();

  /** sellSide = what user spends */
  const [sellSide, setSellSide] = useState<Side>("usdc");
  const [amount, setAmount] = useState("10");
  const [busy, setBusy] = useState(false);
  const [quoteOut, setQuoteOut] = useState<number | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [sig, setSig] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const buySide: Side = sellSide === "usdc" ? "shit" : "usdc";

  const walletAddress = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const list = (wallets || []) as any[];
    const preferred =
      list.find((w) => w?.standardWallet?.name || w?.walletClientType) ||
      list[0];
    return (preferred?.address || user?.wallet?.address || null) as string | null;
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

  const inputMint = sellSide === "usdc" ? USDC_MINT : SHIT_MINT;
  const outputMint = buySide === "usdc" ? USDC_MINT : SHIT_MINT;
  const inDec = sellSide === "usdc" ? USDC_DECIMALS : SHIT_DECIMALS;
  const outDec = buySide === "usdc" ? USDC_DECIMALS : SHIT_DECIMALS;
  const sellLabel = sellSide === "usdc" ? USDC_SYMBOL : `$${SHIT_SYMBOL}`;
  const buyLabel = buySide === "usdc" ? USDC_SYMBOL : `$${SHIT_SYMBOL}`;

  const rawAmount = useMemo(() => {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) return BigInt(0);
    // avoid float issues for 6dp
    const scaled = Math.floor(n * 10 ** inDec + 1e-9);
    return BigInt(scaled);
  }, [amount, inDec]);

  const flip = () => {
    setSellSide((s) => (s === "usdc" ? "shit" : "usdc"));
    setQuoteOut(null);
    setErr(null);
    setSig(null);
    setMsg(null);
  };

  const refreshQuote = useCallback(async () => {
    if (rawAmount <= BigInt(0)) {
      setQuoteOut(null);
      return;
    }
    setQuoteLoading(true);
    try {
      const res = await fetch(
        `/api/swap?inputMint=${inputMint}&outputMint=${outputMint}&amount=${rawAmount.toString()}&slippageBps=150`
      );
      const data = await res.json();
      if (!res.ok || !data.quote?.outAmount) {
        setQuoteOut(null);
        return;
      }
      const out = Number(data.quote.outAmount) / 10 ** outDec;
      setQuoteOut(out);
    } catch {
      setQuoteOut(null);
    } finally {
      setQuoteLoading(false);
    }
  }, [rawAmount, inputMint, outputMint, outDec]);

  useEffect(() => {
    const t = setTimeout(() => void refreshQuote(), 350);
    return () => clearTimeout(t);
  }, [refreshQuote]);

  async function onSwap() {
    setErr(null);
    setSig(null);
    setMsg(null);

    if (!authenticated) {
      login();
      return;
    }
    if (!walletAddress || !walletObj) {
      setErr("No Solana wallet ready — log in again.");
      return;
    }
    if (rawAmount <= BigInt(0)) {
      setErr("Enter an amount > 0");
      return;
    }

    setBusy(true);
    try {
      const qRes = await fetch(
        `/api/swap?inputMint=${inputMint}&outputMint=${outputMint}&amount=${rawAmount.toString()}&slippageBps=150`
      );
      const qData = await qRes.json();
      if (!qRes.ok || !qData.quote) {
        throw new Error(
          typeof qData.error === "string" ? qData.error : "Quote failed"
        );
      }

      const sRes = await fetch("/api/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteResponse: qData.quote,
          userPublicKey: walletAddress,
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
      const txBytes = Uint8Array.from(atob(raw), (c) => c.charCodeAt(0));

      const result = await signAndSendTransaction({
        transaction: txBytes,
        wallet: walletObj,
        chain: "solana:mainnet",
        options: {
          uiOptions: { showWalletUIs: true },
        },
      });

      let signature: string | null = null;
      const sigBytes = result?.signature;
      if (sigBytes instanceof Uint8Array) {
        signature = encodeSig(sigBytes);
      } else if (typeof result?.signature === "string") {
        signature = result.signature;
      }

      setSig(signature);
      setMsg(`Swapped ${sellLabel} → ${buyLabel}`);
      void refreshQuote();
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e);
      if (/insufficient|0x1|lamport/i.test(m)) {
        setErr(`Not enough ${sellLabel} (or SOL for fees).`);
      } else if (/User rejected|denied|cancel/i.test(m)) {
        setErr("Cancelled.");
      } else if (/5663005|lookup tables unknown|address lookup/i.test(m)) {
        setErr("Wallet couldn’t load the swap route — refresh and try again.");
      } else {
        setErr(m);
      }
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return null;

  const jupUrl = `https://jup.ag/swap/${inputMint}-${outputMint}`;

  return (
    <section className="rounded-xl border border-border bg-card p-3.5 sm:p-5 space-y-3 sm:space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-foreground inline-flex items-center gap-2">
            <EmojiIcon size={20}>🔁</EmojiIcon>
            Swap
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1 leading-snug">
            ${SHIT_SYMBOL} ↔ USDC via Jupiter · Privy wallet
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          You pay ({sellLabel})
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg border border-border bg-zinc-950 px-3 py-2.5 text-sm text-foreground font-mono focus:outline-none focus:border-neon"
          />
        </label>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={flip}
            className="h-9 w-9 rounded-full border border-border bg-zinc-900 text-lg hover:border-neon hover:text-neon transition-colors"
            title="Flip direction"
            aria-label="Flip swap direction"
          >
            ⇅
          </button>
        </div>

        <div className="rounded-lg border border-border bg-zinc-950/80 px-3 py-2.5 flex items-center justify-between gap-2">
          <span className="text-xs text-zinc-500">You get ({buyLabel})</span>
          {quoteLoading ? (
            <BalanceSkeleton className="w-20 h-4" />
          ) : (
            <span className="font-mono text-sm text-neon font-semibold">
              {quoteOut != null ? fmtOut(quoteOut, outDec) : "—"}
            </span>
          )}
        </div>
      </div>

      {err && (
        <p className="text-xs text-red-400 break-words" role="alert">
          {err}
        </p>
      )}
      {msg && (
        <p className="text-xs text-neon">
          {msg}
          {sig && (
            <>
              {" · "}
              <a
                href={`https://solscan.io/tx/${sig}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-neon-blue"
              >
                tx
              </a>
            </>
          )}
        </p>
      )}

      <button
        type="button"
        disabled={busy || rawAmount <= BigInt(0)}
        onClick={() => void onSwap()}
        className="w-full rounded-lg bg-neon text-black font-bold py-3 text-sm disabled:opacity-50 hover:brightness-110 transition"
      >
        {!authenticated
          ? "Login to swap"
          : busy
            ? "Swapping…"
            : `Swap ${sellLabel} → ${buyLabel}`}
      </button>

      <a
        href={jupUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center text-xs text-zinc-500 hover:text-neon-blue"
      >
        Open in Jupiter ↗
      </a>
    </section>
  );
}
