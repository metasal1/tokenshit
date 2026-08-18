import { type NextRequest } from "next/server";
import { requirePrivy } from "@/lib/privy-server";
import {
  ensureKolNomSchema,
  listKolNominations,
  setKolNominationStatus,
} from "@/lib/kol-noms";

export const dynamic = "force-dynamic";

function normPrivyId(id: string): string {
  const s = id.trim().toLowerCase();
  return s.startsWith("did:privy:") ? s.slice("did:privy:".length) : s;
}

function adminAllowlist(): string[] {
  return (process.env.ADMIN_PRIVY_ID || "")
    .split(",")
    .map((s) => normPrivyId(s))
    .filter(Boolean);
}

function isAdminPrivy(privyId: string): boolean {
  const adminIds = adminAllowlist();
  if (adminIds.length === 0) return false;
  return adminIds.includes(normPrivyId(privyId));
}

async function requireAdmin(req: NextRequest) {
  const allow = adminAllowlist();
  const cronSecret =
    process.env.CRON_SECRET ||
    process.env.TREASURY_DROP_SECRET ||
    process.env.HERMES_CRON_SECRET ||
    "";
  const authHeader = req.headers.get("authorization") || "";
  const bearer = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : "";
  const headerSecret =
    req.headers.get("x-cron-secret") ||
    req.headers.get("x-admin-secret") ||
    "";

  if (cronSecret && (bearer === cronSecret || headerSecret === cronSecret)) {
    return { ok: true as const };
  }
  if (allow.length === 0) {
    return {
      ok: false as const,
      res: Response.json(
        { error: "Admin not configured (ADMIN_PRIVY_ID)" },
        { status: 503 }
      ),
    };
  }
  const auth = await requirePrivy(req, {});
  if (!auth.ok) return { ok: false as const, res: auth.res };
  if (!isAdminPrivy(auth.id.privyId)) {
    return {
      ok: false as const,
      res: Response.json(
        {
          error: "Forbidden — Privy id not on allowlist",
          yourId: auth.id.privyId,
        },
        { status: 403 }
      ),
    };
  }
  return { ok: true as const };
}

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
  return Response.json({ ok: true, row: result.row });
}
