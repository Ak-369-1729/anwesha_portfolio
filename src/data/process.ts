export interface ProcessStep {
  id: string;
  title: string;
  detail: string;
  artifact: string;
}

export const processSteps: ProcessStep[] = [
  {
    id: "understand",
    title: "Understand",
    detail: "Clarify the real problem, constraints and what success looks like before writing code.",
    artifact: "Scope note + success criteria",
  },
  {
    id: "architect",
    title: "Architect",
    detail: "Choose boundaries, data model and failure behaviour deliberately — and explain why.",
    artifact: "Architecture sketch + trade-offs",
  },
  {
    id: "prototype",
    title: "Prototype",
    detail: "Build the riskiest part first so assumptions are tested early and cheaply.",
    artifact: "Working slice you can click",
  },
  {
    id: "engineer",
    title: "Engineer",
    detail: "Turn the prototype into clean, typed, maintainable code with the edge cases handled.",
    artifact: "Reviewed, versioned code",
  },
  {
    id: "validate",
    title: "Validate",
    detail: "Test behaviour, failure paths and security assumptions — not just the happy path.",
    artifact: "Tests + verification notes",
  },
  {
    id: "deploy",
    title: "Deploy",
    detail: "Containerise, configure and ship with health checks and a rollback path.",
    artifact: "Deployed build + runbook",
  },
  {
    id: "iterate",
    title: "Iterate",
    detail: "Measure, collect feedback and improve in small, visible increments.",
    artifact: "Changelog + next steps",
  },
];

export const workingPrinciples = [
  { title: "Ownership", detail: "I treat your problem as mine, end to end — including the unglamorous parts." },
  { title: "Transparent communication", detail: "Regular progress updates, early warnings, no surprises." },
  { title: "Testing", detail: "Failure paths are part of the spec, not an afterthought." },
  { title: "Documentation", detail: "READMEs, API docs and decisions written down as I go." },
  { title: "Iterative delivery", detail: "Small working increments you can review and steer." },
  { title: "Reliable handoff", detail: "Code, docs and setup instructions you can run without me." },
];
