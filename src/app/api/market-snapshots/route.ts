import { type NextRequest } from "next/server";
import { requireCronSecret } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

/**
 * Market snapshots proxy — locked (was open tokens.xyz key spend).
 * Only cron/admin with CRON_SECRET.
 */
export async function POST(request: NextRequest) {
  const denied = requireCronSecret(request);
  if (denied) return denied;
  return Response.json(
    { error: "market-snapshots proxy disabled" },
    { status: 410 }
  );
}

export async function GET() {
  return Response.json({ error: "Not found" }, { status: 404 });
}
