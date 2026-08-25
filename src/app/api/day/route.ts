import { type NextRequest } from "next/server";
import {
  DAY_GAME_ENABLED,
  DAY_HOUSE_FEE_BPS,
  DAY_STAKE_AMOUNT,
  FREE_PLAY,
  HOUR_PRIZE,
  PLAY_MAX_PICKS,
  PLAY_MIN_BALANCE,
  PLAY_REQUIRE_FOLLOW,
  countWalletPicks,
  ensureRound,
  fetchRealMajorsLive,
  formatHourLabel,
  getHourPrizePool,
  getLiveLeaders,
  getMyTickets,
  getRound,
  getTicketHeat,
  getWalletShitUi,
  listStakes,
  majorsFromOpenSnap,
  nextUtcHourMs,
  recordStake,
  utcHourString,
  type DaySide,
  type MajorSnap,
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
import {
  fetchPythUsdBySymbols,
  HOUR_BOARD_SYMBOLS,
} from "@/lib/pyth-prices";
import {
  knownLogo,
  loadLogoMaps,
  resolveLogo,
  seedKnownLogos,
  upsertAssetLogos,
} from "@/lib/asset-logos";

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

/** Fast board bags via Pyth only (no Tokens.xyz). */
async function boardMajorsPyth(): Promise<MajorSnap[]> {
  const prices = await withTimeout(
    fetchPythUsdBySymbols([...HOUR_BOARD_SYMBOLS]),
    2_500,
    new Map<string, number>()
  );
  const out: MajorSnap[] = [];
  for (const sym of HOUR_BOARD_SYMBOLS) {
    const p = prices.get(sym) ?? prices.get(sym.toUpperCase());
    if (!(p && p > 0)) continue;
    out.push({
      assetId: sym.toLowerCase(),
      price: p,
      volume24h: 0,
      name: sym,
      symbol: sym,
      logo: knownLogo(sym),
      source: "pyth",
    });
  }
  return out;
}

/**
 * GET /api/day — current hour round + live leaders + bags
 * Optional ?wallet= for myTickets
 * POST /api/day — play (multi-ticket OK; any priced bag)
 */
export async function GET(request: NextRequest) {
  const t0 = Date.now();
  try {
    const hour = utcHourString();
    const walletQ =
      request.nextUrl.searchParams.get("wallet")?.trim() || "";

    const emptySeed = {
      amount: 0,
      signature: null as string | null,
      status: null as string | null,
    };

    // Everything in parallel — short timeouts so mobile never spins forever
    const [
      _ensured,
      round,
      stakes,
      majorsLive,
      majorsSnap,
      majorsPyth,
      leaders,
      heat,
      hourSeed,
    ] = await Promise.all([
      withTimeout(ensureRound(hour), 2_000, undefined as void),
      withTimeout(getRound(hour), 2_500, null),
      withTimeout(
        listStakes(hour),
        2_500,
        [] as Awaited<ReturnType<typeof listStakes>>
      ),
      withTimeout(
        fetchRealMajorsLive(),
        10_000,
        [] as Awaited<ReturnType<typeof fetchRealMajorsLive>>
      ),
      withTimeout(majorsFromOpenSnap(hour), 2_000, [] as MajorSnap[]),
      withTimeout(boardMajorsPyth(), 2_800, [] as MajorSnap[]),
      withTimeout(getLiveLeaders(hour), 3_000, null),
      withTimeout(
        getTicketHeat(hour),
        2_000,
        new Map() as Awaited<ReturnType<typeof getTicketHeat>>
      ),
      withTimeout(getHourSeed(hour), 2_000, emptySeed),
    ]);

    const prizePool = await withTimeout(
      getHourPrizePool(hour),
      2_000,
      { base: HOUR_PRIZE, jackpot: 0, total: HOUR_PRIZE }
    );

    let majors =
      majorsLive.length > 0
        ? majorsLive
        : majorsSnap.length > 0
          ? majorsSnap
          : majorsPyth;

    // Last resort: previous hour snap
    if (majors.length === 0) {
      const prev = new Date(Date.now() - 3600_000).toISOString().slice(0, 13);
      majors = await withTimeout(majorsFromOpenSnap(prev), 1_500, []);
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
      myTickets = await withTimeout(getMyTickets(hour, walletQ), 2_000, []);
    }

    const pctMap = new Map(
      (leaders?.moves || []).map((x) => [x.assetId, x] as const)
    );

    // Open prices by id + symbol for hour % when leaders sparse
    const openById = new Map(
      majorsSnap.map((m) => [m.assetId, m.price] as const)
    );
    const openBySym = new Map(
      majorsSnap.map((m) => [m.symbol.toUpperCase(), m.price] as const)
    );

    // Persist live logos + seed full known board set
    void Promise.all([
      upsertAssetLogos(
        [...majorsLive, ...majorsSnap, ...majors].map((m) => ({
          assetId: m.assetId,
          symbol: m.symbol,
          logo: m.logo || knownLogo(m.symbol) || knownLogo(m.assetId),
        }))
      ),
      seedKnownLogos(),
    ]).catch(() => {});

    const logoMaps = await withTimeout(
      loadLogoMaps({
        assetIds: majors.map((m) => m.assetId),
        symbols: majors.map((m) => m.symbol),
      }),
      1_500,
      { byId: new Map<string, string>(), bySym: new Map<string, string>() }
    );

    const degraded =
      !round || majors.length === 0 || !leaders || majorsLive.length === 0;

    const majorsOut = majors.slice(0, 500).map((m) => {
      const move = pctMap.get(m.assetId);
      // also match leaders by symbol if id differs (pyth board vs txyz)
      const moveBySym =
        !move && leaders?.moves
          ? leaders.moves.find(
              (x) =>
                (x.symbol || "").toUpperCase() ===
                (m.symbol || "").toUpperCase()
            )
          : null;
      const mv = move || moveBySym || null;

      let pct = mv?.pct ?? null;
      let openPrice = mv?.openPrice ?? null;
      if (pct == null && m.price > 0) {
        const op =
          openById.get(m.assetId) ??
          openBySym.get((m.symbol || "").toUpperCase()) ??
          null;
        if (op && op > 0) {
          openPrice = op;
          pct = ((m.price - op) / op) * 100;
        }
      }
      // Tokens.xyz 1h as fallback when hour baseline missing
      if (
        (pct == null || !Number.isFinite(pct)) &&
        m.change1h != null &&
        Number.isFinite(m.change1h) &&
        Math.abs(m.change1h) < 80 // reject absurd feed spikes
      ) {
        pct = m.change1h;
      }
      // Cap absurd hour % from bad open snaps
      if (pct != null && Number.isFinite(pct) && Math.abs(pct) > 80) {
        if (
          m.change1h != null &&
          Number.isFinite(m.change1h) &&
          Math.abs(m.change1h) < 80
        ) {
          pct = m.change1h;
        } else {
          pct = null;
        }
      }

      const h = heat.get(m.assetId);
      const logo = resolveLogo(m.assetId, m.symbol, m.logo, logoMaps);

      return {
        assetId: m.assetId,
        name: m.name,
        symbol: m.symbol,
        logo,
        price: m.price,
        pct: pct != null && Number.isFinite(pct) ? pct : null,
        openPrice,
        source: m.source || null,
        hitPlays: h?.hit || 0,
        shitPlays: h?.shit || 0,
      };
    });

    return Response.json({
      enabled: DAY_GAME_ENABLED,
      freePlay: FREE_PLAY,
      cadence: "hourly",
      utcDay: hour,
      utcHour: hour,
      hourLabel: formatHourLabel(hour),
      msToClose: Math.max(0, nextUtcHourMs() - Date.now()),
      nextCloseAt: new Date(nextUtcHourMs()).toISOString(),
      stakeAmount: FREE_PLAY ? 0 : DAY_STAKE_AMOUNT,
      houseFeeBps: DAY_HOUSE_FEE_BPS,
      maxPicks: PLAY_MAX_PICKS,
      minBalance: PLAY_MIN_BALANCE,
      requireFollow: PLAY_REQUIRE_FOLLOW,
      prize: prizePool,
      multiTicket: true,
      treasury: TREASURY_ADDRESS,
      pot: PLAY_POT_ADDRESS,
      mint: SHIT_MINT,
      degraded,
      ms: Date.now() - t0,
      houseSpark: {
        enabled: !FREE_PLAY && PLAY_SEED_ENABLED,
        hourAmount: PLAY_SEED_HOUR_AMOUNT,
        dayCap: PLAY_SEED_DAY_CAP,
        seeded: Number(hourSeed.amount || 0),
        status: hourSeed.status,
        signature: hourSeed.signature,
      },
      round: round
        ? {
            ...round,
            hitPot: FREE_PLAY
              ? Math.floor(prizePool.total / 2)
              : round.hitPot,
            shitPot: FREE_PLAY
              ? prizePool.total - Math.floor(prizePool.total / 2)
              : round.shitPot,
          }
        : {
            utcDay: hour,
            status: "open",
            hitPot: FREE_PLAY ? Math.floor(prizePool.total / 2) : 0,
            shitPot: FREE_PLAY
              ? prizePool.total - Math.floor(prizePool.total / 2)
              : 0,
          },
      stats: {
        hitStakes: hitCount,
        shitStakes: shitCount,
        hitTickets: hitCount,
        shitTickets: shitCount,
        hitPlayers: uniqueHit,
        shitPlayers: uniqueShit,
        players: new Set(stakes.map((s) => s.wallet)).size,
        plays: stakes.length,
      },
      leaders: leaders
        ? {
            hitting: leaders.hitting
              ? {
                  ...leaders.hitting,
                  logo: resolveLogo(
                    leaders.hitting.assetId,
                    leaders.hitting.symbol,
                    leaders.hitting.logo,
                    logoMaps
                  ),
                }
              : null,
            shitting: leaders.shitting
              ? {
                  ...leaders.shitting,
                  logo: resolveLogo(
                    leaders.shitting.assetId,
                    leaders.shitting.symbol,
                    leaders.shitting.logo,
                    logoMaps
                  ),
                }
              : null,
            topHit: leaders.topHit,
            topShit: leaders.topShit,
            stakesOnHitting,
            stakesOnShitting,
            compared: leaders.compared,
          }
        : null,
      majors: majorsOut,
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
    // Batch: { picks: [{ assetId, side }, ...] } or single assetId/side
    const rawPicks = Array.isArray(body.picks) ? body.picks : null;
    const singleAssetId = String(body.assetId || "").trim();
    const singleSide = String(body.side || "").toLowerCase() as DaySide;
    const signature = String(body.signature || body.sig || "").trim();

    if (!isSolanaAddress(wallet)) {
      return Response.json({ error: "invalid wallet" }, { status: 400 });
    }

    type PickIn = { assetId: string; side: DaySide };
    let picks: PickIn[] = [];
    if (rawPicks && rawPicks.length) {
      for (const p of rawPicks) {
        const assetId = String((p as { assetId?: string })?.assetId || "").trim();
        const side = String(
          (p as { side?: string })?.side || ""
        ).toLowerCase() as DaySide;
        if (!assetId) continue;
        if (side !== "hit" && side !== "shit") {
          return Response.json(
            { error: "each pick side must be hit|shit" },
            { status: 400 }
          );
        }
        picks.push({ assetId, side });
      }
      if (!picks.length) {
        return Response.json({ error: "no valid picks" }, { status: 400 });
      }
      if (picks.length > PLAY_MAX_PICKS) {
        return Response.json(
          { error: `Max ${PLAY_MAX_PICKS} picks at once` },
          { status: 400 }
        );
      }
    } else {
      if (!singleAssetId) {
        return Response.json({ error: "assetId required" }, { status: 400 });
      }
      if (singleSide !== "hit" && singleSide !== "shit") {
        return Response.json({ error: "side must be hit|shit" }, { status: 400 });
      }
      picks = [{ assetId: singleAssetId, side: singleSide }];
    }

    if (!FREE_PLAY && (!signature || signature.length < 40)) {
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

    const hour = utcHourString();
    const locked: Array<{
      assetId: string;
      side: DaySide;
      symbol?: string;
      ok: boolean;
      error?: string;
    }> = [];
    let lastRec: Awaited<ReturnType<typeof recordStake>> | null = null;

    for (const pick of picks) {
      const priced = await priceAssetById(pick.assetId);
      if (!priced || !(priced.price > 0)) {
        locked.push({
          assetId: pick.assetId,
          side: pick.side,
          ok: false,
          error: "Bag not playable yet",
        });
        continue;
      }
      const rec = await recordStake({
        utcDay: hour,
        wallet,
        assetId: pick.assetId,
        side: pick.side,
        signature: FREE_PLAY ? undefined : signature,
        twitter: auth.id.twitter,
      });
      if (!rec.ok) {
        locked.push({
          assetId: pick.assetId,
          side: pick.side,
          symbol: priced.symbol,
          ok: false,
          error: rec.error,
        });
        // stop batch on hard gates (balance/follow/max)
        if (rec.status === 403 || /Max \d+ tokens/i.test(rec.error)) {
          lastRec = rec;
          break;
        }
        continue;
      }
      lastRec = rec;
      locked.push({
        assetId: pick.assetId,
        side: pick.side,
        symbol: priced.symbol,
        ok: true,
      });
    }

    const okCount = locked.filter((l) => l.ok).length;
    if (okCount === 0) {
      const err =
        (lastRec && !lastRec.ok && lastRec.error) ||
        locked.find((l) => l.error)?.error ||
        "Play failed";
      const status =
        lastRec && !lastRec.ok ? lastRec.status : 400;
      return Response.json({ error: err, locked }, { status });
    }

    const prize = await getHourPrizePool(hour);
    const picksUsed =
      lastRec && lastRec.ok
        ? lastRec.picksUsed
        : await countWalletPicks(hour, wallet);

    return Response.json({
      ok: true,
      freePlay: FREE_PLAY,
      utcDay: hour,
      utcHour: hour,
      locked,
      lockedCount: okCount,
      amount: 0,
      hitPot: lastRec && lastRec.ok ? lastRec.hitPot : 0,
      shitPot: lastRec && lastRec.ok ? lastRec.shitPot : 0,
      picksUsed,
      maxPicks: PLAY_MAX_PICKS,
      prize,
      multiTicket: true,
      signature: null,
    });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
