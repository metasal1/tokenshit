import { type NextRequest } from "next/server";
import { pickRandomToken } from "@/lib/random-pool";

export async function GET(request: NextRequest) {
  try {
    const username = request.nextUrl.searchParams.get("username") || null;
    const exclude = request.nextUrl.searchParams.get("exclude") || null;
    const token = await pickRandomToken({ username, excludeAssetId: exclude });
    return Response.json({ assetId: token?.assetId ?? null });
  } catch {
    return Response.json({ assetId: null });
  }
}
