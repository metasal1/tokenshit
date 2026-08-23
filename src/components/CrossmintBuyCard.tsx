"use client";

import { useMemo, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";
import {
  CrossmintProvider,
  CrossmintEmbeddedCheckout,
} from "@crossmint/client-sdk-react-ui";
import { pickSolanaAddress } from "@/lib/privy-identity";
import { useSafeLogin } from "@/hooks/useSafeLogin";
import { SHIT_MINT, SHIT_SYMBOL } from "@/lib/shit-token";
import { EmojiIcon } from "@/components/EmojiIcon";

/** Crossmint staging test memecoin — production mint only works with prod keys + KYB */
const STAGING_XMEME = "7EivYFyNfgGj8xbUymR7J4LuxUHLKRzpLaERHLvi7Dgu";

const USD_PRESETS = ["5", "10", "25", "50", "100"] as const;

function clientApiKey(): string {
  return (process.env.NEXT_PUBLIC_CROSSMINT_CLIENT_API_KEY || "").trim();
}

function isStagingKey(key: string): boolean {
  return /staging/i.test(key) || key.startsWith("ck_staging");
}

/**
 * Card buy $TOKENSHIT via Crossmint embedded memecoin checkout.
 * Staging keys use XMEME test mint; production keys use real SHIT mint.
 */
export default function CrossmintBuyCard() {
  const { authenticated, user } = usePrivy();
  const { safeLogin } = useSafeLogin();
  const { wallets } = useWallets();
  const [usd, setUsd] = useState<string>("10");
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");

  const apiKey = clientApiKey();
  const staging = isStagingKey(apiKey);
  const mint = staging
    ? process.env.NEXT_PUBLIC_CROSSMINT_TOKEN_MINT || STAGING_XMEME
    : process.env.NEXT_PUBLIC_CROSSMINT_TOKEN_MINT || SHIT_MINT;

  const walletAddress = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return pickSolanaAddress(wallets as any[], user) || "";
  }, [user, wallets]);

  const email =
    (user?.email?.address as string | undefined) ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((user as any)?.google?.email as string | undefined) ||
    undefined;

  const amount = custom.trim() || usd;
  const amountOk = Number(amount) >= 1 && Number(amount) <= 500;

  if (!apiKey) {
    return (
      <section className="rounded-xl border border-border bg-card p-4 space-y-2">
        <h2 className="text-sm font-bold font-orbitron uppercase tracking-wide text-zinc-200">
          Buy with card
        </h2>
        <p className="text-xs text-zinc-500">
          Crossmint is not configured (missing{" "}
          <code className="text-zinc-400">NEXT_PUBLIC_CROSSMINT_CLIENT_API_KEY</code>
          ).
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-neon/30 bg-card p-4 sm:p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold font-orbitron uppercase tracking-wide text-neon">
            Buy with card
          </h2>
          <p className="text-xs text-zinc-500 mt-1 leading-snug">
            Crossmint · Apple Pay / Google Pay / debit · lands in your Solana
            wallet as ${SHIT_SYMBOL}
            {staging ? " (staging sandbox)" : ""}.
          </p>
        </div>
        <EmojiIcon size={22}>💳</EmojiIcon>
      </div>

      {!authenticated ? (
        <button
          type="button"
          onClick={() => safeLogin()}
          className="w-full min-h-11 rounded-lg bg-neon text-black font-semibold text-sm"
        >
          Login to buy with card
        </button>
      ) : !walletAddress ? (
        <p className="text-xs text-amber-300">
          Creating your Solana wallet… refresh if this sticks.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {USD_PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setUsd(p);
                  setCustom("");
                }}
                className={`min-h-9 px-3 rounded-lg border text-sm font-mono ${
                  !custom && usd === p
                    ? "border-neon bg-neon/15 text-neon"
                    : "border-border text-zinc-400 hover:border-neon/40"
                }`}
              >
                ${p}
              </button>
            ))}
            <label className="flex items-center gap-1.5 min-h-9 px-2 rounded-lg border border-border">
              <span className="text-zinc-500 text-sm">$</span>
              <input
                type="number"
                min={1}
                max={500}
                step="1"
                placeholder="Custom"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                className="w-16 bg-transparent text-sm text-white outline-none"
              />
            </label>
          </div>

          <p className="text-[11px] font-mono text-zinc-600 break-all">
            → {walletAddress.slice(0, 4)}…{walletAddress.slice(-4)}
            {staging ? ` · test mint ${mint.slice(0, 4)}…` : ""}
          </p>

          {!open ? (
            <button
              type="button"
              disabled={!amountOk}
              onClick={() => setOpen(true)}
              className="w-full min-h-11 rounded-lg bg-neon text-black font-semibold text-sm disabled:opacity-50"
            >
              Checkout ${amount} → ${SHIT_SYMBOL}
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-400">
                  Paying ${amount} USD
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-xs text-zinc-500 hover:text-white underline"
                >
                  Change amount
                </button>
              </div>
              <div className="rounded-xl overflow-hidden border border-border bg-white min-h-[420px]">
                <CrossmintProvider apiKey={apiKey}>
                  <CrossmintEmbeddedCheckout
                    key={`${walletAddress}-${amount}-${mint}`}
                    recipient={{ walletAddress }}
                    lineItems={{
                      tokenLocator: `solana:${mint}`,
                      executionParameters: {
                        mode: "exact-in",
                        amount: String(amount),
                        maxSlippageBps: "500",
                      },
                    }}
                    payment={{
                      ...(email ? { receiptEmail: email } : {}),
                      crypto: { enabled: false },
                      fiat: { enabled: true },
                      defaultMethod: "fiat",
                    }}
                  />
                </CrossmintProvider>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
