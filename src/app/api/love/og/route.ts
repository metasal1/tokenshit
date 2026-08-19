import { type NextRequest } from "next/server";
import { getLoveOgPngResponse } from "@/lib/love-og-cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get("ref");
  return getLoveOgPngResponse(ref, req.url);
}
