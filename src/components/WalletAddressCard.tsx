"use client";

import { useMemo } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";
import CopyableAddress from "@/components/CopyableAddress";

/** Logged-in Solana wallet with copy */
export default function WalletAddressCard() {
  const { ready, authenticated, user, login } = usePrivy();
  const { wallets } = useWallets();

  const address = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const list = (wallets || []) as any[];
    const preferred =
      list.find((w) => w?.standardWallet?.name || w?.walletClientType) ||
      list[0];
    return (preferred?.address || user?.wallet?.address || null) as
      | string
      | null;
  }, [wallets, user]);

  if (!ready) return null;

  if (!authenticated || !address) {
    return (
      <div className="rounded-xl border border-border bg-card p-3.5 sm:p-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Your wallet</p>
          <p className="text-xs text-zinc-500 mt-0.5">
            Log in to see & copy your Solana address
          </p>
        </div>
        <button
          type="button"
          onClick={() => login()}
          className="shrink-0 rounded-lg bg-neon text-black text-xs font-bold px-3 py-2"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-3.5 sm:p-4 space-y-2">
      <p className="text-sm font-semibold text-foreground inline-flex items-center gap-1.5">
        <span className="emoji" aria-hidden>
          👛
        </span>
        Your wallet
      </p>
      <CopyableAddress address={address} label="Solana address" />
      <p className="text-[11px] text-zinc-500 leading-snug">
        In-app wallet. To move funds out →{" "}
        <a href="/swap#withdraw" className="text-neon-blue hover:underline">
          Withdraw
        </a>
        .
      </p>
    </div>
  );
}
