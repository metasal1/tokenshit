/**
 * Fair draw entropy — ported from sol.new / Seeker raffle patterns.
 * Default: Solana slot + blockhash hash. Optional Proof Network HTTP VRF.
 */
import { rpc } from "@/lib/treasury";

export type VrfProvider = "solana-blockhash" | "proofnetwork";

export async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashEntries(entries: string[]): Promise<string> {
  return sha256Hex(entries.map((e) => e.trim().toLowerCase()).sort().join("\n"));
}

export function indexFromSeed(seedHex: string, n: number): number {
  if (n <= 0) throw new Error("entry count must be > 0");
  const slice = seedHex.slice(0, 16);
  const value = BigInt("0x" + slice);
  return Number(value % BigInt(n));
}

/** Unique wallets, stable sort for ticket order */
export function normalizeTickets(wallets: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const w of wallets) {
    const t = w.trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  out.sort((a, b) => a.localeCompare(b));
  return out;
}

async function solanaEntropy(): Promise<{
  slot: number;
  blockhash: string;
  seedMaterial: string;
}> {
  const slot = await rpc<number>("getSlot", [{ commitment: "finalized" }]);
  const latest = await rpc<{ value: { blockhash: string } }>(
    "getLatestBlockhash",
    [{ commitment: "finalized" }]
  );
  const blockhash = latest?.value?.blockhash || "";
  return {
    slot,
    blockhash,
    seedMaterial: `${slot}|${blockhash}`,
  };
}

/**
 * Optional Proof Network HTTP VRF (when env set).
 * Falls back to solana-blockhash.
 */
async function proofNetworkSeed(
  requestKey: string
): Promise<{ seed: string; id: number | null } | null> {
  const base =
    process.env.PROOFNETWORK_VRF_URL ||
    process.env.PROOF_NETWORK_VRF_URL ||
    "";
  const key =
    process.env.PROOFNETWORK_API_KEY ||
    process.env.PROOF_NETWORK_API_KEY ||
    "";
  if (!base) return null;
  try {
    const res = await fetch(base, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(key ? { Authorization: `Bearer ${key}` } : {}),
      },
      body: JSON.stringify({ key: requestKey }),
    });
    if (!res.ok) return null;
    const j = await res.json();
    const seed = String(j.seed || j.randomness || j.result || j.hash || "");
    if (!seed) return null;
    return {
      seed: seed.startsWith("0x") ? seed.slice(2) : await sha256Hex(seed),
      id: j.id != null ? Number(j.id) : null,
    };
  } catch {
    return null;
  }
}

export async function pickWinnerWallet(opts: {
  tickets: string[];
  /** domain separation */
  label: string;
}): Promise<{
  winner: string;
  winnerIndex: number;
  tickets: string[];
  seed: string;
  verificationHash: string;
  provider: VrfProvider;
  slot: number | null;
  blockhash: string | null;
  proofnetworkId: number | null;
  entriesHash: string;
}> {
  const tickets = normalizeTickets(opts.tickets);
  if (!tickets.length) throw new Error("no tickets");

  const entriesHash = await hashEntries(tickets);
  const entropy = await solanaEntropy();

  let provider: VrfProvider = "solana-blockhash";
  let seedMaterial = `${opts.label}|${entriesHash}|${entropy.seedMaterial}|day-game-v1`;
  let proofnetworkId: number | null = null;

  const pn = await proofNetworkSeed(seedMaterial);
  if (pn) {
    provider = "proofnetwork";
    seedMaterial = `${seedMaterial}|pn:${pn.seed}`;
    proofnetworkId = pn.id;
  }

  const seed = await sha256Hex(seedMaterial);
  const winnerIndex = indexFromSeed(seed, tickets.length);
  const winner = tickets[winnerIndex]!;
  const verificationHash = await sha256Hex(
    `${seed}|${winnerIndex}|${winner}|${entriesHash}`
  );

  return {
    winner,
    winnerIndex,
    tickets,
    seed,
    verificationHash,
    provider,
    slot: entropy.slot,
    blockhash: entropy.blockhash,
    proofnetworkId,
    entriesHash,
  };
}
