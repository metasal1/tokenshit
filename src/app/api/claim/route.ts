import { type NextRequest } from "next/server";
import {
  CLAIM_GH_FORK,
  CLAIM_X_FOLLOW,
  CLAIM_X_TWEET,
  CLAIM_X_VERIFIED,
  TREASURY_ADDRESS,
} from "@/lib/shit-token";
import {
  checkGhFork,
  checkXFollowsTokenshit,
  checkXTweetTag,
  checkXVerified,
  hasClaimed,
  recordClaim,
  type ClaimKind,
} from "@/lib/claims";
import { getTreasuryBalances, sendShitFromTreasury } from "@/lib/treasury";
import { requirePrivy } from "@/lib/privy-server";
import { assertNotBlacklisted } from "@/lib/security";
import {
  getClientIp,
  gateClaimIp,
  gateXFollowersForClaim,
  recordAbuseEvent,
} from "@/lib/abuse";

export const dynamic = "force-dynamic";

const SOLANA_ADDR = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

const AMOUNTS: Record<ClaimKind, number> = {
  x_verified: CLAIM_X_VERIFIED,
  gh_fork: CLAIM_GH_FORK,
  x_tweet: CLAIM_X_TWEET,
  x_follow: CLAIM_X_FOLLOW,
};

function isKind(k: string): k is ClaimKind {
  return k in AMOUNTS;
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const kindRaw = sp.get("kind") || "";
  const twitter = sp.get("twitter");
  const github = sp.get("github");
  const wallet = sp.get("wallet");

  if (!isKind(kindRaw)) {
    return Response.json({
      amounts: AMOUNTS,
      treasury: TREASURY_ADDRESS,
    });
  }
  const kind = kindRaw;

  try {
    let eligible = false;
    let detail: Record<string, unknown> = {};

    if (kind === "x_verified") {
      if (!twitter)
        return Response.json({ error: "twitter required" }, { status: 400 });
      const x = await checkXVerified(twitter);
      detail = x;
      eligible = x.ok && x.verified;
    } else if (kind === "gh_fork") {
      if (!github)
        return Response.json({ error: "github required" }, { status: 400 });
      const g = await checkGhFork(github);
      detail = g;
      eligible = g.ok && g.forked;
    } else if (kind === "x_tweet") {
      if (!twitter)
        return Response.json({ error: "twitter required" }, { status: 400 });
      const tweetUrl = sp.get("tweetUrl");
      const t = await checkXTweetTag(twitter, tweetUrl);
      detail = t;
      eligible = t.ok && t.found;
    } else if (kind === "x_follow") {
      if (!twitter)
        return Response.json({ error: "twitter required" }, { status: 400 });
      const f = await checkXFollowsTokenshit(twitter);
      detail = f;
      eligible = f.ok && f.following;
    }

    const claimed = await hasClaimed(kind, { twitter, github, wallet });
    const bal = await getTreasuryBalances().catch(() => null);
    const amount = AMOUNTS[kind];

    return Response.json({
      kind,
      amount,
      eligible,
      claimed,
      canClaim: eligible && !claimed && (bal?.shit ?? 0) >= amount,
      treasuryShit: bal?.shit ?? null,
      detail,
    });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const ipGate = await gateClaimIp(ip);
    if (!ipGate.ok) {
      await recordAbuseEvent("claim_blocked", ip, null, { reason: ipGate.code });
      return Response.json(
        { error: ipGate.error, code: ipGate.code },
        { status: ipGate.status }
      );
    }

    const body = await request.json();
    const kindRaw = String(body.kind || "");
    if (!isKind(kindRaw)) {
      return Response.json({ error: "Invalid claim kind" }, { status: 400 });
    }
    const kind = kindRaw;
    const wallet = String(body.wallet || "").trim();
    const twitter = body.twitter
      ? String(body.twitter).replace(/^@/, "")
      : null;
    const github = body.github ? String(body.github).replace(/^@/, "") : null;

    if (!SOLANA_ADDR.test(wallet)) {
      return Response.json(
        { error: "Valid Solana wallet required" },
        { status: 400 }
      );
    }

    const blocked = assertNotBlacklisted(wallet);
    if (blocked) return blocked;

    const auth = await requirePrivy(request, {
      twitter,
      github,
      wallet,
      requireTwitter:
        kind === "x_verified" || kind === "x_tweet" || kind === "x_follow",
      body: body as Record<string, unknown>,
    });
    if (!auth.ok) return auth.res;

    // Follower floor on tweet/follow claims
    const flGate = await gateXFollowersForClaim(twitter || auth.id.twitter, kind);
    if (!flGate.ok) {
      await recordAbuseEvent("claim_blocked", ip, twitter, {
        reason: flGate.code,
        kind,
        followers: flGate.followers,
      });
      return Response.json(
        {
          error: flGate.error,
          code: flGate.code,
          followers: flGate.followers,
        },
        { status: flGate.status }
      );
    }

    const amount = AMOUNTS[kind];
    let tweetId: string | undefined;

    if (kind === "x_verified") {
      if (!twitter)
        return Response.json(
          { error: "Twitter handle required" },
          { status: 400 }
        );
      const x = await checkXVerified(twitter);
      if (!x.ok)
        return Response.json(
          { error: x.error || "X check failed" },
          { status: 502 }
        );
      if (!x.verified)
        return Response.json(
          { error: "X account is not verified", verifiedType: x.verifiedType },
          { status: 403 }
        );
    } else if (kind === "gh_fork") {
      if (!github)
        return Response.json(
          { error: "GitHub username required" },
          { status: 400 }
        );
      const g = await checkGhFork(github);
      if (!g.ok)
        return Response.json(
          { error: g.error || "GitHub check failed" },
          { status: 502 }
        );
      if (!g.forked)
        return Response.json(
          {
            error:
              "No fork of solana-foundation/tokens found on this GitHub account",
          },
          { status: 403 }
        );
    } else if (kind === "x_tweet") {
      if (!twitter)
        return Response.json(
          { error: "Twitter handle required" },
          { status: 400 }
        );
      const tweetUrl = body.tweetUrl ? String(body.tweetUrl).trim() : "";
      if (!tweetUrl) {
        return Response.json(
          { error: "Paste your tweet URL to claim (X search is flaky)." },
          { status: 400 }
        );
      }
      const t = await checkXTweetTag(twitter, tweetUrl);
      if (!t.ok)
        return Response.json(
          { error: t.error || "Tweet check failed" },
          { status: 502 }
        );
      if (!t.found)
        return Response.json(
          {
            error:
              "No recent tweet from you tagging @Tokenshit_ found (last ~7 days). Post, then paste the tweet link and claim.",
          },
          { status: 403 }
        );
      tweetId = t.tweetId;
    } else if (kind === "x_follow") {
      if (!twitter)
        return Response.json(
          { error: "Twitter handle required" },
          { status: 400 }
        );
      const f = await checkXFollowsTokenshit(twitter);
      if (!f.ok)
        return Response.json(
          { error: f.error || "Follow check failed" },
          { status: 502 }
        );
      if (!f.following)
        return Response.json(
          { error: "Follow @Tokenshit_ on X, then claim." },
          { status: 403 }
        );
    }

    if (await hasClaimed(kind, { twitter, github, wallet })) {
      return Response.json({ error: "Already claimed" }, { status: 409 });
    }

    const bal = await getTreasuryBalances();
    if (bal.shit < amount) {
      return Response.json(
        {
          error: "Treasury empty — fund treasury then retry",
          treasury: bal.address,
          have: bal.shit,
          need: amount,
        },
        { status: 503 }
      );
    }

    if (bal.sol < 0.001) {
      return Response.json(
        {
          error: "Treasury needs SOL for fees",
          treasury: bal.address,
          sol: bal.sol,
        },
        { status: 503 }
      );
    }

    // Reserve claim row BEFORE send — stops double-claim races / drain loops
    try {
      await recordClaim({
        kind,
        twitter,
        github,
        wallet,
        amount,
        signature: "pending",
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("UNIQUE") || msg.includes("unique")) {
        return Response.json({ error: "Already claimed" }, { status: 409 });
      }
      throw e;
    }

    let signature: string;
    try {
      ({ signature } = await sendShitFromTreasury(wallet, amount));
    } catch (e) {
      // allow retry if treasury send failed
      const { tursoExecute } = await import("@/lib/turso");
      await tursoExecute(
        `DELETE FROM shit_claims WHERE claim_kind = ? AND wallet = ? AND signature = 'pending'`,
        [kind, wallet]
      ).catch(() => {});
      throw e;
    }

    const { tursoExecute } = await import("@/lib/turso");
    await tursoExecute(
      `UPDATE shit_claims SET signature = ? WHERE claim_kind = ? AND wallet = ? AND signature = 'pending'`,
      [signature, kind, wallet]
    );

    await recordAbuseEvent("claim", ip, twitter || wallet, {
      kind,
      amount,
      followers: flGate.followers,
    });

    return Response.json({
      ok: true,
      kind,
      amount,
      wallet,
      signature,
      tweetId,
      solscan: `https://solscan.io/tx/${signature}`,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("UNIQUE") || msg.includes("unique")) {
      return Response.json({ error: "Already claimed" }, { status: 409 });
    }
    return Response.json({ error: msg }, { status: 500 });
  }
}
