import { type NextRequest } from "next/server";
import {
  checkJupVrfdEligibility,
  isJupTokenVerified,
  JUP_VRFD_DASHBOARD,
} from "@/lib/jup-vrfd";
import { SHIT_MINT } from "@/lib/shit-token";

export const dynamic = "force-dynamic";

/** GET /api/jup/vrfd — eligibility + dashboard link for TOKENSHIT mint */
export async function GET(req: NextRequest) {
  const mint =
    req.nextUrl.searchParams.get("mint")?.trim() || SHIT_MINT;
  try {
    const [elig, verified] = await Promise.all([
      checkJupVrfdEligibility(mint).catch(() => null),
      isJupTokenVerified(mint),
    ]);
    return Response.json({
      mint,
      dashboard: JUP_VRFD_DASHBOARD(mint),
      isVerified: elig?.isVerified ?? verified,
      eligibility: elig,
      express: {
        requiresApiKey: true,
        cost: "1000 JUP (or SOL/USDC via Ultra)",
        docs: "https://dev.jup.ag/docs/tokens/verification",
      },
    });
  } catch (e) {
    return Response.json(
      {
        mint,
        dashboard: JUP_VRFD_DASHBOARD(mint),
        error: e instanceof Error ? e.message : String(e),
      },
      { status: 502 }
    );
  }
}
