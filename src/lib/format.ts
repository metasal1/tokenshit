export function formatPrice(n: number | undefined | null): string {
  if (n == null) return "—";
  if (n === 0) return "$0";
  if (Math.abs(n) < 0.0001) return `$${n.toExponential(2)}`;
  if (Math.abs(n) < 1) return `$${n.toPrecision(4)}`;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatLargeNumber(n: number | undefined | null): string {
  if (n == null) return "—";
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}

export function formatPercent(n: number | undefined | null): string {
  if (n == null) return "—";
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

export function percentColor(n: number | undefined | null): string {
  if (n == null) return "text-zinc-500";
  return n >= 0 ? "text-green-400" : "text-red-400";
}

// API scores: 100 = safe/established, 0 = risky/$HIT
export function riskColor(score: number | undefined | null): string {
  if (score == null) return "text-zinc-500";
  if (score >= 70) return "text-green-400";
  if (score >= 40) return "text-yellow-400";
  return "text-red-400";
}

export function riskBg(score: number | undefined | null): string {
  if (score == null) return "bg-zinc-800";
  if (score >= 70) return "bg-green-500/20";
  if (score >= 40) return "bg-yellow-500/20";
  return "bg-red-500/20";
}

export function hitScoreRoast(score: number | undefined | null): string {
  if (score == null) return "Not enough data to judge this one... suspicious.";
  if (score >= 90) return "Certified Blue Chip. Boring, but your wallet thanks you.";
  if (score >= 75) return "Relatively legit. Still crypto though, so... good luck.";
  if (score >= 60) return "Decent token. Your financial advisor might actually approve.";
  if (score >= 45) return "Mid-tier token. Could moon, could rug. Classic.";
  if (score >= 30) return "Getting spicy. Your financial advisor would NOT approve.";
  if (score >= 15) return "Maximum degen. This thing smells like a rug fresh out of the dryer.";
  return "Absolute $HIT. Congrats, you found the bottom of the barrel.";
}

export function hitScoreEmoji(score: number | undefined | null): string {
  if (score == null) return "🤷";
  if (score >= 90) return "💎";
  if (score >= 75) return "✅";
  if (score >= 60) return "🤔";
  if (score >= 45) return "🌶️";
  if (score >= 30) return "⚠️";
  if (score >= 15) return "🚨";
  return "💩";
}
