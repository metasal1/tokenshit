"use client";

import { useState, useEffect } from "react";
// Privy auth handled separately - VoteButtons uses device ID for voting

function getDeviceId(): string {
  try {
    let id = localStorage.getItem("tokenshit_device_id");
    if (!id) {
      // Fallback for browsers without crypto.randomUUID
      id = typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : "xxxx-xxxx-xxxx".replace(/x/g, () => Math.floor(Math.random() * 16).toString(16));
      localStorage.setItem("tokenshit_device_id", id);
    }
    return id;
  } catch {
    return "anon-" + Math.random().toString(36).slice(2);
  }
}

export default function VoteButtons({ assetId }: { assetId: string }) {
  const authenticated = false;
  const address: string | undefined = undefined;
  const isConnected = false;
  const [hits, setHits] = useState(0);
  const [shits, setShits] = useState(0);
  const [userVote, setUserVote] = useState<"hit" | "shit" | null>(null);
  const [voting, setVoting] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const voterId = isConnected && address ? address : getDeviceId();

  useEffect(() => {
    const deviceId = isConnected && address ? address : getDeviceId();
    fetch(`/api/votes?assetId=${encodeURIComponent(assetId)}&deviceId=${encodeURIComponent(deviceId)}`)
      .then((r) => r.json())
      .then((data) => {
        setHits(data.hits || 0);
        setShits(data.shits || 0);
        setUserVote(data.userVote || null);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [assetId, isConnected, address]);

  async function handleVote(vote: "hit" | "shit") {
    if (userVote || voting) return;
    setVoting(true);
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId,
          vote,
          deviceId: getDeviceId(),
          ...(isConnected && address ? { wallet: address } : {}),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setHits(data.hits || 0);
        setShits(data.shits || 0);
        setUserVote(vote);
      }
    } catch {}
    setVoting(false);
  }

  const hasVoted = userVote !== null;

  const btnBase = {
    padding: "16px 0",
    borderRadius: "12px",
    fontSize: "18px",
    fontWeight: "bold" as const,
    cursor: (hasVoted || voting ? "not-allowed" : "pointer") as string,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center" as const,
    gap: "4px",
    flex: "1",
    minHeight: "100px",
  };

  return (
    <div style={{ border: "1px solid #333", borderRadius: "12px", background: "#111", padding: "20px" }}>
      <p style={{ textAlign: "center", fontSize: "18px", fontWeight: "bold", color: "#fff", marginBottom: "16px" }}>
        Is this token 🎯 or 💩?
      </p>
      <div style={{ display: "flex", gap: "16px" }}>
        <button
          onClick={() => handleVote("hit")}
          disabled={hasVoted || voting}
          style={{
            ...btnBase,
            border: userVote === "hit" ? "3px solid #22c55e" : "3px solid #166534",
            background: "#14532d",
            color: "#4ade80",
            opacity: hasVoted && userVote !== "hit" ? 0.3 : 1,
          }}
        >
          <span style={{ fontSize: "32px" }}>🎯</span>
          <span style={{ color: "#4ade80" }}>Hit</span>
          <span style={{ fontSize: "14px", color: "#4ade80", fontFamily: "monospace" }}>
            {loaded ? hits : "—"}
          </span>
        </button>

        <button
          onClick={() => handleVote("shit")}
          disabled={hasVoted || voting}
          style={{
            ...btnBase,
            border: userVote === "shit" ? "3px solid #ef4444" : "3px solid #7f1d1d",
            background: "#450a0a",
            color: "#f87171",
            opacity: hasVoted && userVote !== "shit" ? 0.3 : 1,
          }}
        >
          <span style={{ fontSize: "32px" }}>💩</span>
          <span style={{ color: "#f87171" }}>Shit</span>
          <span style={{ fontSize: "14px", color: "#f87171", fontFamily: "monospace" }}>
            {loaded ? shits : "—"}
          </span>
        </button>
      </div>
      {hasVoted && (
        <p style={{ textAlign: "center", fontSize: "12px", color: "#888", marginTop: "12px" }}>
          You voted <strong style={{ color: userVote === "hit" ? "#4ade80" : "#f87171" }}>{userVote === "hit" ? "🎯" : "💩"}</strong> today
        </p>
      )}
    </div>
  );
}
