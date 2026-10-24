import { ImageResponse } from "next/og";
import { universeEdges, universeNodes } from "@/components/universe/layout";
import { categoryById } from "@/data/categories";
import { site } from "@/data/site";

export const ogSize = { width: 1200, height: 630 };

/** Shared Open Graph card: constellation on the right, title block on the left. */
export function renderOg({ kicker, title, subtitle }: { kicker: string; title: string; subtitle: string }) {
  const cx = 880;
  const cy = 315;
  const scale = 300;
  const pt = (p: [number, number]) => ({ x: cx + p[0] * scale, y: cy + p[1] * scale });
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0c0e11", position: "relative", fontFamily: "serif" }}>
        {universeEdges
          .filter((e) => universeNodes[e.a].project.tier === 1 || universeNodes[e.b].project.tier === 1)
          .slice(0, 60)
          .map((e, i) => {
            const a = pt(universeNodes[e.a].p2);
            const b = pt(universeNodes[e.b].p2);
            const len = Math.hypot(b.x - a.x, b.y - a.y);
            const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: a.x,
                  top: a.y,
                  width: len,
                  height: 1,
                  background: "rgba(124,214,255,0.22)",
                  transform: `rotate(${angle}deg)`,
                  transformOrigin: "0 0",
                }}
              />
            );
          })}
        {universeNodes.map((n) => {
          const p = pt(n.p2);
          const r = n.project.tier === 1 ? 7 : n.project.tier === 2 ? 4 : 3;
          return (
            <div
              key={n.project.slug}
              style={{
                position: "absolute",
                left: p.x - r,
                top: p.y - r,
                width: r * 2,
                height: r * 2,
                borderRadius: r,
                background: categoryById[n.project.category].color,
              }}
            />
          );
        })}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 70px", width: 700, height: "100%" }}>
          <div style={{ fontSize: 20, letterSpacing: 4, color: "#7cd6ff", fontFamily: "monospace" }}>{kicker}</div>
          <div style={{ fontSize: 92, lineHeight: 1, color: "#ece6d8", marginTop: 24 }}>{title}</div>
          <div style={{ fontSize: 30, lineHeight: 1.3, color: "#b9b4a8", marginTop: 26 }}>{subtitle}</div>
          <div style={{ fontSize: 18, letterSpacing: 3, color: "#8f949c", marginTop: 40, fontFamily: "monospace" }}>{site.lab}</div>
        </div>
      </div>
    ),
    ogSize,
  );
}
