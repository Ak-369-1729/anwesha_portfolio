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
    color: "#2d5be3",
    blurb: "Models, LLM features and decision systems.",
  },
  {
    id: "security",
    label: "Cybersecurity",
    short: "Security",
    code: "SEC",
    color: "#b3301f",
    blurb: "Detection, authorization and offensive testing.",
  },
  {
    id: "infra",
    label: "Infrastructure & Distributed Systems",
    short: "Infra",
    code: "INF",
    color: "#87570c",
    blurb: "Queues, delivery guarantees, containers and deployment.",
  },
  {
    id: "fullstack",
    label: "Full Stack",
    short: "Full stack",
    code: "FS",
    color: "#4a5fa0",
    blurb: "Product-grade web apps, APIs and data layers.",
  },
  {
    id: "mobile",
    label: "Mobile / iOS",
    short: "Mobile",
    code: "iOS",
    color: "#6b48b0",
    blurb: "Native Swift and UIKit applications.",
  },
  {
    id: "space",
    label: "Space / GNSS / Telemetry",
    short: "Space",
    code: "SPC",
    color: "#2b7a4b",
    blurb: "Flight telemetry, GNSS and ground control.",
  },
  {
    id: "iot",
    label: "IoT / Experimental Engineering",
    short: "IoT",
    code: "IOT",
    color: "#6a5c0e",
    blurb: "Sensors, devices and physical computing.",
  },
  {
    id: "research",
    label: "Research / Security Protocols",
    short: "Research",
    code: "RES",
    color: "#a8456a",
    blurb: "Post-quantum crypto and formal protocol verification.",
  },
];

export const categoryById = Object.fromEntries(categories.map((c) => [c.id, c])) as Record<
  CategoryId,
  Category
>;
