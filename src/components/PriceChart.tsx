"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const INTERVALS = [
  { key: "1H", label: "1H" },
  { key: "4H", label: "4H" },
  { key: "1D", label: "1D" },
  { key: "1W", label: "1W" },
];

export default function PriceChart({ assetId }: { assetId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartRef = useRef<any>(null);
  const [interval, setInterval_] = useState("1H");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const buildChart = useCallback(async (container: HTMLDivElement, iv: string) => {
    try {
      const [res, lc] = await Promise.all([
        fetch(`/api/asset/${encodeURIComponent(assetId)}/price-chart?interval=${iv}`),
        import("lightweight-charts"),
      ]);

      if (!res.ok) throw new Error("Failed");
      const raw = await res.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const candles: any[] = raw.candles || raw.data || (Array.isArray(raw) ? raw : []);
      if (!candles.length) throw new Error("No data");

      // Destroy old
      if (chartRef.current) {
        try { chartRef.current.remove(); } catch {}
        chartRef.current = null;
      }
      container.replaceChildren();

      const chart = lc.createChart(container, {
        width: container.clientWidth,
        height: 400,
        layout: { background: { color: "#0a0a12" }, textColor: "#71717a" },
        grid: { vertLines: { color: "#1a1a2e" }, horzLines: { color: "#1a1a2e" } },
        timeScale: { borderColor: "#2a2a3a", timeVisible: true },
        rightPriceScale: { borderColor: "#2a2a3a" },
      });
      chartRef.current = chart;

      const sample = candles[0];
      if (sample && ("open" in sample || "o" in sample)) {
        const series = chart.addSeries(lc.CandlestickSeries, {
          upColor: "#39ff14", downColor: "#ef4444",
          borderUpColor: "#39ff14", borderDownColor: "#ef4444",
          wickUpColor: "#39ff14", wickDownColor: "#ef4444",
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        series.setData(candles.map((d: any) => ({
          time: d.time || d.t,
          open: d.open ?? d.o, high: d.high ?? d.h,
          low: d.low ?? d.l, close: d.close ?? d.c,
        })).sort((a: {time:number}, b: {time:number}) => a.time - b.time));
      } else {
        const series = chart.addSeries(lc.LineSeries, { color: "#39ff14", lineWidth: 2 });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        series.setData(candles.map((d: any) => ({
          time: d.time || d.t, value: d.value ?? d.close ?? d.c,
        })).sort((a: {time:number}, b: {time:number}) => a.time - b.time));
      }

      chart.timeScale().fitContent();

      new ResizeObserver(() => {
        if (chartRef.current && container) {
          chartRef.current.applyOptions({ width: container.clientWidth });
        }
      }).observe(container);

      setError("");
      setLoading(false);
    } catch (e) {
      setError(String(e));
      setLoading(false);
    }
  }, [assetId]);

  useEffect(() => {
    // Use a polling approach to wait for the container to be available
    let t: ReturnType<typeof setTimeout>;
    let attempts = 0;

    const tryBuild = () => {
      const container = containerRef.current;
      if (container && container.clientWidth > 0) {
        setLoading(true);
        buildChart(container, interval);
      } else if (attempts < 20) {
        attempts++;
        t = setTimeout(tryBuild, 200);
      } else {
        setError("Chart container not ready");
        setLoading(false);
      }
    };

    t = setTimeout(tryBuild, 300);

    return () => {
      clearTimeout(t);
    };
  }, [interval, buildChart]);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-foreground">Price Chart</h3>
        <div className="flex gap-1">
          {INTERVALS.map((i) => (
            <button
              key={i.key}
              onClick={() => setInterval_(i.key)}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                interval === i.key ? "bg-neon text-black" : "text-zinc-500 hover:text-foreground"
              }`}
            >
              {i.label}
            </button>
          ))}
        </div>
      </div>
      <div className="relative" style={{ minHeight: 400 }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-neon" />
          </div>
        )}
        {error && !loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <p className="text-zinc-500 text-sm">{error}</p>
          </div>
        )}
        <div ref={containerRef} style={{ width: "100%", height: 400 }} />
      </div>
    </div>
  );
}
