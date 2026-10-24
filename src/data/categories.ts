import type { CategoryId } from "./types";

export interface Category {
  id: CategoryId;
  label: string;
  short: string;
  code: string;
  /** Hex used by the 3D universe and SVG graphs. */
  color: string;
  blurb: string;
}

export const categories: Category[] = [
  {
    id: "ai",
    label: "AI & Intelligence",
    short: "AI",
    code: "AI",
    color: "#7cd6ff",
    blurb: "Models, LLM features and decision systems.",
  },
  {
    id: "security",
    label: "Cybersecurity",
    short: "Security",
    code: "SEC",
    color: "#ef8a6b",
    blurb: "Detection, authorization and offensive testing.",
  },
  {
    id: "infra",
    label: "Infrastructure & Distributed Systems",
    short: "Infra",
    code: "INF",
    color: "#d8a657",
    blurb: "Queues, delivery guarantees, containers and deployment.",
  },
  {
    id: "fullstack",
    label: "Full Stack",
    short: "Full stack",
    code: "FS",
    color: "#b9c7ff",
    blurb: "Product-grade web apps, APIs and data layers.",
  },
  {
    id: "mobile",
    label: "Mobile / iOS",
    short: "Mobile",
    code: "iOS",
    color: "#c7a0ff",
    blurb: "Native Swift and UIKit applications.",
  },
  {
    id: "space",
    label: "Space / GNSS / Telemetry",
    short: "Space",
    code: "SPC",
    color: "#7fdcb4",
    blurb: "Flight telemetry, GNSS and ground control.",
  },
  {
    id: "iot",
    label: "IoT / Experimental Engineering",
    short: "IoT",
    code: "IOT",
    color: "#e8d27a",
    blurb: "Sensors, devices and physical computing.",
  },
  {
    id: "research",
    label: "Research / Security Protocols",
    short: "Research",
    code: "RES",
    color: "#e6a3b8",
    blurb: "Post-quantum crypto and formal protocol verification.",
  },
];

export const categoryById = Object.fromEntries(categories.map((c) => [c.id, c])) as Record<
  CategoryId,
  Category
>;
