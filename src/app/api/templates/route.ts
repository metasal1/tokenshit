import { type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

/** Alias → /api/memes/templates (older clients) */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  url.pathname = "/api/memes/templates";
  return fetch(url.toString(), {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
}
