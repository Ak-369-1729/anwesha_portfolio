import { categoryById } from "@/data/categories";
import { projects } from "@/data/projects";
import type { Project } from "@/data/types";

const STOP_WORDS = new Set(
  "a an and any are built by can do does find for from has have i in is it me my of on or projects project show something that the things to use used uses using what which with work".split(" "),
);

/** Natural-language shorthands → terms that appear in project metadata. */
const SYNONYMS: Record<string, string[]> = {
  ai: ["ai", "llms", "machine learning", "anomaly detection", "isolation forest", "computer vision", "ai personas"],
  ml: ["machine learning", "isolation forest", "anomaly detection"],
  llm: ["llms", "conversational ai", "ai personas"],
  rag: ["llms"],
  security: ["cybersecurity", "security", "authorization", "idor", "bola", "intrusion detection", "web security", "pqc", "cryptography"],
  cybersecurity: ["cybersecurity", "security", "authorization", "intrusion detection", "web security", "pqc"],
  crypto: ["cryptography", "pqc", "ml-kem", "post-quantum"],
  space: ["space", "gnss", "telemetry", "ground station"],
  satellite: ["gnss", "telemetry", "ground station"],
  "distributed systems": ["distributed systems", "event-driven architecture", "mesh networking", "dead-letter queue", "idempotency"],
  distributed: ["distributed systems", "event-driven architecture", "mesh networking"],
  backend: ["fastapi", "rest apis", "redis", "api design"],
  api: ["rest apis", "fastapi", "api design", "api security"],
  frontend: ["react", "next.js", "streamlit", "real-time dashboards"],
  devops: ["docker", "docker compose", "ci/cd", "google cloud", "deployment"],
  cloud: ["google cloud", "cloud", "deployment"],
  deploy: ["docker", "deployment", "google cloud"],
  mobile: ["swift", "uikit", "ios"],
  ios: ["swift", "uikit", "ios"],
  iot: ["sensors", "embedded systems", "iot"],
  hardware: ["sensors", "embedded systems"],
  research: ["formal verification", "scyther", "tamarin", "pqc", "research"],
  database: ["postgresql", "postgis", "redis"],
  data: ["postgresql", "postgis", "networkx", "unsw-nb15", "data analysis"],
  dashboard: ["real-time dashboards", "streamlit", "dashboard"],
  automation: ["automation", "event-driven architecture"],
  queue: ["dead-letter queue", "event-driven architecture", "retries & backoff"],
  auth: ["authentication", "authorization", "access control"],
  network: ["networking", "network topology", "mesh networking"],
  algorithms: ["algorithms", "data structures", "complexity analysis"],
};

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function wordMatch(field: string, term: string) {
  const f = norm(field);
  const t = norm(term);
  if (f === t) return true;
  // Short terms ("ai", "ml") must match whole words; longer ones may match word prefixes.
  const pattern = t.length <= 3 ? `(^|[^a-z0-9])${escape(t)}([^a-z0-9]|$)` : `(^|[^a-z0-9])${escape(t)}`;
  return new RegExp(pattern).test(f);
}

interface Field {
  text: string;
  weight: number;
}

function fieldsOf(p: Project): Field[] {
  const cat = categoryById[p.category];
  return [
    { text: p.title, weight: 6 },
    ...(p.aliases ?? []).map((a) => ({ text: a, weight: 6 })),
    ...p.stack.map((s) => ({ text: s, weight: 5 })),
    ...(p.concepts ?? []).map((c) => ({ text: c, weight: 4 })),
    { text: cat.label, weight: 4 },
    { text: cat.short, weight: 4 },
    { text: p.summary, weight: 1 },
    { text: p.problem, weight: 1 },
    { text: p.solution, weight: 1 },
  ];
}

/** Splits a query into term groups; each group is a word/phrase plus its synonyms. */
function termGroups(query: string): string[][] {
  let q = norm(query).trim();
  const groups: string[][] = [];
  for (const phrase of Object.keys(SYNONYMS).filter((k) => k.includes(" "))) {
    if (q.includes(phrase)) {
      groups.push([phrase, ...SYNONYMS[phrase]]);
      q = q.replace(phrase, " ");
    }
  }
  for (const word of q.split(/[^a-z0-9.+#/-]+/).filter(Boolean)) {
    if (STOP_WORDS.has(word)) continue;
    groups.push([word, ...(SYNONYMS[word] ?? [])]);
  }
  return groups;
}

export interface ProjectHit {
  project: Project;
  score: number;
  matched: string[];
}

/** Local natural-language search across structured project metadata. */
export function searchProjects(query: string): ProjectHit[] {
  const groups = termGroups(query);
  if (!groups.length) return [];
  const hits: ProjectHit[] = [];
  for (const project of projects) {
    const fields = fieldsOf(project);
    let groupsHit = 0;
    let score = 0;
    const matched = new Set<string>();
    for (const group of groups) {
      let best = 0;
      for (const term of group) {
        for (const f of fields) {
          if (f.weight > best && wordMatch(f.text, term)) {
            best = f.weight;
            if (f.weight >= 4) matched.add(f.text);
          }
        }
      }
      if (best > 0) groupsHit++;
      score += best;
    }
    if (groupsHit === 0) continue;
    // Projects matching every part of the query rank first; tier breaks ties.
    hits.push({ project, score: groupsHit * 100 + score + (4 - project.tier), matched: [...matched] });
  }
  return hits.sort((a, b) => b.score - a.score);
}
