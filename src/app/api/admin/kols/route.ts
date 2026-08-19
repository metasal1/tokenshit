import { type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  ensureKolNomSchema,
  listKolNominations,
  setKolNominationStatus,
} from "@/lib/kol-noms";
import { prewarmKolOg } from "@/lib/kol-sync";

export const dynamic = "force-dynamic";

/** GET /api/admin/kols?status=pending|accepted|rejected|live|all */
export async function GET(req: NextRequest) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.res;
  await ensureKolNomSchema();
  const status = req.nextUrl.searchParams.get("status") || "pending";
  const noms = await listKolNominations({ status, limit: 300 });
  const counts = await listKolNominations({ status: "all", limit: 500 });
  const byStatus: Record<string, number> = {};
  for (const n of counts) {
    byStatus[n.status] = (byStatus[n.status] || 0) + 1;
  }
  return Response.json(
    { noms, byStatus, filter: status },
    {
      headers: {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    }
  );
}

/** POST { id, action: accept|reject|live|pending } */
export async function POST(req: NextRequest) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.res;
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const id = Number(body.id);
  const action = String(body.action || body.status || "").toLowerCase();
  const map: Record<string, "pending" | "accepted" | "rejected" | "live"> = {
    accept: "accepted",
    accepted: "accepted",
    reject: "rejected",
    rejected: "rejected",
    live: "live",
    pending: "pending",
  };
  const status = map[action];
  if (!status) {
    return Response.json(
      { error: "action must be accept|reject|live|pending" },
      { status: 400 }
    );
  }
  const result = await setKolNominationStatus(id, status);
  if (!result.ok) {
    return Response.json({ error: result.error || "failed" }, { status: 400 });
  }
  // When approved → bake OG in background so /kols/{handle} + shares are fast
  if (
    (status === "accepted" || status === "live") &&
    result.row?.handle
  ) {
    const h = result.row.handle;
    void prewarmKolOg(h).catch(() => {});
  }
  return Response.json({ ok: true, row: result.row, scoutPay: result.scoutPay });
}
