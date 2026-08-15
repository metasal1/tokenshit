/**
 * Reverse-resolve SNS (.sol) + ANS/AllDomains (.bonk/.sns/.skr/…) for whale wallets.
 * Used on /whales — display name + link sol.new/portfolio/{domain|address}.
 */

export type NameKind = "sns" | "ans";

export type ReverseName = {
  domain: string; // full e.g. metasal.sol
  kind: NameKind;
  bare?: string;
};

const SNS_USER_DOMAINS = "https://sns-api.bonfida.com/v2/user/domains";
const ANS_REVERSE = "https://api.metasal.xyz/api/reverse";

/** Prefer short clean handles (metasal > check-my-portafolio-lordmerch). */
function pickBestBare(names: string[]): string | null {
  const clean = names
    .map((n) => String(n || "").trim().toLowerCase())
    .filter((n) => n && !n.includes("."));
  if (!clean.length) return null;
  clean.sort((a, b) => {
    if (a.length !== b.length) return a.length - b.length;
    return a.localeCompare(b);
  });
  return clean[0];
}

async function reverseSns(wallet: string, signal?: AbortSignal): Promise<ReverseName | null> {
  try {
    const res = await fetch(`${SNS_USER_DOMAINS}/${wallet}`, {
      signal,
      headers: { Accept: "application/json", "User-Agent": "TokenShit-Whales/1.0" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, string[]>;
    const list = data[wallet] || data[Object.keys(data)[0]] || [];
    const bare = pickBestBare(Array.isArray(list) ? list : []);
    if (!bare) return null;
    return { domain: `${bare}.sol`, kind: "sns", bare };
  } catch {
    return null;
  }
}

async function reverseAns(wallet: string, signal?: AbortSignal): Promise<ReverseName | null> {
  try {
    const res = await fetch(`${ANS_REVERSE}/${wallet}`, {
      signal,
      headers: { Accept: "application/json", "User-Agent": "TokenShit-Whales/1.0" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      success?: boolean;
      mainDomain?: string | null;
      domains?: { fullName?: string; name?: string; tld?: string }[];
    };
    if (!data.success) return null;
    if (data.mainDomain) {
      return { domain: data.mainDomain.toLowerCase(), kind: "ans" };
    }
    const domains = data.domains || [];
    // Prefer .sol / .sns / .bonk / .skr
    const prefer = ["sol", "sns", "skr", "bonk"];
    for (const tld of prefer) {
      const hit = domains.find((d) => (d.tld || "").toLowerCase() === tld);
      if (hit?.fullName) {
        return { domain: hit.fullName.toLowerCase(), kind: tld === "sol" ? "sns" : "ans" };
      }
    }
    if (domains[0]?.fullName) {
      return { domain: domains[0].fullName.toLowerCase(), kind: "ans" };
    }
    return null;
  } catch {
    return null;
  }
}

/** Single wallet reverse — SNS first, then ANS. */
export async function reverseWalletName(
  wallet: string,
  opts?: { timeoutMs?: number }
): Promise<ReverseName | null> {
  const timeoutMs = opts?.timeoutMs ?? 4500;
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);
  try {
    // Race SNS (usually faster/reliable) then ANS if empty
    const sns = await reverseSns(wallet, ac.signal);
    if (sns) return sns;
    return await reverseAns(wallet, ac.signal);
  } finally {
    clearTimeout(t);
  }
}

/**
 * Batch reverse with concurrency. Returns map owner → ReverseName.
 * Skip pools/treasury by passing only person wallets.
 */
export async function reverseWalletNames(
  wallets: string[],
  opts?: { concurrency?: number; timeoutMs?: number }
): Promise<Map<string, ReverseName>> {
  const concurrency = opts?.concurrency ?? 8;
  const out = new Map<string, ReverseName>();
  const uniq = [...new Set(wallets.filter(Boolean))];
  let i = 0;

  async function worker() {
    while (i < uniq.length) {
      const idx = i++;
      const w = uniq[idx];
      const r = await reverseWalletName(w, { timeoutMs: opts?.timeoutMs });
      if (r) out.set(w, r);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, uniq.length) }, () => worker())
  );
  return out;
}
