import type { Metadata } from "next";
import { Geist, Geist_Mono, Monoton, Orbitron } from "next/font/google";
import Link from "next/link";
import AnimatedLogo from "@/components/AnimatedLogo";
import OnlineCounter from "@/components/OnlineCounter";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const monoton = Monoton({
  variable: "--font-monoton",
  weight: "400",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tokenshit.com"),
  title: "TokenShit — Every token is shit until proven otherwise",
  description:
    "Solana token explorer with attitude. Search tokens, check risk scores, and find out which ones are certified $HIT.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${monoton.variable} ${orbitron.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center group">
              <AnimatedLogo size="nav" />
            </Link>
            <div className="flex items-center gap-4 text-sm text-zinc-400">
              <Link
                href="/"
                className="hover:text-foreground transition-colors"
              >
                Home
              </Link>
              <Link
                href="/stats"
                className="hover:text-foreground transition-colors"
              >
                Stats
              </Link>
              <OnlineCounter />
            </div>
          </div>
        </nav>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border py-6 text-center text-sm text-zinc-500">
          <p>
            💩 TokenShit — Every token is shit until proven otherwise.
          </p>
          <p className="mt-1 text-zinc-600">
            Data powered by{" "}
            <a
              href="https://tokens.xyz"
              className="text-neon-blue hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Tokens.xyz
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
