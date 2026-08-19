"use client";

import { useCallback, useMemo, useState } from "react";
import { EmojiIcon } from "@/components/EmojiIcon";

type Props = {
  totalVotes: number;
  uniqueDevices: number;
  todayVotes: number;
};

export default function StatsShareButtons({
  totalVotes,
  uniqueDevices,
  todayVotes,
}: Props) {
  const [msg, setMsg] = useState("");

  const pageUrl = useMemo(() => {
    if (typeof window !== "undefined") return `${window.location.origin}/stats`;
    return "https://tokenshit.com/stats";
  }, []);

  const blurb = useMemo(() => {
    const v = totalVotes.toLocaleString();
    const u = uniqueDevices.toLocaleString();
    const t = todayVotes.toLocaleString();
    return `TOKEN$HIT stats: ${v} votes · ${u} visitors · ${t} today\n\n${pageUrl}`;
  }, [totalVotes, uniqueDevices, todayVotes, pageUrl]);

  const xUrl = useMemo(() => {
    const u = new URL("https://x.com/intent/tweet");
    u.searchParams.set("text", blurb);
    return u.toString();
  }, [blurb]);

  const tgUrl = useMemo(() => {
    const u = new URL("https://t.me/share/url");
    u.searchParams.set("url", pageUrl);
    u.searchParams.set(
      "text",
      `TOKEN$HIT stats: ${totalVotes.toLocaleString()} votes · ${uniqueDevices.toLocaleString()} visitors`
    );
    return u.toString();
  }, [pageUrl, totalVotes, uniqueDevices]);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(blurb);
      setMsg("Copied ✓");
      window.setTimeout(() => setMsg(""), 1600);
    } catch {
      setMsg(pageUrl);
    }
  }, [blurb, pageUrl]);

  const nativeShare = useCallback(async () => {
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({
          title: "TOKEN$HIT Stats",
          text: blurb,
          url: pageUrl,
        });
        setMsg("Shared ✓");
        window.setTimeout(() => setMsg(""), 1600);
        return;
      }
      await copy();
    } catch {
      /* user cancel */
    }
  }, [blurb, pageUrl, copy]);

  return (
    <div className="flex flex-col items-center md:items-end gap-1.5">
      <div className="flex flex-wrap justify-center md:justify-end gap-2">
        <button
          type="button"
          onClick={() => void nativeShare()}
          className="inline-flex items-center gap-1.5 rounded-xl bg-neon px-3 py-2 text-[11px] font-bold text-black hover:brightness-110 active:scale-[0.98]"
        >
          <EmojiIcon size={14}>📤</EmojiIcon>
          Share stats
        </button>
        <a
          href={xUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 px-3 py-2 text-[11px] font-bold text-white hover:bg-sky-400 active:scale-[0.98]"
        >
          <span className="font-black">𝕏</span>
          Post
        </a>
        <a
          href={tgUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#2AABEE] px-3 py-2 text-[11px] font-bold text-white hover:brightness-110 active:scale-[0.98]"
        >
          TG
        </a>
        <button
          type="button"
          onClick={() => void copy()}
          className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-600 px-3 py-2 text-[11px] font-semibold text-zinc-200 hover:border-neon active:scale-[0.98]"
        >
          Copy
        </button>
      </div>
      {msg ? (
        <p className="text-[10px] font-mono text-neon">{msg}</p>
      ) : null}
    </div>
  );
}
