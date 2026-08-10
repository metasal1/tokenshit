"use client";

import { useEffect, useState } from "react";

interface NewsItem {
  title: string;
  url: string;
  image?: string;
  author?: string;
  posted_at?: string;
  source_name?: string;
  feed_source?: string;
}

export default function TokenNews({
  assetId,
  symbol,
  name,
}: {
  assetId: string;
  symbol?: string;
  name?: string;
}) {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({
      limit: "6",
      source: "news",
      asset_id: assetId,
    });
    if (symbol) params.set("symbol", symbol);
    if (name) params.set("name", name);
    // coin_id often matches assetId for majors
    params.set("coin_id", assetId);

    fetch(`/api/news?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setItems(Array.isArray(d.items) ? d.items : []);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [assetId, symbol, name]);

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs text-zinc-500">Loading noise…</p>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-bold text-foreground text-sm">Noise</h3>
          <p className="text-[11px] text-zinc-500">Why CT might be mad</p>
        </div>
      </div>
      <ul className="divide-y divide-border">
        {items.slice(0, 6).map((item, i) => (
          <li key={i}>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-3 px-4 py-3 hover:bg-card-hover transition-colors"
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt=""
                  className="w-12 h-12 rounded-md object-cover bg-zinc-800 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-md bg-zinc-800 shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground line-clamp-2 leading-snug">
                  {item.title}
                </p>
                <p className="text-[10px] text-zinc-500 mt-1 truncate">
                  {item.source_name || item.author || item.feed_source || "news"}
                  {item.posted_at
                    ? ` · ${new Date(item.posted_at).toLocaleDateString()}`
                    : ""}
                </p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
