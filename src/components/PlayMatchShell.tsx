import Link from "next/link";
import type { ReactNode } from "react";

type ShellLink = { href: string; label: string; primary?: boolean };

/**
 * Matches /play chrome: compact header, max-w-lg, orbitron/monoton.
 */
export function PlayMatchShell({
  kicker,
  title,
  titleAccent,
  links,
  children,
  fill = false,
}: {
  kicker?: string;
  title: ReactNode;
  /** Small orbitron label after title */
  titleAccent?: string;
  links?: ShellLink[];
  children: ReactNode;
  /** Play-style viewport fill */
  fill?: boolean;
}) {
  return (
    <div
      className={`mx-auto w-full max-w-xl px-3 pt-2 sm:pt-3 flex flex-col min-h-0 ${
        fill
          ? "h-[calc(100dvh-env(safe-area-inset-top)-3.5rem-4.25rem)] md:h-[calc(100dvh-env(safe-area-inset-top)-3.5rem)]"
          : "pb-[max(1.25rem,env(safe-area-inset-bottom))]"
      }`}
    >
      <header className="flex items-center justify-between gap-2 shrink-0 mb-2">
        <div className="min-w-0">
          {kicker ? (
            <p className="text-[9px] font-orbitron tracking-[0.16em] text-zinc-500 uppercase mb-0.5 truncate">
              {kicker}
            </p>
          ) : null}
          <h1 className="text-lg sm:text-xl font-monoton leading-none truncate">
            {title}
            {titleAccent ? (
              <span className="ml-1.5 align-middle text-[9px] font-orbitron tracking-[0.16em] text-zinc-500 uppercase">
                {titleAccent}
              </span>
            ) : null}
          </h1>
        </div>
        {links && links.length > 0 ? (
          <nav className="flex items-center gap-2.5 text-[10px] text-zinc-600 shrink-0 font-orbitron uppercase tracking-wider">
            {links.map((l) => (
              <Link
                key={l.href + l.label}
                href={l.href}
                className={
                  l.primary
                    ? "text-neon-blue hover:underline"
                    : "hover:text-zinc-400"
                }
              >
                {l.label}
              </Link>
            ))}
          </nav>
        ) : null}
      </header>
      <div className={`min-h-0 ${fill ? "flex-1" : ""}`}>{children}</div>
    </div>
  );
}
