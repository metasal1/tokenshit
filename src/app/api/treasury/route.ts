import { getTreasuryBalances } from "@/lib/treasury";
import {
  CLAIM_GH_FORK,
  CLAIM_X_VERIFIED,
  SHIT_MINT,
  TREASURY_ADDRESS,
} from "@/lib/shit-token";

export const dynamic = "force-dynamic";
export const revalidate = 30;

export async function GET() {
  try {
    const bal = await getTreasuryBalances();
    return Response.json({
      ...bal,
      claims: {
        x_verified: CLAIM_X_VERIFIED,
        gh_fork: CLAIM_GH_FORK,
      },
      mint: SHIT_MINT,
      treasury: TREASURY_ADDRESS,
    });
  } catch (e) {
    return Response.json(
      {
        error: String(e),
        address: TREASURY_ADDRESS,
        mint: SHIT_MINT,
        shit: 0,
        sol: 0,
      },
      { status: 500 }
    );
  }
}
