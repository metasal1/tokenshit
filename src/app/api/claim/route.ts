import { type NextRequest } from "next/server";
import {
  CLAIM_EMAIL_LIST,
  CLAIM_GH_FORK,
  CLAIM_JUP_VERIFIED,
  CLAIM_X_FOLLOW,
  CLAIM_X_LIKE,
  CLAIM_X_RETWEET,
  CLAIM_RT_TWEET_ID,
  CLAIM_PUMPFAST,
  CLAIM_X_PREMIUM,
  CLAIM_X_TWEET,
  CLAIM_X_VERIFIED,
  LOVE_GAS_TWEET,
  PLAY_GAS_DROP_SOL,
  PLAY_GAS_STARTER_GAMES,
  TREASURY_ADDRESS,
  loveGasTweetIntentUrl,
  ABUSE_MIN_FOLLOWERS_CLAIM,
} from "@/lib/shit-token";
import {
  checkGhFork,
  checkXFollowsTokenshit,
  checkXRetweeted,
  checkXLiked,
  checkXTweetTag,
  checkXVerified,
  getTweetClaimCooldown,
  hasClaimed,
  hasAnySuccessfulClaim,
  isOnEmailList,
  recordClaim,
  clearStalePendingClaims,
  tweetIdAlreadyClaimed,
  type ClaimKind,
} from "@/lib/claims";
import { getTreasuryBalances, getPlayPotBalances } from "@/lib/treasury";
import { payFromTreasury } from "@/lib/treasury-ledger";
import { requirePrivy } from "@/lib/privy-server";
import { assertNotBlacklisted, isGhForkClaimEnabled } from "@/lib/security";
import {
  getClientIp,
  gateClaimIp,
  gateMajorClaimIp,
  gateXProfileForClaim,
  isMajorClaimKind,
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
  x_like: CLAIM_X_LIKE,
  x_retweet: CLAIM_X_RETWEET,
  email_list: CLAIM_EMAIL_LIST,
  jup_verified: CLAIM_JUP_VERIFIED,
  /** SOL amount (not $TOKENSHIT) — 67 plays of gas */
  sol_gas_love: PLAY_GAS_DROP_SOL,
  pumpfast: CLAIM_PUMPFAST,
};

function isKind(k: string): k is ClaimKind {
  return k in AMOUNTS;
}

/** Tweet / email / Jup 5k / premium dump farms. */
const FARM_OFF = new Set<ClaimKind>([
  "x_tweet",
  "email_list",
  "jup_verified",
  "x_verified",
  "x_premium",
  "gh_fork",
]);

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
      paused: process.env.CLAIMS_ENABLED === "0",
      rules: {
        xRequired: true,
        minFollowers: ABUSE_MIN_FOLLOWERS_CLAIM,
        requirePfp: true,
        majorClaimsPerIpDay: 1,
        verified: CLAIM_X_VERIFIED,
        premium: CLAIM_X_PREMIUM,
        ghFork: CLAIM_GH_FORK,
        ghForkEnabled: isGhForkClaimEnabled(),
        emailList: CLAIM_EMAIL_LIST,
        jupVerified: CLAIM_JUP_VERIFIED,
        solGasLove: PLAY_GAS_DROP_SOL,
        solGasGames: PLAY_GAS_STARTER_GAMES,
        loveGasTweet: LOVE_GAS_TWEET,
        loveGasTweetIntent: loveGasTweetIntentUrl(),
        walletMustBePrivyLinkedToX: true,
        xCompulsoryForAllClaims: true,
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
      if (!isGhForkClaimEnabled()) {
        detail = { disabled: true, code: "gh_fork_disabled" };
        eligible = false;
      } else {
        if (!github)
          return Response.json({ error: "github required" }, { status: 400 });
        const g = await checkGhFork(github);
        detail = g;
        eligible = g.ok && g.forked;
      }
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
    } else if (kind === "x_like") {
      if (!twitter)
        return Response.json({ error: "twitter required" }, { status: 400 });
      const liked = await checkXLiked(twitter, CLAIM_RT_TWEET_ID);
      detail = liked;
      eligible = liked.ok && liked.liked;
    } else if (kind === "x_retweet") {
      if (!twitter)
        return Response.json({ error: "twitter required" }, { status: 400 });
      const tweetUrl = sp.get("tweetUrl");
      const r = await checkXRetweeted(twitter, CLAIM_RT_TWEET_ID, tweetUrl);
      detail = r;
      eligible = r.ok && r.retweeted;
    } else if (kind === "pumpfast") {
      if (!twitter)
        return Response.json({ error: "twitter required" }, { status: 400 });
      const { checkPumpfastUpvote } = await import("@/lib/pumpfast");
      const pf = await checkPumpfastUpvote({ twitter });
      detail = pf;
      eligible = pf.ok && pf.upvoted;
    } else if (kind === "email_list") {
      const email = sp.get("email");
      const list = await isOnEmailList({
        email,
        twitter,
        wallet,
      });
      detail = list;
      eligible = list.ok;
    } else if (kind === "jup_verified") {
      if (!twitter)
        return Response.json({ error: "twitter required" }, { status: 400 });
      const { userLikedTokenOnVrfd } = await import("@/lib/jup-vrfd");
      const like = await userLikedTokenOnVrfd({ twitter });
      detail = like;
      eligible = like.liked;
    } else if (kind === "sol_gas_love") {
      if (!twitter)
        return Response.json({ error: "twitter required" }, { status: 400 });
      const tweetUrl = sp.get("tweetUrl");
      const prior = await hasAnySuccessfulClaim({ twitter, wallet });
      const { hasReceivedGasDrop } = await import("@/lib/gas-drop");
      const gasDone = wallet ? await hasReceivedGasDrop(wallet) : false;
      let tweetOk = false;
      let tweetDetail: Record<string, unknown> = {};
      if (tweetUrl) {
        const tw = await checkXTweetTag(twitter, tweetUrl);
        const { isExactLoveGasTweet } = await import("@/lib/love-gas-tweet");
        tweetOk = !!(tw.ok && tw.found && tw.text && isExactLoveGasTweet(tw.text));
        tweetDetail = { ...tw, exactLove: tweetOk };
      }
      detail = {
        priorClaim: prior,
        gasDone,
        tweet: tweetDetail,
        requiredText: LOVE_GAS_TWEET,
        intent: loveGasTweetIntentUrl(),
        games: PLAY_GAS_STARTER_GAMES,
        sol: PLAY_GAS_DROP_SOL,
      };
      eligible = !prior && !gasDone && (!tweetUrl || tweetOk);
    }

    // Follow is required for every claim except the follow reward itself
    let following: boolean | null = null;
    let followClaimed = false;
    if (twitter) {
      followClaimed = await hasClaimed("x_follow", {
        twitter,
        github,
        wallet,
      });
      if (kind === "x_follow") {
        following = eligible ? true : null;
      } else if (followClaimed) {
        following = true;
      } else {
        const f = await checkXFollowsTokenshit(twitter);
        following = f.ok ? !!f.following : null;
      }
      if (kind !== "x_follow") {
        // Need durable follow claim; live not-following also blocks
        if (!followClaimed || following === false) {
          eligible = false;
          detail = {
            ...detail,
            mustFollowFirst: true,
            following,
            followClaimed,
          };
        }
      }
    }

    const claimed = await hasClaimed(kind, { twitter, github, wallet });
    const bal = await getTreasuryBalances().catch(() => null);
    const amount = AMOUNTS[kind];
    const followOk =
      kind === "x_follow" ||
      (followClaimed && following !== false);
    const canClaim =
      kind === "sol_gas_love"
        ? eligible && !claimed && followOk
        : eligible &&
          !claimed &&
          (bal?.shit ?? 0) >= amount &&
          followOk;

    return Response.json({
      kind,
      amount,
      eligible: eligible && followOk,
      claimed,
      canClaim,
      following,
      followClaimed,
      mustFollowFirst: kind !== "x_follow",
      treasuryShit: bal?.shit ?? null,
      unit: kind === "sol_gas_love" ? "SOL" : "TOKENSHIT",
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
            "Claims paused. Play for prizes instead.",
          code: "claims_paused",
        },
        { status: 503 }
      );
    }

    const ip = getClientIp(request);
    const body = await request.json();
    const kindRaw = String(body.kind || "");
    if (!isKind(kindRaw)) {
      return Response.json({ error: "Invalid claim kind" }, { status: 400 });
    }
    if (kindRaw === "sol_gas_love") {
      return Response.json(
        {
          error: "No SOL on claims. Play is free — no gas drop.",
          code: "gas_claims_off",
        },
        { status: 410 }
      );
    }
    if (FARM_OFF.has(kindRaw as ClaimKind)) {
      return Response.json(
        {
          error:
            "That claim is off. Follow + like + RT/QT the promo to earn. Follow once (1,000). Like 500. RT/QT 500.",
          code: "farm_off",
        },
        { status: 410 }
      );
    }
    const kind = kindRaw;

    // Major (premium/verified/gh): own 1/IP/day bucket only.
    // Bulk gate was wrongly blocking X Premium when shared CGNAT/mobile
    // networks already hit the tweet/follow daily cap.
    if (isMajorClaimKind(kind)) {
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
    } else {
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
      if (
        balPeek &&
        balPeek.shit < amountPeek
      ) {
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
      if (balPeek && balPeek.sol < 0.002) {
        return Response.json(
          {
            error: "Treasury needs more SOL for fees/ATA rent",
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

    // HARD GATE: Follow @Tokenshit_ before ANY other claim
    // 1) Durable: must have successfully claimed x_follow (paid follow reward)
    // 2) Live: when X APIs work, still following (blocks unfollow-after-claim)
    if (kind !== "x_follow") {
      const followedClaim = await hasClaimed("x_follow", {
        twitter,
        github,
        wallet,
      });
      if (!followedClaim) {
        await recordAbuseEvent("claim_blocked", ip, twitter, {
          reason: "must_follow_first",
          kind,
        });
        return Response.json(
          {
            error:
              "Follow @Tokenshit_ and claim the Follow reward first — required before RT / tweet / anything else.",
            code: "must_follow_first",
            followUrl: `https://x.com/intent/follow?screen_name=Tokenshit_`,
          },
          { status: 403 }
        );
      }

      const followGate = await checkXFollowsTokenshit(twitter);
      // Only hard-block on a conclusive "not following". API outages fall back to durable claim.
      if (followGate.ok && !followGate.following) {
        await recordAbuseEvent("claim_blocked", ip, twitter, {
          reason: "unfollowed_after_claim",
          kind,
        });
        return Response.json(
          {
            error:
              "You unfollowed @Tokenshit_. Follow again before claiming.",
            code: "must_follow_first",
            followUrl: `https://x.com/intent/follow?screen_name=Tokenshit_`,
          },
          { status: 403 }
        );
      }
    }

    if (!twitter) {
      return Response.json({ error: "twitter required" }, { status: 400 });
    }

    let amount = AMOUNTS[kind];
    let tweetId: string | undefined;

    if (kind === "x_verified" || kind === "x_premium") {
      // Reuse profileGate (same fetchXUserPublic / 5m cache) — avoid second
      // cold X lookup which made premium/verified claims feel laggy.
      const x = {
        ok: true as const,
        premium: !!profileGate.premium,
        verified: !!profileGate.verified,
        verifiedType: profileGate.premium
          ? "premium"
          : profileGate.verified
            ? "verified"
            : "none",
      };
      if (kind === "x_premium") {
        if (!x.premium)
          return Response.json(
            {
              error:
                "X Premium (blue) required for this reward. Non-premium verified can claim the verified tier instead.",
              code: "not_premium",
              verifiedType: x.verifiedType,
              verified: !!x.verified,
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
                "You have X Premium — use the Premium claim instead of Verified.",
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
      if (!isGhForkClaimEnabled()) {
        return Response.json(
          {
            error: "GitHub fork claim is disabled.",
            code: "gh_fork_disabled",
          },
          { status: 403 }
        );
      }
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
              "No fork of solana-foundation/tokens found on this GitHub account. Fork https://github.com/solana-foundation/tokens then retry.",
            detail: g,
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
              "No tweet with @Tokenshit_ + solana:CA found. Post fresh (<24h) with solana:<mint>, paste link, claim.",
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
    } else if (kind === "x_like") {
      const liked = await checkXLiked(twitter, CLAIM_RT_TWEET_ID);
      if (!liked.liked) {
        return Response.json(
          {
            error:
              liked.error ||
              "Like the promo post (heart), then claim. Jupiter VRFD like also counts.",
            code: "not_liked",
            target: CLAIM_RT_TWEET_ID,
          },
          { status: 403 }
        );
      }
      amount = CLAIM_X_LIKE;
    } else if (kind === "x_retweet") {
      const tweetUrl = body.tweetUrl ? String(body.tweetUrl).trim() : "";
      const r = await checkXRetweeted(twitter, CLAIM_RT_TWEET_ID, tweetUrl || null);
      if (!r.ok && r.error && /paste|could not load|API/i.test(r.error)) {
        return Response.json(
          {
            error: r.error,
            code: "rt_verify_failed",
            target: CLAIM_RT_TWEET_ID,
          },
          { status: 502 }
        );
      }
      if (!r.retweeted) {
        return Response.json(
          {
            error:
              r.error ||
              "Retweet the promo post (or quote it and paste your status URL), then claim.",
            code: "not_retweeted",
            target: CLAIM_RT_TWEET_ID,
          },
          { status: 403 }
        );
      }
      amount = CLAIM_X_RETWEET;
      if (r.evidenceTweetId) tweetId = r.evidenceTweetId;
    } else if (kind === "pumpfast") {
      const { checkPumpfastUpvote, PUMPFAST_TOKEN_URL } = await import(
        "@/lib/pumpfast"
      );
      const pf = await checkPumpfastUpvote({
        twitter,
        twitterId: auth.id.twitterId,
      });
      if (!pf.ok) {
        return Response.json(
          { error: pf.error || "PumpFast upvote check failed", code: "pumpfast_check_failed" },
          { status: 502 }
        );
      }
      if (!pf.upvoted) {
        return Response.json(
          {
            error:
              "Upvote TOKENSHIT on pumpfa.st with this X account, then claim. Same @handle as login.",
            code: "not_upvoted",
            upvoteUrl: PUMPFAST_TOKEN_URL,
          },
          { status: 403 }
        );
      }
      amount = CLAIM_PUMPFAST;
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
    } else if (kind === "jup_verified") {
      // User must like TOKENSHIT on verified.jup.ag with the same X handle
      const { userLikedTokenOnVrfd, JUP_VRFD_DASHBOARD } = await import(
        "@/lib/jup-vrfd"
      );
      const like = await userLikedTokenOnVrfd({
        twitter,
        twitterId: auth.id.twitterId,
      });
      if (!like.liked) {
        return Response.json(
          {
            error:
              "Like $TOKENSHIT on Jupiter VRFD with this X account, then claim. Same @handle as login.",
            code: "not_jup_liked",
            dashboard: like.dashboard || JUP_VRFD_DASHBOARD(),
            likes: like.likes,
          },
          { status: 403 }
        );
      }
      amount = CLAIM_JUP_VERIFIED;
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
    if (kind !== "x_follow" && bal.sol < 0.0015) {
      // still allow if pot can sponsor gas (sendShitFromTreasury allowPlayPotFeePayer)
      const pot = await getPlayPotBalances().catch(() => null);
      if (!pot || pot.sol < 0.005) {
        return Response.json(
          {
            error:
              "Claims temporarily need SOL for network fees. We’re topping up — retry in a minute.",
            code: "treasury_sol_low",
            treasury: bal.address,
            sol: bal.sol,
            potSol: pot?.sol ?? null,
          },
          { status: 503 }
        );
      }
    }

    // Clear abandoned pending rows so retries aren't blocked
    await clearStalePendingClaims({ kind, twitter, github, wallet });
    // Also clear fresh pending for this identity (failed mid-flight last attempt)
    {
      const { tursoExecute } = await import("@/lib/turso");
      await tursoExecute(
        `DELETE FROM shit_claims
         WHERE claim_kind = ? AND signature = 'pending'
           AND (
             (twitter IS NOT NULL AND lower(twitter) = lower(?))
             OR wallet = ?
           )`,
        [kind, twitter || "", wallet]
      ).catch(() => {});
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
      const err = e as Error & { code?: string; status?: number };
      // Paid on-chain (or healed) — do NOT wipe the claim row
      if (err.code === "already_paid") {
        return Response.json(
          {
            error: "Already paid for this claim",
            code: "already_paid",
          },
          { status: 409 }
        );
      }
      const { tursoExecute } = await import("@/lib/turso");
      await tursoExecute(
        `DELETE FROM shit_claims WHERE claim_kind = ? AND wallet = ? AND signature = 'pending'`,
        [kind, wallet]
      ).catch(() => {});
      if (kind === "x_follow") {
        return Response.json(
          {
            ok: true,
            paid: false,
            retry: true,
            kind,
            amount,
            wallet,
            code: "claim_later",
            error:
              "Follow counted. 1,000 $TOKENSHIT waiting — tap Claim follow again later (no gas from us).",
          },
          { status: 202 }
        );
      }
      if (err.status && err.code) {
        return Response.json(
          { error: err.message, code: err.code },
          { status: err.status }
        );
      }
      const msg = err.message || String(e);
      if (/recipient_needs_ata/i.test(msg)) {
        return Response.json(
          {
            ok: true,
            paid: false,
            retry: true,
            kind,
            amount,
            wallet,
            code: "need_ata",
            error:
              "No $TOKENSHIT account on this wallet yet. We never pay gas. Add a tiny bit of SOL, open TOKENSHIT once, then claim.",
          },
          { status: 202 }
        );
      }
      if (/RPC HTTP 429|rate limit|RPC busy|too many requests/i.test(msg)) {
        return Response.json(
          {
            error:
              "Solana RPC busy (rate limit). Wait a few seconds and claim again.",
            code: "rpc_rate_limit",
            retry: true,
          },
          { status: 503 }
        );
      }
      if (/RPC HTTP 5|RPC unavailable|fetch failed|ECONNRESET/i.test(msg)) {
        return Response.json(
          {
            error: "Network blip talking to Solana. Tap claim again.",
            code: "rpc_upstream",
            retry: true,
          },
          { status: 503 }
        );
      }
      throw e;
    }

    const { tursoExecute } = await import("@/lib/turso");
    await tursoExecute(
      `UPDATE shit_claims SET signature = ? WHERE claim_kind = ? AND wallet = ? AND signature = 'pending'`,
      [signature, kind, wallet]
    );

    await recordAbuseEvent(
      isMajorClaimKind(kind) ? "claim_major" : "claim",
      ip,
      twitter,
      {
        kind,
        amount,
        followers: profileGate.followers,
      }
    );

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

    // Play is FREE — never auto-send SOL on claims.
    return Response.json({
      ok: true,
      kind,
      amount,
      wallet,
      signature,
      tweetId,
      unit: "TOKENSHIT",
      solscan: `https://solscan.io/tx/${signature}`,
      gasDrop: null,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("UNIQUE") || msg.includes("unique")) {
      return Response.json({ error: "Already claimed" }, { status: 409 });
    }
    if (/RPC HTTP 429|rate limit|RPC busy|too many requests/i.test(msg)) {
      return Response.json(
        {
          error:
            "Solana RPC busy (rate limit). Wait a few seconds and claim again.",
          code: "rpc_rate_limit",
          retry: true,
        },
        { status: 503 }
      );
    }
    if (/RPC HTTP 5|RPC unavailable|fetch failed|ECONNRESET/i.test(msg)) {
      return Response.json(
        {
          error: "Network blip talking to Solana. Tap claim again.",
          code: "rpc_upstream",
          retry: true,
        },
        { status: 503 }
      );
    }
    return Response.json({ error: msg }, { status: 500 });
  }
}
