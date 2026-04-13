import { ImageResponse } from "next/og";
import { siteCopy } from "@/lib/constants";

export const LUXPADS_OG_SIZE = { width: 1200, height: 630 } as const;
export const LUXPADS_OG_ALT = `${siteCopy.legalName} — ${siteCopy.tagline}`;

/** 1200×630 card for Open Graph / link previews (Messages, Slack, etc.). */
export function luxpadsShareCardImageResponse() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(165deg, #faf9f7 0%, #e7e5e0 45%, #d6d3cd 100%)",
          padding: 72,
        }}
      >
        <div
          style={{
            fontSize: 92,
            fontWeight: 700,
            color: "#1c1917",
            fontFamily: 'Georgia, "Times New Roman", serif',
            letterSpacing: "-0.03em",
          }}
        >
          {siteCopy.legalName}
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 36,
            color: "#44403c",
            fontFamily: "system-ui, -apple-system, sans-serif",
            textAlign: "center",
            maxWidth: 920,
            lineHeight: 1.35,
            fontWeight: 500,
          }}
        >
          {siteCopy.tagline}
        </div>
        <div
          style={{
            marginTop: 52,
            fontSize: 26,
            color: "#78716c",
            fontFamily: "system-ui, -apple-system, sans-serif",
            letterSpacing: "0.02em",
          }}
        >
          {siteCopy.domainDisplay.toLowerCase()}
        </div>
      </div>
    ),
    { ...LUXPADS_OG_SIZE },
  );
}
