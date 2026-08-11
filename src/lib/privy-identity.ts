import type { User } from "@privy-io/react-auth";

/** Stable voter id: prefer Twitter, then GitHub, then wallet. */
export function getVoterId(user: User | null | undefined): string {
  if (!user) return "";
  const tw = user.twitter?.username?.trim();
  if (tw) return tw;
  const gh = user.github?.username?.trim();
  if (gh) return `gh:${gh}`;
  const wallet = user.wallet?.address?.trim();
  if (wallet) return wallet;
  return user.id || "";
}

/** Nav / UI label */
export function getDisplayHandle(user: User | null | undefined): string {
  if (!user) return "Connected";
  if (user.twitter?.username) return `@${user.twitter.username}`;
  if (user.github?.username) return `gh/${user.github.username}`;
  if (user.wallet?.address)
    return `${user.wallet.address.slice(0, 4)}…${user.wallet.address.slice(-4)}`;
  return "Connected";
}

/** Referral slug (twitter preferred; github ok) */
export function getRefHandle(user: User | null | undefined): string | null {
  if (!user) return null;
  if (user.twitter?.username) return user.twitter.username.toLowerCase();
  if (user.github?.username) return `gh:${user.github.username.toLowerCase()}`;
  return null;
}
