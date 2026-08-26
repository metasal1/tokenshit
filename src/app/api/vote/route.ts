import { type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

/** Voting removed. */
export async function POST(_request: NextRequest) {
  return Response.json(
    { ok: false, error: "Voting is off. Play FOR PRIZES instead.", code: "voting_removed" },
    { status: 410 }
  );
}

export async function GET() {
  return Response.json(
    { ok: false, error: "Voting is off.", code: "voting_removed" },
    { status: 410 }
  );
}
