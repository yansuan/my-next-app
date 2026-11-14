import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ReelMux — AI Video, Image & Audio Creative Studio",
    short_name: "ReelMux",
    description:
      "One credit balance for Kling 4.0, Seedance 2.5, Veo 3.1, MiniMax H3, Wan 3.0, GPT Image 2.6, FLUX.2 Max, Suno v6 and ElevenLabs.",
    start_url: "/",
    display: "standalone",
    background_color: "#06070A",
    theme_color: "#D4FF00",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "16x16 32x32 48x48",
        type: "image/x-icon",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
