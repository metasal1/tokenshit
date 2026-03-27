import { type NextRequest } from "next/server";
import { apiFetch } from "@/lib/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const { assetId } = await params;
  const interval = request.nextUrl.searchParams.get("interval") || "1H";
  try {
    // Calculate a sensible 'from' to get enough data points
    const now = Math.floor(Date.now() / 1000);
    const ranges: Record<string, number> = {
      "1m": 3600 * 6,       // 6 hours
      "5m": 3600 * 24,      // 1 day
      "15m": 3600 * 72,     // 3 days
      "1H": 3600 * 24 * 7,  // 7 days
      "4H": 3600 * 24 * 30, // 30 days
      "1D": 3600 * 24 * 90, // 90 days
      "1W": 3600 * 24 * 365,// 1 year
    };
    const from = now - (ranges[interval] || 3600 * 24 * 7);

    // Try OHLCV endpoint first (more data points)
    const data = await apiFetch(
      `/assets/${encodeURIComponent(assetId)}/ohlcv?interval=${interval}&from=${from}&to=${now}`
    );
    const candles = Array.isArray(data) ? data : data.candles || data.data || [];
    if (candles.length > 0) {
      return Response.json({ candles });
    }

    // Fallback to price-chart
    const fallback = await apiFetch(
      `/assets/${encodeURIComponent(assetId)}/price-chart?interval=${interval}&from=${from}&to=${now}`
    );
    return Response.json(fallback);
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
