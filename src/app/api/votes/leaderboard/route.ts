import { tursoExecute } from "@/lib/turso";
import { apiFetch } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await tursoExecute(
      `SELECT asset_id, vote, COUNT(*) as cnt
       FROM votes
       WHERE voted_at = date('now')
       GROUP BY asset_id, vote
       ORDER BY cnt DESC`,
      []
    );

    // Build per-asset tallies
    const assets: Record<string, { hits: number; shits: number }> = {};
    for (const row of result.rows) {
      const id = row[0] as string;
      if (!assets[id]) assets[id] = { hits: 0, shits: 0 };
      if (row[1] === "hit") assets[id].hits = Number(row[2]);
      if (row[1] === "shit") assets[id].shits = Number(row[2]);
    }

    // Top 5 hits
    const mostHit = Object.entries(assets)
      .filter(([, v]) => v.hits > 0)
      .sort((a, b) => b[1].hits - a[1].hits)
      .slice(0, 5)
      .map(([assetId, v]) => ({ assetId, hits: v.hits, shits: v.shits }));

    // Top 5 shits
    const mostShit = Object.entries(assets)
      .filter(([, v]) => v.shits > 0)
      .sort((a, b) => b[1].shits - a[1].shits)
      .slice(0, 5)
      .map(([assetId, v]) => ({ assetId, hits: v.hits, shits: v.shits }));

    // Batch-resolve token metadata for all unique asset IDs
    const allIds = [
      ...new Set([
        ...mostHit.map((e) => e.assetId),
        ...mostShit.map((e) => e.assetId),
      ]),
    ];

    const meta: Record<string, { name: string; symbol: string; logo: string }> = {};
    await Promise.all(
      allIds.map(async (id) => {
        try {
          const d = await apiFetch(`/assets/${encodeURIComponent(id)}?include=profile`);
          const p = d.profile || d;
          meta[id] = {
            name: p.name || d.name || id,
            symbol: p.symbol || d.symbol || "",
            logo: p.logo || d.logo || "",
          };
        } catch {
          // skip
        }
      })
    );

    const enrich = (entries: typeof mostHit) =>
      entries.map((e) => ({ ...e, ...meta[e.assetId] }));

    return Response.json({
      mostHit: enrich(mostHit),
      mostShit: enrich(mostShit),
    });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
