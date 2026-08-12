"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { sfx } from "@/lib/sfx";
import SkipNextButton from "@/components/SkipNextButton";
import { EmojiIcon } from "@/components/EmojiIcon";
import { getDeviceId, incrementAnonVoteCount } from "@/lib/device-id";

const HIT_CURSOR = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='%2339ff14' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Ccircle cx='12' cy='12' r='6'/%3E%3Ccircle cx='12' cy='12' r='2'/%3E%3C/svg%3E") 14 14, crosshair`;
const SHIT_CURSOR = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='%23ef4444' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='9' cy='12' r='1'/%3E%3Ccircle cx='15' cy='12' r='1'/%3E%3Cpath d='M8 20v2h8v-2'/%3E%3Cpath d='M12.5 17l-.5-1-.5 1h1z'/%3E%3Cpath d='M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20'/%3E%3C/svg%3E") 14 14, pointer`;

/** Noto Color Emoji packs — HIT = green/win energy, SHIT = dump/chaos */
const HIT_EMOJIS = ["🎯", "🚀", "💎", "🔥", "✨", "🟩", "🤑", "💪", "🏆", "⚡"];
const SHIT_EMOJIS = ["💩", "💀", "🗑️", "🔻", "😭", "🤡", "📉", "☠️", "🧻", "🤢"];

function EmojiDrop({
  emoji,
  pack,
  count = 28,
}: {
  emoji?: string;
  pack?: "hit" | "shit";
  count?: number;
}) {
  const pool =
    pack === "hit" ? HIT_EMOJIS : pack === "shit" ? SHIT_EMOJIS : emoji ? [emoji] : HIT_EMOJIS;

  const [particles, setParticles] = useState<
    {
      id: number;
      left: number;
      delay: number;
      size: number;
      duration: number;
      char: string;
      spin: number;
    }[]
  >([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.55,
        size: 18 + Math.random() * 28,
        duration: 1 + Math.random() * 1.6,
        char: pool[Math.floor(Math.random() * pool.length)]!,
        spin: (Math.random() > 0.5 ? 1 : -1) * (240 + Math.random() * 400),
      }))
    );
  }, [count, pack, emoji]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="emoji"
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: "-40px",
            fontSize: `${p.size}px`,
            animation: `emojifall ${p.duration}s ease-in ${p.delay}s forwards`,
            // per-particle spin via CSS var
            ["--spin" as string]: `${p.spin}deg`,
          }}
        >
          {p.char}
        </div>
      ))}
      <style>{`
        @keyframes emojifall {
          0% { transform: translateY(0) rotate(0deg) scale(0.6); opacity: 0; }
          12% { opacity: 1; transform: translateY(8vh) rotate(calc(var(--spin) * 0.15)) scale(1); }
          85% { opacity: 1; }
          100% { transform: translateY(105vh) rotate(var(--spin)); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function VoteButtons({ assetId, name, symbol }: { assetId: string; name?: string; symbol?: string }) {
  const { ready, user, login } = usePrivy();
  const router = useRouter();
  const twitterUsername = user?.twitter?.username;

  const [deviceId, setDeviceId] = useState("");
  const [hits, setHits] = useState(0);
  const [shits, setShits] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const [userVote, setUserVote] = useState<"hit" | "shit" | null>(null);
  const [voting, setVoting] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [dropPack, setDropPack] = useState<"hit" | "shit" | null>(null);
  const [pressing, setPressing] = useState<"hit" | "shit" | null>(null);
  const [nextUrl, setNextUrl] = useState<string | null>(null);

  useEffect(() => {
    setDeviceId(getDeviceId());
  }, []);

  useEffect(() => {
    const voter = twitterUsername || deviceId;
    if (!voter) return;
    fetch(`/api/votes?assetId=${encodeURIComponent(assetId)}&deviceId=${encodeURIComponent(voter)}`)
      .then((r) => r.json())
      .then((data) => {
        setHits(data.hits || 0);
        setShits(data.shits || 0);
        setTotalVotes(data.totalVotes || 0);
        setUserVote(data.userVote || null);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [assetId, twitterUsername, deviceId]);

  const handleVote = useCallback(async (vote: "hit" | "shit") => {
    if (userVote || voting) return;
    const voter = twitterUsername || deviceId;
    if (!voter) return;

    sfx.tap();
    setVoting(true);

    const prevHits = hits;
    const prevShits = shits;
    setUserVote(vote);
    setHits((h) => (vote === "hit" ? h + 1 : h));
    setShits((s) => (vote === "shit" ? s + 1 : s));
    if (vote === "hit") sfx.hit();
    else sfx.shit();
    setDropPack(vote === "hit" ? "hit" : "shit");
    setTimeout(() => setDropPack(null), 3200);

    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId,
          vote,
          ...(twitterUsername ? { twitterUsername } : { deviceId }),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setHits(data.hits || 0);
        setShits(data.shits || 0);
        setUserVote(vote);

        if (!twitterUsername) {
          incrementAnonVoteCount();
        }

        const params = new URLSearchParams({ exclude: assetId });
        if (twitterUsername) params.set("username", twitterUsername);
        fetch(`/api/random-token?${params}`)
          .then((r) => r.json())
          .then((d) => {
            if (d.assetId) {
              const next = `/token/${d.assetId}`;
              router.prefetch(next);
              setNextUrl(next);
            }
          })
          .catch(() => {});
      } else if (res.status === 409) {
        setUserVote(vote);
      } else {
        setUserVote(null);
        setHits(prevHits);
        setShits(prevShits);
      }
    } catch {
      setUserVote(null);
      setHits(prevHits);
      setShits(prevShits);
    }
    setVoting(false);
  }, [
    twitterUsername,
    deviceId,
    userVote,
    voting,
    assetId,
    router,
    hits,
    shits,
  ]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (userVote || voting) return;
      const key = e.key.toLowerCase();
      if (key === "h") { e.preventDefault(); handleVote("hit"); }
      else if (key === "s") { e.preventDefault(); handleVote("shit"); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleVote, userVote, voting]);

  if (!ready) return null;

  const hasVoted = userVote !== null;
  const isAnonymous = !twitterUsername;

  const tokenUrl = `https://tokenshit.com/token/${assetId}`;
  const displayName = name && symbol ? `$${symbol}` : name || assetId.slice(0, 8);
  const tweetText = userVote
    ? `I voted ${userVote === "hit" ? "🎯 HIT" : "💀 SHIT"} on ${displayName} on @tokenshit_\n\n${tokenUrl}`
    : "";
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

  return (
    <div className="border border-zinc-800 rounded-xl bg-zinc-900/80 p-5 relative">
      {dropPack && <EmojiDrop pack={dropPack} />}
      <div className="text-center mb-4">
        <p className="text-lg font-bold text-white">
          Is this token a <span className="text-green-400">HIT</span> or <span className="text-red-400">SHIT</span>?
        </p>
        {loaded && totalVotes > 0 && (
          <p className="text-xs text-zinc-600 mt-1">
            {totalVotes.toLocaleString()} vote{totalVotes !== 1 ? "s" : ""} cast
          </p>
        )}
      </div>

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
            ${!hasVoted && !voting ? "active:scale-95 hover:border-green-500 hover:bg-green-900/40" : "cursor-not-allowed"}
            ${pressing === "hit" && !hasVoted ? "scale-90 brightness-125" : ""}
          `}
          style={{
            WebkitTapHighlightColor: "transparent",
            touchAction: "manipulation",
            cursor: !hasVoted && !voting ? HIT_CURSOR : undefined,
          }}
        >
          <span className="flex items-center justify-center h-10">
            {voting && pressing === "hit"
              ? <EmojiIcon size={36} className="animate-spin">💫</EmojiIcon>
              : <EmojiIcon size={40} className="drop-shadow-[0_0_10px_rgba(57,255,20,0.6)]">🎯</EmojiIcon>
            }
          </span>
          <span className="text-green-400 text-base flex items-center gap-2">
            Hit
            <kbd className="hidden sm:inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 text-[11px] font-mono font-bold text-green-200 bg-green-950/80 border border-green-700 border-b-2 rounded shadow-sm">H</kbd>
          </span>
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
            ${!hasVoted && !voting ? "active:scale-95 hover:border-red-500 hover:bg-red-900/40" : "cursor-not-allowed"}
            ${pressing === "shit" && !hasVoted ? "scale-90 brightness-125" : ""}
          `}
          style={{
            WebkitTapHighlightColor: "transparent",
            touchAction: "manipulation",
            cursor: !hasVoted && !voting ? SHIT_CURSOR : undefined,
          }}
        >
          <span className="flex items-center justify-center h-10">
            {voting && pressing === "shit"
              ? <EmojiIcon size={36} className="animate-spin">💫</EmojiIcon>
              : <EmojiIcon size={40} className="drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]">💀</EmojiIcon>
            }
          </span>
          <span className="text-red-400 text-base flex items-center gap-2">
            Shit
            <kbd className="hidden sm:inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 text-[11px] font-mono font-bold text-red-200 bg-red-950/80 border border-red-700 border-b-2 rounded shadow-sm">S</kbd>
          </span>
          <span className="text-sm text-red-400 font-mono">
            {loaded ? shits : "—"}
          </span>
        </button>
      </div>

      {hasVoted && (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-zinc-500 text-center">
            You voted <strong className={userVote === "hit" ? "text-green-400" : "text-red-400"}>{userVote === "hit" ? "HIT" : "SHIT"}</strong> today
            {twitterUsername && <span className="text-zinc-600"> as @{twitterUsername}</span>}
          </p>

          <div className="flex gap-2">
            {/* Share to X */}
            <a
              href={tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors border ${
                userVote === "hit"
                  ? "bg-green-950/40 border-green-800/60 text-green-400 hover:bg-green-900/50"
                  : "bg-red-950/40 border-red-800/60 text-red-400 hover:bg-red-900/50"
              }`}
            >
              <EmojiIcon size={14}>📤</EmojiIcon>
              Share
            </a>

            {/* Next case */}\n            <SkipNextButton\n              variant=\"chip\"\n              label=\"Next case\"\n              sublabel=\"continue\"\n              onClick={() => {\n                if (nextUrl) {\n                  sfx.whoosh();\n                  router.push(nextUrl);\n                }\n              }}\n              disabled={!nextUrl}\n              className=\"flex-1 justify-center min-h-[40px] rounded-lg\"\n            />
          </div>

          {/* Login nudge for anonymous voters */}
          {isAnonymous && (
            <button
              onClick={() => login()}
              className="w-full text-center text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-600"
            >
              Sign in with X to save your history & climb the leaderboard →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
