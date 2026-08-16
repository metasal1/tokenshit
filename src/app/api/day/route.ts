import { type NextRequest } from "next/server";
import {
  DAY_GAME_ENABLED,
  DAY_HOUSE_FEE_BPS,
  DAY_STAKE_AMOUNT,
  ensureRound,
  fetchRealMajorsLive,
  formatHourLabel,
  getLiveLeaders,
  getRound,
  listStakes,
  nextUtcHourMs,
  recordStake,
  utcHourString,
  type DaySide,
} from "@/lib/day-game";
import { requirePrivy } from "@/lib/privy-server";
import { isSolanaAddress, getClientIp, rateLimitIp } from "@/lib/api-guard";
import { SHIT_MINT, TREASURY_ADDRESS, PLAY_POT_ADDRESS } from "@/lib/shit-token";

export const dynamic = "force-dynamic";

/**
 * GET /api/day — current hour round + live hitting/shitting
 * POST /api/day — stake
 */
export async function GET() {
  try {
    const hour = utcHourString();
    await ensureRound(hour);
    const [round, stakes, majors, leaders] = await Promise.all([
      getRound(hour),
      listStakes(hour),
      fetchRealMajorsLive().catch(() => []),
      getLiveLeaders(hour).catch(() => null),
    ]);

    const hitCount = stakes.filter((s) => s.side === "hit").length;
    const shitCount = stakes.filter((s) => s.side === "shit").length;
    const uniqueHit = new Set(
      stakes.filter((s) => s.side === "hit").map((s) => s.wallet)
    ).size;
    const uniqueShit = new Set(
      stakes.filter((s) => s.side === "shit").map((s) => s.wallet)
    ).size;

    // stake pressure on current leaders
    const hitLeaderId = leaders?.hitting?.assetId;
    const shitLeaderId = leaders?.shitting?.assetId;
    const stakesOnHitting = hitLeaderId
      ? stakes.filter((s) => s.side === "hit" && s.assetId === hitLeaderId)
          .length
      : 0;
    const stakesOnShitting = shitLeaderId
      ? stakes.filter((s) => s.side === "shit" && s.assetId === shitLeaderId)
          .length
      : 0;

    return Response.json({
      enabled: DAY_GAME_ENABLED,
      cadence: "hourly",
      utcDay: hour,
      utcHour: hour,
      hourLabel: formatHourLabel(hour),
      msToClose: Math.max(0, nextUtcHourMs() - Date.now()),
      nextCloseAt: new Date(nextUtcHourMs()).toISOString(),
      stakeAmount: DAY_STAKE_AMOUNT,
      houseFeeBps: DAY_HOUSE_FEE_BPS,
      treasury: TREASURY_ADDRESS,
      pot: PLAY_POT_ADDRESS,
      mint: SHIT_MINT,
      round,
      stats: {
        hitStakes: hitCount,
        shitStakes: shitCount,
        hitTickets: uniqueHit,
        shitTickets: uniqueShit,
      },
      leaders: leaders
        ? {
            hitting: leaders.hitting,
            shitting: leaders.shitting,
            topHit: leaders.topHit,
            topShit: leaders.topShit,
            stakesOnHitting,
            stakesOnShitting,
            compared: leaders.compared,
          }
        : null,
      majors: (() => {
        const pctMap = new Map(
          (leaders?.moves || []).map((x) => [x.assetId, x] as const)
        );
        return majors.slice(0, 120).map((m) => {
          const move = pctMap.get(m.assetId);
          return {
            assetId: m.assetId,
            name: m.name,
            symbol: m.symbol,
            logo: m.logo,
            price: m.price,
            pct: move?.pct ?? null,
            openPrice: move?.openPrice ?? null,
            source: m.source || null,
          };
        });
      })(),
      majorsCount: majors.length,
    });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!DAY_GAME_ENABLED) {
      return Response.json({ error: "Hour game paused" }, { status: 503 });
    }
    const ip = getClientIp(request);
    const limited = await rateLimitIp({
      ip,
      bucket: "day_stake",
      limit: 60,
      windowHours: 1,
    });
    if (limited) return limited;

    const body = await request.json();
    let wallet = String(body.wallet || "").trim();
    const assetId = String(body.assetId || "").trim();
    const side = String(body.side || "").toLowerCase() as DaySide;
    const signature = String(body.signature || body.sig || "").trim();

    if (!isSolanaAddress(wallet)) {
      return Response.json({ error: "invalid wallet" }, { status: 400 });
    }
    if (!assetId) {
      return Response.json({ error: "assetId required" }, { status: 400 });
    }
    if (side !== "hit" && side !== "shit") {
      return Response.json({ error: "side must be hit|shit" }, { status: 400 });
    }
    if (!signature || signature.length < 40) {
      return Response.json(
        { error: "on-chain transfer signature required" },
        { status: 400 }
      );
    }

    const auth = await requirePrivy(request, {
      wallet,
      requireTwitter: true,
      requireLinkedWallet: true,
      body: body as Record<string, unknown>,
    });
    if (!auth.ok) return auth.res;

    if (auth.id.wallets.length === 1) {
      wallet = auth.id.wallets[0]!;
    } else if (auth.id.wallets.length > 1) {
      const match = auth.id.wallets.find(
        (w) => w.toLowerCase() === wallet.toLowerCase()
      );
      if (!match) {
        return Response.json(
          { error: "Wallet must be linked to your X account" },
          { status: 403 }
        );
      }
      wallet = match;
    }

    const majors = await fetchRealMajorsLive();
    if (!majors.some((m) => m.assetId === assetId)) {
      return Response.json(
        { error: "asset must be a real major" },
        { status: 400 }
      );
    }

    const hour = utcHourString();
    const rec = await recordStake({
      utcDay: hour,
      wallet,
      assetId,
      side,
      signature,
      twitter: auth.id.twitter,
    });
    if (!rec.ok) {
      return Response.json({ error: rec.error }, { status: rec.status });
    }

    return Response.json({
      ok: true,
      utcDay: hour,
      utcHour: hour,
      side,
      assetId,
      amount: DAY_STAKE_AMOUNT,
      hitPot: rec.hitPot,
      shitPot: rec.shitPot,
      signature,
    });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
