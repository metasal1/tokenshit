"use client";

/**
 * Diagonal scrolling beta notice — site-wide.
 * Non-blocking (pointer-events none except mail link).
 */
const MSG =
  "this app is currently in beta — shit will break — report it bugs@tokenshit.com";

export default function BetaScrollBanner() {
  // Repeat so marquee never gaps
  const unit = (
    <span className="beta-banner-unit inline-flex items-center gap-4 px-4 shrink-0">
      <span aria-hidden className="text-black/50">
        ◆
      </span>
      <span>
        this app is currently in beta — shit will break — report it{" "}
        <a
          href="mailto:bugs@tokenshit.com"
          className="underline font-bold decoration-2 underline-offset-2 hover:text-black pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          bugs@tokenshit.com
        </a>
      </span>
      <span aria-hidden className="text-black/50">
        ◆
      </span>
    </span>
  );

  return (
    <div
      className="beta-banner-root pointer-events-none select-none"
      role="status"
      aria-label={MSG}
    >
      <div className="beta-banner-strip">
        <div className="beta-banner-track">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="contents">
              {unit}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
