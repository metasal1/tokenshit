import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import ClientLayout from "@/components/ClientLayout";
import { GA_MEASUREMENT_ID } from "@/lib/analytics";
import { defaultMetadata, siteJsonLd } from "@/lib/seo";
import "./globals.css";

/** Local fonts — no Google Fonts fetch at build (CF / offline safe). */
const geistSans = localFont({
  src: [
    {
      path: "../../public/brand/fonts/Inter-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/brand/fonts/Inter-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = localFont({
  src: [
    {
      path: "../../public/brand/fonts/Inter-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/brand/fonts/Inter-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-geist-mono",
  display: "swap",
});

const monoton = localFont({
  src: "../../public/brand/fonts/Monoton-Regular.ttf",
  variable: "--font-monoton",
  weight: "400",
  display: "swap",
});

const orbitron = localFont({
  src: "../../public/brand/fonts/Orbitron-Bold.ttf",
  variable: "--font-orbitron",
  weight: "700",
  display: "swap",
});

export const metadata: Metadata = {
  ...defaultMetadata,
  // Home sets its own canonical; do NOT set root canonical to "/"
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0f" },
    { color: "#0a0a0f" },
  ],
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
  const jsonLd = siteJsonLd();
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${monoton.variable} ${orbitron.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <link
          rel="alternate"
          type="text/plain"
          href="/llms.txt"
          title="llms.txt"
        />
        {/* Noto emoji optional CDN — non-blocking; build does not depend on it */}
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=swap"
          rel="stylesheet"
        />
        {/* OG/Twitter images come from Metadata API only.
            Hardcoding default here made crawlers pick default.png
            even when pages set a custom og:image (first-tag-wins). */}
        <meta name="twitter:site" content="@Tokenshit_" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="theme-color" content="#0a0a0f" />
        <meta name="apple-mobile-web-app-title" content="TOKEN$HIT" />
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {GA_MEASUREMENT_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', { anonymize_ip: true });
          `}
            </Script>
          </>
        ) : null}
      </head>
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
