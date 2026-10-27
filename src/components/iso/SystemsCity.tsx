"use client";

import Link from "next/link";
import { useState } from "react";
import { useLab } from "@/components/providers/LabProvider";
import { flagships } from "@/data/projects";
import { flagshipLinks } from "@/lib/graph";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { footprint, machines, project } from "@/lib/iso";
import { MachineShape } from "./IsoMachine";

/*
 * The hero: the eight flagship systems as an isometric city. Roads join systems
 * that share a technology; packets travel them. Each machine is a link to its case study.
 */
const S = 34;
const PLACE: Record<string, [number, number]> = {
  eventmesh: [1, 0],
  nexus: [6, 0],
  resqmesh: [11, 0],
  chronoheritage: [1, 5],
  careeros: [6, 5],
  boundarylens: [11, 5],
  prepai: [2.6, 9.8],
  balloonsat: [9.4, 9.4],
};
const GROUND = { x0: -1, y0: -1, x1: 15, y1: 13 };

const P = (x: number, y: number, z = 0) => project(x, y, z, S);
const toPts = (list: [number, number][]) => list.map((q) => q.join(",")).join(" ");
const centre = (slug: string) => {
  const [x, y] = PLACE[slug];
  const f = footprint(machines[slug]);
  return [x + f.w / 2 - 0.2, y + f.d / 2 - 0.2] as const;
};

// Precomputed geometry: ground, grid, roads (an L along the grid between two machines).
const corners = [P(GROUND.x0, GROUND.y0), P(GROUND.x1, GROUND.y0), P(GROUND.x1, GROUND.y1), P(GROUND.x0, GROUND.y1)];
const minX = Math.min(...corners.map((c) => c[0]));
const maxX = Math.max(...corners.map((c) => c[0]));
const minY = Math.min(...corners.map((c) => c[1])) - 120;
const maxY = Math.max(...corners.map((c) => c[1])) + 10;
const VIEW = [minX - 10, minY, maxX - minX + 20, maxY - minY];

const roads = flagshipLinks.map((l) => {
  const a = centre(l.a.slug);
  const b = centre(l.b.slug);
  const pts = [P(a[0], a[1]), P(b[0], a[1]), P(b[0], b[1])];
  return { link: l, d: `M${pts.map((q) => q.join(",")).join(" L")}` };
});

const order = [...flagships].sort((a, b) => PLACE[a.slug][0] + PLACE[a.slug][1] - (PLACE[b.slug][0] + PLACE[b.slug][1]));

export function SystemsCity() {
  const { lumos } = useLab();
  const reduce = usePrefersReducedMotion();
  const [focus, setFocus] = useState<string | null>(null);

  return (
    <svg viewBox={VIEW.join(" ")} className="h-auto w-full" role="group" aria-label="Eight flagship systems as an isometric map">
      <polygon points={toPts(corners)} fill="#e3e6f7" />
      {Array.from({ length: GROUND.x1 - GROUND.x0 + 1 }, (_, i) => {
        const [a, b] = [P(GROUND.x0 + i, GROUND.y0), P(GROUND.x0 + i, GROUND.y1)];
        return <line key={`gx${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="rgba(21,22,58,0.05)" />;
      })}
      {Array.from({ length: GROUND.y1 - GROUND.y0 + 1 }, (_, j) => {
        const [a, b] = [P(GROUND.x0, GROUND.y0 + j), P(GROUND.x1, GROUND.y0 + j)];
        return <line key={`gy${j}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="rgba(21,22,58,0.05)" />;
      })}

      {roads.map((r, i) => {
        const on = focus !== null && (r.link.a.slug === focus || r.link.b.slug === focus);
        return (
          <g key={r.d}>
            <path d={r.d} fill="none" stroke="#ffffff" strokeWidth={on ? 12 : 9} strokeLinecap="round" strokeLinejoin="round" className="transition-[stroke-width]" />
            <path
              id={`road-${i}`}
              d={r.d}
              fill="none"
              stroke={lumos ? "#ff7b47" : on ? "#3b5bff" : "rgba(21,22,58,0.2)"}
              strokeWidth={on || lumos ? 1.8 : 1}
              strokeDasharray="4 6"
            />
            {!reduce ? (
              <circle r={4.5} fill={machines[r.link.a.slug].color} stroke="#fff" strokeWidth={1.6}>
                <animateMotion dur={`${4.2 + i * 0.55}s`} repeatCount="indefinite" begin={`${i * 0.35}s`}>
                  <mpath href={`#road-${i}`} />
                </animateMotion>
              </circle>
            ) : null}
          </g>
        );
      })}

      {order.map((p, i) => {
        const spec = machines[p.slug];
        const [gx, gy] = PLACE[p.slug];
        const [tx, ty] = P(gx, gy);
        const f = footprint(spec);
        const label = P(gx + f.w / 2 - 0.2, gy + f.d / 2 - 0.2, f.h + 0.9);
        const on = focus === p.slug;
        const name = p.title.split(" /")[0];
        const tag = p.tagline ?? "";
        const w = Math.max(name.length * 8.8, tag.length * 6.9) + 28;
        return (
          <Link
            key={p.slug}
            href={`/projects/${p.slug}`}
            onMouseEnter={() => setFocus(p.slug)}
            onMouseLeave={() => setFocus(null)}
            onFocus={() => setFocus(p.slug)}
            onBlur={() => setFocus(null)}
            className="outline-none"
          >
            <g
              className="animate-rise"
              style={{ animationDelay: `${150 + i * 90}ms` }}
            >
              <g
                className="transition-transform duration-300 ease-out"
                style={{ transform: `translate(${tx}px, ${ty - (on ? 10 : 0)}px)` }}
              >
                <MachineShape spec={spec} scale={S} />
              </g>
              <g
                className="hidden transition-transform duration-300 ease-out sm:inline"
                style={{ transform: `translate(${label[0]}px, ${label[1] - (on ? 10 : 0)}px)` }}
              >
                <rect x={-w / 2} y={-38} width={w} height={46} rx={12} fill={on ? "#15163a" : "#ffffff"} className="transition-colors" />
                <path d="M-6,8 L0,15 L6,8 Z" fill={on ? "#15163a" : "#ffffff"} />
                <text y={-18} textAnchor="middle" fontSize={15} fontWeight={650} fill={on ? "#ffffff" : "#15163a"} fontFamily="var(--font-bricolage)">
                  {name}
                </text>
                <text y={-1} textAnchor="middle" fontSize={12.5} fill={on ? "#c9ccef" : "#666989"} fontFamily="var(--font-bricolage)">
                  {on ? "Open the case study" : tag}
                </text>
              </g>
            </g>
          </Link>
        );
      })}
    </svg>
  );
}

