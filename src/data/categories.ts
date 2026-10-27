import type { CategoryId } from "./types";

export interface Category {
  id: CategoryId;
  label: string;
  short: string;
  code: string;
  /** Text-safe colour for labels (passes contrast on white). */
  color: string;
  /** Bright fill used for this discipline's isometric blocks. */
  block: string;
  blurb: string;
}

export const categories: Category[] = [
  {
    id: "ai",
    label: "AI & Intelligence",
    short: "AI",
    code: "AI",
    color: "#3451f2",
    block: "#3b5bff",
    blurb: "Models, LLM features and decision systems.",
  },
  {
    id: "security",
    label: "Cybersecurity",
    short: "Security",
    code: "SEC",
    color: "#d33547",
    block: "#ff7aa8",
    blurb: "Detection, authorization and offensive testing.",
  },
  {
    id: "infra",
    label: "Infrastructure & Distributed Systems",
    short: "Infra",
    code: "INF",
    color: "#c2570c",
    block: "#ff7b47",
    blurb: "Queues, delivery guarantees, containers and deployment.",
  },
  {
    id: "fullstack",
    label: "Full Stack",
    short: "Full stack",
    code: "FS",
    color: "#6d4ee6",
    block: "#4cc3ff",
    blurb: "Product-grade web apps, APIs and data layers.",
  },
  {
    id: "mobile",
    label: "Mobile / iOS",
    short: "Mobile",
    code: "iOS",
    color: "#9333c9",
    block: "#b8a6ff",
    blurb: "Native Swift and UIKit applications.",
  },
  {
    id: "space",
    label: "Space / GNSS / Telemetry",
    short: "Space",
    code: "SPC",
    color: "#0d8459",
    block: "#2fd3a0",
    blurb: "Flight telemetry, GNSS and ground control.",
  },
  {
    id: "iot",
    label: "IoT / Experimental Engineering",
    short: "IoT",
    code: "IOT",
    color: "#a16207",
    block: "#ffd24a",
    blurb: "Sensors, devices and physical computing.",
  },
  {
    id: "research",
    label: "Research / Security Protocols",
    short: "Research",
    code: "RES",
    color: "#c03a75",
    block: "#a6e35c",
    blurb: "Post-quantum crypto and formal protocol verification.",
  },
];

export const categoryById = Object.fromEntries(categories.map((c) => [c.id, c])) as Record<
  CategoryId,
  Category
>;
