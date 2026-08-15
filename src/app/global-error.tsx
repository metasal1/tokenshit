"use client";

/**
 * Root error boundary — must include html/body (replaces root layout).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          background: "#0a0a0f",
          color: "#fff8e7",
          fontFamily: "system-ui, sans-serif",
          display: "grid",
          placeItems: "center",
          textAlign: "center",
          padding: 24,
        }}
      >
        <div>
          <div style={{ fontSize: 28, letterSpacing: "0.04em", marginBottom: 12 }}>
            TOKEN<span style={{ color: "#39ff14" }}>$</span>HIT
          </div>
          <p style={{ color: "#a1a1aa", fontSize: 14, maxWidth: 320, margin: "0 auto 20px" }}>
            App hit a client error. Clear cache and reload.
          </p>
          <button
            type="button"
            onClick={() => {
              try {
                if ("serviceWorker" in navigator) {
                  navigator.serviceWorker.getRegistrations().then((regs) => {
                    regs.forEach((r) => r.unregister());
                  });
                }
                if ("caches" in window) {
                  caches.keys().then((keys) =>
                    Promise.all(keys.map((k) => caches.delete(k)))
                  );
                }
              } catch {
                /* */
              }
              reset();
              location.href = "/?nocache=" + Date.now();
            }}
            style={{
              padding: "12px 20px",
              borderRadius: 12,
              border: 0,
              background: "#39ff14",
              color: "#000",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Clear cache & reload
          </button>
          {error?.message && (
            <p
              style={{
                marginTop: 16,
                fontSize: 10,
                color: "#52525b",
                fontFamily: "ui-monospace, monospace",
                maxWidth: 280,
                wordBreak: "break-word",
              }}
            >
              {error.message.slice(0, 160)}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
