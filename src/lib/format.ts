/**
 * Human price formatting — never scientific notation.
 * $3.73e-5 → $0.0000373
 */
export function formatPrice(n: number | undefined | null): string {
  if (n == null || !Number.isFinite(n)) return "—";
  if (n === 0) return "$0";

  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);

  if (abs >= 1_000_000) {
    return `${sign}$${abs.toLocaleString("en-US", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    })}`;
  }
  if (abs >= 1000) {
    return `${sign}$${abs.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  if (abs >= 1) {
    return `${sign}$${abs.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    })}`;
  }
  if (abs >= 0.01) {
    return `${sign}$${trimZeros(abs.toFixed(4))}`;
  }
  if (abs >= 0.0001) {
    return `${sign}$${trimZeros(abs.toFixed(6))}`;
  }

  // Sub-0.0001: keep ~4 significant digits as plain decimal
  // e.g. 3.73e-5 → 0.0000373
  const exp = Math.floor(Math.log10(abs));
  const decimals = Math.min(12, Math.max(6, -exp + 3));
  return `${sign}$${trimZeros(abs.toFixed(decimals))}`;
}

function trimZeros(s: string): string {
  if (!s.includes(".")) return s;
  return s.replace(/\.?0+$/, "");
}

export function formatLargeNumber(n: number | undefined | null): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(2)}K`;
  if (abs >= 1) return `${sign}$${abs.toFixed(2)}`;
  if (abs === 0) return "$0";
  // tiny market caps still use $ prefix once
  return `${sign}$${trimZeros(abs.toFixed(2))}`;
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
  return "☠️";
}

import type { LucideIcon } from "lucide-react";
import {
  Gem,
  ShieldCheck,
  HelpCircle,
  Flame,
  AlertTriangle,
  Siren,
  Skull,
} from "lucide-react";

export interface HitScoreIcon {
  Icon: LucideIcon;
  className: string;
}

export function hitScoreIcon(score: number | undefined | null): HitScoreIcon {
  const glow = (rgb: string) => `drop-shadow-[0_0_10px_rgba(${rgb},0.55)]`;
  if (score == null)   return { Icon: HelpCircle,     className: `text-zinc-500 ${glow("113,113,122")}` };
  if (score >= 90)     return { Icon: Gem,            className: `text-cyan-300 ${glow("103,232,249")}` };
  if (score >= 75)     return { Icon: ShieldCheck,    className: `text-green-400 ${glow("74,222,128")}` };
  if (score >= 60)     return { Icon: HelpCircle,     className: `text-yellow-400 ${glow("250,204,21")}` };
  if (score >= 45)     return { Icon: Flame,          className: `text-orange-400 ${glow("251,146,60")}` };
  if (score >= 30)     return { Icon: AlertTriangle,  className: `text-orange-500 ${glow("249,115,22")}` };
  if (score >= 15)     return { Icon: Siren,          className: `text-red-500   ${glow("239,68,68")}` };
  return                       { Icon: Skull,         className: `text-red-500   ${glow("239,68,68")}` };
}
