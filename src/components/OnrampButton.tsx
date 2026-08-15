"use client";

import { useMemo, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  useFundWallet,
  useSolanaFundingPlugin,
  useSignAndSendTransaction,
  useSignTransaction,
  useWallets,
} from "@privy-io/react-auth/solana";
import { pickSolanaAddress } from "@/lib/privy-identity";
import { useSafeLogin } from "@/hooks/useSafeLogin";
import { EmojiIcon } from "@/components/EmojiIcon";
import { SHIT_SYMBOL } from "@/lib/shit-token";
import {
  b64ToBytes,
  encodeSigBs58,
  friendlySolanaSendError,
  isPrepareFailure,
  sendRawBase64,
} from "@/lib/solana-send";

/** Call once near root so Privy Solana onramp plugin is registered. */
export function SolanaFundingBootstrap() {
  useSolanaFundingPlugin();
  return null;
}

type Props = {
  /** Suggested SOL amount for the MoonPay card flow */
  amount?: string;
  /** full = card with copy; compact = single button; inline = text-ish */
  variant?: "full" | "compact" | "inline";
  className?: string;
  label?: string;
  /**
   * After SOL lands from card, auto-swap SOL → $TOKENSHIT via Jupiter.
   * Default true — MoonPay cannot list custom SPL tokens.
   */
  autoSwap?: boolean;
};

const WSOL = "So11111111111111111111111111111111111111112";
/** Leave this much SOL for rent / future fees after swap (lamports) */
const DUST_LAMPORTS = 12_000_000; // 0.012 SOL
/**
 * MoonPay enforces a minimum SOL receive size (often ~0.25–0.3).
 * Opening below that shows “Minimum order is X SOL” — always pad up.
 */
const MOONPAY_MIN_SOL = 0.3;

function normalizeOnrampSol(raw?: string): string {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < MOONPAY_MIN_SOL) return String(MOONPAY_MIN_SOL);
  return String(Math.round(n * 1000) / 1000);
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Fiat on-ramp → SOL (MoonPay via Privy) → optional auto-swap to $TOKENSHIT.
 * MoonPay has no TOKENSHIT listing; this is the real “buy the token with card” path.
 */
export default function OnrampButton({
  amount = "0.3",
  variant = "compact",
  className = "",
  label,
  autoSwap = true,
}: Props) {
  const solAmount = useMemo(() => normalizeOnrampSol(amount), [amount]);
  const { ready, authenticated, user } = usePrivy();
  const { safeLogin } = useSafeLogin();
  const { fundWallet } = useFundWallet();
  const { wallets } = useWallets();
  const { signAndSendTransaction } = useSignAndSendTransaction();
  const { signTransaction } = useSignTransaction();
  const [busy, setBusy] = useState<"idle" | "card" | "swap">("idle");
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [sig, setSig] = useState<string | null>(null);

  const address = useMemo(
    () => pickSolanaAddress(wallets, user),
    [wallets, user]
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const walletObj = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const list = (wallets || []) as any[];
    return (
      list.find((w) => w?.address === address) ||
      list.find((w) => w?.standardWallet?.name || w?.walletClientType) ||
      list[0] ||
      null
    );
  }, [wallets, address]);

  async function getSolLamports(owner: string): Promise<number> {
    try {
      const r = await fetch(
        `/api/wallet/balances?address=${encodeURIComponent(owner)}`,
        { cache: "no-store" }
      );
      const d = await r.json();
      if (typeof d.solLamports === "number") return d.solLamports;
      if (typeof d.lamports === "number") return d.lamports;
      if (typeof d.lamports === "string" && d.lamports) return Number(d.lamports);
      if (typeof d.sol === "number") return Math.floor(d.sol * 1e9);
    } catch {
      /* */
    }
    return 0;
  }

  /** Poll until SOL rises or timeout (MoonPay settlement is async). */
  async function waitForSolIncrease(
    owner: string,
    baseline: number,
    timeoutMs = 90_000
  ): Promise<number> {
    const start = Date.now();
    let best = baseline;
    while (Date.now() - start < timeoutMs) {
      const now = await getSolLamports(owner);
      if (now > best) best = now;
      // Meaningful bump ( > ~0.02 SOL )
      if (now >= baseline + 20_000_000) return now;
      await sleep(2500);
    }
    return best;
  }

  async function swapSolToShit(
    owner: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wallet: any,
    lamportsIn: number
  ): Promise<string> {
    const spend = Math.max(0, lamportsIn - DUST_LAMPORTS);
    if (spend < 5_000_000) {
      throw new Error(
        `Not enough SOL to swap yet (have ${(lamportsIn / 1e9).toFixed(4)}). Wait for MoonPay to settle, then tap again.`
      );
    }

    const qRes = await fetch(
      `/api/buy?amountLamports=${spend}&slippageBps=200&fee=0`
    );
    const qData = await qRes.json();
    if (!qRes.ok || !qData.quote) {
      throw new Error(
        typeof qData.error === "string" ? qData.error : "Quote failed"
      );
    }

    const sRes = await fetch("/api/buy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quoteResponse: qData.quote,
        userPublicKey: owner,
        fee: false,
      }),
    });
    const sData = await sRes.json();
    if (!sRes.ok || !sData.swapTransaction) {
      throw new Error(
        typeof sData.error === "string" ? sData.error : "Swap build failed"
      );
    }

    const txBytes = b64ToBytes(sData.swapTransaction as string);
    let signature: string | null = null;

    try {
      try {
        const result = await signAndSendTransaction({
          transaction: txBytes,
          wallet,
          chain: "solana:mainnet",
          options: {
            sponsor: true,
            uiOptions: {
              showWalletUIs: true,
              description: `Swap SOL → $${SHIT_SYMBOL}`,
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
          wallet,
          chain: "solana:mainnet",
          options: {
            uiOptions: {
              showWalletUIs: true,
              description: `Swap SOL → $${SHIT_SYMBOL}`,
            },
          },
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
        wallet,
        chain: "solana:mainnet",
        options: { uiOptions: { showWalletUIs: true } },
      });
      if (!(signed?.signedTransaction instanceof Uint8Array)) throw e;
      signature = await sendRawBase64(signed.signedTransaction, {
        skipPreflight: true,
      });
    }

    if (!signature) throw new Error("Swap sent but no signature returned");
    return signature;
  }

  async function onRamp() {
    setErr(null);
    setMsg(null);
    setSig(null);
    if (!authenticated) {
      safeLogin();
      return;
    }
    if (!address) {
      setErr("No Solana wallet yet — wait a second after login, or re-login.");
      return;
    }

    const baseline = await getSolLamports(address);

    // If they already have enough SOL, skip card and go straight to swap
    if (autoSwap && baseline >= 25_000_000 && walletObj) {
      setBusy("swap");
      try {
        setMsg(`Swapping SOL → $${SHIT_SYMBOL}…`);
        const signature = await swapSolToShit(address, walletObj, baseline);
        setSig(signature);
        setMsg(`Bought $${SHIT_SYMBOL}`);
      } catch (e) {
        setErr(friendlySolanaSendError(e));
      } finally {
        setBusy("idle");
      }
      return;
    }

    setBusy("card");
    try {
      await fundWallet({
        address,
        options: {
          chain: "solana:mainnet",
          amount: solAmount,
          asset: "native-currency",
          defaultFundingMethod: "card",
          card: {
            preferredProvider: "moonpay",
          },
          uiConfig: {
            receiveFundsTitle: `Buy $${SHIT_SYMBOL}`,
            receiveFundsSubtitle: `Card → SOL (min ~${MOONPAY_MIN_SOL}) → auto-swap to $${SHIT_SYMBOL}`,
          },
        },
      });
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e);
      if (/reject|cancel|close|denied/i.test(m)) {
        setMsg("Card flow dismissed.");
        setBusy("idle");
        return;
      }
      setErr(m);
      setBusy("idle");
      return;
    }

    if (!autoSwap) {
      setMsg("SOL on the way — open Swap when it lands.");
      setBusy("idle");
      return;
    }

    // MoonPay may finish after modal closes — wait for balance, then swap
    setBusy("swap");
    setMsg("Waiting for SOL to land, then swapping to $" + SHIT_SYMBOL + "…");
    try {
      const after = await waitForSolIncrease(address, baseline, 100_000);
      if (after <= baseline + 5_000_000) {
        setMsg(
          "Card closed — SOL can take a minute. Tap again once balance updates to finish swap."
        );
        setBusy("idle");
        return;
      }
      if (!walletObj) {
        setErr("Wallet not ready for swap — refresh and tap again.");
        setBusy("idle");
        return;
      }
      const signature = await swapSolToShit(address, walletObj, after);
      setSig(signature);
      setMsg(`Bought $${SHIT_SYMBOL} 🎉`);
    } catch (e) {
      const m = friendlySolanaSendError(e);
      if (/Not enough SOL to swap yet/i.test(m)) {
        setMsg(m);
      } else {
        setErr(m);
      }
    } finally {
      setBusy("idle");
    }
  }

  if (!ready) return null;

  const working = busy !== "idle";
  const cta =
    label ||
    (busy === "card"
      ? "Opening card…"
      : busy === "swap"
        ? `Buying $${SHIT_SYMBOL}…`
        : !authenticated
          ? `Login · buy $${SHIT_SYMBOL}`
          : `Buy $${SHIT_SYMBOL} with card`);

  const blurb = `Card (MoonPay) → SOL → Jupiter swap into $${SHIT_SYMBOL}. Custom tokens can’t list on MoonPay directly.`;

  if (variant === "inline") {
    return (
      <button
        type="button"
        disabled={working}
        onClick={() => void onRamp()}
        className={`text-neon-blue hover:underline text-xs font-medium disabled:opacity-50 ${className}`}
      >
        {cta}
      </button>
    );
  }

  if (variant === "compact") {
    return (
      <div className={className}>
        <button
          type="button"
          disabled={working}
          onClick={() => void onRamp()}
          className="w-full min-h-11 rounded-xl border border-neon/45 bg-neon/10 hover:bg-neon/20 text-neon text-sm font-semibold font-orbitron tracking-wide transition disabled:opacity-50 active:scale-[0.99] inline-flex items-center justify-center gap-2"
        >
          <EmojiIcon size={16}>💳</EmojiIcon>
          {cta}
        </button>
        {err && (
          <p className="mt-1.5 text-[11px] text-red-400 break-words">{err}</p>
        )}
        {msg && !err && (
          <p className="mt-1.5 text-[11px] text-zinc-500">{msg}</p>
        )}
        {sig && (
          <a
            href={`https://solscan.io/tx/${sig}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block text-[10px] text-neon-blue hover:underline font-mono"
          >
            tx {sig.slice(0, 8)}…{sig.slice(-6)}
          </a>
        )}
      </div>
    );
  }

  return (
    <section
      className={`rounded-xl border border-neon/35 bg-gradient-to-br from-neon/5 to-zinc-950/80 p-3.5 sm:p-4 space-y-2.5 ${className}`}
    >
      <div className="flex items-start gap-2.5">
        <span className="text-xl leading-none mt-0.5" aria-hidden>
          <EmojiIcon size={22}>💳</EmojiIcon>
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-white font-orbitron tracking-wide">
            Buy ${SHIT_SYMBOL}
          </h3>
          <p className="text-[11px] text-zinc-500 leading-snug mt-0.5">
            {blurb}
          </p>
        </div>
      </div>
      <button
        type="button"
        disabled={working}
        onClick={() => void onRamp()}
        className="w-full min-h-11 rounded-xl bg-neon text-black text-sm font-bold hover:brightness-110 transition disabled:opacity-50 active:scale-[0.99] inline-flex items-center justify-center gap-2"
      >
        {cta}
      </button>
      {address && (
        <p className="text-[10px] font-mono text-zinc-600 truncate">
          → {address.slice(0, 4)}…{address.slice(-4)}
        </p>
      )}
      {err && (
        <p className="text-xs text-red-400 break-words bg-red-950/30 border border-red-900/40 rounded-lg px-2.5 py-1.5">
          {err}
        </p>
      )}
      {msg && !err && <p className="text-xs text-zinc-400">{msg}</p>}
      {sig && (
        <a
          href={`https://solscan.io/tx/${sig}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-neon-blue hover:underline font-mono break-all"
        >
          tx {sig.slice(0, 12)}…{sig.slice(-8)}
        </a>
      )}
    </section>
  );
}
