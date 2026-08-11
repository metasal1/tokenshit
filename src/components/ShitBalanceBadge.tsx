"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";
import Link from "next/link";
import { SHIT_SYMBOL } from "@/lib/shit-token";
import { BalanceSkeleton } from "@/components/StatLoader";

function fmt(n: number) {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}K`;
  if (n >= 1)
    return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (n <= 0) return "0";
  return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

/**
 * User $TOKENSHIT balance — sits next to Referrals in nav.
 */
export default function ShitBalanceBadge({
  className = "",
}: {
  className?: string;
}) {
  const { ready, authenticated, user, login } = usePrivy();
  const { wallets } = useWallets();
  const [bal, setBal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const address = (() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const list = (wallets || []) as any[];
    return (
      list[0]?.address ||
      user?.wallet?.address ||
      null
    ) as string | null;
  })();

  useEffect(() => {
    if (!authenticated || !address) {
      setBal(null);
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    const load = () => {
      fetch(`/api/wallet/shit-balance?address=${encodeURIComponent(address)}`)
        .then((r) => r.json())
        .then((d) => {
          if (!alive) return;
          if (typeof d.balance === "number") setBal(d.balance);
          else setBal(0);
        })
        .catch(() => {
          if (alive) setBal(null);
        })
        .finally(() => {
          if (alive) setLoading(false);
        });
    };
    load();
    const t = setInterval(load, 45_000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      alive = false;
      clearInterval(t);
      window.removeEventListener("focus", onFocus);
    };
  }, [authenticated, address]);

  if (!ready) return null;

  if (!authenticated) {
    return (
      <button
        type="button"
        onClick={() => login()}
        className={`inline-flex items-center gap-1 text-xs px-2 py-1.5 min-h-9 rounded-md border border-zinc-800 text-zinc-500 hover:border-neon hover:text-neon transition-colors font-mono ${className}`}
        title="Login to see $TOKENSHIT balance"
      >
        <span className="text-neon/70">$</span>
        <span>—</span>
      </button>
    );
  }

  return (
    <Link
      href="/claim"
      className={`inline-flex items-center gap-1 text-xs px-2 py-1.5 min-h-9 rounded-md border border-neon/30 bg-neon/5 text-zinc-200 hover:border-neon hover:text-white transition-colors font-mono ${className}`}
      title={`Your $${SHIT_SYMBOL} balance`}
    >
      <span className="text-neon font-semibold">$</span>
      {loading && bal == null ? (
        <BalanceSkeleton className="h-3.5 w-10" />
      ) : (
        <span className="text-neon font-bold tabular-nums">
          {fmt(bal ?? 0)}
        </span>
      )}
    </Link>
  );
}
