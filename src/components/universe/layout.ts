import { categories } from "@/data/categories";
import { projects, projectTerms } from "@/data/projects";
import type { CategoryId, Project } from "@/data/types";
import { seeded } from "@/lib/utils";

export interface UniverseNode {
  project: Project;
  /** 3D position for the WebGL universe. */
  p3: [number, number, number];
  /** 2D position in a -1..1 square for canvas / SVG renderings. */
  p2: [number, number];
}

export interface UniverseEdge {
  a: number;
  b: number;
  shared: string[];
}

export interface ClusterAnchor {
  id: CategoryId;
  label: string;
  color: string;
  p3: [number, number, number];
  p2: [number, number];
}

const TAU = Math.PI * 2;

export const clusterAnchors: ClusterAnchor[] = categories.map((c, i) => {
  const angle = (i / categories.length) * TAU - Math.PI / 2;
  return {
    id: c.id,
    label: c.label,
    color: c.color,
    p3: [Math.cos(angle) * 6.2, Math.sin(angle * 2) * 1.5, Math.sin(angle) * 6.2],
    p2: [Math.cos(angle) * 0.66, Math.sin(angle) * 0.62],
  };
});

const anchorById = Object.fromEntries(clusterAnchors.map((a) => [a.id, a])) as Record<CategoryId, ClusterAnchor>;

export const universeNodes: UniverseNode[] = projects.map((project) => {
  const anchor = anchorById[project.category];
  const s = project.slug;
  const theta = seeded(s, 1) * TAU;
  const phi = Math.acos(2 * seeded(s, 2) - 1);
  const r3 = project.tier === 1 ? 1.1 + seeded(s, 3) * 0.5 : 1.5 + seeded(s, 3) * 1.1;
  const r2 = project.tier === 1 ? 0.07 + seeded(s, 4) * 0.05 : 0.12 + seeded(s, 4) * 0.12;
  return {
    project,
    p3: [
      anchor.p3[0] + r3 * Math.sin(phi) * Math.cos(theta),
      anchor.p3[1] + r3 * Math.cos(phi) * 0.8,
      anchor.p3[2] + r3 * Math.sin(phi) * Math.sin(theta),
    ],
    p2: [anchor.p2[0] + Math.cos(theta) * r2, anchor.p2[1] + Math.sin(theta) * r2 * 0.9],
  };
});

/** Very common concepts would connect everything to everything — they don't explain relationships. */
const IGNORED_FOR_EDGES = new Set(["automation", "web application", "rest apis"]);

export const universeEdges: UniverseEdge[] = (() => {
  const edges: UniverseEdge[] = [];
  const termSets = projects.map(
    (p) => new Set(projectTerms(p).map((t) => t.toLowerCase()).filter((t) => !IGNORED_FOR_EDGES.has(t))),
  );
  for (let a = 0; a < projects.length; a++) {
    for (let b = a + 1; b < projects.length; b++) {
      const shared = projectTerms(projects[a]).filter((t) => termSets[b].has(t.toLowerCase()));
      if (shared.length) edges.push({ a, b, shared });
    }
  }
  return edges;
})();

export function connectionsOf(index: number) {
  return universeEdges
    .filter((e) => e.a === index || e.b === index)
    .map((e) => ({ node: universeNodes[e.a === index ? e.b : e.a], shared: e.shared }));
}
