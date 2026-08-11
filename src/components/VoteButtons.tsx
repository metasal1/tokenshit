"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { CanvasPanelFx } from "@/components/CanvasShell";
import ShareRefButton from "@/components/ShareRefButton";
import { getRefHandle, getVoterId } from "@/lib/privy-identity";
import { sfx } from "@/lib/sfx";
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

const HIT_LINES = [
  (s: string) => `I just called $${s} a HIT on @Tokenshit_ — don't make me look dumb`,
  (s: string) => `$${s} = HIT. Court adjourned. @Tokenshit_`,
  (s: string) => `Certified HIT: $${s}. Come fight me in the replies @Tokenshit_`,
  (s: string) => `Drake would approve $${s}. I voted HIT on @Tokenshit_`,
];

const SHIT_LINES = [
  (s: string) => `I just called $${s} SHIT on @Tokenshit_ — history will remember this`,
  (s: string) => `$${s} got the brown checkmark. @Tokenshit_`,
  (s: string) => `Voted SHIT on $${s}. Not financial advice. Barely emotional advice. @Tokenshit_`,
  (s: string) => `This ain't it chief. $${s} = SHIT on @Tokenshit_`,
];

function pickLine(vote: "hit" | "shit", symbol: string) {
  const pool = vote === "hit" ? HIT_LINES : SHIT_LINES;
  return pool[Math.floor(Math.random() * pool.length)](symbol || "???");
}

export default function VoteButtons({
  assetId,
  symbol: symbolProp,
}: {
  assetId: string;
  symbol?: string;
}) {
  const { authenticated, user, login } = usePrivy();
  const router = useRouter();
  const twitterUsername = user?.twitter?.username;

  const [hits, setHits] = useState(0);
  const [shits, setShits] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const [userVote, setUserVote] = useState<"hit" | "shit" | null>(null);
  const [voting, setVoting] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [dropEmoji, setDropEmoji] = useState<string | null>(null);
  const [symbol, setSymbol] = useState(symbolProp || "");
  const [shareText, setShareText] = useState("");
  const [copied, setCopied] = useState(false);
  const [skipTimer, setSkipTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    if (symbolProp) {
      setSymbol(symbolProp);
      return;
    }
  }, [symbolProp]);

  useEffect(() => {
    return () => {
      if (skipTimer) clearTimeout(skipTimer);
    };
  }, [skipTimer]);

  const tokenUrl = () => {
    const base = `https://tokenshit.com/token/${encodeURIComponent(assetId)}`;
    if (twitterUsername) return `${base}?ref=${encodeURIComponent(twitterUsername.toLowerCase())}`;
    return base;
  };

  const goNext = useCallback(() => {
    fetch("/api/adjacent-tokens?assetId=" + encodeURIComponent(assetId))
      .then((r) => r.json())
      .then((d) => {
        const candidates = [d.prev, d.next].filter(Boolean);
        if (candidates.length > 0) {
          const randomId = candidates[Math.floor(Math.random() * candidates.length)];
          router.push(`/token/${randomId}`);
        } else {
          fetch("/api/random-token")
            .then((r) => r.json())
            .then((d2) => {
              if (d2.assetId) router.push(`/token/${d2.assetId}`);
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, [assetId, router]);

  async function handleVote(vote: "hit" | "shit") {
    if (!authenticated || !twitterUsername) {
      login();
      return;
    }
    if (userVote || voting) return;
    sfx.tap();
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
        if (vote === "hit") sfx.hit();
        else sfx.shit();
        setDropEmoji(vote === "hit" ? "🎯" : "💩");
        setTimeout(() => setDropEmoji(null), 3000);
        const line = pickLine(vote, (symbol || symbolProp || assetId).toUpperCase());
        setShareText(line);
        // give time to share before auto-advance
        const t = setTimeout(() => goNext(), 8000);
        setSkipTimer(t);
      } else if (res.status === 409) {
        setUserVote(vote);
      }
    } catch {}
    setVoting(false);
  }

  const shareOnX = () => {
    const text = shareText || pickLine(userVote || "hit", (symbol || "???").toUpperCase());
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(tokenUrl())}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const copyShare = async () => {
    const text = `${shareText || pickLine(userVote || "hit", (symbol || "???").toUpperCase())}\n${tokenUrl()}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const openMemeStudio = () => {
    const sym = (symbol || "???").toUpperCase();
    const hit = userVote === "hit";
    // Prefer branded Drake blank on memes.sal.fun, fall back to classic drake id
    const top = hit ? "Reading charts all day" : `$${sym} bagholders`;
    const bottom = hit ? `$${sym} = HIT` : `$${sym} = SHIT`;
    const u = new URL("https://memes.sal.fun/");
    u.searchParams.set("t", "sol-au-drake");
    u.searchParams.set("top", top);
    u.searchParams.set("bottom", bottom);
    u.searchParams.set("q", "drake");
    window.open(u.toString(), "_blank", "noopener,noreferrer");
  };

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
        <div className="mt-4 space-y-3">
          <p className="text-center text-xs text-zinc-500">
            You voted{" "}
            <strong className={userVote === "hit" ? "text-green-400" : "text-red-400"}>
              {userVote === "hit" ? "🎯 HIT" : "💩 SHIT"}
            </strong>
            {twitterUsername && <span className="text-zinc-600"> as @{twitterUsername}</span>}
          </p>

          <CanvasPanelFx>
            <div className="rounded-xl border border-zinc-700/80 bg-zinc-950/70 p-4 text-center space-y-3">
              <p className="text-sm font-semibold text-white">
                {userVote === "hit" ? "Flex the HIT" : "Drop the SHIT take"}
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed px-1">
                {shareText ||
                  (userVote === "hit"
                    ? "Tell CT you cooked."
                    : "Tell CT you smelled it first.")}
              </p>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={openMemeStudio}
                  className="w-full rounded-lg bg-neon text-black text-sm font-bold py-2.5 hover:brightness-110 transition-colors"
                >
                  Meme it on memes.sal.fun
                </button>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={shareOnX}
                    className="flex-1 rounded-lg bg-white text-black text-sm font-bold py-2.5 hover:bg-zinc-200 transition-colors"
                  >
                    Post on X
                  </button>
                  <button
                    type="button"
                    onClick={copyShare}
                    className="flex-1 rounded-lg border border-zinc-600 text-zinc-200 text-sm font-medium py-2.5 hover:border-zinc-400 transition-colors"
                  >
                    {copied ? "Copied" : "Copy meme text"}
                  </button>
                </div>
                <ShareRefButton
                  variant="inline"
                  path={`/token/${encodeURIComponent(assetId)}`}
                  showLogin={false}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (skipTimer) clearTimeout(skipTimer);
                  goNext();
                }}
                className="text-[11px] text-zinc-500 hover:text-zinc-300 underline-offset-2 hover:underline"
              >
                Skip — next victim
              </button>
            </div>
          </CanvasPanelFx>
        </div>
      )}
    </div>
  );
}
