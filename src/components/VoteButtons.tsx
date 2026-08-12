"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import ShareRefButton from "@/components/ShareRefButton";
import { sfx } from "@/lib/sfx";
import InteractiveSwipeLottie, {
  SwipeEdgeGlow,
} from "@/components/InteractiveSwipeLottie";
import { memeStudioUrl } from "@/lib/meme-templates";
import SkipNextButton from "@/components/SkipNextButton";
import { EmojiIcon } from "@/components/EmojiIcon";

/** Brand confetti — HIT/SHIT emoji marks (Noto) */
function BrandDrop({ pack }: { pack: "hit" | "shit" }) {
  const [parts, setParts] = useState<
    {
      id: number;
      left: number;
      delay: number;
      size: number;
      duration: number;
      spin: number;
      char: string;
    }[]
  >([]);
  useEffect(() => {
    const pool =
      pack === "hit"
        ? ["🎯", "🎯", "✨", "🟩"]
        : ["💩", "💩", "💀", "🗑️"];
    setParts(
      Array.from({ length: 26 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        size: 16 + Math.random() * 22,
        duration: 1.1 + Math.random() * 1.4,
        spin: (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 280),
        char: pool[Math.floor(Math.random() * pool.length)]!,
      }))
    );
  }, [pack]);
  return (
    <div
      className="fixed inset-0 pointer-events-none z-[200] overflow-hidden"
      aria-hidden
    >
      {parts.map((p) => (
        <div
          key={p.id}
          className="emoji"
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: "-40px",
            fontSize: `${p.size}px`,
            animation: `brandfall ${p.duration}s ease-in ${p.delay}s forwards`,
            ["--spin" as string]: `${p.spin}deg`,
          }}
        >
          {p.char}
        </div>
      ))}
      <style>{`
        @keyframes brandfall {
          0% { transform: translateY(0) rotate(0deg) scale(0.6); opacity: 0; }
          12% { opacity: 1; transform: translateY(8vh) rotate(calc(var(--spin) * 0.15)) scale(1); }
          85% { opacity: 1; }
          100% { transform: translateY(105vh) rotate(var(--spin)); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

const HIT_LINES = [
  (s: string) => `I just called $${s} a HIT on @Tokenshit_ — don't make me look dumb`,
  (s: string) => `$${s} = HIT. Every token is shit until proven otherwise. @Tokenshit_`,
  (s: string) => `Certified HIT: $${s}. Come fight me in the replies @Tokenshit_`,
];

const SHIT_LINES = [
  (s: string) => `I just called $${s} SHIT on @Tokenshit_ — history will remember this`,
  (s: string) => `$${s} got the brown checkmark. @Tokenshit_`,
  (s: string) => `Voted SHIT on $${s}. Not financial advice. Barely emotional advice. @Tokenshit_`,
];

function pickLine(vote: "hit" | "shit", symbol: string) {
  const pool = vote === "hit" ? HIT_LINES : SHIT_LINES;
  return pool[Math.floor(Math.random() * pool.length)](symbol || "???");
}

function ResultBar({
  hits,
  shits,
  userVote,
}: {
  hits: number;
  shits: number;
  userVote: "hit" | "shit" | null;
}) {
  const total = hits + shits;
  const hitPct = total > 0 ? (hits / total) * 100 : 50;
  const shitPct = total > 0 ? 100 - hitPct : 50;
  return (
    <div className="space-y-2">
      <div className="flex h-3 rounded-full overflow-hidden border border-zinc-700/80 bg-zinc-950">
        <div
          className="bg-neon/90 transition-all duration-500"
          style={{ width: `${hitPct}%` }}
        />
        <div
          className="bg-red-500/90 transition-all duration-500"
          style={{ width: `${shitPct}%` }}
        />
      </div>
      <div className="flex justify-between text-[11px] font-mono">
        <span
          className={
            userVote === "hit" ? "text-neon font-bold" : "text-zinc-400"
          }
        >
          <span className="emoji mr-0.5" aria-hidden>
            🎯
          </span>
          HIT {total ? `${hitPct.toFixed(0)}%` : "—"} · {hits}
        </span>
        <span
          className={
            userVote === "shit" ? "text-red-400 font-bold" : "text-zinc-400"
          }
        >
          {shits} · {total ? `${shitPct.toFixed(0)}%` : "—"} SHIT{" "}
          <span className="emoji ml-0.5" aria-hidden>
            💩
          </span>
        </span>
      </div>
    </div>
  );
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
  const [dropPack, setDropPack] = useState<"hit" | "shit" | null>(null);
  const [symbol, setSymbol] = useState(symbolProp || "");
  const [shareText, setShareText] = useState("");
  const [copied, setCopied] = useState(false);
  const [skipTimer, setSkipTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [pressing, setPressing] = useState<"hit" | "shit" | null>(null);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const [swipeX, setSwipeX] = useState(0);
  const [swipeBurst, setSwipeBurst] = useState<"hit" | "shit" | null>(null);
  const [burstKey, setBurstKey] = useState(0);

  useEffect(() => {
    const voterId = twitterUsername || "";
    fetch(
      `/api/votes?assetId=${encodeURIComponent(assetId)}&deviceId=${encodeURIComponent(voterId)}`
    )
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
    if (symbolProp) setSymbol(symbolProp);
  }, [symbolProp]);

  useEffect(() => {
    return () => {
      if (skipTimer) clearTimeout(skipTimer);
    };
  }, [skipTimer]);

  const tokenUrl = () => {
    const base = `https://tokenshit.com/token/${encodeURIComponent(assetId)}`;
    if (twitterUsername)
      return `${base}?ref=${encodeURIComponent(twitterUsername.toLowerCase())}`;
    return base;
  };

  const goNext = useCallback(() => {
    const params = new URLSearchParams({ exclude: assetId });
    if (twitterUsername) params.set("username", twitterUsername);
    fetch(`/api/random-token?${params}`)
      .then((r) => r.json())
      .then((d2) => {
        if (d2.assetId) router.push(`/token/${d2.assetId}`);
        else {
          // fallback adjacent
          fetch("/api/adjacent-tokens?assetId=" + encodeURIComponent(assetId))
            .then((r) => r.json())
            .then((d) => {
              const id = d.next || d.prev;
              if (id) router.push(`/token/${id}`);
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, [assetId, router, twitterUsername]);

  async function handleVote(vote: "hit" | "shit") {
    if (!authenticated || !twitterUsername) {
      login();
      return;
    }
    if (userVote || voting) return;
    sfx.tap();
    setVoting(true);

    const prevHits = hits;
    const prevShits = shits;
    setUserVote(vote);
    setHits((h) => (vote === "hit" ? h + 1 : h));
    setShits((s) => (vote === "shit" ? s + 1 : s));
    setTotalVotes((t) => t + 1);
    if (vote === "hit") sfx.hit();
    else sfx.shit();
    setDropPack(vote);
    setTimeout(() => setDropPack(null), 2800);
    const line = pickLine(
      vote,
      (symbol || symbolProp || assetId).toUpperCase()
    );
    setShareText(line);

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
        setTotalVotes((data.hits || 0) + (data.shits || 0));
        setUserVote(vote);
        const t = setTimeout(() => goNext(), 9000);
        setSkipTimer(t);
      } else if (res.status === 409) {
        setUserVote(vote);
      } else {
        setUserVote(null);
        setHits(prevHits);
        setShits(prevShits);
        setShareText("");
      }
    } catch {
      setUserVote(null);
      setHits(prevHits);
      setShits(prevShits);
      setShareText("");
    }
    setVoting(false);
  }

  const shareOnX = () => {
    const text =
      shareText ||
      pickLine(userVote || "hit", (symbol || "???").toUpperCase());
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(tokenUrl())}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const copyShare = async () => {
    const text = `${shareText || pickLine(userVote || "hit", (symbol || "???").toUpperCase())}\n${tokenUrl()}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const openMemeStudio = () => {
    const sym = (symbol || "???").toUpperCase();
    const hit = userVote === "hit";
    window.open(memeStudioUrl({ symbol: sym, hit }), "_blank", "noopener,noreferrer");
  };

  const hasVoted = userVote !== null;
  const needsLogin = !authenticated || !twitterUsername;

  const onSwipeStart = (e: React.TouchEvent) => {
    if (hasVoted || voting) return;
    swipeStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };
  const onSwipeMove = (e: React.TouchEvent) => {
    if (!swipeStart.current || hasVoted || voting) return;
    const dx = e.touches[0].clientX - swipeStart.current.x;
    const dy = e.touches[0].clientY - swipeStart.current.y;
    if (Math.abs(dy) > Math.abs(dx) * 1.25) return;
    setSwipeX(dx * 0.55);
    if (dx > 24) setPressing("hit");
    else if (dx < -24) setPressing("shit");
    else setPressing(null);
  };
  const onSwipeEnd = () => {
    if (!swipeStart.current || hasVoted || voting) {
      setSwipeX(0);
      setPressing(null);
      swipeStart.current = null;
      return;
    }
    const dx = swipeX;
    swipeStart.current = null;
    if (dx > 56) {
      setSwipeBurst("hit");
      setBurstKey((k) => k + 1);
      setSwipeX(110);
      void handleVote("hit");
      setTimeout(() => {
        setSwipeBurst(null);
        setSwipeX(0);
      }, 900);
    } else if (dx < -56) {
      setSwipeBurst("shit");
      setBurstKey((k) => k + 1);
      setSwipeX(-110);
      void handleVote("shit");
      setTimeout(() => {
        setSwipeBurst(null);
        setSwipeX(0);
      }, 900);
    } else {
      setSwipeX(0);
    }
    setPressing(null);
  };

  const displaySym = (symbol || symbolProp || "").toUpperCase();

  return (
    <div
      id="vote"
      className="rounded-2xl border border-border bg-card shadow-[0_0_40px_rgba(0,0,0,0.35)] overflow-hidden relative"
      onTouchStart={onSwipeStart}
      onTouchMove={onSwipeMove}
      onTouchEnd={onSwipeEnd}
      style={{ touchAction: "pan-y" }}
    >
      {dropPack && <BrandDrop pack={dropPack} />}
      {swipeX > 10 && (
        <SwipeEdgeGlow
          side="left"
          intensity={Math.min(1, swipeX / 90)}
          mode="vote"
        />
      )}
      {swipeX < -10 && (
        <SwipeEdgeGlow
          side="right"
          intensity={Math.min(1, Math.abs(swipeX) / 90)}
          mode="vote"
        />
      )}
      <InteractiveSwipeLottie
        offsetX={swipeX}
        threshold={80}
        burst={swipeBurst}
        burstKey={burstKey}
        variant="hand"
        mode="vote"
        size={96}
      />

      {/* Header strip */}
      <div className="px-4 sm:px-5 pt-4 pb-3 border-b border-border/70 bg-zinc-950/50">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-500">
              Every token is shit until proven otherwise
            </p>
            <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
              {displaySym ? (
                <>
                  Is <span className="text-neon">${displaySym}</span> HIT or SHIT?
                </>
              ) : (
                "HIT or SHIT?"
              )}
            </h2>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-600">
              votes
            </p>
            <p className="text-sm font-mono font-semibold text-zinc-200">
              {loaded ? totalVotes.toLocaleString() : "—"}
            </p>
          </div>
        </div>
        <p className="text-[10px] font-mono text-zinc-600 mt-2 sm:hidden">
          swipe right = HIT · left = SHIT
        </p>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {needsLogin && (
          <button
            type="button"
            onClick={() => login()}
            className="w-full min-h-11 rounded-xl border border-neon/40 bg-neon/10 text-neon text-sm font-bold hover:bg-neon/20 transition"
          >
            Sign in with X to cast your vote
          </button>
        )}

        {/* Live tally */}
        {loaded && (
          <ResultBar hits={hits} shits={shits} userVote={userVote} />
        )}

        {/* Vote buttons */}
        <div
          className="grid grid-cols-2 gap-3"
          style={{
            transform: `translateX(${swipeX}px)`,
            transition: swipeStart.current ? "none" : "transform 0.18s ease-out",
          }}
        >
          <button
            type="button"
            onClick={() => void handleVote("hit")}
            onPointerDown={() => setPressing("hit")}
            onPointerUp={() => setPressing(null)}
            onPointerLeave={() => setPressing(null)}
            disabled={hasVoted || voting}
            className={`
              relative flex flex-col items-center justify-center gap-1.5 py-5 sm:py-6 rounded-2xl font-black
              border-2 min-h-[7.5rem] select-none overflow-hidden
              transition-all duration-100 ease-out
              ${
                userVote === "hit"
                  ? "border-neon bg-neon/20 shadow-[0_0_28px_rgba(57,255,20,0.25)]"
                  : "border-neon/35 bg-zinc-950 hover:border-neon hover:bg-neon/10"
              }
              ${hasVoted && userVote !== "hit" ? "opacity-35" : ""}
              ${!hasVoted && !voting ? "cursor-pointer active:scale-[0.97]" : "cursor-not-allowed"}
              ${pressing === "hit" && !hasVoted ? "scale-[0.96] brightness-110" : ""}
            `}
            style={{
              WebkitTapHighlightColor: "transparent",
              touchAction: "manipulation",
            }}
            aria-label="Vote HIT"
          >
            {voting && pressing === "hit" ? (
              <EmojiIcon size={40} className="animate-pulse opacity-80">
                🎯
              </EmojiIcon>
            ) : (
              <EmojiIcon
                size={44}
                className="drop-shadow-[0_0_12px_rgba(57,255,20,0.65)]"
                label="HIT"
              >
                🎯
              </EmojiIcon>
            )}
            <span className="text-base sm:text-lg tracking-tight text-neon">
              HIT
            </span>
            <span className="text-sm font-mono text-neon/90 tabular-nums">
              {loaded ? hits.toLocaleString() : "—"}
            </span>
            {userVote === "hit" && (
              <span className="absolute top-2 right-2 text-[9px] font-mono uppercase tracking-wider text-neon bg-neon/15 border border-neon/40 rounded px-1.5 py-0.5">
                yours
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => void handleVote("shit")}
            onPointerDown={() => setPressing("shit")}
            onPointerUp={() => setPressing(null)}
            onPointerLeave={() => setPressing(null)}
            disabled={hasVoted || voting}
            className={`
              relative flex flex-col items-center justify-center gap-1.5 py-5 sm:py-6 rounded-2xl font-black
              border-2 min-h-[7.5rem] select-none overflow-hidden
              transition-all duration-100 ease-out
              ${
                userVote === "shit"
                  ? "border-red-400 bg-red-500/15 shadow-[0_0_28px_rgba(248,113,113,0.22)]"
                  : "border-red-500/35 bg-zinc-950 hover:border-red-400 hover:bg-red-500/10"
              }
              ${hasVoted && userVote !== "shit" ? "opacity-35" : ""}
              ${!hasVoted && !voting ? "cursor-pointer active:scale-[0.97]" : "cursor-not-allowed"}
              ${pressing === "shit" && !hasVoted ? "scale-[0.96] brightness-110" : ""}
            `}
            style={{
              WebkitTapHighlightColor: "transparent",
              touchAction: "manipulation",
            }}
            aria-label="Vote SHIT"
          >
            {voting && pressing === "shit" ? (
              <EmojiIcon size={40} className="animate-pulse opacity-80">
                💩
              </EmojiIcon>
            ) : (
              <EmojiIcon
                size={44}
                className="drop-shadow-[0_0_12px_rgba(239,68,68,0.6)]"
                label="SHIT"
              >
                💩
              </EmojiIcon>
            )}
            <span className="text-base sm:text-lg tracking-tight text-red-400">
              SHIT
            </span>
            <span className="text-sm font-mono text-red-300/90 tabular-nums">
              {loaded ? shits.toLocaleString() : "—"}
            </span>
            {userVote === "shit" && (
              <span className="absolute top-2 right-2 text-[9px] font-mono uppercase tracking-wider text-red-300 bg-red-500/15 border border-red-400/40 rounded px-1.5 py-0.5">
                yours
              </span>
            )}
          </button>
        </div>

        {!hasVoted && !needsLogin && (
          <p className="text-center text-[11px] text-zinc-600 font-mono">
            1 vote per token per day · X linked
          </p>
        )}

        {hasVoted && (
          <div className="rounded-xl border border-zinc-700/80 bg-zinc-950/80 p-4 space-y-3">
            <div className="text-center">
              <p className="text-sm font-semibold text-white">
                You ruled{" "}
                <span
                  className={
                    userVote === "hit" ? "text-neon" : "text-red-400"
                  }
                >
                  {userVote === "hit" ? (
                    <>
                      <span className="emoji" aria-hidden>
                        🎯
                      </span>{" "}
                      HIT
                    </>
                  ) : (
                    <>
                      <span className="emoji" aria-hidden>
                        💩
                      </span>{" "}
                      SHIT
                    </>
                  )}
                </span>
                {twitterUsername ? (
                  <span className="text-zinc-500 font-normal">
                    {" "}
                    · @{twitterUsername}
                  </span>
                ) : null}
              </p>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                {userVote === "hit"
                  ? "Flex it on CT before the chart moves."
                  : "Tell CT you smelled it first."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={openMemeStudio}
                className="min-h-11 rounded-xl bg-neon text-black text-sm font-bold hover:brightness-110 transition"
              >
                Meme it
              </button>
              <button
                type="button"
                onClick={shareOnX}
                className="min-h-11 rounded-xl bg-white text-black text-sm font-bold hover:bg-zinc-200 transition"
              >
                Post on X
              </button>
              <button
                type="button"
                onClick={() => void copyShare()}
                className="min-h-11 rounded-xl border border-zinc-600 text-zinc-200 text-sm font-semibold hover:border-zinc-400 transition"
              >
                {copied ? "Copied" : "Copy take"}
              </button>
            </div>

            <ShareRefButton
              variant="inline"
              path={`/token/${encodeURIComponent(assetId)}`}
              showLogin={false}
            />

            <SkipNextButton
              variant="button"
              label="Next bag"
              sublabel="auto in a few · or tap"
              onClick={() => {
                if (skipTimer) clearTimeout(skipTimer);
                goNext();
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
