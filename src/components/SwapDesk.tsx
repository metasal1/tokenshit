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
import { jupiterBuyUrlWithFee, USDC_MINT } from "@/lib/buy-fee";
import { SHIT_MINT, SHIT_SYMBOL, SHIT_DECIMALS } from "@/lib/shit-token";
import { pickSolanaAddress } from "@/lib/privy-identity";
import { BalanceSkeleton } from "@/components/StatLoader";
import {
  b64ToBytes,
  encodeSigBs58,
  friendlySolanaSendError,
  isPrepareFailure,
  sendRawBase64,
} from "@/lib/solana-send";

const SOL_MINT = "So11111111111111111111111111111111111111112";
const USDC_DECIMALS = 6;
const USDC_SYMBOL = "USDC";

type Mode = "buy" | "swap";
/** sell asset */
type Asset = "sol" | "usdc" | "shit";

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

function fmt(n: number | null | undefined, maxFrac = 4) {
  if (n == null || !Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000)
    return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (n >= 1)
    return n.toLocaleString(undefined, {
      maximumFractionDigits: Math.min(2, maxFrac),
    });
  return n.toLocaleString(undefined, {
    maximumFractionDigits: maxFrac,
    minimumFractionDigits: 0,
  });
}

function SolanaFundingBootstrap() {
  useSolanaFundingPlugin();
  return null;
}

function Chip({
  active,
  onClick,
  children,
  disabled,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`min-h-9 px-2.5 rounded-lg text-[11px] sm:text-xs font-semibold font-mono border transition active:scale-[0.98] disabled:opacity-40 ${
        active
          ? "border-neon bg-neon/15 text-neon"
          : "border-zinc-700 bg-zinc-950/80 text-zinc-300 hover:border-zinc-500 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

export default function SwapDesk() {
  const { ready, authenticated, user, login } = usePrivy();
  const { wallets } = useWallets();
  const { signAndSendTransaction } = useSignAndSendTransaction();
  const { signTransaction } = useSignTransaction();
  const { fundWallet } = useFundWallet();

  const [mode] = useState<Mode>("buy");
  /** buy only — swap/sell UI hidden */
  const [sellAsset] = useState<Asset>("usdc");
  const [amount, setAmount] = useState("0.1");
  const [slippageBps, setSlippageBps] = useState(150);
  const [busy, setBusy] = useState<"fund" | "swap" | null>(null);
  const [quoteOut, setQuoteOut] = useState<number | null>(null);
  const [quoteIn, setQuoteIn] = useState<number | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteErr, setQuoteErr] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [sig, setSig] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [balances, setBalances] = useState<{
    sol: number;
    usdc: number;
    shit: number;
  } | null>(null);
  const [balLoading, setBalLoading] = useState(false);

  const walletAddress = useMemo(
    () => pickSolanaAddress(wallets, user),
    [wallets, user]
  );

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

  const payAsset: Asset = mode === "buy" ? "sol" : sellAsset;
  const getAsset: Asset =
    mode === "buy" ? "shit" : sellAsset === "usdc" ? "shit" : "usdc";

  const payLabel =
    payAsset === "sol" ? "SOL" : payAsset === "usdc" ? USDC_SYMBOL : `$${SHIT_SYMBOL}`;
  const getLabel = getAsset === "usdc" ? USDC_SYMBOL : `$${SHIT_SYMBOL}`;

  const payDec =
    payAsset === "sol" ? 9 : payAsset === "usdc" ? USDC_DECIMALS : SHIT_DECIMALS;
  const getDec = getAsset === "usdc" ? USDC_DECIMALS : SHIT_DECIMALS;

  const payBalance =
    payAsset === "sol"
      ? balances?.sol
      : payAsset === "usdc"
        ? balances?.usdc
        : balances?.shit;

  const getBalance =
    getAsset === "usdc" ? balances?.usdc : balances?.shit;

  const rawAmount = useMemo(() => {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) return BigInt(0);
    const scaled = Math.floor(n * 10 ** payDec + 1e-9);
    if (!Number.isFinite(scaled) || scaled <= 0) return BigInt(0);
    return BigInt(scaled);
  }, [amount, payDec]);

  const loadBalances = useCallback(async () => {
    if (!walletAddress) {
      setBalances(null);
      return;
    }
    setBalLoading(true);
    try {
      const r = await fetch(
        `/api/wallet/balances?address=${encodeURIComponent(walletAddress)}`,
        { cache: "no-store" }
      );
      const d = await r.json();
      if (r.ok) {
        setBalances({
          sol: Number(d.sol || 0),
          usdc: Number(d.usdc || 0),
          shit: Number(d.shit || 0),
        });
      }
    } catch {
      /* ignore */
    } finally {
      setBalLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    void loadBalances();
    if (!walletAddress) return;
    const t = window.setInterval(() => void loadBalances(), 20_000);
    return () => window.clearInterval(t);
  }, [loadBalances, walletAddress]);

  // Reset sensible default amount when mode/side changes
  useEffect(() => {
    if (mode === "buy") setAmount("0.1");
    else if (sellAsset === "usdc") setAmount("10");
    else setAmount("100000");
    setQuoteOut(null);
    setQuoteErr(null);
    setSig(null);
    setMsg(null);
    setErr(null);
  }, [mode, sellAsset]);

  const refreshQuote = useCallback(async () => {
    if (rawAmount <= BigInt(0)) {
      setQuoteOut(null);
      setQuoteIn(null);
      setQuoteErr(null);
      return;
    }
    setQuoteLoading(true);
    setQuoteErr(null);
    try {
      let data: {
        quote?: { outAmount?: string; inAmount?: string };
        error?: string;
      } = {};
      let res: Response;

      if (mode === "buy") {
        res = await fetch(
          `/api/buy?amountLamports=${rawAmount.toString()}&slippageBps=${slippageBps}&fee=0`
        );
        data = await res.json();
      } else {
        const inputMint = payAsset === "usdc" ? USDC_MINT : SHIT_MINT;
        const outputMint = getAsset === "usdc" ? USDC_MINT : SHIT_MINT;
        res = await fetch(
          `/api/swap?inputMint=${inputMint}&outputMint=${outputMint}&amount=${rawAmount.toString()}&slippageBps=${slippageBps}`
        );
        data = await res.json();
      }

      if (!res.ok || !data.quote?.outAmount) {
        setQuoteOut(null);
        setQuoteIn(null);
        setQuoteErr(
          typeof data.error === "string" ? data.error : "No route for this size"
        );
        return;
      }
      setQuoteOut(Number(data.quote.outAmount) / 10 ** getDec);
      setQuoteIn(
        data.quote.inAmount
          ? Number(data.quote.inAmount) / 10 ** payDec
          : Number(amount)
      );
    } catch (e) {
      setQuoteOut(null);
      setQuoteErr(e instanceof Error ? e.message : "Quote failed");
    } finally {
      setQuoteLoading(false);
    }
  }, [
    rawAmount,
    mode,
    payAsset,
    getAsset,
    getDec,
    payDec,
    amount,
    slippageBps,
  ]);

  useEffect(() => {
    const t = setTimeout(() => void refreshQuote(), 320);
    return () => clearTimeout(t);
  }, [refreshQuote]);

  const setPct = (pct: number) => {
    const bal = payBalance;
    if (bal == null || !Number.isFinite(bal) || bal <= 0) return;
    let use = bal * pct;
    // leave gas dust when paying SOL
    if (payAsset === "sol") {
      use = Math.max(0, bal - 0.005) * pct;
      if (pct === 1) use = Math.max(0, bal - 0.005);
    }
    if (use <= 0) return;
    const decimals = payAsset === "sol" ? 4 : payAsset === "usdc" ? 2 : 0;
    setAmount(use.toFixed(decimals).replace(/\.?0+$/, "") || "0");
  };

  const flipSwap = () => {
    /* sell/swap disabled */
  };

  async function onFund() {
    setErr(null);
    setMsg(null);
    if (!authenticated) {
      login();
      return;
    }
    if (!walletAddress) {
      setErr("No Solana wallet yet — log in again.");
      return;
    }
    setBusy("fund");
    try {
      await fundWallet({
        address: walletAddress,
        options: {
          chain: "solana:mainnet",
          amount: mode === "buy" ? amount || "0.1" : "0.05",
          asset: "native-currency",
          defaultFundingMethod: "card",
          card: { preferredProvider: "moonpay" },
          uiConfig: {
            receiveFundsTitle: "Add SOL",
            receiveFundsSubtitle: `For fees + $${SHIT_SYMBOL}`,
          },
        },
      });
      setMsg("Funding closed — balances refresh when SOL lands.");
      window.setTimeout(() => void loadBalances(), 2500);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  async function onSwap() {
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
    if (rawAmount <= BigInt(0)) {
      setErr("Enter an amount greater than 0");
      return;
    }

    setBusy("swap");
    try {
      let quote: unknown = null;
      if (mode === "buy") {
        const qRes = await fetch(
          `/api/buy?amountLamports=${rawAmount.toString()}&slippageBps=${slippageBps}&fee=0`
        );
        const qData = await qRes.json();
        if (!qRes.ok || !qData.quote) {
          throw new Error(
            typeof qData.error === "string" ? qData.error : "Quote failed"
          );
        }
        quote = qData.quote;
        const sRes = await fetch("/api/buy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quoteResponse: quote,
            userPublicKey: walletAddress,
            fee: false,
          }),
        });
        const sData = await sRes.json();
        if (!sRes.ok || !sData.swapTransaction) {
          throw new Error(
            typeof sData.error === "string"
              ? sData.error
              : "Swap build failed"
          );
        }
        await sendTx(sData.swapTransaction as string);
      } else {
        const inputMint = payAsset === "usdc" ? USDC_MINT : SHIT_MINT;
        const outputMint = getAsset === "usdc" ? USDC_MINT : SHIT_MINT;
        const qRes = await fetch(
          `/api/swap?inputMint=${inputMint}&outputMint=${outputMint}&amount=${rawAmount.toString()}&slippageBps=${slippageBps}`
        );
        const qData = await qRes.json();
        if (!qRes.ok || !qData.quote) {
          throw new Error(
            typeof qData.error === "string" ? qData.error : "Quote failed"
          );
        }
        quote = qData.quote;
        const sRes = await fetch("/api/swap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quoteResponse: quote,
            userPublicKey: walletAddress,
          }),
        });
        const sData = await sRes.json();
        if (!sRes.ok || !sData.swapTransaction) {
          throw new Error(
            typeof sData.error === "string"
              ? sData.error
              : "Swap build failed"
          );
        }
        await sendTx(sData.swapTransaction as string);
      }

      setMsg(`${payLabel} → ${getLabel} submitted. Scroll down to Withdraw if you want it in Phantom.`);
      void refreshQuote();
      window.setTimeout(() => void loadBalances(), 2000);
    } catch (e) {
      setErr(friendlySolanaSendError(e));
    } finally {
      setBusy(null);
    }
  }

  async function sendTx(raw: string) {
    if (!walletObj) throw new Error("No wallet");
    const txBytes = b64ToBytes(raw);

    const trySignAndSend = (sponsor: boolean) =>
      signAndSendTransaction({
        transaction: txBytes,
        wallet: walletObj,
        chain: "solana:mainnet",
        options: {
          sponsor,
          uiOptions: {
            showWalletUIs: true,
            // hide scary empty fee when sponsored
            description: sponsor
              ? "Network fees sponsored by TOKEN$HIT"
              : undefined,
          },
        },
      });

    try {
      // Prefer sponsored gas so users can swap $TOKENSHIT with 0 SOL
      let result;
      try {
        result = await trySignAndSend(true);
      } catch (sponsorErr) {
        // Dashboard gas sponsorship not on / unsupported → retry user-pays
        if ((balances?.sol ?? 0) < 0.005) {
          throw new Error(
            "Fee sponsorship unavailable and this wallet has almost no SOL. Tap Add SOL (~0.01) or try again later."
          );
        }
        result = await trySignAndSend(false);
      }
      let signature: string | null = null;
      const sigBytes = result?.signature;
      if (sigBytes instanceof Uint8Array) {
        signature = encodeSigBs58(sigBytes);
      } else if (typeof result?.signature === "string") {
        signature = result.signature;
      }
      setSig(signature);
      return signature;
    } catch (e) {
      // Privy "prepare" often dies on Token-2022 Jupiter routes (-32602).
      // Fallback: sign only, broadcast via our RPC (user pays fee if any SOL).
      if (!isPrepareFailure(e)) throw e;
      if ((balances?.sol ?? 0) < 0.003) {
        throw new Error(
          "Could not sponsor this route and wallet has no SOL for fees. Tap Add SOL, then retry."
        );
      }
      const signed = await signTransaction({
        transaction: txBytes,
        wallet: walletObj,
        chain: "solana:mainnet",
        options: { uiOptions: { showWalletUIs: true } },
      });
      const signedBytes = signed?.signedTransaction;
      if (!(signedBytes instanceof Uint8Array)) {
        throw e;
      }
      const signature = await sendRawBase64(signedBytes, {
        skipPreflight: true,
      });
      setSig(signature);
      return signature;
    }
  }

  if (!ready) {
    return (
      <section className="rounded-2xl border border-border bg-card p-6 animate-pulse h-72" />
    );
  }

  const rate =
    quoteOut != null && Number(amount) > 0
      ? quoteOut / Number(amount)
      : null;

  const jupUrl =
    mode === "buy"
      ? jupiterBuyUrlWithFee()
      : `https://jup.ag/swap/${payAsset === "usdc" ? USDC_MINT : SHIT_MINT}-${
          getAsset === "usdc" ? USDC_MINT : SHIT_MINT
        }`;

  const primaryLabel = !authenticated
    ? "Login to buy"
    : busy === "swap"
      ? "Confirm in wallet…"
      : `Buy $${SHIT_SYMBOL}`;

  return (
    <section className="rounded-2xl border border-border bg-card overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.35)]">
      <SolanaFundingBootstrap />

      {/* Buy only — swap/sell tab hidden */}
      <div className="border-b border-border px-4 py-3">
        <p className="text-sm font-bold text-neon font-orbitron uppercase tracking-wide">
          Buy ${SHIT_SYMBOL}
        </p>
        <p className="text-[11px] text-zinc-500 mt-0.5">
          Card or SOL → $TOKENSHIT. Selling is off.
        </p>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        <p className="text-[11px] font-mono text-neon/90 border border-neon/25 bg-neon/5 rounded-lg px-3 py-2">
          Buy with SOL · fees sponsored when available · selling is off
        </p>
        {/* Balances strip */}
        <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
          {(
            [
              ["SOL", balances?.sol],
              [USDC_SYMBOL, balances?.usdc],
              [`$${SHIT_SYMBOL}`, balances?.shit],
            ] as const
          ).map(([lab, val]) => (
            <div
              key={lab}
              className="rounded-lg border border-border/80 bg-zinc-950/70 px-2 py-2 text-center"
            >
              <div className="text-zinc-500 uppercase tracking-wide">{lab}</div>
              <div className="text-zinc-100 font-semibold mt-0.5 truncate">
                {balLoading && val == null ? (
                  <BalanceSkeleton className="h-3 w-10 mx-auto" />
                ) : (
                  fmt(val, lab === "SOL" ? 4 : lab === USDC_SYMBOL ? 2 : 0)
                )}
              </div>
            </div>
          ))}
        </div>

        {/* You pay */}
        <div className="rounded-xl border border-zinc-700/80 bg-zinc-950/90 p-3 sm:p-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-mono">
              You pay
            </span>
            <button
              type="button"
              disabled={payBalance == null}
              onClick={() => setPct(1)}
              className="text-[11px] font-mono text-zinc-400 hover:text-neon disabled:opacity-40"
            >
              Bal {fmt(payBalance, payAsset === "sol" ? 4 : 2)} {payLabel}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9.]/g, "");
                setAmount(v);
              }}
              className="flex-1 min-w-0 bg-transparent text-2xl sm:text-3xl font-mono font-semibold text-white outline-none placeholder:text-zinc-700"
              placeholder="0"
              aria-label={`Amount ${payLabel}`}
            />
            <div className="shrink-0 rounded-full border border-zinc-600 bg-zinc-900 px-3 py-1.5 text-sm font-bold text-white">
              {payLabel}
            </div>
          </div>

          {/* Percent + presets */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[0.25, 0.5, 0.75, 1].map((p) => (
              <Chip
                key={p}
                onClick={() => setPct(p)}
                disabled={!authenticated || payBalance == null || payBalance <= 0}
              >
                {p === 1 ? "MAX" : `${p * 100}%`}
              </Chip>
            ))}
            {mode === "buy"
              ? ["0.05", "0.1", "0.25", "0.5", "1"].map((v) => (
                  <Chip key={v} active={amount === v} onClick={() => setAmount(v)}>
                    {v} SOL
                  </Chip>
                ))
              : sellAsset === "usdc"
                ? ["5", "10", "25", "50", "100"].map((v) => (
                    <Chip key={v} active={amount === v} onClick={() => setAmount(v)}>
                      ${v}
                    </Chip>
                  ))
                : ["10k", "50k", "100k", "250k", "1M"].map((lab, i) => {
                    const vals = ["10000", "50000", "100000", "250000", "1000000"];
                    return (
                      <Chip
                        key={lab}
                        active={amount === vals[i]}
                        onClick={() => setAmount(vals[i])}
                      >
                        {lab}
                      </Chip>
                    );
                  })}
          </div>
        </div>

        {/* Direction fixed: SOL → $TOKENSHIT */}
        <div className="flex justify-center -my-1 relative z-10">
          <div
            className="h-10 w-10 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-500 font-mono text-lg flex items-center justify-center"
            aria-hidden
          >
            ↓
          </div>
        </div>

        {/* You get */}
        <div className="rounded-xl border border-neon/30 bg-neon/5 p-3 sm:p-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-mono">
              You get
            </span>
            <span className="text-[11px] font-mono text-zinc-500">
              Bal {fmt(getBalance, getAsset === "shit" ? 0 : 2)} {getLabel}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0 text-2xl sm:text-3xl font-mono font-semibold text-neon truncate">
              {quoteLoading ? (
                <BalanceSkeleton className="h-8 w-32" />
              ) : (
                fmt(quoteOut, getAsset === "shit" ? 0 : 4)
              )}
            </div>
            <div className="shrink-0 rounded-full border border-neon/40 bg-zinc-950 px-3 py-1.5 text-sm font-bold text-neon">
              {getLabel}
            </div>
          </div>
          {quoteErr && (
            <p className="text-[11px] text-amber-400/90">{quoteErr}</p>
          )}
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-zinc-500">
          <span>
            Rate{" "}
            {rate != null && Number.isFinite(rate) ? (
              <span className="text-zinc-300">
                1 {payLabel} ≈ {fmt(rate, getAsset === "shit" ? 0 : 4)} {getLabel}
              </span>
            ) : (
              "—"
            )}
          </span>
          <div className="flex items-center gap-1">
            <span className="mr-1">Slip</span>
            {[
              [50, "0.5%"],
              [150, "1.5%"],
              [300, "3%"],
            ].map(([bps, lab]) => (
              <Chip
                key={String(bps)}
                active={slippageBps === bps}
                onClick={() => setSlippageBps(Number(bps))}
              >
                {lab}
              </Chip>
            ))}
          </div>
        </div>

        {/* Pre-sign summary (security review #6) */}
        <div className="rounded-xl border border-border/80 bg-zinc-950/70 px-3 py-2.5 space-y-1.5 text-[11px] font-mono">
          <div className="flex justify-between gap-2">
            <span className="text-zinc-500">You receive (est.)</span>
            <span className="text-neon font-semibold tabular-nums">
              {quoteLoading ? (
                "…"
              ) : quoteOut != null ? (
                <>
                  {fmt(quoteOut, getAsset === "shit" ? 0 : 4)} {getLabel}
                </>
              ) : (
                "—"
              )}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-zinc-500">Min received</span>
            <span className="text-zinc-300 tabular-nums">
              {quoteOut != null && Number.isFinite(quoteOut)
                ? `${fmt(
                    quoteOut * (1 - slippageBps / 10_000),
                    getAsset === "shit" ? 0 : 4
                  )} ${getLabel}`
                : "—"}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-zinc-500">Route</span>
            <span className="text-zinc-300">
              Jupiter · {payLabel} → {getLabel}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-zinc-500">Recipient</span>
            <span className="text-zinc-300 truncate max-w-[58%]">
              {walletAddress
                ? `${walletAddress.slice(0, 4)}…${walletAddress.slice(-4)} (your wallet)`
                : "Login required"}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-zinc-500">Network fee</span>
            <span className="text-zinc-300">
              Sponsored when available · else ~0.00001 SOL
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-zinc-500">Platform fee</span>
            <span className="text-zinc-300">Off on this desk</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-zinc-500">Token-2022</span>
            <span className="text-zinc-300">
              ${SHIT_SYMBOL} · transfer-checked
            </span>
          </div>
        </div>

        {err && (
          <p
            className="text-sm text-red-400 break-words bg-red-950/35 border border-red-900/50 rounded-lg px-3 py-2"
            role="alert"
          >
            {err}
          </p>
        )}
        {msg && (
          <p className="text-sm text-neon break-words bg-neon/10 border border-neon/30 rounded-lg px-3 py-2">
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
                  view tx
                </a>
              </>
            )}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void onFund()}
            className="min-h-12 sm:col-span-1 rounded-xl border border-zinc-600 hover:border-zinc-400 text-white text-sm font-semibold transition disabled:opacity-50 active:scale-[0.99]"
          >
            {busy === "fund"
              ? "Opening…"
              : authenticated
                ? "Add SOL"
                : "Login · fund"}
          </button>
          <button
            type="button"
            disabled={busy !== null || rawAmount <= BigInt(0)}
            onClick={() => void onSwap()}
            className="min-h-12 sm:col-span-2 rounded-xl bg-neon text-black text-sm font-bold hover:brightness-110 transition disabled:opacity-50 active:scale-[0.99]"
          >
            {primaryLabel}
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-600">
          <span>
            Via Jupiter · network fees sponsored when available
          </span>
          <a
            href={jupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-neon-blue"
          >
            Open in Jupiter
          </a>
        </div>

        {walletAddress && (
          <p className="text-[10px] font-mono text-zinc-600 truncate">
            Wallet {walletAddress.slice(0, 4)}…{walletAddress.slice(-4)}
          </p>
        )}
      </div>
    </section>
  );
}
