import { categoryById } from "@/data/categories";
import type { Project } from "@/data/types";

/** A box in tile units: position on the ground (x, y), footprint (w × d) and height h. */
export interface Part {
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
}

export interface MachineSpec {
  color: string;
  parts: Part[];
}

const p = (x: number, y: number, w: number, d: number, h: number): Part => ({ x, y, w, d, h });

/**
 * Each flagship gets its own small isometric "machine". The shapes are loosely
 * suggestive (a tall detector for NEXUS, a long low mesh for RESQMesh, a mast for
 * BalloonSat) — illustration, not architecture.
 */
export const machines: Record<string, MachineSpec> = {
  eventmesh: { color: "#3b5bff", parts: [p(0, 0, 2, 2, 1.2), p(2.2, 0.2, 1.3, 1.6, 2.4), p(0.3, 2.2, 1.6, 0.9, 0.6)] },
  nexus: { color: "#ff7b47", parts: [p(0, 0, 1.2, 1.2, 2.9), p(1.6, 0, 1.4, 2.4, 1.1), p(0, 1.6, 1.2, 1, 0.7)] },
  resqmesh: { color: "#a6e35c", parts: [p(0, 0, 2.7, 1.2, 0.8), p(0.5, 1.4, 1.2, 1.2, 1.9), p(2, 1.6, 0.8, 0.8, 1.3)] },
  chronoheritage: { color: "#ffd24a", parts: [p(0, 0, 1.4, 2.6, 1.6), p(1.7, 0.4, 1.4, 1.4, 2.6)] },
  careeros: { color: "#b8a6ff", parts: [p(0, 0, 2.8, 1.4, 1), p(0.6, 1.6, 1.4, 1, 2.2)] },
  boundarylens: { color: "#ff7aa8", parts: [p(0, 0, 1.2, 1.2, 3.1), p(1.5, 0.2, 1.2, 2, 1.4)] },
  prepai: { color: "#4cc3ff", parts: [p(0, 0, 2, 1.2, 1.3), p(2.3, 0, 0.9, 0.9, 2), p(0.4, 1.4, 1.1, 1.1, 0.8)] },
  balloonsat: { color: "#2fd3a0", parts: [p(0, 0, 1.6, 1.6, 0.9), p(0.45, 0.45, 0.7, 0.7, 3.3)] },
};

/** A single block for projects without their own machine, in the discipline's colour. */
export function machineFor(project: Project): MachineSpec {
  return (
    machines[project.slug] ?? {
      color: categoryById[project.category].block,
      parts: [p(0, 0, 1.4, 1.4, project.tier === 2 ? 1.4 : 0.9)],
    }
  );
}

const COS = Math.cos(Math.PI / 6);
const SIN = Math.sin(Math.PI / 6);

/** Isometric projection of a point in tile units to screen units (scale = pixels per tile). */
export const project = (x: number, y: number, z: number, scale: number): [number, number] => [
  (x - y) * COS * scale,
  (x + y) * SIN * scale - z * scale,
];

/** Lighten (f > 1) or darken (f < 1) a hex colour for the faces of a block. */
export function shade(hex: string, f: number) {
  const v = parseInt(hex.slice(1), 16);
  const ch = [v >> 16, (v >> 8) & 255, v & 255].map((c) =>
    Math.round(Math.max(0, Math.min(255, f > 1 ? c + (255 - c) * (f - 1) : c * f))),
  );
  return `rgb(${ch.join(",")})`;
}

const pts = (list: [number, number][]) => list.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

/** The three visible faces of a box, as SVG point strings, back faces first. */
export function boxFaces(b: Part, z: number, scale: number) {
  const P = (x: number, y: number, zz: number) => project(x, y, zz, scale);
  const { x, y, w, d, h } = b;
  return {
    left: pts([P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)]),
    right: pts([P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)]),
    top: pts([P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)]),
  };
}

/** Footprint of a machine including its white base plate, in tile units. */
export function footprint(spec: MachineSpec) {
  const w = Math.max(...spec.parts.map((q) => q.x + q.w)) + 0.4;
  const d = Math.max(...spec.parts.map((q) => q.y + q.d)) + 0.4;
  const h = Math.max(...spec.parts.map((q) => q.h));
  return { w, d, h };
}
