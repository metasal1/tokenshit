/**
 * Pure VRF explorer helpers (safe for client components).
 */

export type VrfRecord = {
  provider?: string;
  seed?: string;
  verificationHash?: string;
  winnerIndex?: number;
  entriesHash?: string;
  slot?: number | null;
  blockhash?: string | null;
  proofnetworkId?: number | null;
  ticketCount?: number;
  error?: string;
};

export type VrfLink = {
  label: string;
  url: string;
  detail?: string;
};

export const PROOFNETWORK = {
  site: "https://proofnetwork.lol",
  vrfExplorer: "https://proofnetwork.lol/vrfs",
  historyApi: "https://proofnetwork.lol/api/vrf/history",
} as const;

/** Public explorer links for a stored VRF draw record. */
export function vrfExplorerLinks(vrf: VrfRecord | null | undefined): VrfLink[] {
  if (!vrf || vrf.error) return [];
  const links: VrfLink[] = [];
  if (vrf.slot != null && Number.isFinite(Number(vrf.slot))) {
    const slot = Number(vrf.slot);
    links.push({
      label: "Solana block",
      url: `https://solscan.io/block/${slot}`,
      detail: `slot ${slot}`,
    });
    links.push({
      label: "Explorer",
      url: `https://explorer.solana.com/block/${slot}`,
      detail: `slot ${slot}`,
    });
  }
  if (vrf.provider === "proofnetwork" || vrf.proofnetworkId != null) {
    const id = vrf.proofnetworkId;
    links.push({
      label: "Proof Network VRF",
      url:
        id != null
          ? `${PROOFNETWORK.vrfExplorer}/${id}`
          : PROOFNETWORK.vrfExplorer,
      detail: id != null ? `#${id}` : "vrfs",
    });
  }
  return links;
}

/** Primary on-chain link (prefer Solana slot, else Proof Network). */
export function vrfPrimaryLink(
  vrf: VrfRecord | null | undefined
): VrfLink | null {
  const all = vrfExplorerLinks(vrf);
  return (
    all.find((l) => l.label === "Solana block") ||
    all.find((l) => l.label === "Proof Network VRF") ||
    all[0] ||
    null
  );
}
