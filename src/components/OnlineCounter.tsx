"use client";

import { useState, useEffect } from "react";

function getDeviceId(): string {
  try {
    let id = localStorage.getItem("tokenshit_device_id");
    if (!id) {
      id = typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : "x-" + Math.random().toString(36).slice(2);
      localStorage.setItem("tokenshit_device_id", id);
    }
    return id;
  } catch {
    return "anon-" + Math.random().toString(36).slice(2);
  }
}

export default function OnlineCounter() {
  const [online, setOnline] = useState<number | null>(null);

  useEffect(() => {
    const deviceId = getDeviceId();

    const ping = () => {
      fetch("/api/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId }),
      })
        .then((r) => r.json())
        .then((d) => setOnline(d.online))
        .catch(() => {});
    };

    ping();
    const interval = setInterval(ping, 30000); // every 30s
    return () => clearInterval(interval);
  }, []);

  if (online === null) return null;

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "12px",
      color: "#71717a",
    }}>
      <span style={{
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        background: "#39ff14",
        boxShadow: "0 0 6px #39ff14",
        display: "inline-block",
      }} />
      {online} online
    </span>
  );
}
