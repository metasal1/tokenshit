import { tursoExecute } from "@/lib/turso";
import { apiFetch } from "@/lib/api";
import { buildAssetCategoryMap } from "@/lib/curatedAssets";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const withCategories =
    new URL(request.url).searchParams.get("withCategories") === "1";

  try {
    // Prefer all-time for sparse days so arenas aren't empty
    const result = await tursoExecute(
      `SELECT asset_id, vote, COUNT(*) as cnt
       FROM votes
       GROUP BY asset_id, vote
       ORDER BY cnt DESC`,
      []
    );

    const assets: Record<string, { hits: number; shits: number }> = {};
    for (const row of result.rows) {
      const id = row[0] as string;
      if (!assets[id]) assets[id] = { hits: 0, shits: 0 };
      if (row[1] === "hit") assets[id].hits = Number(row[2]);
      if (row[1] === "shit") assets[id].shits = Number(row[2]);
    }

    const mostHit = Object.entries(assets)
      .filter(([, v]) => v.hits > 0)
      .sort((a, b) => b[1].hits - a[1].hits)
      .slice(0, 40)
      .map(([assetId, v]) => ({ assetId, hits: v.hits, shits: v.shits }));

    const mostShit = Object.entries(assets)
      .filter(([, v]) => v.shits > 0)
      .sort((a, b) => b[1].shits - a[1].shits)
      .slice(0, 40)
      .map(([assetId, v]) => ({ assetId, hits: v.hits, shits: v.shits }));

    const allIds = [
      ...new Set([
        ...mostHit.map((e) => e.assetId),
        ...mostShit.map((e) => e.assetId),
      ]),
    ];

    const meta: Record<string, { name: string; symbol: string; logo: string }> =
      {};
    await Promise.all(
      allIds.map(async (id) => {
        try {
          const d = await apiFetch(`/assets/${encodeURIComponent(id)}`);
          const a = d.asset || d;
          meta[id] = {
            name: a.name || id,
            symbol: a.symbol || "",
            logo: a.imageUrl || a.primaryVariant?.market?.logoURI || "",
          };
        } catch {
          /* skip */
        }
      })
    );

    let categoryMap: Record<string, string> = {};
    if (withCategories) {
      try {
        categoryMap = await buildAssetCategoryMap();
      } catch {
        categoryMap = {};
      }
    }

    const enrich = (entries: typeof mostHit) =>
      entries.map((e) => ({
        ...e,
        ...meta[e.assetId],
        category: categoryMap[e.assetId],
      }));

    return Response.json({
      mostHit: enrich(mostHit),
      mostShit: enrich(mostShit),
      categoryMap,
    });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
