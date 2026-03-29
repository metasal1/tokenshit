import type { Metadata } from "next";
import AnimatedLogo from "@/components/AnimatedLogo";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Brand — TokenShit",
  description: "TokenShit brand guidelines, logos, colors, and assets.",
};

const colors = [
  { name: "Neon Green", hex: "#39ff14", css: "--color-neon", dark: false },
  { name: "Neon Purple", hex: "#b94dff", css: "--color-neon-purple", dark: false },
  { name: "Neon Blue", hex: "#00d4ff", css: "--color-neon-blue", dark: false },
  { name: "Warm White", hex: "#fff8e7", css: "neon-text glow", dark: false },
  { name: "Background", hex: "#0a0a0f", css: "--color-background", dark: true },
  { name: "Card", hex: "#12121a", css: "--color-card", dark: true },
  { name: "Border", hex: "#2a2a3a", css: "--color-border", dark: true },
  { name: "Foreground", hex: "#e4e4e7", css: "--color-foreground", dark: true },
];

const fonts = [
  {
    name: "Monoton",
    usage: "Logo / Display",
    sample: "TOKEN$HIT",
    className: "font-monoton text-4xl neon-glow",
  },
  {
    name: "Orbitron",
    usage: "Headings / UI Accents",
    sample: "TOKENS HIT DIFFERENT",
    className: "font-orbitron text-2xl",
  },
  {
    name: "Geist Sans",
    usage: "Body / UI Text",
    sample: "The quick brown fox jumps over the lazy dog",
    className: "font-sans text-lg",
  },
  {
    name: "Geist Mono",
    usage: "Code / Data / Stats",
    sample: "0x7a3b...9f2c → 420.69 SOL",
    className: "font-mono text-lg",
  },
];

const logos = [
  { src: "/logo-neon.jpg", label: "Neon Sign (JPG)", bg: "bg-black" },
];

const assets = [
  { path: "icon.svg", label: "Icon (SVG)" },
  { path: "square-gradient.png", label: "Square Gradient" },
  { path: "square-solid.png", label: "Square Solid" },
  { path: "square-outline.png", label: "Square Outline" },
  { path: "og-image.png", label: "OG Image" },
];

export default function BrandPage() {
  return (
    <main className="min-h-screen px-6 py-16 max-w-5xl mx-auto space-y-20">
      {/* Header */}
      <section className="text-center space-y-6">
        <AnimatedLogo size="hero" />
        <p className="text-zinc-400 text-lg max-w-xl mx-auto">
          Brand guidelines, assets, and resources for TokenShit — the real-time 
          Solana token sentiment tracker.
        </p>
      </section>

      {/* Logo */}
      <section className="space-y-6">
        <h2 className="font-orbitron text-2xl text-neon">LOGO</h2>
        <p className="text-zinc-400">
          The TokenShit logo uses <strong className="text-foreground">Monoton</strong> with 
          a signature green neon <span className="text-neon font-bold">$</span> replacing 
          the &quot;S&quot;. The dollar sign pulses — it never sits still.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Animated CSS logo */}
          <div className="rounded-xl border border-border bg-background p-8 flex items-center justify-center">
            <AnimatedLogo size="nav" />
          </div>
          {/* Static neon sign */}
          {logos.map((logo) => (
            <div key={logo.src} className={`rounded-xl border border-border ${logo.bg} p-4 flex flex-col items-center gap-3`}>
              <Image src={logo.src} alt={logo.label} width={400} height={200} className="rounded-lg object-contain" />
              <span className="text-xs text-zinc-500">{logo.label}</span>
            </div>
          ))}
        </div>
        <div className="bg-card rounded-xl border border-border p-6 space-y-2">
          <h3 className="font-orbitron text-sm text-neon-purple">USAGE RULES</h3>
          <ul className="text-zinc-400 text-sm space-y-1 list-disc list-inside">
            <li>Always keep the <span className="text-neon font-bold">$</span> green — never match it to surrounding text</li>
            <li>Minimum clear space: 1× the height of the dollar sign on all sides</li>
            <li>Dark backgrounds only — never place on white or light surfaces</li>
            <li>Don&apos;t animate the logo in contexts where motion is inaccessible</li>
          </ul>
        </div>
      </section>

      {/* Colors */}
      <section className="space-y-6">
        <h2 className="font-orbitron text-2xl text-neon">COLORS</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {colors.map((c) => (
            <div key={c.hex} className="space-y-2">
              <div
                className="w-full aspect-square rounded-xl border border-border"
                style={{ backgroundColor: c.hex }}
              />
              <div>
                <p className="text-sm font-medium">{c.name}</p>
                <p className="text-xs text-zinc-500 font-mono">{c.hex}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section className="space-y-6">
        <h2 className="font-orbitron text-2xl text-neon">TYPOGRAPHY</h2>
        <div className="space-y-6">
          {fonts.map((f) => (
            <div key={f.name} className="bg-card rounded-xl border border-border p-6 space-y-3">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-orbitron text-sm text-neon-purple">{f.name}</h3>
                <span className="text-xs text-zinc-500">{f.usage}</span>
              </div>
              <p className={f.className}>{f.sample}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Assets */}
      <section className="space-y-6">
        <h2 className="font-orbitron text-2xl text-neon">ASSETS</h2>
        <p className="text-zinc-400 text-sm">
          Download brand assets for use in articles, integrations, and promotions.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {assets.map((a) => (
            <a
              key={a.path}
              href={`/brand/${a.path}`}
              download
              className="bg-card rounded-xl border border-border p-4 flex flex-col items-center gap-3 hover:border-neon/30 transition-colors group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/brand/${a.path}`}
                alt={a.label}
                className="w-24 h-24 object-contain rounded-lg"
              />
              <span className="text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors">{a.label}</span>
            </a>
          ))}
        </div>
      </section>

      {/* Tone */}
      <section className="space-y-6">
        <h2 className="font-orbitron text-2xl text-neon">VOICE &amp; TONE</h2>
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
              <h3 className="text-neon font-bold">✅ We are</h3>
              <ul className="text-zinc-400 space-y-1 list-disc list-inside">
                <li>Blunt, irreverent, and honest</li>
                <li>Data-driven sentiment, not financial advice</li>
                <li>Fun first — crypto doesn&apos;t have to be boring</li>
                <li>Community-powered (your votes shape the feed)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="text-neon-purple font-bold">❌ We&apos;re not</h3>
              <ul className="text-zinc-400 space-y-1 list-disc list-inside">
                <li>Shilling tokens or giving financial advice</li>
                <li>Corporate or sanitized</li>
                <li>Taking ourselves too seriously</li>
                <li>Afraid of the 💩 emoji</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="text-center pt-8 border-t border-border">
        <p className="text-zinc-500 text-sm">
          Questions about brand usage?{" "}
          <a href="https://x.com/tokenshit_" className="text-neon hover:underline" target="_blank" rel="noopener">
            Hit us up on X
          </a>
        </p>
      </section>
    </main>
  );
}
