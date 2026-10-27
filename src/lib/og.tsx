import { ImageResponse } from "next/og";
import { flagships } from "@/data/projects";
import { machines } from "@/lib/iso";

export const ogSize = { width: 1200, height: 630 };

/** Shared Open Graph card: the name on the lavender field beside a stack of system colours. */
export function renderOg({ kicker, title, subtitle }: { kicker: string; title: string; subtitle: string }) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#eef0fb", padding: 64, color: "#15163a" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: 640 }}>
          <div style={{ display: "flex", alignSelf: "flex-start", background: "#ffffff", borderRadius: 999, padding: "8px 18px", fontSize: 22, color: "#4e5175" }}>
            {kicker}
          </div>
          <div style={{ fontSize: 104, fontWeight: 800, lineHeight: 0.9, letterSpacing: -4, marginTop: 28 }}>{title}</div>
          <div style={{ fontSize: 32, lineHeight: 1.25, color: "#4e5175", marginTop: 28 }}>{subtitle}</div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 18, width: 400, alignContent: "center", justifyContent: "flex-end" }}>
          {flagships.map((p) => (
            <div
              key={p.slug}
              style={{
                width: 180,
                height: 96,
                borderRadius: 24,
                background: machines[p.slug].color,
                display: "flex",
                alignItems: "flex-end",
                padding: "0 16px 14px",
                fontSize: 21,
                fontWeight: 700,
              }}
            >
              {p.title.split(" /")[0]}
            </div>
          ))}
        </div>
      </div>
    ),
    ogSize,
  );
}
