export type CategoryId =
  | "ai"
  | "security"
  | "infra"
  | "fullstack"
  | "mobile"
  | "space"
  | "iot"
  | "research";

/** 1 = flagship system, 2 = substantial project, 3 = lab / experiment */
export type Tier = 1 | 2 | 3;

export type ProjectStatus =
  | "Active build"
  | "Prototype"
  | "Concept + simulation"
  | "Built"
  | "Exploration"
  | "Ongoing";

export type SimulationId =
  | "eventmesh"
  | "nexus"
  | "resqmesh"
  | "chronoheritage"
  | "careeros"
  | "boundarylens"
  | "prepai"
  | "balloonsat";

export type ServiceId =
  | "ai"
  | "backend"
  | "fullstack"
  | "automation"
  | "dashboards"
  | "data"
  | "auth"
  | "devops"
  | "architecture";

export type ArchNodeKind = "client" | "edge" | "service" | "store" | "queue" | "worker" | "external";

export interface ArchNode {
  id: string;
  label: string;
  sub?: string;
  kind: ArchNodeKind;
}

export interface Architecture {
  columns: { title: string; nodes: ArchNode[] }[];
  edges: { from: string; to: string; label?: string; failure?: boolean }[];
}

export interface CaseStudy {
  whyItMatters: string;
  limitation: string;
  idea: string;
  howItWorks: string[];
  decisions: { title: string; detail: string }[];
  reliability: string[];
  challenges: string[];
  implementation: string[];
  lessons: string[];
  next: string[];
  architecture: Architecture;
  simulation: SimulationId;
  simulationCaption: string;
  cta: { question: string; service: ServiceId };
}

export interface Project {
  slug: string;
  title: string;
  /** Alternate names that should resolve to this entry in search. */
  aliases?: string[];
  tier: Tier;
  category: CategoryId;
  summary: string;
  /** Two or three words, used on the isometric map labels. */
  tagline?: string;
  problem: string;
  solution: string;
  /** Concrete technologies — these feed the technology graph. */
  stack: string[];
  /** Engineering concepts — searchable, shown as secondary tags. */
  concepts?: string[];
  features?: string[];
  status: ProjectStatus;
  github?: string;
  demo?: string;
  year?: string;
  caseStudy?: CaseStudy;
}
