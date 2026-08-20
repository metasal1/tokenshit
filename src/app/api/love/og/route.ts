import { type NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Legacy dynamic OG URL → static brand card (instant). */
export async function GET(_req: NextRequest) {
  return NextResponse.redirect(
    "https://tokenshit.com/brand/og/love.png?v=8",
    308
  );
}
