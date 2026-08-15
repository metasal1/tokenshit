"use client";

/**
 * Flat neon beta ticker under the header (no diagonal tilt).
 */
const MSG =
  "this app is currently in beta — shit will break — report it bugs@tokenshit.com";

export default function BetaScrollBanner() {
  const unit = (
    <span className="beta-banner-unit inline-flex items-center gap-4 px-4 shrink-0">
      <span aria-hidden className="text-black/45">
        ◆
      </span>
      <span>
        this app is currently in beta — shit will break — report it{" "}
        <a
          href="mailto:bugs@tokenshit.com"
          className="underline font-bold decoration-2 underline-offset-2 hover:text-black/80 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          bugs@tokenshit.com
        </a>
      </span>
      <span aria-hidden className="text-black/45">
        ◆
      </span>
    </span>
  );

  return (
    <div
      className="beta-banner-root"
      role="status"
      aria-label={MSG}
      suppressHydrationWarning
    >
      <div className="beta-banner-strip">
        <div className="beta-banner-track">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="inline-flex shrink-0">
              {unit}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
