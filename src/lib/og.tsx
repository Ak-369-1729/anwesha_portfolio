import { ImageResponse } from "next/og";
import { flagships } from "@/data/projects";

export const ogSize = { width: 1200, height: 630 };

const INK = "#1b2f6e";
const PAPER = "#f4f7f8";

/** Shared Open Graph card: a drawing sheet with the flagship components and a title block. */
export function renderOg({ kicker, title, subtitle }: { kicker: string; title: string; subtitle: string }) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: PAPER, padding: 28 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", border: `3px solid ${INK}`, padding: 6 }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", border: `1px solid ${INK}`, padding: 36, background: "#fbfcfd" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
              {flagships.map((p, i) => (
                <div
                  key={p.slug}
                  style={{
                    width: 248,
                    height: 70,
                    border: `2px solid ${INK}`,
                    display: "flex",
                    alignItems: "center",
                    padding: "0 14px",
                    color: INK,
                    fontSize: 22,
                    background: "#fbfcfd",
                  }}
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                      border: `2px solid ${INK}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 15,
                      marginRight: 12,
                    }}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                  {p.title.split(" /")[0]}
                </div>
              ))}
            </div>
            <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", border: `2px solid ${INK}`, alignSelf: "flex-end", width: 700 }}>
              <div style={{ display: "flex", flexDirection: "column", padding: "14px 20px", borderBottom: `2px solid ${INK}` }}>
                <div style={{ fontSize: 18, color: "#5e6977" }}>{kicker}</div>
                <div style={{ fontSize: 64, color: INK, fontWeight: 700, lineHeight: 1 }}>{title}</div>
              </div>
              <div style={{ display: "flex", padding: "12px 20px", fontSize: 24, color: "#3f4a5a" }}>{subtitle}</div>
            </div>
          </div>
        </div>
      </div>
    ),
    ogSize,
  );
}
