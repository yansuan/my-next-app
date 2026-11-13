import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "@/context/WalletContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "ReelMux — Create Videos, Images & Audio with the Latest AI Models",
  description:
    "One credit balance for creators and marketers to use Kling 4.0, Seedance 2.5, Veo 3.1, MiniMax H3, Wan 3.0, GPT Image 2.6, FLUX.2 Max, Suno and ElevenLabs.",
  metadataBase: new URL("https://reelmux.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#06070A] text-zinc-100 antialiased selection:bg-[#D4FF00] selection:text-black">
        <WalletProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <Footer />
        </WalletProvider>
      </body>
    </html>
  );
}
