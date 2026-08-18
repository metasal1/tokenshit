import { type NextRequest } from "next/server";
import {
  getTokenLikeSummary,
  userLikedTokenOnVrfd,
  JUP_VRFD_DASHBOARD,
  checkJupVrfdEligibility,
} from "@/lib/jup-vrfd";
import { SHIT_MINT } from "@/lib/shit-token";

export const dynamic = "force-dynamic";

/**
 * GET /api/jup/vrfd?twitter=handle
 * Like counts + optional per-user like check (for claim UI).
 */
export async function GET(req: NextRequest) {
  const mint =
    req.nextUrl.searchParams.get("mint")?.trim() || SHIT_MINT;
  const twitter = req.nextUrl.searchParams.get("twitter")?.trim() || "";
  try {
    const [sum, elig] = await Promise.all([
      getTokenLikeSummary(mint),
      checkJupVrfdEligibility(mint).catch(() => null),
    ]);
    let liked: Awaited<ReturnType<typeof userLikedTokenOnVrfd>> | null = null;
    if (twitter) {
      liked = await userLikedTokenOnVrfd({ twitter, mint });
    }
    return Response.json({
      mint,
      dashboard: JUP_VRFD_DASHBOARD(mint),
      likes: sum.likes,
      smartLikes: sum.smartLikes,
      topLikers: sum.topLikers,
      userLiked: liked?.liked ?? null,
      userMatch: liked?.matched ?? null,
      isVerified: elig?.isVerified ?? null,
      eligibility: elig,
      claim: {
        kind: "jup_verified",
        amount: 5_000,
        rule: "Like $TOKENSHIT on Jupiter VRFD with the same X as Privy login",
      },
    });
  } catch (e) {
    return Response.json(
      {
        mint,
        dashboard: JUP_VRFD_DASHBOARD(mint),
        error: e instanceof Error ? e.message : String(e),
      },
      { status: 502 }
    );
  }
}
