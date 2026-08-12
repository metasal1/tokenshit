"use client";

import { useEffect, useState } from "react";
import { X_HANDLE, X_URL } from "@/lib/shit-token";
import { BalanceSkeleton, SpinLoader } from "@/components/StatLoader";

type Profile = {
  username: string;
  name: string;
  followers: number;
  following: number;
  tweets: number;
  profileImageUrl?: string;
  source?: string;
};

function fmt(n: number) {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export default function XFollowersBadge({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  const [p, setP] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/x/profile?refresh=1")
      .then((r) => r.json())
      .then((d) => {
        if (!alive || d.error) return;
        setP(d);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const followers = p?.followers;

  if (compact) {
    return (
      <a
        href={X_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 min-h-9 rounded-md border border-zinc-700 text-zinc-300 hover:border-sky-500 hover:text-white transition-colors font-mono ${className}`}
        title={`@${X_HANDLE} on X`}
      >
        <span className="text-sky-400 font-sans font-bold">𝕏</span>
        {loading || followers == null ? (
          <SpinLoader size={11} label="Followers loading" />
        ) : (
          <span>{fmt(followers)}</span>
        )}
      </a>
    );
  }

  return (
    <a
      href={X_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-3 rounded-xl border border-zinc-700/80 bg-zinc-900/60 hover:border-sky-500/60 px-3.5 py-3 transition-colors ${className}`}
    >
      {p?.profileImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={p.profileImageUrl}
          alt=""
          className="h-11 w-11 rounded-full bg-zinc-800 shrink-0"
        />
      ) : (
        <div className="h-11 w-11 rounded-full bg-zinc-800 flex items-center justify-center text-sky-400 font-bold shrink-0">
          𝕏
        </div>
      )}
      <div className="min-w-0 flex-1 text-left">
        <div className="text-sm font-semibold text-white truncate">
          @{p?.username || X_HANDLE}
        </div>
        <div className="text-xs text-zinc-500">
          <span className="text-neon font-mono font-bold inline-flex items-center min-h-[1rem]">
            {loading || followers == null ? (
              <BalanceSkeleton className="h-3.5 w-10" />
            ) : (
              fmt(followers)
            )}
          </span>{" "}
          followers
          {!loading && p?.tweets != null && (
            <>
              {" · "}
              <span className="font-mono">{fmt(p.tweets)}</span> posts
            </>
          )}
        </div>
      </div>
      <span className="shrink-0 text-xs font-semibold text-sky-400 border border-sky-700/50 rounded-full px-3 py-1.5">
        Follow
      </span>
    </a>
  );
}
