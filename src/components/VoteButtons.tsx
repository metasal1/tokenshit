"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";

function EmojiDrop({ emoji, count = 20 }: { emoji: string; count?: number }) {
  const [particles, setParticles] = useState<{ id: number; left: number; delay: number; size: number; duration: number }[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        size: 16 + Math.random() * 24,
        duration: 1 + Math.random() * 1.5,
      }))
    );
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: "-40px",
            fontSize: `${p.size}px`,
            animation: `emojifall ${p.duration}s ease-in ${p.delay}s forwards`,
          }}
        >
          {emoji}
        </div>
      ))}
      <style>{`
        @keyframes emojifall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(105vh) rotate(${Math.random() > 0.5 ? '' : '-'}360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function VoteButtons({ assetId }: { assetId: string }) {
  const { ready, authenticated, user, login } = usePrivy();
  const router = useRouter();
  const twitterUsername = user?.twitter?.username;

  const [hits, setHits] = useState(0);
  const [shits, setShits] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const [userVote, setUserVote] = useState<"hit" | "shit" | null>(null);
  const [voting, setVoting] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [dropEmoji, setDropEmoji] = useState<string | null>(null);

  useEffect(() => {
    const voterId = twitterUsername || "";
    fetch(`/api/votes?assetId=${encodeURIComponent(assetId)}&deviceId=${encodeURIComponent(voterId)}`)
      .then((r) => r.json())
      .then((data) => {
        setHits(data.hits || 0);
        setShits(data.shits || 0);
        setTotalVotes(data.totalVotes || 0);
        setUserVote(data.userVote || null);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [assetId, twitterUsername]);

  async function handleVote(vote: "hit" | "shit") {
    if (!authenticated || !twitterUsername) {
      login();
      return;
    }
    if (userVote || voting) return;
    setVoting(true);
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId,
          vote,
          twitterUsername,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setHits(data.hits || 0);
        setShits(data.shits || 0);
        setUserVote(vote);
        setDropEmoji(vote === "hit" ? "🎯" : "💩");
        setTimeout(() => setDropEmoji(null), 3000);
        // Navigate to random token after confetti
        fetch("/api/adjacent-tokens?assetId=" + encodeURIComponent(assetId))
          .then(r => r.json())
          .then(d => {
            // Pick a random token from the list
            const candidates = [d.prev, d.next].filter(Boolean);
            if (candidates.length > 0) {
              const randomId = candidates[Math.floor(Math.random() * candidates.length)];
              setTimeout(() => router.push(`/token/${randomId}`), 2000);
            } else {
              // Fallback: fetch full list
              fetch("/api/random-token")
                .then(r => r.json())
                .then(d => { if (d.assetId) setTimeout(() => router.push(`/token/${d.assetId}`), 2000); })
                .catch(() => {});
            }
          })
          .catch(() => {});
      } else if (res.status === 409) {
        setUserVote(vote);
      }
    } catch {}
    setVoting(false);
  }

  const hasVoted = userVote !== null;
  const needsLogin = !authenticated || !twitterUsername;

  const [pressing, setPressing] = useState<"hit" | "shit" | null>(null);

  return (
    <div className="border border-zinc-800 rounded-xl bg-zinc-900/80 p-5 relative">
      {dropEmoji && <EmojiDrop emoji={dropEmoji} />}
      <div className="text-center mb-4">
        <p className="text-lg font-bold text-white">
          Is this token 🎯 or 💩?
        </p>
        {loaded && totalVotes > 0 && (
          <p className="text-xs text-zinc-600 mt-1">
            {totalVotes.toLocaleString()} vote{totalVotes !== 1 ? "s" : ""} cast
          </p>
        )}
      </div>
      {needsLogin && (
        <p className="text-center text-xs text-zinc-500 mb-3">
          Sign in with X to vote (1 vote per token per day)
        </p>
      )}
      <div className="flex gap-4">
        <button
          onClick={() => handleVote("hit")}
          onPointerDown={() => setPressing("hit")}
          onPointerUp={() => setPressing(null)}
          onPointerLeave={() => setPressing(null)}
          disabled={hasVoted || voting}
          className={`
            flex-1 flex flex-col items-center gap-1 py-4 rounded-xl font-bold
            border-[3px] min-h-[100px] select-none
            transition-all duration-100 ease-out
            ${userVote === "hit" ? "border-green-500 bg-green-900/60" : "border-green-900 bg-green-950"}
            ${hasVoted && userVote !== "hit" ? "opacity-30" : ""}
            ${!hasVoted && !voting ? "cursor-pointer active:scale-95 hover:border-green-500 hover:bg-green-900/40" : "cursor-not-allowed"}
            ${pressing === "hit" && !hasVoted ? "scale-90 brightness-125" : ""}
          `}
          style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
        >
          <span className="text-4xl">{voting && pressing === "hit" ? "⏳" : "🎯"}</span>
          <span className="text-green-400 text-base">Hit</span>
          <span className="text-sm text-green-400 font-mono">
            {loaded ? hits : "—"}
          </span>
        </button>

        <button
          onClick={() => handleVote("shit")}
          onPointerDown={() => setPressing("shit")}
          onPointerUp={() => setPressing(null)}
          onPointerLeave={() => setPressing(null)}
          disabled={hasVoted || voting}
          className={`
            flex-1 flex flex-col items-center gap-1 py-4 rounded-xl font-bold
            border-[3px] min-h-[100px] select-none
            transition-all duration-100 ease-out
            ${userVote === "shit" ? "border-red-500 bg-red-900/60" : "border-red-900 bg-red-950"}
            ${hasVoted && userVote !== "shit" ? "opacity-30" : ""}
            ${!hasVoted && !voting ? "cursor-pointer active:scale-95 hover:border-red-500 hover:bg-red-900/40" : "cursor-not-allowed"}
            ${pressing === "shit" && !hasVoted ? "scale-90 brightness-125" : ""}
          `}
          style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
        >
          <span className="text-4xl">{voting && pressing === "shit" ? "⏳" : "💩"}</span>
          <span className="text-red-400 text-base">Shit</span>
          <span className="text-sm text-red-400 font-mono">
            {loaded ? shits : "—"}
          </span>
        </button>
      </div>
      {hasVoted && (
        <div className="text-center mt-3">
          <p className="text-xs text-zinc-500">
            You voted <strong className={userVote === "hit" ? "text-green-400" : "text-red-400"}>{userVote === "hit" ? "🎯" : "💩"}</strong> today
            {twitterUsername && <span className="text-zinc-600"> as @{twitterUsername}</span>}
          </p>
          {dropEmoji && (
            <p className="text-[11px] text-zinc-600 mt-2 animate-pulse">
              Loading next token...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
