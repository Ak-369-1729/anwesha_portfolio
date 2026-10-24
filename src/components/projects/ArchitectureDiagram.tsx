"use client";

import { useRef } from "react";
import type { ArchNodeKind, Architecture } from "@/data/types";
import { useInView } from "@/lib/hooks";

const KIND_COLOR: Record<ArchNodeKind, string> = {
  client: "#1b2f6e",
  edge: "#87570c",
  service: "#2d5be3",
  store: "#2b7a4b",
  queue: "#a8456a",
  worker: "#4a5fa0",
  external: "#5e6977",
};

const NODE_W = 164;
const COL_GAP = 212;
const NODE_H = 52;

interface Placed {
  id: string;
  x: number;
  y: number;
  col: number;
}

function place(arch: Architecture, vertical: boolean) {
  const colGap = vertical ? 92 : COL_GAP;
  const rowGap = vertical ? 180 : 84;
  const maxRows = Math.max(...arch.columns.map((c) => c.nodes.length));
  const span = (maxRows - 1) * rowGap;
  const placed: Record<string, Placed> = {};
  arch.columns.forEach((col, ci) => {
    const offset = (span - (col.nodes.length - 1) * rowGap) / 2;
    col.nodes.forEach((n, ni) => {
      const main = ci * colGap;
      const cross = offset + ni * rowGap;
      placed[n.id] = vertical ? { id: n.id, x: cross, y: main, col: ci } : { id: n.id, x: main, y: cross, col: ci };
    });
  });
  const width = vertical ? span + NODE_W : (arch.columns.length - 1) * colGap + NODE_W;
  const height = vertical ? (arch.columns.length - 1) * colGap + NODE_H : span + NODE_H;
  return { placed, width, height };
}

function edgePath(a: Placed, b: Placed, vertical: boolean) {
  if (vertical) {
    const sx = a.x + NODE_W / 2;
    const sy = a.y + NODE_H;
    const tx = b.x + NODE_W / 2;
    const ty = b.y;
    if (b.col > a.col) return `M${sx},${sy} C${sx},${sy + 36} ${tx},${ty - 36} ${tx},${ty}`;
    // same column or backwards: route along the side
    const side = Math.max(a.x, b.x) + NODE_W + 18;
    return `M${a.x + NODE_W},${a.y + NODE_H / 2} C${side},${a.y + NODE_H / 2} ${side},${b.y + NODE_H / 2} ${b.x + NODE_W},${b.y + NODE_H / 2}`;
  }
  if (b.col > a.col) {
    const sx = a.x + NODE_W;
    const sy = a.y + NODE_H / 2;
    const tx = b.x;
    const ty = b.y + NODE_H / 2;
    const mid = (sx + tx) / 2;
    return `M${sx},${sy} C${mid},${sy} ${mid},${ty} ${tx},${ty}`;
  }
  if (b.col === a.col) {
    const down = b.y > a.y;
    return `M${a.x + NODE_W / 2},${down ? a.y + NODE_H : a.y} L${b.x + NODE_W / 2},${down ? b.y : b.y + NODE_H}`;
  }
  // backwards edge loops underneath
  const below = Math.max(a.y, b.y) + NODE_H + 30;
  return `M${a.x + NODE_W / 2},${a.y + NODE_H} C${a.x + NODE_W / 2},${below} ${b.x + NODE_W / 2},${below} ${b.x + NODE_W / 2},${b.y + NODE_H}`;
}

function Diagram({ arch, vertical, visible }: { arch: Architecture; vertical: boolean; visible: boolean }) {
  const { placed, width, height } = place(arch, vertical);
  const pad = 34;
  const nodes = arch.columns.flatMap((c) => c.nodes);
  return (
    <svg
      viewBox={`${-pad} ${-pad - 10} ${width + pad * 2 + (vertical ? 30 : 0)} ${height + pad * 2 + 40}`}
      className="w-full"
      role="img"
      aria-label={`Architecture: ${arch.edges.map((e) => `${nodes.find((n) => n.id === e.from)?.label} to ${nodes.find((n) => n.id === e.to)?.label}`).join("; ")}`}
    >
      <defs>
        <marker id="arch-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L8,4 L0,8 z" fill="#2d5be3" />
        </marker>
        <marker id="arch-arrow-fail" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L8,4 L0,8 z" fill="#b3301f" />
        </marker>
      </defs>
      {!vertical
        ? arch.columns.map((c, ci) => (
            <text key={c.title} x={ci * COL_GAP + NODE_W / 2} y={-pad + 4} textAnchor="middle" fontSize={13} fill="#5e6977" fontFamily="var(--font-archivo)" >
              {c.title}
            </text>
          ))
        : null}
      {arch.edges.map((e, i) => {
        const a = placed[e.from];
        const b = placed[e.to];
        if (!a || !b) return null;
        const d = edgePath(a, b, vertical);
        const mx = (a.x + b.x) / 2 + NODE_W / 2;
        const my = (a.y + b.y) / 2 + NODE_H / 2;
        return (
          <g key={`${e.from}-${e.to}`}>
            <path
              d={d}
              fill="none"
              stroke={e.failure ? "#b3301f" : "#2d5be3"}
              strokeOpacity={0.7}
              strokeWidth={1.2}
              strokeDasharray={e.failure ? "4 4" : "600"}
              strokeDashoffset={visible || e.failure ? 0 : 600}
              markerEnd={`url(#${e.failure ? "arch-arrow-fail" : "arch-arrow"})`}
              style={{ transition: `stroke-dashoffset 1.1s ease ${0.3 + i * 0.08}s, opacity 0.6s ease ${0.3 + i * 0.08}s`, opacity: visible ? 1 : 0 }}
            />
            {e.label ? (
              <text
                x={mx}
                y={my - 6}
                textAnchor="middle"
                fontSize={11.5}
                fill={e.failure ? "#b3301f" : "#3f4a5a"}
                fontFamily="var(--font-archivo)"
                style={{ transition: `opacity 0.6s ease ${0.6 + i * 0.08}s`, opacity: visible ? 1 : 0 }}
                paintOrder="stroke"
                stroke="#f4f7f8"
                strokeWidth={4}
              >
                {e.label}
              </text>
            ) : null}
          </g>
        );
      })}
      {arch.columns.flatMap((c, ci) =>
        c.nodes.map((n) => {
          const p = placed[n.id];
          const color = KIND_COLOR[n.kind];
          return (
            <g
              key={n.id}
              style={{
                transform: `translate(${p.x}px, ${p.y + (visible ? 0 : 10)}px)`,
                opacity: visible ? 1 : 0,
                transition: `transform 0.6s ease ${ci * 0.12}s, opacity 0.6s ease ${ci * 0.12}s`,
              }}
            >
              <rect width={NODE_W} height={NODE_H} fill="#fbfcfd" stroke={color} strokeOpacity={0.6} />
              <rect width={3} height={NODE_H} fill={color} />
              <text x={14} y={n.sub ? 22 : 31} fontSize={n.label.length > 18 ? 12.5 : 14} fill="#1b2f6e" fontFamily="var(--font-archivo)">
                {n.label}
              </text>
              {n.sub ? (
                <text x={14} y={39} fontSize={11} fill="#5e6977" fontFamily="var(--font-archivo)">
                  {n.sub}
                </text>
              ) : null}
            </g>
          );
        }),
      )}
    </svg>
  );
}

/** Data-driven architecture diagram; components assemble as it scrolls into view. */
export function ArchitectureDiagram({ architecture }: { architecture: Architecture }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, "-80px 0px", true);
  const kinds = [...new Set(architecture.columns.flatMap((c) => c.nodes.map((n) => n.kind)))];
  return (
    <figure ref={ref} className="frame p-4 sm:p-6">
      <div className="hidden md:block">
        <Diagram arch={architecture} vertical={false} visible={visible} />
      </div>
      <div className="mx-auto max-w-sm md:hidden">
        <Diagram arch={architecture} vertical visible={visible} />
      </div>
      <figcaption className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-line pt-3 font-cond text-[12.5px] text-pencil">
        {kinds.map((k) => (
          <span key={k} className="flex items-center gap-1.5">
            <span className="size-2" style={{ background: KIND_COLOR[k] }} aria-hidden="true" /> {k}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className="h-px w-4 border-t border-dashed border-redline" aria-hidden="true" /> failure path
        </span>
      </figcaption>
    </figure>
  );
}
