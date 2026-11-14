import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#D4FF00",
          borderRadius: "42px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "32px",
            top: "32px",
            width: "82px",
            height: "82px",
            borderRadius: "20px",
            border: "13px solid #06070A",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "65px",
            top: "65px",
            width: "82px",
            height: "82px",
            borderRadius: "20px",
            background: "#D4FF00",
            border: "13px solid #06070A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderTop: "14px solid transparent",
              borderBottom: "14px solid transparent",
              borderLeft: "22px solid #06070A",
              marginLeft: "6px",
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
