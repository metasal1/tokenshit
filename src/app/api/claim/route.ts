import { type NextRequest } from "next/server";
import {
  CLAIM_EMAIL_LIST,
  CLAIM_GH_FORK,
  CLAIM_X_FOLLOW,
  CLAIM_X_PREMIUM,
  CLAIM_X_TWEET,
  CLAIM_X_VERIFIED,
  TREASURY_ADDRESS,
} from "@/lib/shit-token";
import {
  checkGhFork,
  checkXFollowsTokenshit,
  checkXTweetTag,
  checkXVerified,
  getTweetClaimCooldown,
  hasClaimed,
  isOnEmailList,
  recordClaim,
  tweetIdAlreadyClaimed,
  type ClaimKind,
} from "@/lib/claims";
import { getTreasuryBalances } from "@/lib/treasury";
import { payFromTreasury } from "@/lib/treasury-ledger";
import { requirePrivy } from "@/lib/privy-server";
import { assertNotBlacklisted } from "@/lib/security";
import {
  getClientIp,
  gateClaimIp,
  gateMajorClaimIp,
  gateXProfileForClaim,
  recordAbuseEvent,
} from "@/lib/abuse";

export const dynamic = "force-dynamic";

const SOLANA_ADDR = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

const AMOUNTS: Record<ClaimKind, number> = {
  x_verified: CLAIM_X_VERIFIED,
  x_premium: CLAIM_X_PREMIUM,
  gh_fork: CLAIM_GH_FORK,
  x_tweet: CLAIM_X_TWEET,
  x_follow: CLAIM_X_FOLLOW,
  email_list: CLAIM_EMAIL_LIST,
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

  // Eligibility oracle burns X/TweetAPI — rate limit public checks
  if (isKind(kindRaw)) {
    const { getClientIp, rateLimitIp } = await import("@/lib/api-guard");
    const limited = await rateLimitIp({
      ip: getClientIp(request),
      bucket: "claim_check",
      limit: 40,
      windowHours: 1,
    });
    if (limited) return limited;
  }

  if (!isKind(kindRaw)) {
    return Response.json({
      amounts: AMOUNTS,
      treasury: TREASURY_ADDRESS,
      rules: {
        xRequired: true,
        minFollowers: 100,
        requirePfp: true,
        majorClaimsPerIpDay: 1,
        verified: CLAIM_X_VERIFIED,
        premium: CLAIM_X_PREMIUM,
        ghFork: CLAIM_GH_FORK,
        emailList: CLAIM_EMAIL_LIST,
        walletMustBePrivyLinkedToX: true,
      },
    });
  }
  const kind = kindRaw;

  try {
    let eligible = false;
    let detail: Record<string, unknown> = {};

    if (kind === "x_verified" || kind === "x_premium") {
      if (!twitter)
        return Response.json({ error: "twitter required" }, { status: 400 });
      const x = await checkXVerified(twitter);
      detail = x;
      if (kind === "x_premium") eligible = x.ok && x.premium;
      else eligible = x.ok && x.verified && !x.premium;
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
    } else if (kind === "email_list") {
      const email = sp.get("email");
      const list = await isOnEmailList({
        email,
        twitter,
        wallet,
      });
      detail = list;
      eligible = list.ok;
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
    if (process.env.CLAIMS_ENABLED === "0") {
      return Response.json(
        {
          error:
            "Claims paused while we secure the treasury. Follow @Tokenshit_ for updates.",
          code: "claims_paused",
        },
        { status: 503 }
      );
    }

    const ip = getClientIp(request);
    const ipGate = await gateClaimIp(ip);
    if (!ipGate.ok) {
      await recordAbuseEvent("claim_blocked", ip, null, {
        reason: ipGate.code,
      });
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

    const majorGate = await gateMajorClaimIp(ip, kind);
    if (!majorGate.ok) {
      await recordAbuseEvent("claim_blocked", ip, null, {
        reason: majorGate.code,
        kind,
      });
      return Response.json(
        { error: majorGate.error, code: majorGate.code },
        { status: majorGate.status }
      );
    }

    let wallet = String(body.wallet || "").trim();
    let twitter = body.twitter
      ? String(body.twitter).replace(/^@/, "").toLowerCase().trim()
      : null;
    let github = body.github
      ? String(body.github).replace(/^@/, "").toLowerCase().trim()
      : null;

    if (!SOLANA_ADDR.test(wallet)) {
      return Response.json(
        { error: "Valid Solana wallet required" },
        { status: 400 }
      );
    }

    const blocked = assertNotBlacklisted(wallet);
    if (blocked) return blocked;

    // X sign-in compulsory for ALL claims. Wallet must be Privy-linked to that X.
    const auth = await requirePrivy(request, {
      twitter,
      github,
      wallet,
      requireTwitter: true,
      requireLinkedWallet: true,
      body: body as Record<string, unknown>,
    });
    if (!auth.ok) return auth.res;

    // Canonical identity from Privy (not client body)
    if (auth.id.twitter) twitter = auth.id.twitter;
    if (auth.id.github) github = auth.id.github;
    if (auth.id.wallets.length === 1) {
      wallet = auth.id.wallets[0]!;
    } else if (auth.id.wallets.length > 1) {
      const match = auth.id.wallets.find(
        (w) => w.toLowerCase() === wallet.toLowerCase()
      );
      if (!match) {
        return Response.json(
          {
            error:
              "Wallet must be the Privy Solana wallet linked to your X account",
            linkedWallets: auth.id.wallets.map(
              (w) => `${w.slice(0, 4)}…${w.slice(-4)}`
            ),
          },
          { status: 403 }
        );
      }
      wallet = match;
    }

    if (!twitter) {
      return Response.json(
        { error: "Sign in with X is required" },
        { status: 403 }
      );
    }

    // Fail fast: already claimed / empty treasury before X eligibility work
    {
      const amountPeek = AMOUNTS[kind];
      const [claimedEarly, balPeek] = await Promise.all([
        hasClaimed(kind, { twitter, github, wallet }),
        getTreasuryBalances().catch(() => null),
      ]);
      if (claimedEarly) {
        if (kind === "x_tweet") {
          const cool = await getTweetClaimCooldown({ twitter, wallet });
          return Response.json(
            {
              error: "Tweet claim every 24h. Come back later.",
              code: "tweet_cooldown",
              nextClaimAt: cool.nextClaimAt,
              msRemaining: cool.msRemaining,
            },
            { status: 429 }
          );
        }
        return Response.json({ error: "Already claimed" }, { status: 409 });
      }
      if (balPeek && balPeek.shit < amountPeek) {
        return Response.json(
          {
            error: "Treasury empty — fund treasury then retry",
            treasury: balPeek.address,
            have: balPeek.shit,
            need: amountPeek,
          },
          { status: 503 }
        );
      }
      if (balPeek && balPeek.sol < 0.001) {
        return Response.json(
          {
            error: "Treasury needs SOL for fees",
            treasury: balPeek.address,
            sol: balPeek.sol,
          },
          { status: 503 }
        );
      }
    }

    const profileGate = await gateXProfileForClaim(twitter);
    if (!profileGate.ok) {
      await recordAbuseEvent("claim_blocked", ip, twitter, {
        reason: profileGate.code,
        kind,
        followers: profileGate.followers,
      });
      return Response.json(
        {
          error: profileGate.error,
          code: profileGate.code,
          followers: profileGate.followers,
        },
        { status: profileGate.status }
      );
    }

    let amount = AMOUNTS[kind];
    let tweetId: string | undefined;

    if (kind === "x_verified" || kind === "x_premium") {
      const x = await checkXVerified(twitter);
      if (!x.ok)
        return Response.json(
          { error: x.error || "X check failed" },
          { status: 502 }
        );
      if (kind === "x_premium") {
        if (!x.premium)
          return Response.json(
            {
              error:
                "X Premium (blue) required for this reward. Non-premium verified can claim the verified tier instead.",
              verifiedType: x.verifiedType,
            },
            { status: 403 }
          );
        amount = CLAIM_X_PREMIUM;
      } else {
        // verified tier: any verified, but premium users should use x_premium
        if (x.premium) {
          return Response.json(
            {
              error:
                "You have X Premium — use the Premium claim (20,000) instead of Verified (10,000).",
              code: "use_premium_tier",
            },
            { status: 400 }
          );
        }
        if (!x.verified)
          return Response.json(
            {
              error: "X account is not verified",
              verifiedType: x.verifiedType,
            },
            { status: 403 }
          );
        amount = CLAIM_X_VERIFIED;
      }
    } else if (kind === "gh_fork") {
      if (!github)
        return Response.json(
          { error: "Link GitHub to your Privy account first" },
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
      amount = CLAIM_GH_FORK;
    } else if (kind === "x_tweet") {
      const tweetUrl = body.tweetUrl ? String(body.tweetUrl).trim() : "";
      if (!tweetUrl) {
        return Response.json(
          { error: "Paste your tweet URL to claim." },
          { status: 400 }
        );
      }
      const cool = await getTweetClaimCooldown({ twitter, wallet });
      if (cool.onCooldown) {
        return Response.json(
          {
            error: "Tweet claim every 24h. Come back later.",
            code: "tweet_cooldown",
            nextClaimAt: cool.nextClaimAt,
            msRemaining: cool.msRemaining,
          },
          { status: 429 }
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
              t.error ||
              "No recent tweet from you tagging @Tokenshit_ found. Post a fresh tweet (<24h), paste the link, claim.",
          },
          { status: 403 }
        );
      tweetId = t.tweetId;
      if (tweetId && (await tweetIdAlreadyClaimed(tweetId))) {
        return Response.json(
          {
            error: "This tweet was already claimed. Post a new one.",
            code: "tweet_already_claimed",
          },
          { status: 409 }
        );
      }
    } else if (kind === "x_follow") {
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
    } else if (kind === "email_list") {
      const emailRaw = body.email ? String(body.email).trim().toLowerCase() : "";
      const list = await isOnEmailList({
        email: emailRaw || null,
        twitter,
        wallet,
        privyId: auth.id.privyId,
      });
      if (!list.ok) {
        return Response.json(
          {
            error:
              "Join the email list first, then claim. Use the same X / wallet you signed up with.",
            code: "not_on_list",
          },
          { status: 403 }
        );
      }
      amount = CLAIM_EMAIL_LIST;
    }

    if (await hasClaimed(kind, { twitter, github, wallet })) {
      if (kind === "x_tweet") {
        const cool = await getTweetClaimCooldown({ twitter, wallet });
        return Response.json(
          {
            error: "Tweet claim every 24h. Come back later.",
            code: "tweet_cooldown",
            nextClaimAt: cool.nextClaimAt,
            msRemaining: cool.msRemaining,
          },
          { status: 429 }
        );
      }
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

    try {
      await recordClaim({
        kind,
        twitter,
        github,
        wallet,
        amount,
        signature: "pending",
        tweetId: kind === "x_tweet" ? tweetId || null : null,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("UNIQUE") || msg.includes("unique")) {
        return Response.json(
          {
            error:
              kind === "x_tweet"
                ? "This tweet was already claimed. Post a new one."
                : "Already claimed",
          },
          { status: 409 }
        );
      }
      throw e;
    }

    let signature: string;
    try {
      const paid = await payFromTreasury({
        kind,
        recipient: wallet,
        amount,
        twitter,
        github,
        idempotencyKey:
          kind === "x_tweet" && tweetId
            ? `claim:x_tweet:${twitter}:${tweetId}`
            : `claim:${kind}:${twitter}:${wallet.toLowerCase()}`,
        meta: { twitter, github, tweetId, premium: kind === "x_premium" },
      });
      signature = paid.signature;
    } catch (e) {
      const { tursoExecute } = await import("@/lib/turso");
      await tursoExecute(
        `DELETE FROM shit_claims WHERE claim_kind = ? AND wallet = ? AND signature = 'pending'`,
        [kind, wallet]
      ).catch(() => {});
      const err = e as Error & { code?: string; status?: number };
      if (err.status && err.code) {
        return Response.json(
          { error: err.message, code: err.code },
          { status: err.status }
        );
      }
      throw e;
    }

    const { tursoExecute } = await import("@/lib/turso");
    await tursoExecute(
      `UPDATE shit_claims SET signature = ? WHERE claim_kind = ? AND wallet = ? AND signature = 'pending'`,
      [signature, kind, wallet]
    );

    await recordAbuseEvent("claim", ip, twitter, {
      kind,
      amount,
      followers: profileGate.followers,
    });
    if (kind === "x_verified" || kind === "x_premium" || kind === "gh_fork") {
      await recordAbuseEvent("claim_major", ip, twitter, { kind, amount });
    }

    // Don't block response on Telegram
    const { notifyClaimTelegram } = await import("@/lib/telegram");
    void notifyClaimTelegram({
      kind,
      amount,
      twitter,
      github,
      wallet,
      signature,
      followers: profileGate.followers,
      ip,
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
