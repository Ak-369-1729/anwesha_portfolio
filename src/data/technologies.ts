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
    color: "#2d5be3",
    terms: ["LLMs", "Isolation Forest", "Anomaly detection", "Machine learning", "Computer vision", "AI personas"],
  },
  {
    id: "backend",
    label: "Backend",
    color: "#87570c",
    terms: ["FastAPI", "Python", "REST APIs", "Redis", "Java"],
  },
  {
    id: "frontend",
    label: "Frontend",
    color: "#4a5fa0",
    terms: ["Next.js", "React", "Streamlit", "Real-time dashboards"],
  },
  {
    id: "infrastructure",
    label: "Infrastructure",
    color: "#6a5c0e",
    terms: ["Docker", "Docker Compose", "Google Cloud", "CI/CD", "Event-driven architecture"],
  },
  {
    id: "security",
    label: "Security",
    color: "#b3301f",
    terms: ["Authorization", "IDOR", "Intrusion detection", "Web security", "PQC", "ML-KEM", "Scyther", "Tamarin"],
  },
  {
    id: "mobile",
    label: "Mobile",
    color: "#6b48b0",
    terms: ["Swift", "UIKit"],
  },
  {
    id: "data",
    label: "Data",
    color: "#2b7a4b",
    terms: ["PostGIS", "PostgreSQL", "NetworkX", "UNSW-NB15", "Geospatial queries"],
  },
  {
    id: "systems",
    label: "Systems",
    color: "#a8456a",
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
