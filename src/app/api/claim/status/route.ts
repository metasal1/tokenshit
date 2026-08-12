import { type NextRequest } from "next/server";
import { hasClaimed, type ClaimKind } from "@/lib/claims";
import {
  CLAIM_GH_FORK,
  CLAIM_X_FOLLOW,
  CLAIM_X_TWEET,
  CLAIM_X_VERIFIED,
} from "@/lib/shit-token";
import { getTreasuryBalances } from "@/lib/treasury";

export const dynamic = "force-dynamic";

const KINDS: ClaimKind[] = ["x_tweet", "x_follow", "x_verified", "gh_fork"];

const AMOUNTS: Record<ClaimKind, number> = {
  x_verified: CLAIM_X_VERIFIED,
  gh_fork: CLAIM_GH_FORK,
  x_tweet: CLAIM_X_TWEET,
  x_follow: CLAIM_X_FOLLOW,
};

/**
 * GET /api/claim/status?twitter=&github=&wallet=
 * Lightweight claimed flags for UI (no X eligibility checks — those run on POST).
 */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const twitter = sp.get("twitter");
  const github = sp.get("github");
  const wallet = sp.get("wallet");

  try {
    const claimed: Record<string, boolean> = {};
    await Promise.all(
      KINDS.map(async (k) => {
        claimed[k] = await hasClaimed(k, { twitter, github, wallet });
      })
    );
    const bal = await getTreasuryBalances().catch(() => null);
    return Response.json({
      claimed,
      amounts: AMOUNTS,
      treasuryShit: bal?.shit ?? null,
      treasurySol: bal?.sol ?? null,
      identity: {
        twitter: twitter || null,
        github: github || null,
        wallet: wallet || null,
      },
    });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
