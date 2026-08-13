"use client";

import type { VrfLink, VrfRecord } from "@/lib/day-vrf-links";
import { vrfExplorerLinks, vrfPrimaryLink } from "@/lib/day-vrf-links";

/**
 * On-chain / Proof Network VRF verification links.
 */
export default function VrfProofLinks({
  vrf,
  compact = false,
  className = "",
}: {
  vrf?: VrfRecord | null;
  compact?: boolean;
  className?: string;
}) {
  if (!vrf || vrf.error) return null;
  const primary = vrfPrimaryLink(vrf);
  const all = vrfExplorerLinks(vrf);
  if (!primary && !all.length) return null;

  if (compact && primary) {
    return (
      <a
        href={primary.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className={`inline-flex items-center gap-1 text-[11px] font-mono text-neon-blue hover:underline ${className}`}
        title={primary.detail || primary.label}
      >
        VRF on-chain
        {primary.detail ? (
          <span className="text-zinc-600">· {primary.detail}</span>
        ) : null}
      </a>
    );
  }

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="text-[10px] uppercase tracking-wide text-zinc-500">
        VRF proof
        {vrf.provider ? (
          <span className="normal-case text-zinc-600"> · {vrf.provider}</span>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {all.map((l: VrfLink) => (
          <a
            key={l.label + l.url}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-neon-blue hover:underline font-mono"
          >
            {l.label}
            {l.detail ? (
              <span className="text-zinc-600"> · {l.detail}</span>
            ) : null}
          </a>
        ))}
      </div>
      {vrf.blockhash && (
        <div className="text-[10px] font-mono text-zinc-600 break-all">
          bh {vrf.blockhash}
        </div>
      )}
      {vrf.verificationHash && (
        <div className="text-[10px] font-mono text-zinc-600 break-all">
          verify {vrf.verificationHash}
        </div>
      )}
      {vrf.entriesHash && (
        <div className="text-[10px] font-mono text-zinc-600 break-all">
          entries {vrf.entriesHash}
        </div>
      )}
    </div>
  );
}
