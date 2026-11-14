import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { WalletProvider } from "@/context/WalletContext";
import { AppShell } from "@/components/layout/AppShell";

export const viewport: Viewport = {
  themeColor: "#06070A",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://reelmux.com"),
  title: {
    default: "ReelMux — Create Videos, Images & Audio with 73+ Flagship AI Models",
    template: "%s | ReelMux",
  },
  description:
    "One unified credit balance for creators, studios, and AI agents to generate cinema video, photorealistic images, and studio audio with Kling 4.0, Seedance 2.5, Google Veo 3.1, MiniMax H3, Wan 3.0, GPT Image 2.6, FLUX.2 Max, Suno v6, and ElevenLabs. 100 free credits on sign up.",
  keywords: [
    "ReelMux",
    "AI video generator",
    "text to video AI",
    "image to video AI",
    "frames to video",
    "reference to video",
    "Kling 4.0",
    "Seedance 2.5",
    "Google Veo 3.1",
    "MiniMax H3",
    "Hailuo 2.3",
    "Wan 3.0",
    "GPT Image 2.6",
    "FLUX.2 Max",
    "Nano Banana Pro",
    "Seedream 5.0 Pro",
    "Suno v6 AI music",
    "ElevenLabs v3",
    "MCP server video generation",
    "AI agent media API",
  ],
  authors: [{ name: "ReelMux Team", url: "https://reelmux.com" }],
  creator: "ReelMux",
  publisher: "ReelMux",
  applicationName: "ReelMux",
  category: "technology",
  alternates: {
    canonical: "https://reelmux.com",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48", type: "image/x-icon" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://reelmux.com",
    siteName: "ReelMux",
    title: "ReelMux — One Credit Balance for Every Flagship AI Model",
    description:
      "Generate cinema-grade AI videos, images, and audio with Kling 4.0, Seedance 2.5, Veo 3.1, MiniMax H3, Wan 3.0, GPT Image 2.6, FLUX.2 Max, and Suno v6. See the exact credit price first. Automatic refund on failed runs.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "ReelMux — AI Video, Image & Audio Creative Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ReelMux — Create Videos, Images & Audio with 73+ Flagship AI Models",
    description:
      "One unified credit wallet for Kling 4.0, Seedance 2.5, Veo 3.1, MiniMax H3, GPT Image 2.6, FLUX.2 Max, and Suno v6. 100 free credits on sign up.",
    images: ["/twitter-image"],
    creator: "@reelmux",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const JSON_LD_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://reelmux.com/#organization",
      name: "ReelMux",
      url: "https://reelmux.com",
      logo: {
        "@type": "ImageObject",
        url: "https://reelmux.com/logo.svg",
      },
      description:
        "Unified multimodal AI studio for video, image, and audio generation across 73+ flagship models.",
    },
    {
      "@type": "WebSite",
      "@id": "https://reelmux.com/#website",
      url: "https://reelmux.com",
      name: "ReelMux",
      publisher: { "@id": "https://reelmux.com/#organization" },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://reelmux.com/models?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SoftwareApplication",
      name: "ReelMux Studio",
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Web",
      url: "https://reelmux.com",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "100 free trial credits on sign up with no credit card required.",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_SCHEMA) }}
        />
      </head>
      <body className="min-h-screen bg-[#06070A] text-zinc-100 antialiased selection:bg-[#D4FF00] selection:text-black">
        <Script
          src="https://www.googletagmanager.com/gtm.js?id=GTM-PDHCRWCF"
          strategy="afterInteractive"
        />
        <Script id="google-gtm-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
          `}
        </Script>
        <WalletProvider>
          <AppShell>{children}</AppShell>
        </WalletProvider>
      </body>
    </html>
  );
}
