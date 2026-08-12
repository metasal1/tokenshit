"use client";

import { useCallback, useState } from "react";

function short(addr: string, n = 4) {
  if (!addr || addr.length < n * 2 + 1) return addr;
  return `${addr.slice(0, n)}…${addr.slice(-n)}`;
}

/** One-tap copy for mint / wallet / treasury addresses */
export default function CopyableAddress({
  address,
  label,
  explorer,
  monoClassName = "",
}: {
  address: string;
  label?: string;
  /** full explorer URL; defaults to solscan account */
  explorer?: string;
  monoClassName?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }, [address]);

  const href =
    explorer ||
    (address.length >= 32
      ? `https://solscan.io/account/${address}`
      : undefined);

  return (
    <div className="flex flex-col gap-1 min-w-0">
      {label && (
        <span className="text-[11px] uppercase tracking-wide text-zinc-600">
          {label}
        </span>
      )}
      <div className="flex items-stretch gap-1.5 min-w-0">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex-1 min-w-0 rounded-lg border border-border bg-zinc-950 px-2.5 py-2 font-mono text-[11px] sm:text-xs text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors break-all ${monoClassName}`}
            title={address}
          >
            <span className="sm:hidden">{short(address, 6)}</span>
            <span className="hidden sm:inline">{address}</span>
          </a>
        ) : (
          <span
            className={`flex-1 min-w-0 rounded-lg border border-border bg-zinc-950 px-2.5 py-2 font-mono text-[11px] sm:text-xs text-zinc-300 break-all ${monoClassName}`}
          >
            {address}
          </span>
        )}
        <button
          type="button"
          onClick={() => void copy()}
          className="shrink-0 rounded-lg border border-border bg-zinc-900 px-3 text-xs font-semibold text-zinc-200 hover:border-neon hover:text-neon transition-colors"
          aria-label={copied ? "Copied" : `Copy ${label || "address"}`}
          title={copied ? "Copied" : "Copy"}
        >
          <span className="ml-1">
            {copied ? "Copied" : "Copy"}
          </span>
        </button>
      </div>
    </div>
  );
}
