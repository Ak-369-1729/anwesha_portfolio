import type { ServiceId } from "./types";

export interface Service {
  id: ServiceId;
  title: string;
  pitch: string;
  deliverables: string[];
  evidence: string[];
  cta: string;
}

/** Client mode: what can be built, with the project evidence behind each claim. */
export const services: Service[] = [
  {
    id: "ai",
    title: "AI-powered applications",
    pitch: "LLM features, RAG pipelines and AI workflows wired into real products.",
    deliverables: ["LLM and RAG integration", "prompt and evaluation design", "AI feature UX"],
    evidence: ["careeros", "prepai", "nexus"],
    cta: "Scope an AI feature",
  },
  {
    id: "backend",
    title: "FastAPI & REST APIs",
    pitch: "Typed, documented backends with the reliability plumbing already in place.",
    deliverables: ["REST API design", "validation and docs", "async jobs, retries and queues"],
    evidence: ["eventmesh", "chronoheritage", "fastapi-backends"],
    cta: "Scope an API",
  },
  {
    id: "fullstack",
    title: "Full-stack web apps",
    pitch: "React and Next.js frontends on top of clean APIs, from MVP to production.",
    deliverables: ["React and Next.js UI", "API integration", "responsive, accessible screens"],
    evidence: ["chronoheritage", "careeros", "react-student-form"],
    cta: "Plan an MVP",
  },
  {
    id: "automation",
    title: "Automation & workflows",
    pitch: "Replace repetitive manual steps with scripts, jobs and event pipelines.",
    deliverables: ["workflow automation", "scheduled jobs", "third-party integrations"],
    evidence: ["eventmesh", "screenshot-monitoring", "web-security-scanner"],
    cta: "Automate a workflow",
  },
  {
    id: "dashboards",
    title: "Dashboards & monitoring",
    pitch: "Interfaces that show what a system is doing at a glance.",
    deliverables: ["real-time dashboards", "data visualisation", "operational views"],
    evidence: ["balloonsat", "nexus"],
    cta: "Design a dashboard",
  },
  {
    id: "data",
    title: "Databases & integration",
    pitch: "Data models, spatial queries, caching and third-party integrations.",
    deliverables: ["PostgreSQL and PostGIS", "Redis caching", "schema design"],
    evidence: ["chronoheritage", "eventmesh"],
    cta: "Discuss your data",
  },
  {
    id: "auth",
    title: "Authentication & access control",
    pitch: "Auth flows and authorization that actually check object-level access.",
    deliverables: ["auth integration", "role and object-level policy", "a security review"],
    evidence: ["boundarylens", "eventmesh", "web-security-scanner"],
    cta: "Review your auth",
  },
  {
    id: "devops",
    title: "Docker & deployment",
    pitch: "Containerised, reproducible environments and a clean path to production.",
    deliverables: ["Dockerfiles and Compose", "cloud deployment", "health checks and config"],
    evidence: ["chronoheritage", "eventmesh", "dockerized-apps", "cloud-deployments"],
    cta: "Ship it to production",
  },
  {
    id: "architecture",
    title: "Debugging & system architecture",
    pitch: "Untangle a failing system, or design one that will not need untangling.",
    deliverables: ["architecture design", "root-cause debugging", "a reliability review"],
    evidence: ["eventmesh", "resqmesh", "nexus"],
    cta: "Talk architecture",
  },
];

export const serviceById = Object.fromEntries(services.map((s) => [s.id, s])) as Record<ServiceId, Service>;

export interface DepthArea {
  title: string;
  detail: string;
  evidence: string[];
}

/** Recruiter mode: technical depth areas, each tied to evidence. */
export const depthAreas: DepthArea[] = [
  {
    title: "Architecture & system design",
    detail: "Service boundaries, async workers, containers and the data model underneath.",
    evidence: ["chronoheritage", "eventmesh", "careeros"],
  },
  {
    title: "Distributed & async systems",
    detail: "Delivery guarantees, idempotency, back-pressure and graceful degradation.",
    evidence: ["eventmesh", "resqmesh", "computer-networking"],
  },
  {
    title: "Security engineering",
    detail: "Anomaly detection, authorization models, scanning and post-quantum crypto.",
    evidence: ["nexus", "boundarylens", "web-security-scanner", "ml-kem"],
  },
  {
    title: "Algorithms & fundamentals",
    detail: "Complexity analysis, data structures and contest-style problem solving.",
    evidence: ["java-daa-analyzer", "algoforge", "competitive-coding"],
  },
  {
    title: "Research & formal methods",
    detail: "Protocol verification with Scyther and Tamarin; ML-KEM and PQC experiments.",
    evidence: ["scyther", "tamarin", "pqc-experiments"],
  },
  {
    title: "Applied AI",
    detail: "Unsupervised detection, LLM personas and AI-assisted decision tools.",
    evidence: ["nexus", "prepai", "careeros"],
  },
];
