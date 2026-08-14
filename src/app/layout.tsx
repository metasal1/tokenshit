import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Monoton, Orbitron } from "next/font/google";
import Script from "next/script";
import ClientLayout from "@/components/ClientLayout";
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

/** Static OG card — same for / and /?ref=… (referral query does not need unique art). */
const OG_IMAGE = {
  url: "https://tokenshit.com/brand/og-share.png",
  secureUrl: "https://tokenshit.com/brand/og-share.png",
  width: 1200,
  height: 630,
  type: "image/png" as const,
  alt: "TOKEN$HIT — Every token is shit until proven otherwise.",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://tokenshit.com"),
  title: {
    default: "TOKEN$HIT — Every token is shit until proven otherwise",
    template: "%s · TOKEN$HIT",
  },
  description:
    "Every token is shit until proven otherwise. Vote HIT or SHIT on Solana tokens. Claim, swap, refer.",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.webmanifest",
  applicationName: "TOKEN$HIT",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TOKEN$HIT",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tokenshit.com",
    siteName: "TOKEN$HIT",
    title: "TOKEN$HIT — Every token is shit until proven otherwise",
    description:
      "Every token is shit until proven otherwise. Vote HIT or SHIT on Solana.",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    site: "@Tokenshit_",
    creator: "@Tokenshit_",
    title: "TOKEN$HIT — Every token is shit until proven otherwise",
    description:
      "Every token is shit until proven otherwise. Vote HIT or SHIT on Solana.",
    images: [OG_IMAGE.url],
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/brand/logo-mark-dark.png", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
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
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=swap"
          rel="stylesheet"
        />
        {/* Explicit static OG for crawlers that skip Next metadata merge */}
        <meta property="og:image" content={OG_IMAGE.url} />
        <meta property="og:image:secure_url" content={OG_IMAGE.secureUrl} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={OG_IMAGE.alt} />
        <meta name="twitter:image" content={OG_IMAGE.url} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="theme-color" content="#0a0a0f" />
        <meta name="apple-mobile-web-app-title" content="TOKEN$HIT" />
        {/* iOS splash / startup images */}
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-iphone-14-pro.png"
          media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-iphone-15-pro-max.png"
          media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-iphone-14.png"
          media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-iphone-x.png"
          media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-iphone-8.png"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-ipad-pro.png"
          media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link rel="apple-touch-startup-image" href="/splash/splash-boot.png" />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XTVEWC915F"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XTVEWC915F');
          `}
        </Script>
      </head>
      <body
        className="min-h-full flex flex-col font-sans"
        suppressHydrationWarning
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
