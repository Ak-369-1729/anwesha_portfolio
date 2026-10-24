"use client";

import { useEffect, useRef } from "react";
import { clusterAnchors, universeEdges, universeNodes } from "@/components/universe/layout";
import { categoryById } from "@/data/categories";
import type { ScrollProgress } from "@/lib/scrollProgress";
import { clamp, seeded } from "@/lib/utils";

interface Props {
  progress: ScrollProgress;
  /** Render a single static frame (reduced motion). */
  staticFrame?: number;
}

const ease = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
const span = (p: number, a: number, b: number) => clamp((p - a) / (b - a), 0, 1);

/**
 * The opening constellation. Scroll progress drives the story:
 * a single seed node → project nodes emerge → shared technologies connect them → the camera dives in.
 */
export function IntroCanvas({ progress, staticFrame }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let visible = true;
    const born = performance.now();

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    };
    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (staticFrame !== undefined) draw(performance.now());
    });
    ro.observe(canvas);

    const dust = Array.from({ length: 90 }, (_, i) => ({
      x: seeded(`d${i}`, 1) * 2 - 1,
      y: seeded(`d${i}`, 2) * 2 - 1,
      r: 0.4 + seeded(`d${i}`, 3) * 0.9,
      tw: seeded(`d${i}`, 4) * Math.PI * 2,
    }));

    const draw = (now: number) => {
      const p = staticFrame ?? progress.get();
      const t = (now - born) / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const zoom = 1 + ease(span(p, 0.78, 1)) * 1.8;
      const fadeOut = 1 - span(p, 0.86, 1);
      // The seed sits beside the headline, then drifts to centre as the constellation emerges.
      const settle = ease(span(p, 0.08, 0.3));
      const seedX = w >= 1024 ? w * 0.7 : w * 0.82;
      const seedY = w >= 1024 ? h * 0.5 : h * 0.2;
      const cx = seedX + (w / 2 - seedX) * settle;
      const cy = seedY + (h / 2 - seedY) * settle;
      const scale = Math.min(w, h) * 0.62 * (w < 640 ? 0.78 : 1) * zoom;
      const sx = (x: number) => cx + x * scale * (w > h ? 1.35 : 1);
      const sy = (y: number) => cy + y * scale;

      // background dust — slow twinkle
      for (const d of dust) {
        const a = (0.15 + 0.15 * Math.sin(t * 0.8 + d.tw)) * fadeOut;
        ctx.fillStyle = `rgba(236,230,216,${a})`;
        ctx.beginPath();
        ctx.arc(cx + d.x * w * 0.55 * zoom, cy + d.y * h * 0.55 * zoom, d.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // seed node: expands on load, then becomes the origin of the constellation
      const grow = staticFrame !== undefined ? 1 : ease(t / 1.1);
      const seedR = 2 + grow * 3;
      const ring = (t % 3.2) / 3.2;
      ctx.strokeStyle = `rgba(124,214,255,${(1 - ring) * 0.5 * fadeOut})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, seedR + ring * 60, 0, Math.PI * 2);
      ctx.stroke();
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40 * grow + 1);
      glow.addColorStop(0, `rgba(124,214,255,${0.55 * fadeOut})`);
      glow.addColorStop(1, "rgba(124,214,255,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, 40 * grow + 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(236,230,216,${fadeOut})`;
      ctx.beginPath();
      ctx.arc(cx, cy, seedR, 0, Math.PI * 2);
      ctx.fill();

      const emerge = span(p, 0.16, 0.46);
      const connect = span(p, 0.4, 0.72);
      const labels = span(p, 0.58, 0.74);
      const n = universeNodes.length;

      const pos = universeNodes.map((node, i) => {
        const local = ease(clamp(emerge * 1.6 - (i / n) * 0.6, 0, 1));
        return { x: sx(node.p2[0] * local), y: sy(node.p2[1] * local), a: local };
      });

      // spokes from origin to clusters
      if (emerge > 0) {
        for (const anchor of clusterAnchors) {
          ctx.strokeStyle = `rgba(214,224,236,${0.06 * emerge * fadeOut})`;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(sx(anchor.p2[0] * emerge), sy(anchor.p2[1] * emerge));
          ctx.stroke();
        }
      }

      // shared-technology edges draw in progressively
      if (connect > 0) {
        const limit = Math.floor(universeEdges.length * connect);
        for (let k = 0; k < limit; k++) {
          const e = universeEdges[k];
          const A = pos[e.a];
          const B = pos[e.b];
          const flagship = universeNodes[e.a].project.tier === 1 && universeNodes[e.b].project.tier === 1;
          ctx.strokeStyle = flagship
            ? `rgba(124,214,255,${0.32 * fadeOut})`
            : `rgba(214,224,236,${0.08 * fadeOut})`;
          ctx.beginPath();
          ctx.moveTo(A.x, A.y);
          ctx.lineTo(B.x, B.y);
          ctx.stroke();
        }
      }

      // nodes
      universeNodes.forEach((node, i) => {
        const P = pos[i];
        if (P.a <= 0) return;
        const color = categoryById[node.project.category].color;
        const r = node.project.tier === 1 ? 3.4 : node.project.tier === 2 ? 2.2 : 1.6;
        ctx.globalAlpha = P.a * fadeOut;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(P.x, P.y, r, 0, Math.PI * 2);
        ctx.fill();
        if (node.project.tier === 1 && labels > 0) {
          ctx.globalAlpha = labels * fadeOut * 0.9;
          ctx.font = "500 10px ui-monospace, monospace";
          ctx.fillStyle = "#ece6d8";
          ctx.fillText(node.project.title.split(" /")[0].toUpperCase(), P.x + 7, P.y + 3);
        }
        ctx.globalAlpha = 1;
      });

      if (staticFrame === undefined && visible) raf = requestAnimationFrame(draw);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(draw);
    });
    io.observe(canvas);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [progress, staticFrame]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}
