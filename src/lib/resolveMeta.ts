import { apiFetch } from "@/lib/api";

const HELIUS_RPC =
  process.env.HELIUS_RPC_URL ||
  "https://viviyan-bkj12u-fast-mainnet.helius-rpc.com";

export interface AssetMeta {
  name: string;
  symbol: string;
  logo: string;
  /** Extra logo URLs to try (OG embed) */
  logoCandidates?: string[];
}

const MINT_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

/** Pull mint out of composite ids like solana-<mint> or bare mint */
export function extractMint(assetId: string): string | null {
  if (!assetId) return null;
  if (MINT_RE.test(assetId)) return assetId;
  // solana-CCSEV…pump (pump.fun mints often end in "pump")
  if (/^solana-/i.test(assetId)) {
    const rest = assetId.replace(/^solana-/i, "");
    if (MINT_RE.test(rest)) return rest;
  }
  return null;
}

async function heliusMeta(mint: string): Promise<AssetMeta | null> {
  try {
    const res = await fetch(HELIUS_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "meta",
        method: "getAsset",
        params: { id: mint },
      }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const r = json?.result;
    if (!r) return null;
    const content = r.content || {};
    const md = content.metadata || {};
    const name = (md.name || md.symbol || "").trim();
    const symbol = (md.symbol || "").trim();
    const logo =
      content.links?.image ||
      content.files?.[0]?.uri ||
      content.files?.[0]?.cdn_uri ||
      "";
    const dex = `https://dd.dexscreener.com/ds-data/tokens/solana/${mint}.png`;
    if (!name && !symbol) return null;
    const candidates = [dex, typeof logo === "string" ? logo : ""].filter(
      Boolean
    ) as string[];
    return {
      name: name || symbol || mint.slice(0, 8),
      symbol: symbol || name.slice(0, 8) || "",
      // DexScreener first — j7tracker often blocked from serverless
      logo: dex,
      logoCandidates: candidates,
    };
  } catch {
    return null;
  }
}

/**
 * Resolve display name/symbol/logo for a voted assetId.
 * Tokens.xyz first; Helius DAS fallback for pump/unregistered mints.
 */
export async function resolveAssetMeta(assetId: string): Promise<AssetMeta> {
  // Official $SHIT mint — Tokens.xyz has null name/symbol
  const mintEarly = extractMint(assetId) || assetId;
  if (
    mintEarly === "fEbiuDdZZ1QaWYpJFPqk23ZkaRnAyHg4aivhrCTshit" ||
    assetId.includes("fEbiuDdZZ1QaWYpJFPqk23ZkaRnAyHg4aivhrCTshit")
  ) {
    return {
      name: "TokenShit",
      symbol: "SHIT",
      logo: "",
    };
  }

  const fallback: AssetMeta = {
    name: shortId(assetId),
    symbol: "",
    logo: "",
  };

  // 1) Tokens.xyz asset by id
  try {
    const d = await apiFetch(`/assets/${encodeURIComponent(assetId)}`);
    const a = d.asset || d;
    const name = (a.name || a.profile?.name || "").trim();
    const symbol = (a.symbol || a.profile?.symbol || "").trim();
    const logo =
      a.imageUrl ||
      a.logo ||
      a.primaryVariant?.market?.logoURI ||
      a.profile?.logo ||
      "";
    if (name && name !== assetId) {
      return { name, symbol, logo: logo || "" };
    }
  } catch {
    /* continue */
  }

  // 2) resolve by mint if composite / bare mint
  const mint = extractMint(assetId);
  if (mint) {
    try {
      const d = await apiFetch(
        `/assets/resolve?mint=${encodeURIComponent(mint)}`
      );
      const a = d.asset || d;
      const name = (a.name || "").trim();
      const symbol = (a.symbol || "").trim();
      const logo =
        a.imageUrl ||
        a.logo ||
        a.primaryVariant?.market?.logoURI ||
        d.variant?.market?.logoURI ||
        "";
      if (name && name !== assetId && name !== mint) {
        return { name, symbol, logo: logo || "" };
      }
    } catch {
      /* continue */
    }

    // 3) Helius DAS — real name for pump tokens Tokens.xyz doesn't label
    const h = await heliusMeta(mint);
    if (h) return h;
  }

  return fallback;
}

function shortId(id: string): string {
  if (id.length <= 18) return id;
  const mint = extractMint(id);
  if (mint) return `${mint.slice(0, 4)}…${mint.slice(-4)}`;
  return `${id.slice(0, 10)}…`;
}
