import type { Metadata } from "next";
import Link from "next/link";
import AnimatedLogo from "@/components/AnimatedLogo";
import { BRAND, BRAND_COLOR_SWATCHES } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Brand — TOKENSHIT",
  description:
    "TOKENSHIT brand guide: colors, type, logo, voice, assets. Every token is shit until proven otherwise.",
  alternates: { canonical: "/brand" },
};

export const dynamic = "force-static";
export const revalidate = 3600;

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-4">
      <h2 className="text-xl sm:text-2xl font-black text-white border-b border-border pb-2">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function BrandPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-3 sm:px-4 pt-6 pb-16 sm:py-12 space-y-12">
      <header className="space-y-4">
        <p className="text-xs font-mono uppercase tracking-widest text-zinc-500">
          Brand guide · v1
        </p>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <AnimatedLogo size="hero" />
          <p className="text-sm text-zinc-400 max-w-sm sm:text-right leading-snug">
            {BRAND.tagline}
          </p>
        </div>
        <nav className="flex flex-wrap gap-2 text-xs font-mono">
          {[
            ["#logo", "Logo"],
            ["#colors", "Colors"],
            ["#type", "Type"],
            ["#voice", "Voice"],
            ["#product", "Product"],
            ["#assets", "Assets"],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="rounded-full border border-border px-3 py-1.5 text-zinc-400 hover:border-neon hover:text-neon transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>
      </header>

      <Section id="logo" title="Logo">
        <p className="text-sm text-zinc-400 leading-relaxed">
          Wordmark is <span className="font-monoton text-neon">TOKEN</span>
          <span className="font-monoton neon-dollar">$</span>
          <span className="font-monoton text-neon">HIT</span> in{" "}
          <strong className="text-zinc-200">Monoton</strong>. The{" "}
          <span className="neon-dollar">$</span> is magenta neon — not green.
          Bare mark only: no boxes, no app-icon chrome on social shares.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-card p-8 flex items-center justify-center min-h-[140px]">
            <AnimatedLogo size="nav" />
          </div>
          <div className="rounded-xl border border-border bg-white p-8 flex items-center justify-center min-h-[140px]">
            <span className="text-3xl font-monoton">
              <span style={{ color: BRAND.colors.background }}>TOKEN</span>
              <span style={{ color: BRAND.colors.neonMagenta }}>$</span>
              <span style={{ color: BRAND.colors.background }}>HIT</span>
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(
            [
              ["Icon", BRAND.logo.assets.iconSvg],
              ["Solid $", BRAND.logo.assets.squareSolid],
              ["Outline", BRAND.logo.assets.squareOutline],
              ["Gradient", BRAND.logo.assets.squareGradient],
            ] as const
          ).map(([label, src]) => (
            <a
              key={src}
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-border bg-card p-4 flex flex-col items-center gap-2 hover:border-neon/50 transition-colors"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={label} className="h-16 w-16 object-contain" />
              <span className="text-[11px] font-mono text-zinc-500">{label}</span>
            </a>
          ))}
        </div>
        <ul className="text-sm text-zinc-400 space-y-1 list-disc pl-5">
          <li>
            Clear space: ≥ height of the <code className="text-neon">$</code> on
            all sides
          </li>
          <li>Min digital size: 24px tall wordmark; 32px for icon</li>
          <li>Never recolor $ to green or stretch Monoton</li>
        </ul>
      </Section>

      <Section id="colors" title="Colors">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {BRAND_COLOR_SWATCHES.map((c) => (
            <div
              key={c.key}
              className="rounded-xl border border-border overflow-hidden bg-card"
            >
              <div
                className="h-16 w-full"
                style={{ backgroundColor: c.hex }}
                title={c.hex}
              />
              <div className="p-2.5 space-y-0.5">
                <div className="text-xs font-semibold text-zinc-200">{c.key}</div>
                <div className="text-[11px] font-mono text-neon">{c.hex}</div>
                <div className="text-[10px] text-zinc-500 leading-snug">
                  {c.role}
                </div>
              </div>
            </div>
          ))}
        </div>
        <pre className="rounded-xl border border-border bg-card p-4 text-[11px] sm:text-xs font-mono text-zinc-400 overflow-x-auto leading-relaxed">{`/* globals.css @theme */
--color-background: ${BRAND.colors.background};
--color-neon:        ${BRAND.colors.neon};
--color-neon-blue:   ${BRAND.colors.neonBlue};
--color-neon-purple: ${BRAND.colors.neonPurple};
--color-card:        ${BRAND.colors.card};
--color-border:      ${BRAND.colors.border};`}</pre>
      </Section>

      <Section id="type" title="Typography">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">
              Brand · Monoton
            </p>
            <p className="font-monoton text-3xl sm:text-4xl neon-text leading-none">
              TOKEN$HIT
            </p>
            <p className="text-xs text-zinc-500">
              Lockups, hero, 404, OG brand mark only
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">
              Display · Orbitron
            </p>
            <p
              className="text-2xl font-bold tracking-wide"
              style={{ fontFamily: "var(--font-orbitron), sans-serif" }}
            >
              ARENA COURT
            </p>
            <p className="text-xs text-zinc-500">Optional display / HUD labels</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">
              UI · Geist
            </p>
            <p className="text-lg text-foreground">
              Every token is shit until proven otherwise.
            </p>
            <p className="text-xs text-zinc-500">Body, buttons, nav</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">
              Data · Geist Mono
            </p>
            <p className="font-mono text-neon text-lg tabular-nums">
              $0.0000373 · 1,225,000
            </p>
            <p className="text-xs text-zinc-500">
              Prices, mints, countdowns — never scientific notation
            </p>
          </div>
        </div>
      </Section>

      <Section id="voice" title="Voice">
        <p className="text-sm text-zinc-300 leading-relaxed">
          Tone: {BRAND.voice.tone.join(" · ")}. CT-native, short, no corporate
          speak.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-neon/30 bg-neon/5 p-4 space-y-2">
            <h3 className="text-sm font-bold text-neon">Do</h3>
            <ul className="text-sm text-zinc-300 space-y-1.5 list-disc pl-4">
              {BRAND.voice.do.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 space-y-2">
            <h3 className="text-sm font-bold text-red-400">Don&apos;t</h3>
            <ul className="text-sm text-zinc-300 space-y-1.5 list-disc pl-4">
              {BRAND.voice.dont.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 space-y-2 text-sm">
          <p className="text-zinc-500 text-xs font-mono uppercase">Example</p>
          <p className="text-zinc-200">
            “Voted SHIT on that bag. Court adjourned.{" "}
            <span className="text-neon-blue">tokenshit.com</span>”
          </p>
          <p className="text-zinc-600 line-through">
            “Excited to announce our innovative token rating ecosystem!!!”
          </p>
        </div>
      </Section>

      <Section id="product" title="Product marks">
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-border bg-card p-4 space-y-1 font-mono text-xs">
            <div className="text-zinc-500">Ticker</div>
            <div className="text-neon text-base">{BRAND.tickerDisplay}</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 space-y-1 font-mono text-xs">
            <div className="text-zinc-500">X</div>
            <a
              href={BRAND.x}
              className="text-neon-blue hover:underline text-base"
              target="_blank"
              rel="noopener noreferrer"
            >
              @{BRAND.xHandle}
            </a>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 space-y-1 font-mono text-xs sm:col-span-2">
            <div className="text-zinc-500">Mint</div>
            <div className="text-zinc-200 break-all">{BRAND.mint}</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 space-y-1 font-mono text-xs sm:col-span-2">
            <div className="text-zinc-500">Treasury</div>
            <div className="text-zinc-200 break-all">{BRAND.treasury}</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-lg bg-neon text-black text-sm font-semibold px-4 py-2">
            Primary CTA
          </span>
          <span className="rounded-lg border border-zinc-600 text-white text-sm font-semibold px-4 py-2">
            Secondary
          </span>
          <span className="rounded-lg bg-green-500/20 text-green-400 text-sm font-semibold px-4 py-2">
            HIT
          </span>
          <span className="rounded-lg bg-red-500/20 text-red-400 text-sm font-semibold px-4 py-2">
            SHIT
          </span>
        </div>
      </Section>

      <Section id="assets" title="Assets">
        <div className="grid sm:grid-cols-3 gap-3">
          {(
            [
              ["Logo", BRAND.logo.assets.logoJpg],
              ["Banner", BRAND.logo.assets.banner],
              ["X banner", BRAND.logo.assets.xBanner],
              ["Icon SVG", BRAND.logo.assets.iconSvg],
              ["Square solid", BRAND.logo.assets.squareSolid],
            ] as const
          ).map(([label, src]) => (
            <a
              key={src}
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-border bg-card overflow-hidden hover:border-neon/40 transition-colors"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={label}
                className="w-full h-28 object-cover bg-zinc-900"
              />
              <div className="px-3 py-2 text-xs font-mono text-zinc-400 flex justify-between gap-2">
                <span>{label}</span>
                <span className="text-zinc-600 truncate">{src}</span>
              </div>
            </a>
          ))}
        </div>
        <p className="text-sm text-zinc-500">
          Machine-readable:{" "}
          <Link href="/brand/BRAND.md" className="text-neon-blue hover:underline">
            /brand/BRAND.md
          </Link>
          {" · "}
          <Link href="/solana.txt" className="text-neon-blue hover:underline">
            /solana.txt
          </Link>
          {" · "}
          <code className="text-zinc-400">src/lib/brand.ts</code>
        </p>
      </Section>

      <footer className="pt-4 border-t border-border text-center text-xs text-zinc-600 font-mono">
        {BRAND.site} · {BRAND.tagline}
      </footer>
    </div>
  );
}
