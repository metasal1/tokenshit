import { type NextRequest } from "next/server";
import {
  CLAIM_GH_FORK,
  CLAIM_X_VERIFIED,
  TREASURY_ADDRESS,
} from "@/lib/shit-token";
import {
  checkGhFork,
  checkXVerified,
  hasClaimed,
  recordClaim,
  type ClaimKind,
} from "@/lib/claims";
import { getTreasuryBalances, sendShitFromTreasury } from "@/lib/treasury";

export const dynamic = "force-dynamic";

const SOLANA_ADDR = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const kind = (sp.get("kind") || "") as ClaimKind;
  const twitter = sp.get("twitter");
  const github = sp.get("github");
  const wallet = sp.get("wallet");

  if (kind !== "x_verified" && kind !== "gh_fork") {
    return Response.json({
      amounts: { x_verified: CLAIM_X_VERIFIED, gh_fork: CLAIM_GH_FORK },
      treasury: TREASURY_ADDRESS,
    });
  }

  try {
    let eligible = false;
    let detail: Record<string, unknown> = {};
    if (kind === "x_verified") {
      if (!twitter)
        return Response.json({ error: "twitter required" }, { status: 400 });
      const x = await checkXVerified(twitter);
      detail = x;
      eligible = x.ok && x.verified;
    } else {
      if (!github)
        return Response.json({ error: "github required" }, { status: 400 });
      const g = await checkGhFork(github);
      detail = g;
      eligible = g.ok && g.forked;
    }

    const claimed = await hasClaimed(kind, { twitter, github, wallet });
    const bal = await getTreasuryBalances().catch(() => null);
    const amount = kind === "x_verified" ? CLAIM_X_VERIFIED : CLAIM_GH_FORK;

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
    const body = await request.json();
    const kind = body.kind as ClaimKind;
    const wallet = String(body.wallet || "").trim();
    const twitter = body.twitter ? String(body.twitter).replace(/^@/, "") : null;
    const github = body.github ? String(body.github).replace(/^@/, "") : null;

    if (kind !== "x_verified" && kind !== "gh_fork") {
      return Response.json({ error: "Invalid claim kind" }, { status: 400 });
    }
    if (!SOLANA_ADDR.test(wallet)) {
      return Response.json({ error: "Valid Solana wallet required" }, { status: 400 });
    }

    const amount = kind === "x_verified" ? CLAIM_X_VERIFIED : CLAIM_GH_FORK;

    if (kind === "x_verified") {
      if (!twitter)
        return Response.json({ error: "Twitter handle required" }, { status: 400 });
      const x = await checkXVerified(twitter);
      if (!x.ok)
        return Response.json({ error: x.error || "X check failed" }, { status: 502 });
      if (!x.verified)
        return Response.json(
          { error: "X account is not verified", verifiedType: x.verifiedType },
          { status: 403 }
        );
    } else {
      if (!github)
        return Response.json({ error: "GitHub username required" }, { status: 400 });
      const g = await checkGhFork(github);
      if (!g.ok)
        return Response.json({ error: g.error || "GitHub check failed" }, { status: 502 });
      if (!g.forked)
        return Response.json(
          {
            error:
              "No fork of solana-foundation/tokens found on this GitHub account",
          },
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

    const { signature } = await sendShitFromTreasury(wallet, amount);
    await recordClaim({
      kind,
      twitter,
      github,
      wallet,
      amount,
      signature,
    });

    return Response.json({
      ok: true,
      kind,
      amount,
      wallet,
      signature,
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
