import { ImageResponse } from "next/og";

export const alt = "ReelMux — One Credit Balance for Every Flagship AI Model";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#06070A",
          backgroundImage:
            "radial-gradient(circle at 85% 15%, rgba(212, 255, 0, 0.22), transparent 45%), radial-gradient(circle at 15% 85%, rgba(6, 182, 212, 0.16), transparent 45%)",
          padding: "64px 72px",
          color: "#FFFFFF",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top Brand Row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                background: "#D4FF00",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#06070A",
                fontSize: "30px",
                fontWeight: 900,
              }}
            >
              R
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "34px", fontWeight: 800, letterSpacing: "-0.03em" }}>
                ReelMux
              </span>
              <span style={{ fontSize: "15px", color: "#A1A1AA" }}>reelmux.com</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 20px",
              borderRadius: "999px",
              border: "1px solid rgba(212, 255, 0, 0.4)",
              background: "rgba(212, 255, 0, 0.1)",
              color: "#D4FF00",
              fontSize: "18px",
              fontWeight: 700,
            }}
          >
            100 Free Credits · No Card Needed
          </div>
        </div>

        {/* Center Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "980px" }}>
          <div
            style={{
              fontSize: "68px",
              fontWeight: 900,
              lineHeight: 1.06,
              letterSpacing: "-0.03em",
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            Create Videos, Images &amp; Audio with{" "}
            <span style={{ color: "#D4FF00", marginLeft: "16px" }}>73+ Flagship AI Models</span>
          </div>
          <div style={{ fontSize: "26px", color: "#A1A1AA", lineHeight: 1.4 }}>
            One unified credit wallet. Exact price before every run. Automatic refund on failed
            generations. Built-in MCP Server for AI agents.
          </div>
        </div>

        {/* Bottom Model Pills */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
          {[
            "Kling 4.0",
            "Seedance 2.5",
            "Google Veo 3.1",
            "MiniMax H3",
            "Wan 3.0",
            "GPT Image 2.6",
            "FLUX.2 Max",
            "Suno v6",
            "ElevenLabs v3",
          ].map((model) => (
            <div
              key={model}
              style={{
                padding: "10px 18px",
                borderRadius: "12px",
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                fontSize: "18px",
                fontWeight: 600,
                color: "#E4E4E7",
              }}
            >
              {model}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
