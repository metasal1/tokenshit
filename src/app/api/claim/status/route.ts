import { type NextRequest } from "next/server";
import {
  getTweetClaimCooldown,
  hasClaimed,
  type ClaimKind,
} from "@/lib/claims";
import {
  CLAIM_GH_FORK,
  CLAIM_X_FOLLOW,
  CLAIM_X_PREMIUM,
  CLAIM_X_TWEET,
  CLAIM_X_VERIFIED,
} from "@/lib/shit-token";
import { getTreasuryBalances } from "@/lib/treasury";

export const dynamic = "force-dynamic";

const KINDS: ClaimKind[] = [
  "x_tweet",
  "x_follow",
  "x_verified",
  "x_premium",
  "gh_fork",
];

const AMOUNTS: Record<ClaimKind, number> = {
  x_verified: CLAIM_X_VERIFIED,
  x_premium: CLAIM_X_PREMIUM,
  gh_fork: CLAIM_GH_FORK,
  x_tweet: CLAIM_X_TWEET,
  x_follow: CLAIM_X_FOLLOW,
};

/**
 * GET /api/claim/status?twitter=&github=&wallet=
 * Claimed flags + tweet 24h cooldown for UI.
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

    const tweetCooldown = await getTweetClaimCooldown({ twitter, wallet });
    // claimed.x_tweet means "on cooldown" for tweet kind
    claimed.x_tweet = tweetCooldown.onCooldown;

    const bal = await getTreasuryBalances().catch(() => null);
    return Response.json({
      claimed,
      amounts: AMOUNTS,
      treasuryShit: bal?.shit ?? null,
      treasurySol: bal?.sol ?? null,
      tweet: {
        cooldownHours: 24,
        maxTweetAgeHours: 24,
        onCooldown: tweetCooldown.onCooldown,
        lastClaimAt: tweetCooldown.lastClaimAt,
        nextClaimAt: tweetCooldown.nextClaimAt,
        msRemaining: tweetCooldown.msRemaining,
      },
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
