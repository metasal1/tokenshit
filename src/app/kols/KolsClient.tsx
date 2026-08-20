"use client";

import { useMemo, useState } from "react";
import KolSwipeDeck, { type KolCard } from "@/components/KolSwipeDeck";
import KolRecommendModal from "@/components/KolRecommendModal";

export default function KolsClient({
  initialKols,
  totalApproved,
  deckLabel = "KOLs",
}: {
  initialKols: KolCard[];
  totalApproved: number;
  deckLabel?: string;
}) {
  const [search, setSearch] = useState("");
  const [minFollowers, setMinFollowers] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [prefill, setPrefill] = useState("");

  const filtered = useMemo(() => {
    let res = initialKols;
    const q = search.trim().toLowerCase();
    if (q) {
      res = res.filter(
        (k) =>
          k.handle.toLowerCase().includes(q) ||
          (k.displayName || "").toLowerCase().includes(q)
      );
    }
    if (minFollowers > 0) {
      res = res.filter((k) => (k.followers || 0) >= minFollowers);
    }
    return res;
  }, [search, minFollowers, initialKols]);

  function openRecommendModal(k?: KolCard) {
    if (k) setPrefill(`@${k.handle}`);
    setModalOpen(true);
  }

  function handleSwipeRight(k: KolCard) {
    // Right swipe = strong positive → open recommendation modal prefilled for that KOL
    openRecommendModal(k);
  }

  function handleSwipeLeft(_k: KolCard) {
    // left = pass / SHIT
  }

  return (
    <>
      {/* Filters */}
      <div className="mb-4 flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Search handle or name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm placeholder:text-zinc-600"
        />

        <select
          value={minFollowers}
          onChange={(e) => setMinFollowers(Number(e.target.value))}
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
        >
          <option value={0}>Any size</option>
          <option value={10000}>10k+ followers</option>
          <option value={25000}>25k+</option>
          <option value={50000}>50k+</option>
          <option value={100000}>100k+</option>
        </select>

        <button
          onClick={() => openRecommendModal()}
          className="rounded-xl bg-neon px-4 py-2 text-sm font-bold text-black active:opacity-90"
        >
          + Recommend new KOL
        </button>
      </div>

      {/* Deck label */}
      <div className="mb-2 flex items-center justify-between px-1">
        <div className="text-[10px] uppercase tracking-widest text-neon/80 font-orbitron">{deckLabel}</div>
        <div className="text-[10px] text-zinc-500">{initialKols.length} cards</div>
      </div>
      {/* Tinder-style Swipe Deck */}
      <div className="mb-2">
        <KolSwipeDeck
          key={`${search}-${minFollowers}`}
          kols={filtered}
          onSwipeRight={handleSwipeRight}
          onSwipeLeft={handleSwipeLeft}
        />
      </div>

      <p className="text-center text-[10px] text-zinc-500 mb-6">
        {filtered.length} in deck · {totalApproved} approved total
      </p>

      <KolRecommendModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setPrefill("");
        }}
        prefillHandle={prefill}
      />
    </>
  );
}
