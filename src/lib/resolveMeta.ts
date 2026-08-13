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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function metaFromRow(a: any, assetId: string): AssetMeta | null {
  if (!a || typeof a !== "object") return null;
  const pv = a.primaryVariant || {};
  const market = pv.market || a.market || {};
  // Prefer variant labels — Tokens.xyz often collapses LST rows to parent SOL
  // with null top-level name while primaryVariant has the real ticker.
  const name = String(
    a.name || a.profile?.name || pv.name || pv.symbol || ""
  ).trim();
  const symbol = String(
    a.symbol || a.profile?.symbol || pv.symbol || pv.name || ""
  ).trim();
  const logo = String(
    a.imageUrl ||
      a.logo ||
      market.logoURI ||
      a.profile?.logo ||
      pv.imageUrl ||
      ""
  ).trim();

  // Reject parent SOL bleed when looking up solana-<mint>
  const id = String(a.assetId || a.id || "");
  if (
    /^solana-/i.test(assetId) &&
    (id === "solana" || name === "Solana" || symbol === "SOL") &&
    !pv.name &&
    !pv.symbol
  ) {
    return null;
  }

  if (!name && !symbol) return null;
  if (name === assetId || symbol === assetId) return null;

  return {
    name: name || symbol,
    symbol: symbol || (name ? name.slice(0, 12) : ""),
    logo,
  };
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
      logo: dex,
      logoCandidates: candidates,
    };
  } catch {
    return null;
  }
}

/**
 * Resolve display name/symbol/logo for a voted assetId.
 * Tokens.xyz first (incl. primaryVariant); Helius DAS fallback.
 */
export async function resolveAssetMeta(assetId: string): Promise<AssetMeta> {
  const mintEarly = extractMint(assetId) || assetId;
  if (
    mintEarly === "fEbiuDdZZ1QaWYpJFPqk23ZkaRnAyHg4aivhrCTshit" ||
    assetId.includes("fEbiuDdZZ1QaWYpJFPqk23ZkaRnAyHg4aivhrCTshit")
  ) {
    return {
      name: "TokenShit",
      symbol: "TOKENSHIT",
      logo: "",
    };
  }

  const fallback: AssetMeta = {
    name: shortId(assetId),
    symbol: "",
    logo: "",
  };

  // 1) Tokens.xyz asset by id — prefer primaryVariant for composite ids
  try {
    const d = await apiFetch(`/assets/${encodeURIComponent(assetId)}`);
    const a = d.asset || d;
    const m = metaFromRow(a, assetId) || metaFromRow(d, assetId);
    if (m) return m;
  } catch {
    /* continue */
  }

  // 2) Scan curated majors for this id (has primaryVariant labels)
  try {
    const d = await apiFetch(`/assets/curated?list=majors&groupBy=asset`);
    const assets = (d.assets || d.results || []) as Record<string, unknown>[];
    const hit = assets.find(
      (row) =>
        String(row.assetId || row.id || "") === assetId ||
        String((row as { asset?: { assetId?: string } }).asset?.assetId || "") ===
          assetId
    );
    if (hit) {
      const m = metaFromRow(hit, assetId);
      if (m) return m;
    }
  } catch {
    /* continue */
  }

  // 3) resolve by mint
  const mint = extractMint(assetId);
  if (mint) {
    try {
      const d = await apiFetch(
        `/assets/resolve?mint=${encodeURIComponent(mint)}`
      );
      const a = d.asset || d.variant || d;
      const m = metaFromRow(a, assetId) || metaFromRow(d, assetId);
      if (m) return m;
    } catch {
      /* continue */
    }

    // 4) Helius DAS
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
