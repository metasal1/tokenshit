"use client";

/**
 * Subtle diagonal beta notice — site-wide, non-blocking.
 */
const MSG =
  "beta — things break — bugs@tokenshit.com";

export default function BetaScrollBanner() {
  const unit = (
    <span className="beta-banner-unit inline-flex items-center gap-3 px-3 shrink-0">
      <span aria-hidden className="opacity-40">
        ·
      </span>
      <span>
        beta — shit breaks —{" "}
        <a
          href="mailto:bugs@tokenshit.com"
          className="underline underline-offset-2 decoration-white/30 hover:decoration-neon hover:text-neon pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          bugs@tokenshit.com
        </a>
      </span>
      <span aria-hidden className="opacity-40">
        ·
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
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} className="contents">
              {unit}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
