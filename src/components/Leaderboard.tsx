import Link from "next/link";

interface LeaderEntry {
  assetId: string;
  hits: number;
  shits: number;
  name?: string;
  symbol?: string;
  logo?: string;
}

export default function Leaderboard({
  mostHit,
  mostShit,
}: {
  mostHit: LeaderEntry[];
  mostShit: LeaderEntry[];
}) {
  if (mostHit.length === 0 && mostShit.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <LeaderList
        title="🎯 Most Hit"
        subtitle="Today's top tokens"
        entries={mostHit}
        type="hit"
      />
      <LeaderList
        title="💩 Most Shit"
        subtitle="Today's biggest $HIT"
        entries={mostShit}
        type="shit"
      />
    </div>
  );
}

function LeaderList({
  title,
  subtitle,
  entries,
  type,
}: {
  title: string;
  subtitle: string;
  entries: LeaderEntry[];
  type: "hit" | "shit";
}) {
  if (entries.length === 0) return null;

  const color = type === "hit" ? "text-green-400" : "text-red-400";
  const bgHover = type === "hit" ? "hover:bg-green-500/5" : "hover:bg-red-500/5";

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-bold text-foreground">{title}</h3>
        <p className="text-xs text-zinc-500">{subtitle}</p>
      </div>
      <div className="divide-y divide-border">
        {entries.map((e, i) => (
          <Link
            key={e.assetId}
            href={`/token/${encodeURIComponent(e.assetId)}`}
            className={`flex items-center gap-3 px-4 py-3 transition-colors ${bgHover}`}
          >
            <span className="text-lg font-bold text-zinc-600 w-6 text-center font-mono">
              {i + 1}
            </span>
            {e.logo ? (
              <img
                src={e.logo}
                alt={e.symbol || ""}
                className="h-8 w-8 rounded-full bg-zinc-800"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500">
                {(e.symbol || "?").slice(0, 2)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-foreground text-sm truncate">
                {e.name || e.assetId}
              </div>
              <div className="text-xs text-zinc-500 font-mono uppercase">
                {e.symbol}
              </div>
            </div>
            <div className={`font-mono font-bold ${color} flex items-center gap-1`}>
              <span>{type === "hit" ? e.hits : e.shits}</span>
              <span className="text-xl">
                {type === "hit" ? "🎯" : "💩"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
