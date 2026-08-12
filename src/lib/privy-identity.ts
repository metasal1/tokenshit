import type { User } from "@privy-io/react-auth";

/** Stable voter id: prefer Twitter, then GitHub, then Solana wallet. */
export function getVoterId(user: User | null | undefined): string {
  if (!user) return "";
  const tw = user.twitter?.username?.trim();
  if (tw) return tw;
  const gh = user.github?.username?.trim();
  if (gh) return `gh:${gh}`;
  const wallet = getSolanaAddressFromUser(user);
  if (wallet) return wallet;
  return user.id || "";
}

/** Nav / UI label */
export function getDisplayHandle(user: User | null | undefined): string {
  if (!user) return "Connected";
  if (user.twitter?.username) return `@${user.twitter.username}`;
  if (user.github?.username) return `gh/${user.github.username}`;
  const wallet = getSolanaAddressFromUser(user);
  if (wallet) return `${wallet.slice(0, 4)}…${wallet.slice(-4)}`;
  return "Connected";
}

/** Referral slug (twitter preferred; github ok) */
export function getRefHandle(user: User | null | undefined): string | null {
  if (!user) return null;
  if (user.twitter?.username) return user.twitter.username.toLowerCase();
  if (user.github?.username) return `gh:${user.github.username.toLowerCase()}`;
  return null;
}

/**
 * Solana address only — ignore EVM `user.wallet` (often 0x).
 * Base58 Solana pubs are typically 32–44 chars, no 0x prefix.
 */
export function isSolanaAddress(addr: string | null | undefined): boolean {
  if (!addr) return false;
  const a = addr.trim();
  if (!a || a.startsWith("0x") || a.startsWith("0X")) return false;
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(a);
}

/** Pick Solana address from Privy useWallets() list + user linked accounts. */
export function pickSolanaAddress(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wallets: any[] | null | undefined,
  user?: User | null
): string | null {
  const list = wallets || [];
  for (const w of list) {
    const addr = w?.address as string | undefined;
    if (isSolanaAddress(addr)) return addr!;
  }
  return getSolanaAddressFromUser(user);
}

export function getSolanaAddressFromUser(
  user: User | null | undefined
): string | null {
  if (!user) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const accounts = ((user as any).linkedAccounts || []) as Array<{
    type?: string;
    address?: string;
    chainType?: string;
    chain_type?: string;
  }>;
  for (const a of accounts) {
    const t = (a.type || "").toLowerCase();
    const chain = (a.chainType || a.chain_type || "").toLowerCase();
    if (
      a.address &&
      (chain === "solana" || t.includes("solana") || isSolanaAddress(a.address))
    ) {
      if (isSolanaAddress(a.address)) return a.address;
    }
  }
  const w = user.wallet?.address;
  if (isSolanaAddress(w)) return w!;
  return null;
}
