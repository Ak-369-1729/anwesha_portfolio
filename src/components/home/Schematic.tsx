"use client";

import Link from "next/link";
import { useState } from "react";
import { useLab } from "@/components/providers/LabProvider";
import { categoryById } from "@/data/categories";
import { flagships } from "@/data/projects";
import { calloutOf, flagshipLinks, type Link as Wire } from "@/lib/graph";
import { cn } from "@/lib/utils";

/*
 * The homepage drawing: eight flagship systems as components, wired by what they share.
 * Geometry lives in a 1000 × 420 drawing space; components are HTML laid over the wire SVG
 * using percentages, so text wraps naturally and every component is a real link.
 */
const W = 1000;
const H = 440;
const BOX = { w: 190, h: 104 };
const COLS = [18, 272, 526, 790];
const ROWS = [26, 306];
const CHANNEL = [176, 212, 248];

/** Wire labels have to fit between two components. */
const SHORT: Record<string, string> = { "Distributed systems": "Distributed" };

/** Placement keeps related systems adjacent so most wires stay short and straight. */
const PLACE: Record<string, [number, number]> = {
  resqmesh: [0, 0],
  eventmesh: [1, 0],
  chronoheritage: [2, 0],
  nexus: [3, 0],
  prepai: [0, 1],
  careeros: [1, 1],
  boundarylens: [2, 1],
  balloonsat: [3, 1],
};

const box = (slug: string) => {
  const [c, r] = PLACE[slug];
  return { x: COLS[c], y: ROWS[r], col: c, row: r };
};

interface Routed {
  wire: Wire;
  d: string;
  label: { x: number; y: number; anchor: "middle" | "start" };
}

/** Orthogonal routing: side-to-side within a row, otherwise down/up through the channel between rows. */
function route(): Routed[] {
  // Pins on the facing edge (bottom of the top row, top of the bottom row), spread evenly.
  const pinUsers = new Map<string, string[]>();
  for (const w of flagshipLinks) {
    const A = box(w.a.slug);
    const B = box(w.b.slug);
    if (A.row === B.row && Math.abs(A.col - B.col) === 1) continue;
    for (const s of [w.a.slug, w.b.slug]) pinUsers.set(s, [...(pinUsers.get(s) ?? []), `${w.a.slug}-${w.b.slug}`]);
  }
  // Top-row pins sit in the left half of a component, bottom-row pins in the right half,
  // so wires leaving vertically stacked components can never overlap.
  const pinX = (slug: string, id: string) => {
    const users = pinUsers.get(slug) ?? [id];
    const b = box(slug);
    const [from, to] = b.row === 0 ? [0.18, 0.46] : [0.54, 0.82];
    const t = users.length === 1 ? 0.5 : users.indexOf(id) / (users.length - 1);
    return b.x + BOX.w * (from + (to - from) * t);
  };

  let lane = 0;
  return flagshipLinks.map((wire) => {
    const id = `${wire.a.slug}-${wire.b.slug}`;
    let A = box(wire.a.slug);
    let B = box(wire.b.slug);
    let [sa, sb] = [wire.a.slug, wire.b.slug];
    if (A.col > B.col || (A.col === B.col && A.row > B.row)) {
      [A, B] = [B, A];
      [sa, sb] = [sb, sa];
    }
    if (A.row === B.row && B.col - A.col === 1) {
      const y = A.y + BOX.h / 2;
      return {
        wire,
        d: `M${A.x + BOX.w},${y} H${B.x}`,
        label: { x: (A.x + BOX.w + B.x) / 2, y: y - 8, anchor: "middle" },
      };
    }
    const x1 = pinX(sa, id);
    const x2 = pinX(sb, id);
    const y1 = A.row === 0 ? A.y + BOX.h : A.y;
    const y2 = B.row === 0 ? B.y + BOX.h : B.y;
    if (A.col === B.col) {
      return { wire, d: `M${x1},${y1} V${y2}`, label: { x: x1 + 8, y: CHANNEL[CHANNEL.length - 1] + 22, anchor: "start" } };
    }
    const ly = CHANNEL[lane++ % CHANNEL.length];
    return {
      wire,
      d: `M${x1},${y1} V${ly} H${x2} V${y2}`,
      label: { x: (x1 + x2) / 2, y: ly - 7, anchor: "middle" },
    };
  });
}

const wires = route();
const pct = (v: number, of: number) => `${(v / of) * 100}%`;

export function Schematic() {
  const { lumos } = useLab();
  const [focus, setFocus] = useState<string | null>(null);
  const focused = focus ? flagships.find((p) => p.slug === focus) : null;
  const touches = (w: Wire) => focus !== null && (w.a.slug === focus || w.b.slug === focus);

  return (
    <div>
      {/* Desktop / tablet: the drawing */}
      <div className="relative hidden md:block" style={{ aspectRatio: `${W} / ${H}` }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
          {wires.map((r, i) => {
            const on = touches(r.wire);
            return (
              <g key={r.d}>
                <path
                  d={r.d}
                  pathLength={1}
                  fill="none"
                  stroke={lumos ? "var(--redline)" : on ? "var(--blueprint)" : "var(--ink)"}
                  strokeWidth={on ? 2 : 1.25}
                  strokeDasharray="1"
                  className="animate-draw transition-[stroke,stroke-width] duration-200"
                  style={{ animationDelay: `${200 + i * 140}ms` }}
                />
                <text
                  x={r.label.x}
                  y={r.label.y}
                  textAnchor={r.label.anchor}
                  fontSize={12}
                  fontFamily="var(--font-archivo)"
                  fontStretch="78%"
                  fill={on || lumos ? "var(--blueprint)" : "var(--pencil)"}
                  paintOrder="stroke"
                  stroke="var(--sheet)"
                  strokeWidth={5}
                >
                  {SHORT[r.wire.via] ?? r.wire.via}
                </text>
              </g>
            );
          })}
          {/* junction dots where wires meet a component */}
          {wires.flatMap((r) => {
            const pts = r.d.match(/M([\d.]+),([\d.]+)/)!;
            return [<circle key={`${r.d}-s`} cx={pts[1]} cy={pts[2]} r={2.5} fill="var(--ink)" />];
          })}
        </svg>

        {flagships.map((p) => {
          const b = box(p.slug);
          const on = focus === p.slug;
          return (
            <Link
              key={p.slug}
              href={`/projects/${p.slug}`}
              onMouseEnter={() => setFocus(p.slug)}
              onMouseLeave={() => setFocus(null)}
              onFocus={() => setFocus(p.slug)}
              onBlur={() => setFocus(null)}
              className={cn(
                "group absolute flex flex-col border bg-sheet px-3 py-2.5 text-left transition-colors",
                on ? "border-blueprint bg-[#eef3fd]" : "border-ink",
              )}
              style={{ left: pct(b.x, W), top: pct(b.y, H), width: pct(BOX.w, W), height: pct(BOX.h, H) }}
            >
              <span
                className={cn(
                  "absolute -left-3 -top-3 grid size-6 place-items-center rounded-full border bg-sheet text-[11px] font-semibold",
                  on ? "border-blueprint text-blueprint" : "border-ink text-ink",
                )}
                aria-hidden="true"
              >
                {calloutOf(p.slug)}
              </span>
              <span className="text-[15px] font-semibold leading-tight text-ink [font-stretch:110%]">
                {p.title.split(" /")[0]}
              </span>
              <span className="mt-1 line-clamp-3 text-[12.5px] leading-snug text-graphite [font-stretch:85%]">
                {p.summary}
              </span>
              {/* red-pencil mark on the component being inspected */}
              <svg
                className={cn("pointer-events-none absolute -inset-2 h-[calc(100%+16px)] w-[calc(100%+16px)] transition-opacity", on ? "opacity-100" : "opacity-0")}
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M4,8 C20,2 70,1 96,6 C99,30 98,70 95,94 C70,99 28,98 5,95 C2,70 1,30 4,8 Z"
                  fill="none"
                  stroke="var(--redline)"
                  strokeWidth={1.6}
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </Link>
          );
        })}
      </div>

      {/* General notes, as on any drawing; note 4 changes with the component being inspected. */}
      <div className="mt-6 hidden max-w-3xl md:block">
        <p className="text-[15px] font-semibold text-ink">General notes</p>
        <ol className="mt-1.5 grid list-decimal gap-1 pl-5 text-[14.5px] leading-snug text-graphite marker:text-pencil">
          <li>Each component is a system I designed and built. Open one for its case study.</li>
          <li>Wires join systems that share a technology or a discipline.</li>
          <li>Lettered components have working models in the detail drawings below.</li>
          <li aria-live="polite" className={focused ? "text-redline" : undefined}>
            {focused ? (
              <>
                <span className="font-semibold">{focused.title.split(" /")[0]}:</span> {focused.problem}
              </>
            ) : (
              "Point at a component to read the problem it solves."
            )}
          </li>
        </ol>
      </div>

      {/* Mobile: the same components on a single bus */}
      <ol className="relative grid gap-3 border-l border-ink pl-5 md:hidden">
        {flagships.map((p) => {
          const links = flagshipLinks.filter((w) => w.a.slug === p.slug || w.b.slug === p.slug);
          return (
            <li key={p.slug} className="relative">
              <span className="absolute -left-5 top-5 h-px w-5 bg-ink" aria-hidden="true" />
              <Link href={`/projects/${p.slug}`} className="block border border-ink bg-sheet px-3 py-2.5">
                <span className="flex items-baseline gap-2">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full border border-ink text-[10px] font-semibold">
                    {calloutOf(p.slug)}
                  </span>
                  <span className="text-[15px] font-semibold text-ink">{p.title.split(" /")[0]}</span>
                  <span className="ml-auto font-cond text-[12px]" style={{ color: categoryById[p.category].color }}>
                    {categoryById[p.category].short}
                  </span>
                </span>
                <span className="mt-1 block text-[13px] leading-snug text-graphite">{p.summary}</span>
                {links.length ? (
                  <span className="mt-1.5 block font-cond text-[12px] text-pencil">
                    Shares{" "}
                    {links
                      .map((w) => `${w.via} with ${(w.a.slug === p.slug ? w.b : w.a).title.split(" /")[0]}`)
                      .join(", ")}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
