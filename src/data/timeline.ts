export type TimelineKind = "experience" | "leadership" | "award" | "research" | "project" | "milestone";

export interface TimelineEntry {
  id: string;
  /** Free-form period label. Only the internship has confirmed dates. */
  period: string;
  title: string;
  org?: string;
  kind: TimelineKind;
  detail: string;
  link?: string;
}

/** Ordered oldest first — the timeline signal travels toward the present. Undated entries are grouped by era, never given invented dates. */
export const timeline: TimelineEntry[] = [
  {
    id: "ncsc",
    period: "School",
    title: "National Child Scientist recognition",
    org: "National Children’s Science Congress",
    kind: "award",
    detail: "National-finalist experience at NCSC — where the habit of asking questions started.",
  },
  {
    id: "manak",
    period: "School",
    title: "INSPIRE Award — MANAK",
    kind: "award",
    detail: "Recognised under the INSPIRE–MANAK scheme for original student ideas.",
  },
  {
    id: "hackathons",
    period: "University",
    title: "Hackathons & technical events",
    kind: "milestone",
    detail: "Building under time pressure, in teams, in front of judges.",
  },
  {
    id: "pqc",
    period: "University",
    title: "Security protocol research",
    kind: "research",
    detail: "Scyther and Tamarin protocol verification; ML-KEM and post-quantum experiments.",
  },
  {
    id: "space",
    period: "University",
    title: "Space-tech exploration — KCC",
    kind: "research",
    detail: "BalloonSat, CanSat / ground control, GNSS and telemetry work.",
    link: "/projects/balloonsat",
  },
  {
    id: "badges",
    period: "University",
    title: "100+ Google Cloud badges · Arcade Legend tier",
    kind: "milestone",
    detail: "Sustained hands-on cloud practice across Google Cloud services.",
  },
  {
    id: "arcade",
    period: "University",
    title: "Google Cloud Arcade Facilitator — Top 30",
    kind: "leadership",
    detail: "Facilitated learners through the Google Cloud Arcade programme.",
  },
  {
    id: "ieee",
    period: "University",
    title: "Vice Chair, IEEE SIGHT",
    org: "Chandigarh University",
    kind: "leadership",
    detail: "Leadership in IEEE’s Special Interest Group on Humanitarian Technology.",
  },
  {
    id: "flagships",
    period: "University",
    title: "Flagship systems",
    kind: "project",
    detail: "EventMesh, NEXUS, RESQMesh, ChronoHeritage, CareerOS, BoundaryLens, PrepAI and the BalloonSat dashboard.",
    link: "/#systems",
  },
  {
    id: "adxania",
    period: "Aug 2025 – Feb 2026",
    title: "Cybersecurity Intern",
    org: "Adxania Cyber Solutions Pvt. Ltd.",
    kind: "experience",
    detail: "Hands-on security work in an industry setting.",
  },
];
