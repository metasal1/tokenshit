import { type NextRequest } from "next/server";
import {
  DAY_GAME_ENABLED,
  DAY_HOUSE_FEE_BPS,
  DAY_STAKE_AMOUNT,
  ensureRound,
  fetchRealMajorsLive,
  formatHourLabel,
  getLiveLeaders,
  getMyTickets,
  getRound,
  getTicketHeat,
  listStakes,
  majorsFromOpenSnap,
  nextUtcHourMs,
  recordStake,
  utcHourString,
  type DaySide,
} from "@/lib/day-game";
import { requirePrivy } from "@/lib/privy-server";
import { isSolanaAddress, getClientIp, rateLimitIp } from "@/lib/api-guard";
import {
  SHIT_MINT,
  TREASURY_ADDRESS,
  PLAY_POT_ADDRESS,
  PLAY_SEED_HOUR_AMOUNT,
  PLAY_SEED_DAY_CAP,
  PLAY_SEED_ENABLED,
} from "@/lib/shit-token";
import { getHourSeed } from "@/lib/play-seed";
import { priceAssetById } from "@/lib/live-prices";

export const dynamic = "force-dynamic";

/** Never hang the worker — CF kills long requests; Play UI needs a fast shell. */
function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    let done = false;
    const t = setTimeout(() => {
      if (!done) {
        done = true;
        resolve(fallback);
      }
    }, ms);
    p.then((v) => {
      if (!done) {
        done = true;
        clearTimeout(t);
        resolve(v);
      }
    }).catch(() => {
      if (!done) {
        done = true;
        clearTimeout(t);
        resolve(fallback);
      }
    });
  });
}

/**
 * GET /api/day — current hour round + live leaders + bags
 * Optional ?wallet= for myTickets
 * POST /api/day — play (multi-ticket OK; any priced bag)
 */
export async function GET(request: NextRequest) {
  try {
    const hour = utcHourString();
    await withTimeout(ensureRound(hour), 4_000, undefined as void);

    const walletQ =
      request.nextUrl.searchParams.get("wallet")?.trim() || "";

    const emptySeed = {
      amount: 0,
      signature: null as string | null,
      status: null as string | null,
    };

    const [round, stakes, majorsLive, leaders, heat, hourSeed] =
      await Promise.all([
        withTimeout(getRound(hour), 5_000, null),
        withTimeout(
          listStakes(hour),
          5_000,
          [] as Awaited<ReturnType<typeof listStakes>>
        ),
        withTimeout(
          fetchRealMajorsLive(),
          6_000,
          [] as Awaited<ReturnType<typeof fetchRealMajorsLive>>
        ),
        withTimeout(getLiveLeaders(hour), 8_000, null),
        withTimeout(
          getTicketHeat(hour),
          5_000,
          new Map() as Awaited<ReturnType<typeof getTicketHeat>>
        ),
        withTimeout(getHourSeed(hour), 4_000, emptySeed),
      ]);

    let majors = majorsLive;
    if (majors.length === 0) {
      majors = await withTimeout(majorsFromOpenSnap(hour), 4_000, []);
    }
    // Still empty → last-hour open snap
    if (majors.length === 0) {
      const prev = new Date(Date.now() - 3600_000).toISOString().slice(0, 13);
      majors = await withTimeout(majorsFromOpenSnap(prev), 4_000, []);
    }
    const hitCount = stakes.filter((s) => s.side === "hit").length;
    const shitCount = stakes.filter((s) => s.side === "shit").length;
    const uniqueHit = new Set(
      stakes.filter((s) => s.side === "hit").map((s) => s.wallet)
    ).size;
    const uniqueShit = new Set(
      stakes.filter((s) => s.side === "shit").map((s) => s.wallet)
    ).size;

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

    let myTickets: Array<{
      assetId: string;
      side: DaySide;
      tickets: number;
    }> = [];
    if (walletQ && isSolanaAddress(walletQ)) {
      myTickets = await withTimeout(getMyTickets(hour, walletQ), 4_000, []);
    }

    const pctMap = new Map(
      (leaders?.moves || []).map((x) => [x.assetId, x] as const)
    );

    const degraded =
      !round ||
      majors.length === 0 ||
      !leaders;

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
      multiTicket: true,
      treasury: TREASURY_ADDRESS,
      pot: PLAY_POT_ADDRESS,
      mint: SHIT_MINT,
      degraded,
      houseSpark: {
        enabled: PLAY_SEED_ENABLED,
        hourAmount: PLAY_SEED_HOUR_AMOUNT,
        dayCap: PLAY_SEED_DAY_CAP,
        seeded: Number(hourSeed.amount || 0),
        status: hourSeed.status,
        signature: hourSeed.signature,
      },
      round: round || {
        utcDay: hour,
        status: "open",
        hitPot: 0,
        shitPot: 0,
      },
      stats: {
        hitStakes: hitCount,
        shitStakes: shitCount,
        /** Total plays (tickets) — multi-play counts multiple */
        hitTickets: hitCount,
        shitTickets: shitCount,
        hitPlayers: uniqueHit,
        shitPlayers: uniqueShit,
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
      majors: majors.slice(0, 120).map((m) => {
        const move = pctMap.get(m.assetId);
        const h = heat.get(m.assetId);
        return {
          assetId: m.assetId,
          name: m.name,
          symbol: m.symbol,
          logo: m.logo,
          price: m.price,
          pct: move?.pct ?? null,
          openPrice: move?.openPrice ?? null,
          source: m.source || null,
          hitPlays: h?.hit || 0,
          shitPlays: h?.shit || 0,
        };
      }),
      majorsCount: majors.length,
      myTickets,
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
      limit: 200,
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

    // Any bag we can price (majors or full registry)
    const priced = await priceAssetById(assetId);
    if (!priced || !(priced.price > 0)) {
      return Response.json(
        { error: "Bag not playable yet — pick another or try again" },
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
      symbol: priced.symbol,
      amount: DAY_STAKE_AMOUNT,
      hitPot: rec.hitPot,
      shitPot: rec.shitPot,
      ticketCount: rec.ticketCount,
      multiTicket: true,
      signature,
    });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
