import { getTreasuryBalances } from "@/lib/treasury";
import {
  CLAIM_GH_FORK,
  CLAIM_X_FOLLOW,
  CLAIM_X_TWEET,
  CLAIM_X_VERIFIED,
  GLOBAL_TREASURY_DAILY_DROP,
  REFERRAL_REWARD_SHIT,
  SHIT_MINT,
  SHIT_SYMBOL,
  TREASURY_ADDRESS,
} from "@/lib/shit-token";
import {
  buildDropSchedule,
  getLastDrop,
  hasDroppedToday,
} from "@/lib/treasury-drop";

export const dynamic = "force-dynamic";
export const revalidate = 15;

export async function GET() {
  const now = new Date();
  try {
    const [bal, lastDrop, droppedToday] = await Promise.all([
      getTreasuryBalances(),
      getLastDrop(),
      hasDroppedToday(now),
    ]);
    const schedule = buildDropSchedule(now);

    return Response.json({
      ...bal,
      symbol: SHIT_SYMBOL,
      mint: SHIT_MINT,
      treasury: TREASURY_ADDRESS,
      global: {
        ...schedule,
        droppedToday,
        lastDrop,
        serverNow: now.toISOString(),
        serverNowMs: now.getTime(),
      },
      claims: {
        x_tweet: CLAIM_X_TWEET,
        x_follow: CLAIM_X_FOLLOW,
        x_verified: CLAIM_X_VERIFIED,
        gh_fork: CLAIM_GH_FORK,
        referral: REFERRAL_REWARD_SHIT,
        daily_drop: GLOBAL_TREASURY_DAILY_DROP,
      },
    });
  } catch (e) {
    const schedule = buildDropSchedule(now);
    return Response.json(
      {
        error: String(e),
        address: TREASURY_ADDRESS,
        mint: SHIT_MINT,
        shit: 0,
        sol: 0,
        global: {
          ...schedule,
          droppedToday: false,
          lastDrop: null,
          serverNow: now.toISOString(),
          serverNowMs: now.getTime(),
        },
      },
      { status: 500 }
    );
  }
}
