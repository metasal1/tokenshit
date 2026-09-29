import { NextResponse } from "next/server";
import { BRAND } from "@/lib/brand";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.redirect(BRAND.telegram, 302);
}
