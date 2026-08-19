import { type NextRequest } from "next/server";
import { getKolOgPngResponse } from "@/lib/kol-og-cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ handle: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { handle: raw } = await ctx.params;
  return getKolOgPngResponse(raw, req.url);
}
