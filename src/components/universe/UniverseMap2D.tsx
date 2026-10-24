"use client";

import { categoryById } from "@/data/categories";
import type { CategoryId } from "@/data/types";
import { cn } from "@/lib/utils";
import { clusterAnchors, universeEdges, universeNodes } from "./layout";

interface Props {
  focus: number | null;
  selected: number | null;
  cluster: CategoryId | null;
  lumos: boolean;
  onHover: (index: number | null) => void;
  onSelect: (index: number) => void;
}

/** DOM/SVG rendering of the same universe — used on mobile, without WebGL, or by preference. */
export function UniverseMap2D({ focus, selected, cluster, lumos, onHover, onSelect }: Props) {
  const related = new Set<number>();
  if (focus !== null) {
    related.add(focus);
    for (const e of universeEdges) {
      if (e.a === focus) related.add(e.b);
      if (e.b === focus) related.add(e.a);
    }
  }

  return (
    <svg viewBox="-1.12 -0.98 2.24 1.96" className="h-full w-full" role="group" aria-label="Project constellation map">
      {clusterAnchors.map((a) => (
        <line
          key={`spoke-${a.id}`}
          x1={0}
          y1={0}
          x2={a.p2[0]}
          y2={a.p2[1]}
          stroke="rgba(214,224,236,0.06)"
          strokeWidth={0.003}
        />
      ))}
      {universeEdges.map((e, i) => {
        const A = universeNodes[e.a];
        const B = universeNodes[e.b];
        const touches = focus !== null && (e.a === focus || e.b === focus);
        const inCluster = cluster && (A.project.category === cluster || B.project.category === cluster);
        const stroke = touches
          ? "#7cd6ff"
          : lumos
            ? categoryById[A.project.category].color
            : inCluster
              ? categoryById[cluster].color
              : "#d6e0ec";
        const opacity = touches ? 0.9 : lumos ? 0.55 : inCluster ? 0.3 : focus !== null || cluster ? 0.03 : 0.08;
        return (
          <line
            key={i}
            x1={A.p2[0]}
            y1={A.p2[1]}
            x2={B.p2[0]}
            y2={B.p2[1]}
            stroke={stroke}
            strokeOpacity={opacity}
            strokeWidth={touches ? 0.004 : 0.0025}
            className="transition-[stroke-opacity] duration-300"
          />
        );
      })}
      {clusterAnchors.map((a) => (
        <text
          key={`label-${a.id}`}
          x={a.p2[0] * 1.2}
          y={a.p2[1] * 1.22 + 0.012}
          textAnchor="middle"
          fill={cluster && cluster !== a.id ? "rgba(143,148,156,0.4)" : a.color}
          fontSize={0.034}
          fontFamily="var(--font-mono)"
          letterSpacing={0.004}
          className="pointer-events-none uppercase"
        >
          {categoryById[a.id].code} · {categoryById[a.id].short}
        </text>
      ))}
      <circle cx={0} cy={0} r={0.012} fill="#ece6d8" />
      {universeNodes.map((n, i) => {
        const p = n.project;
        const dimmed = (focus !== null && !related.has(i)) || (cluster !== null && p.category !== cluster);
        const r = p.tier === 1 ? 0.024 : p.tier === 2 ? 0.015 : 0.011;
        const color = categoryById[p.category].color;
        const isFocus = i === focus || i === selected;
        return (
          <g
            key={p.slug}
            role="button"
            tabIndex={0}
            aria-label={`${p.title} — ${categoryById[p.category].label}`}
            aria-pressed={i === selected}
            onMouseEnter={() => onHover(i)}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(i)}
            onBlur={() => onHover(null)}
            onClick={() => onSelect(i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(i);
              }
            }}
            className={cn("cursor-pointer outline-none transition-opacity duration-300", dimmed && "opacity-20")}
          >
            <circle cx={n.p2[0]} cy={n.p2[1]} r={0.032} fill="transparent" />
            {p.tier === 1 ? (
              <circle cx={n.p2[0]} cy={n.p2[1]} r={r * 2.2} fill={color} opacity={lumos ? 0.35 : 0.12} />
            ) : null}
            <circle
              cx={n.p2[0]}
              cy={n.p2[1]}
              r={isFocus ? r * 1.5 : r}
              fill={color}
              stroke={isFocus ? "#ece6d8" : "none"}
              strokeWidth={0.004}
              className="transition-all duration-200"
            />
            {p.tier === 1 || isFocus ? (
              <text
                x={n.p2[0] + r + 0.014}
                y={n.p2[1] + 0.011}
                fill="#ece6d8"
                fontSize={0.03}
                fontFamily="var(--font-mono)"
                className="pointer-events-none"
              >
                {p.title.split(" /")[0]}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
