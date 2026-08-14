"use client";

import { useMemo, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  useFundWallet,
  useSolanaFundingPlugin,
  useWallets,
} from "@privy-io/react-auth/solana";
import { pickSolanaAddress } from "@/lib/privy-identity";
import { useSafeLogin } from "@/hooks/useSafeLogin";
import { EmojiIcon } from "@/components/EmojiIcon";

/** Call once near root so Privy Solana onramp plugin is registered. */
export function SolanaFundingBootstrap() {
  useSolanaFundingPlugin();
  return null;
}

type Props = {
  /** Suggested SOL amount in the MoonPay flow */
  amount?: string;
  /** full = card with copy; compact = single button; inline = text-ish */
  variant?: "full" | "compact" | "inline";
  className?: string;
  label?: string;
};

/**
 * Fiat on-ramp → SOL into the user's Privy Solana wallet (MoonPay via Privy).
 */
export default function OnrampButton({
  amount = "0.15",
  variant = "compact",
  className = "",
  label,
}: Props) {
  const { ready, authenticated, user } = usePrivy();
  const { safeLogin } = useSafeLogin();
  const { fundWallet } = useFundWallet();
  const { wallets } = useWallets();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const address = useMemo(
    () => pickSolanaAddress(wallets, user),
    [wallets, user]
  );

  async function onRamp() {
    setErr(null);
    setMsg(null);
    if (!authenticated) {
      safeLogin();
      return;
    }
    if (!address) {
      setErr("No Solana wallet yet — wait a second after login, or re-login.");
      return;
    }
    setBusy(true);
    try {
      await fundWallet({
        address,
        options: {
          chain: "solana:mainnet",
          amount: amount || "0.15",
          asset: "native-currency",
          defaultFundingMethod: "card",
          card: {
            preferredProvider: "moonpay",
          },
          uiConfig: {
            receiveFundsTitle: "Buy SOL",
            receiveFundsSubtitle:
              "Card → SOL in your TOKEN$HIT wallet. Then play, claim, or swap.",
          },
        },
      });
      setMsg("Onramp closed — balances update when SOL lands.");
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e);
      // User dismiss is noisy — soften
      if (/reject|cancel|close|denied/i.test(m)) {
        setMsg("Onramp dismissed.");
      } else {
        setErr(m);
      }
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return null;

  const cta =
    label ||
    (busy
      ? "Opening…"
      : !authenticated
        ? "Login · buy SOL"
        : "Buy SOL with card");

  if (variant === "inline") {
    return (
      <button
        type="button"
        disabled={busy}
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
          disabled={busy}
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
      </div>
    );
  }

  // full card
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
            On-ramp
          </h3>
          <p className="text-[11px] text-zinc-500 leading-snug mt-0.5">
            Buy SOL with card (MoonPay) straight into your wallet — then play,
            claim fees, or swap to $TOKENSHIT.
          </p>
        </div>
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={() => void onRamp()}
        className="w-full min-h-11 rounded-xl bg-neon text-black text-sm font-bold hover:brightness-110 transition disabled:opacity-50 active:scale-[0.99] inline-flex items-center justify-center gap-2"
      >
        {busy ? "Opening MoonPay…" : authenticated ? "Buy SOL with card" : "Login · buy SOL"}
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
      {msg && !err && (
        <p className="text-xs text-zinc-400">{msg}</p>
      )}
    </section>
  );
}
