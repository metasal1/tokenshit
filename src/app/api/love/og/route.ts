import { type NextRequest, NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-static";

/** Legacy /api/love/og?ref= → static brand card (no generation). */
export async function GET(_req: NextRequest) {
  return NextResponse.redirect(
    "https://tokenshit.com/brand/og/love.png?v=8",
    308
  );
}
