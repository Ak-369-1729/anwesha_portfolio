import { projects, projectTerms } from "./projects";
import type { Project } from "./types";

export type TechClusterId =
  | "ai"
  | "backend"
  | "frontend"
  | "infrastructure"
  | "security"
  | "mobile"
  | "data"
  | "systems";

export interface TechCluster {
  id: TechClusterId;
  label: string;
  color: string;
  terms: string[];
}

/** Every term listed here must appear in at least one project's stack or concepts. */
export const techClusters: TechCluster[] = [
  {
    id: "ai",
    label: "AI",
    color: "#7cd6ff",
    terms: ["LLMs", "Isolation Forest", "Anomaly detection", "Machine learning", "Computer vision", "AI personas"],
  },
  {
    id: "backend",
    label: "Backend",
    color: "#d8a657",
    terms: ["FastAPI", "Python", "REST APIs", "Redis", "Java"],
  },
  {
    id: "frontend",
    label: "Frontend",
    color: "#b9c7ff",
    terms: ["Next.js", "React", "Streamlit", "Real-time dashboards"],
  },
  {
    id: "infrastructure",
    label: "Infrastructure",
    color: "#e8d27a",
    terms: ["Docker", "Docker Compose", "Google Cloud", "CI/CD", "Event-driven architecture"],
  },
  {
    id: "security",
    label: "Security",
    color: "#ef8a6b",
    terms: ["Authorization", "IDOR", "Intrusion detection", "Web security", "PQC", "ML-KEM", "Scyther", "Tamarin"],
  },
  {
    id: "mobile",
    label: "Mobile",
    color: "#c7a0ff",
    terms: ["Swift", "UIKit"],
  },
  {
    id: "data",
    label: "Data",
    color: "#7fdcb4",
    terms: ["PostGIS", "PostgreSQL", "NetworkX", "UNSW-NB15", "Geospatial queries"],
  },
  {
    id: "systems",
    label: "Systems",
    color: "#e6a3b8",
    terms: ["Distributed systems", "Networking", "Algorithms", "Telemetry", "GNSS", "Mesh networking", "Sensors"],
  },
];

const norm = (s: string) => s.toLowerCase();

export function projectsUsing(term: string): Project[] {
  const t = norm(term);
  return projects.filter((p) => projectTerms(p).some((x) => norm(x) === t));
}

export function projectsInCluster(cluster: TechCluster): Project[] {
  const set = new Set(cluster.terms.map(norm));
  return projects.filter((p) => projectTerms(p).some((x) => set.has(norm(x))));
}

/** Every distinct technology used across projects (stack only), sorted by usage. */
export function allTechnologies(): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of projects) for (const s of p.stack) counts.set(s, (counts.get(s) ?? 0) + 1);
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
