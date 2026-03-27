"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Result {
  assetId: string;
  name: string;
  symbol: string;
  logo?: string;
}

export default function SearchBar({ big = false }: { big?: boolean }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function search(q: string) {
    setQuery(q);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!q.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=8`);
        const data = await res.json();
        const items = Array.isArray(data) ? data : data.results || data.assets || [];
        setResults(items.slice(0, 8));
        setOpen(items.length > 0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      setOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <div ref={ref} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => search(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            placeholder="Search tokens, contracts, symbols..."
            className={`w-full rounded-xl border border-border bg-card text-foreground placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-neon/50 focus:border-neon transition-all ${
              big ? "px-6 py-4 text-lg" : "px-4 py-2.5 text-sm"
            }`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {loading && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-neon" />
            )}
            <button
              type="submit"
              className="text-zinc-500 hover:text-neon transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={big ? "h-6 w-6" : "h-4 w-4"}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </form>
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-border bg-card shadow-2xl shadow-black/50 overflow-hidden z-50">
          {results.map((r) => (
            <Link
              key={r.assetId}
              href={`/token/${r.assetId}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-card-hover transition-colors border-b border-border last:border-0"
            >
              {r.logo ? (
                <img
                  src={r.logo}
                  alt={r.symbol}
                  className="h-8 w-8 rounded-full bg-zinc-800"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                  {r.symbol?.slice(0, 2)}
                </div>
              )}
              <div>
                <div className="font-medium text-foreground">{r.name}</div>
                <div className="text-xs text-zinc-500">{r.symbol}</div>
              </div>
            </Link>
          ))}
          <Link
            href={`/search?q=${encodeURIComponent(query)}`}
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-center text-sm text-neon hover:bg-card-hover transition-colors"
          >
            View all results for &quot;{query}&quot;
          </Link>
        </div>
      )}
    </div>
  );
}
