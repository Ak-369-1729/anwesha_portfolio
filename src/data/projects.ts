import type { CategoryId, Project, Tier } from "./types";

/**
 * Single source of truth for every project on the site.
 *
 * `github` / `demo` are only rendered when present — add repository or live
 * URLs here and they appear on cards, case studies and the command palette.
 */
export const projects: Project[] = [
  // ── Tier 1 · Flagship systems ────────────────────────────────────────────
  {
    slug: "eventmesh",
    title: "EventMesh",
    tier: 1,
    category: "infra",
    summary: "Developer infrastructure for reliable asynchronous workflows.",
    problem:
      "Every service that sends webhooks or runs background jobs ends up re-implementing retries, de-duplication and dead-letter handling — usually badly.",
    solution:
      "A delivery layer between producers and consumers: authenticated publishing, rate limiting, idempotency, retries, a dead-letter queue and recovery — observable through metrics and health checks.",
    stack: ["Redis", "Docker", "REST APIs"],
    concepts: [
      "Event-driven architecture",
      "Retries & backoff",
      "Dead-letter queue",
      "Idempotency",
      "Rate limiting",
      "Authentication",
      "Caching",
      "Metrics",
      "Health checks",
      "Failure recovery",
      "Distributed systems",
    ],
    features: [
      "Event publishing",
      "Consumers & subscriptions",
      "Retries with backoff",
      "Dead-letter queue",
      "Idempotency keys",
      "Rate limiting",
      "Authentication",
      "Redis caching",
      "Metrics",
      "Health checks",
      "Failure recovery",
    ],
    status: "Active build",
    caseStudy: {
      whyItMatters:
        "Asynchronous failures are silent. A dropped webhook, a job processed twice or an email that never sends is invisible until a user notices. Delivery guarantees are infrastructure concerns — they should not be copy-pasted into every service’s business logic.",
      limitation:
        "Brokers give you transport, not policy. Retry rules, idempotency and dead-letter handling are left to each consumer, and hosted event platforms can be opaque or heavyweight for small teams that just need dependable delivery.",
      idea:
        "Treat delivery guarantees as a product surface: a thin, observable layer where retries, de-duplication, back-pressure and recovery are explicit, configurable behaviours instead of scattered try/catch blocks.",
      howItWorks: [
        "A producer publishes an event with its API credential and an idempotency key.",
        "The edge authenticates the caller and applies per-client rate limits before anything is accepted.",
        "The idempotency check (Redis) acknowledges duplicates without delivering them twice.",
        "Accepted events are queued and dispatched to subscribed consumers.",
        "Failed deliveries are retried with increasing backoff; after the retry budget is spent the event moves to the dead-letter queue with its failure context.",
        "Operators inspect and replay dead-lettered events once the consumer recovers; metrics and health checks expose the state of every stage.",
      ],
      decisions: [
        {
          title: "At-least-once delivery + idempotency",
          detail:
            "Exactly-once delivery across networks is expensive and fragile. At-least-once with idempotency keys gives the same user-visible outcome with far simpler failure modes.",
        },
        {
          title: "Redis on the hot path",
          detail:
            "Idempotency keys, rate-limit counters and cached lookups are short-lived and latency-sensitive — Redis TTL semantics fit them naturally.",
        },
        {
          title: "The DLQ is data, not a log line",
          detail:
            "Dead-lettered events keep their payload, last error and attempt history so they can be diagnosed and replayed instead of being lost in log output.",
        },
        {
          title: "Bounded retries",
          detail:
            "A finite retry budget with growing delays protects a struggling consumer from a retry storm while still absorbing transient failures.",
        },
      ],
      reliability: [
        "Publishing requires authentication; unauthenticated traffic never reaches the queue.",
        "Rate limiting protects downstream consumers from bursts and noisy clients.",
        "Idempotency makes producer retries safe by design.",
        "Replay from the DLQ is an explicit operator action, not an automatic loop.",
        "Health checks and metrics make degradation visible before it becomes an outage.",
      ],
      challenges: [
        "Choosing retry semantics without breaking ordering expectations.",
        "Keeping idempotency windows bounded so state does not grow forever.",
        "Making failure states observable without drowning operators in logs.",
      ],
      implementation: [
        "Publish, consume and dead-letter operations exposed through an authenticated HTTP API.",
        "Redis-backed idempotency, rate-limit state and caching.",
        "Metrics and health endpoints for monitoring and orchestration probes.",
        "Containerised with Docker for reproducible local and deployed environments.",
      ],
      lessons: [
        "Reliability engineering is mostly the unhappy path.",
        "Idempotency is a contract between producer and platform — it has to be designed into the API.",
        "What you choose to measure shapes how the system gets operated.",
      ],
      next: [
        "A small consumer SDK so retries and acknowledgements are one call.",
        "Per-topic ordering options.",
        "A DLQ triage dashboard.",
        "Load testing to characterise throughput and latency honestly.",
      ],
      architecture: {
        columns: [
          { title: "Producers", nodes: [{ id: "prod", label: "Producer", sub: "service / webhook", kind: "client" }] },
          {
            title: "Edge",
            nodes: [
              { id: "auth", label: "Auth", sub: "API credentials", kind: "edge" },
              { id: "rate", label: "Rate limiter", sub: "per client", kind: "edge" },
            ],
          },
          {
            title: "Guarantees",
            nodes: [
              { id: "idem", label: "Idempotency", sub: "dedupe window", kind: "service" },
              { id: "redis", label: "Redis", sub: "keys · limits · cache", kind: "store" },
            ],
          },
          {
            title: "Core",
            nodes: [
              { id: "queue", label: "Event queue", kind: "queue" },
              { id: "disp", label: "Dispatcher", sub: "retry + backoff", kind: "worker" },
            ],
          },
          {
            title: "Delivery",
            nodes: [
              { id: "cons", label: "Consumer", kind: "client" },
              { id: "dlq", label: "Dead-letter queue", sub: "inspect · replay", kind: "queue" },
              { id: "metrics", label: "Metrics", sub: "health checks", kind: "service" },
            ],
          },
        ],
        edges: [
          { from: "prod", to: "auth", label: "publish" },
          { from: "auth", to: "rate" },
          { from: "rate", to: "idem" },
          { from: "rate", to: "redis" },
          { from: "idem", to: "redis" },
          { from: "idem", to: "queue" },
          { from: "queue", to: "disp" },
          { from: "disp", to: "cons", label: "deliver" },
          { from: "disp", to: "dlq", label: "exhausted", failure: true },
          { from: "disp", to: "metrics" },
        ],
      },
      simulation: "eventmesh",
      simulationCaption:
        "Publish events, burst past the rate limit, send a duplicate, then break the consumer and watch retries escalate into the DLQ.",
      cta: { question: "Need an API or async pipeline built like this?", service: "backend" },
    },
  },
  {
    slug: "nexus",
    title: "NEXUS / NEXUS Delta",
    aliases: ["NEXUS", "NEXUS Delta", "Nexus Δ"],
    tier: 1,
    category: "security",
    summary: "Cybersecurity digital twin that detects, isolates and restores anomalous nodes.",
    problem:
      "Intrusion detection usually stops at an alert. Someone still has to work out where the anomalous host sits in the network and what breaks if it is cut off.",
    solution:
      "A network digital twin: anomaly detection on UNSW-NB15 traffic flags suspicious flows, a NetworkX topology locates them, and the system isolates the node, then restores it — every step visible in a Streamlit dashboard with logs.",
    stack: ["Python", "NetworkX", "Streamlit", "Isolation Forest", "UNSW-NB15"],
    concepts: [
      "Anomaly detection",
      "Dynamic Isolation Forest",
      "Digital twin",
      "Network topology",
      "Incident response",
      "Intrusion detection",
      "Machine learning",
    ],
    features: [
      "UNSW-NB15 anomaly detection",
      "Dynamic Isolation Forest",
      "NetworkX topology model",
      "Suspicious-node isolation",
      "Restoration",
      "Streamlit dashboard & logs",
    ],
    status: "Prototype",
    caseStudy: {
      whyItMatters:
        "Security outcomes are decided in the response, not the alert. Modelling the network as a graph lets you rehearse containment — and see its blast radius — before touching real infrastructure.",
      limitation:
        "Signature rules miss novel behaviour, while many anomaly models emit a score with no topological context and no path to action.",
      idea:
        "Couple unsupervised detection with a graph model of the network so every detection has a location, a blast radius and a reversible response. NEXUS Delta is the iteration focused on that dynamic detect → isolate → restore loop.",
      howItWorks: [
        "Flow records from the UNSW-NB15 dataset are cleaned and turned into model features.",
        "A Dynamic Isolation Forest scores flows; outliers beyond the threshold are flagged.",
        "Flags are mapped onto nodes in a NetworkX model of the network.",
        "The suspicious node is isolated in the twin — its edges removed — and the effect on connectivity becomes visible.",
        "After verification the node is restored and its connections re-attached.",
        "The Streamlit dashboard streams scores, topology state and an audit log of every transition.",
      ],
      decisions: [
        {
          title: "Unsupervised detection",
          detail:
            "Isolation Forest isolates outliers without needing labelled signatures for every attack class — useful when the next attack does not look like the last one.",
        },
        {
          title: "The graph is the source of truth",
          detail:
            "With NetworkX, isolation becomes a graph operation: neighbours, paths and connectivity are directly measurable before and after a response.",
        },
        {
          title: "Reversible response",
          detail:
            "Isolation is modelled as a state with an explicit restore step, so a false positive costs minutes instead of an outage.",
        },
        {
          title: "Streamlit for the operator loop",
          detail: "Fast iteration on an analyst-facing dashboard without a separate frontend stack.",
        },
      ],
      reliability: [
        "Every state change (flag → isolate → restore) is logged for auditability.",
        "Reversible isolation limits the damage of false positives.",
        "UNSW-NB15 is a benchmark dataset — the twin is a research environment, not a live sensor.",
      ],
      challenges: [
        "Feature scaling and class imbalance in UNSW-NB15.",
        "Choosing a threshold that balances missed attacks against false alarms.",
        "Keeping detections and the topology model consistent as state changes.",
      ],
      implementation: [
        "Python data pipeline over UNSW-NB15 flow records.",
        "Dynamic Isolation Forest anomaly scoring.",
        "NetworkX topology with isolate / restore operations.",
        "Streamlit dashboard for scores, topology and logs.",
      ],
      lessons: [
        "Detection without response context is just noise.",
        "Explainable state transitions build analyst trust faster than a better score.",
        "Benchmark datasets are a starting point, not proof of real-world performance.",
      ],
      next: [
        "Streaming ingestion instead of batch scoring.",
        "Per-segment thresholds.",
        "Playbook-driven responses.",
        "Evaluation on additional datasets.",
      ],
      architecture: {
        columns: [
          { title: "Data", nodes: [{ id: "ds", label: "UNSW-NB15", sub: "flow records", kind: "external" }] },
          {
            title: "Detection",
            nodes: [
              { id: "feat", label: "Feature pipeline", sub: "Python", kind: "worker" },
              { id: "if", label: "Dynamic Isolation Forest", sub: "anomaly score", kind: "service" },
            ],
          },
          {
            title: "Digital twin",
            nodes: [
              { id: "resp", label: "Responder", sub: "isolate · restore", kind: "service" },
              { id: "graph", label: "Topology", sub: "NetworkX", kind: "store" },
            ],
          },
          {
            title: "Operator",
            nodes: [
              { id: "dash", label: "Dashboard", sub: "Streamlit", kind: "client" },
              { id: "log", label: "Audit log", kind: "store" },
            ],
          },
        ],
        edges: [
          { from: "ds", to: "feat" },
          { from: "feat", to: "if" },
          { from: "if", to: "resp", label: "flag node" },
          { from: "resp", to: "graph", label: "isolate", failure: true },
          { from: "graph", to: "dash", label: "topology" },
          { from: "resp", to: "log" },
        ],
      },
      simulation: "nexus",
      simulationCaption:
        "Inject an anomaly: a node’s score climbs past the threshold, the twin isolates it, connectivity reacts, then the node is restored.",
      cta: { question: "Working on a security-sensitive system?", service: "auth" },
    },
  },
  {
    slug: "resqmesh",
    title: "RESQMesh",
    aliases: ["RESCUERS", "ResQMesh", "Rescuers"],
    tier: 1,
    category: "infra",
    summary: "Information-pressure adaptive emergency communication network.",
    problem:
      "In a disaster, networks degrade exactly when traffic spikes. Critical SOS messages end up queued behind thousands of low-priority updates.",
    solution:
      "An offline-first emergency mesh that adapts payloads to information pressure: critical individual reports always travel intact, while lower-priority reports collapse into bounded, mergeable summaries.",
    stack: ["Mesh networking"],
    concepts: [
      "Offline-first",
      "Priority scheduling",
      "Adaptive payloads",
      "Mergeable summaries",
      "Congestion control",
      "Store-and-forward",
      "Distributed systems",
    ],
    features: [
      "Congestion-aware payload sizing",
      "Urgency & severity classification",
      "Critical-report preservation",
      "Bounded mergeable summaries",
      "Offline-first design",
    ],
    status: "Concept + simulation",
    caseStudy: {
      whyItMatters:
        "When bandwidth collapses, every byte is a triage decision. Responders need individual SOS signals and an aggregate picture of everyone else — without one drowning out the other.",
      limitation:
        "Conventional messaging treats every packet the same: first-in-first-out until buffers overflow, then indiscriminate drops. Mesh apps keep links alive but rarely adapt what they send to what the network can carry.",
      idea:
        "Make the payload elastic. Information pressure — demand relative to capacity — decides how each report travels. Critical reports are never merged; everything else degrades gracefully into compact summaries such as “14 × safe · sector B”.",
      howItWorks: [
        "Each report is classified by urgency and emergency severity.",
        "Nodes estimate local congestion and available capacity.",
        "Capacity is reserved for critical reports first — they are forwarded individually and intact.",
        "Lower-priority reports are merged into bounded summaries whose size does not grow with the number of reports they represent.",
        "Because summaries merge cleanly, any node on the path can combine them further as pressure rises.",
        "When links are down, reports wait locally and move on when connectivity returns.",
      ],
      decisions: [
        {
          title: "Bounded summaries",
          detail:
            "A summary has a fixed maximum size no matter how many reports it absorbs, so aggregation cannot itself cause congestion.",
        },
        {
          title: "Mergeable by construction",
          detail:
            "Summaries combine order-independently, so different nodes can aggregate without coordination and still agree.",
        },
        {
          title: "Critical never degrades",
          detail:
            "SOS-class reports are exempt from merging — the system sheds detail on low-priority traffic, never on the reports that matter most.",
        },
        {
          title: "Offline-first",
          detail: "The design assumes no infrastructure; connectivity is an optimisation, not a requirement.",
        },
      ],
      reliability: [
        "Priority reservation prevents critical traffic from being starved by bulk updates.",
        "Bounded payloads keep worst-case bandwidth predictable.",
        "Abuse resistance (per-device limits, signed reports) is part of the next iteration.",
      ],
      challenges: [
        "Classifying severity reliably from short, noisy reports.",
        "Defining merge rules that keep summaries useful to responders.",
        "Estimating capacity on links that change minute to minute.",
      ],
      implementation: [
        "Information-pressure model and prioritisation policy.",
        "Mergeable summary format with bounded size.",
        "Interactive simulation of normal vs disaster conditions (below).",
      ],
      lessons: [
        "Graceful degradation has to be designed — it never happens by accident.",
        "Aggregation is a form of compression with semantics.",
        "The most important feature of an emergency system is what it refuses to drop.",
      ],
      next: [
        "Field-realistic radio and mesh simulation.",
        "Signed reports and per-device rate limits.",
        "Responder dashboard for merged summaries.",
      ],
      architecture: {
        columns: [
          {
            title: "Field",
            nodes: [
              { id: "dev", label: "Device", sub: "offline-first app", kind: "client" },
            ],
          },
          {
            title: "Classify",
            nodes: [
              { id: "cls", label: "Urgency × severity", kind: "service" },
              { id: "press", label: "Pressure monitor", sub: "demand / capacity", kind: "service" },
            ],
          },
          {
            title: "Shape",
            nodes: [
              { id: "crit", label: "Critical lane", sub: "intact · reserved", kind: "queue" },
              { id: "merge", label: "Summary merger", sub: "bounded size", kind: "worker" },
            ],
          },
          {
            title: "Mesh",
            nodes: [{ id: "hop", label: "Relay nodes", sub: "store & forward", kind: "edge" }],
          },
          {
            title: "Response",
            nodes: [{ id: "resp", label: "Responders", kind: "client" }],
          },
        ],
        edges: [
          { from: "dev", to: "cls" },
          { from: "cls", to: "press" },
          { from: "press", to: "crit", label: "SOS" },
          { from: "press", to: "merge", label: "routine" },
          { from: "crit", to: "hop" },
          { from: "merge", to: "hop" },
          { from: "hop", to: "resp" },
        ],
      },
      simulation: "resqmesh",
      simulationCaption:
        "Switch to disaster mode: capacity collapses, critical SOS packets stay intact while routine reports merge into bounded summaries.",
      cta: { question: "Building for unreliable networks or field operations?", service: "architecture" },
    },
  },
  {
    slug: "chronoheritage",
    title: "ChronoHeritage",
    tier: 1,
    category: "fullstack",
    summary: "Dockerized geo-temporal platform for cultural heritage.",
    problem:
      "Heritage data is inherently about where and when — sites, eras, artefacts — yet it usually lives in flat lists that lose both.",
    solution:
      "A containerised platform with a Next.js frontend, FastAPI API, PostGIS for spatial queries and a Python worker for background processing — brought up together with Docker Compose.",
    stack: ["Next.js", "React", "FastAPI", "Python", "PostGIS", "PostgreSQL", "Docker", "Docker Compose"],
    concepts: ["Geospatial queries", "Background workers", "Service architecture", "REST APIs"],
    features: [
      "Timeline exploration",
      "Spatial queries with PostGIS",
      "FastAPI service layer",
      "Background worker",
      "One-command Docker Compose environment",
    ],
    status: "Prototype",
    caseStudy: {
      whyItMatters:
        "Place and time are what make heritage meaningful. A platform that understands both can answer questions a spreadsheet cannot — what stood near here, and when.",
      limitation:
        "Generic CMSes and spreadsheets store heritage as rows. They cannot efficiently answer spatial-temporal questions, and they push processing work into the request path.",
      idea:
        "Model heritage as geo-temporal data first, keep slow work off the request path, and package everything so the whole system starts with one command.",
      howItWorks: [
        "The Next.js frontend renders timeline and place-based exploration.",
        "Requests go to a FastAPI service with typed request/response schemas.",
        "Spatial and temporal filters run inside PostGIS, close to the data.",
        "Heavier processing is handed to a Python worker so the API stays responsive.",
        "Docker Compose wires frontend, API, database and worker into one reproducible environment.",
      ],
      decisions: [
        {
          title: "PostGIS over plain Postgres",
          detail: "Spatial types and indexes turn distance and containment questions into single queries.",
        },
        {
          title: "A separate worker",
          detail: "Long-running jobs never block user requests, and can be retried independently.",
        },
        {
          title: "FastAPI",
          detail: "Typed schemas validate input at the edge and generate OpenAPI documentation for free.",
        },
        {
          title: "Docker Compose",
          detail: "Every service starts the same way on every machine — onboarding is one command.",
        },
      ],
      reliability: [
        "Schema validation at the API boundary rejects malformed input early.",
        "Service isolation: the API keeps serving while background jobs are slow or failing.",
        "Configuration through environment variables keeps secrets out of the codebase.",
      ],
      challenges: [
        "Designing a data model that captures uncertain historical dates.",
        "Keeping spatial queries fast as data grows.",
        "Coordinating start-up order between database, API and worker containers.",
      ],
      implementation: [
        "Next.js + React frontend.",
        "FastAPI service layer in Python.",
        "PostgreSQL with the PostGIS extension.",
        "Python background worker.",
        "Docker Compose for the full stack.",
      ],
      lessons: [
        "The data model is the product — get place and time right first.",
        "Containerising early prevents “works on my machine” from ever starting.",
        "Async work deserves its own process boundary.",
      ],
      next: ["Interactive map layer", "Media ingestion pipeline", "Public read API with caching"],
      architecture: {
        columns: [
          { title: "Client", nodes: [{ id: "web", label: "Next.js", sub: "timeline · map UI", kind: "client" }] },
          { title: "API", nodes: [{ id: "api", label: "FastAPI", sub: "typed schemas", kind: "service" }] },
          {
            title: "Data & async",
            nodes: [
              { id: "db", label: "PostGIS", sub: "spatial + temporal", kind: "store" },
              { id: "worker", label: "Python worker", sub: "processing jobs", kind: "worker" },
            ],
          },
        ],
        edges: [
          { from: "web", to: "api", label: "HTTP" },
          { from: "api", to: "db", label: "spatial query" },
          { from: "api", to: "worker", label: "enqueue" },
          { from: "worker", to: "db", label: "write" },
        ],
      },
      simulation: "chronoheritage",
      simulationCaption:
        "Step through a request’s journey across the containers — from the timeline UI down to a spatial query and back.",
      cta: { question: "Need a full-stack platform shipped and containerised?", service: "fullstack" },
    },
  },
  {
    slug: "careeros",
    title: "CareerOS",
    tier: 1,
    category: "ai",
    summary: "AI-powered career operating system for students.",
    problem:
      "Students discover internships across scattered sources and make career decisions with little signal about fit or skill gaps.",
    solution:
      "A platform for daily opportunity discovery, internship and job intelligence, personalised career tracking and a Career Constellation that maps skills to roles and paths — with AI-assisted decision support.",
    stack: ["LLMs", "Docker"],
    concepts: [
      "Recommendation",
      "Personalisation",
      "Career graph",
      "AI-assisted decisions",
      "Opportunity discovery",
    ],
    features: [
      "Daily opportunity discovery",
      "Internship / job intelligence",
      "Personalised tracking",
      "Career Constellation",
      "AI-assisted decision making",
    ],
    status: "Active build",
    caseStudy: {
      whyItMatters:
        "Early-career decisions compound. Seeing how today’s skills connect to tomorrow’s roles turns a list of postings into a strategy.",
      limitation:
        "Job boards are lists sorted by recency. They do not model the relationship between what a student knows, what a role needs and the paths in between.",
      idea:
        "Represent careers as a graph: opportunities are stars, skills are connecting nodes, and paths are the routes between them. AI assists by summarising opportunities and suggesting next steps — the student stays in control of the decision.",
      howItWorks: [
        "Opportunities are collected and normalised daily.",
        "Each opportunity is linked to the skills it requires.",
        "A student’s profile places them in the constellation.",
        "Matching highlights reachable roles and the skills that would unlock more.",
        "Tracking keeps applications and progress in one place.",
      ],
      decisions: [
        {
          title: "Graph over list",
          detail: "Relationships between skills and roles are the insight — a graph makes them navigable.",
        },
        {
          title: "AI assists, the student decides",
          detail: "Suggestions are explainable through the skills they are based on, not opaque scores.",
        },
        {
          title: "Daily cadence",
          detail: "A small, fresh set of opportunities each day beats an overwhelming backlog.",
        },
      ],
      reliability: [
        "Personal data is scoped to the student’s own account.",
        "Recommendations are traceable to the skills they depend on.",
      ],
      challenges: [
        "Normalising inconsistent posting formats.",
        "Extracting skill requirements reliably.",
        "Keeping recommendations useful rather than noisy.",
      ],
      implementation: [
        "Opportunity ingestion and normalisation.",
        "Skill extraction and role mapping with LLM assistance.",
        "Career Constellation visualisation.",
        "Containerised services with Docker.",
      ],
      lessons: [
        "Recommendation quality depends on data cleanliness more than on the model.",
        "Visual structure can be the most useful form of AI output.",
      ],
      next: ["Skill-gap learning plans", "Mentor sharing", "Outcome-based feedback loop"],
      architecture: {
        columns: [
          {
            title: "Sources",
            nodes: [{ id: "src", label: "Opportunity sources", kind: "external" }],
          },
          {
            title: "Pipeline",
            nodes: [
              { id: "ing", label: "Ingestion", sub: "daily", kind: "worker" },
              { id: "llm", label: "LLM enrichment", sub: "skills · summary", kind: "service" },
            ],
          },
          {
            title: "Intelligence",
            nodes: [
              { id: "graph", label: "Career graph", sub: "skills ↔ roles", kind: "store" },
              { id: "match", label: "Matcher", kind: "service" },
            ],
          },
          {
            title: "Student",
            nodes: [
              { id: "ui", label: "CareerOS app", sub: "constellation · tracker", kind: "client" },
            ],
          },
        ],
        edges: [
          { from: "src", to: "ing" },
          { from: "ing", to: "llm" },
          { from: "llm", to: "graph" },
          { from: "graph", to: "match" },
          { from: "match", to: "ui", label: "suggestions" },
          { from: "ui", to: "graph", label: "profile" },
        ],
      },
      simulation: "careeros",
      simulationCaption:
        "Toggle skills to see which roles light up, how close each one is, and which skill unlocks the most new paths.",
      cta: { question: "Building an AI product?", service: "ai" },
    },
  },
  {
    slug: "boundarylens",
    title: "BoundaryLens",
    tier: 1,
    category: "security",
    summary: "Authorization and access-control security platform.",
    problem:
      "Broken access control is the top risk in the OWASP Top 10 (2021), and broken object-level authorization tops the OWASP API Security Top 10 (2023). APIs check that you are logged in — not that the object is yours.",
    solution:
      "A platform that models authorization as an explicit chain — user → role → resource → action → policy → allow/deny — and shows exactly where object-level checks are missing.",
    stack: ["REST APIs"],
    concepts: [
      "Authorization",
      "Access control",
      "RBAC",
      "IDOR",
      "BOLA",
      "Policy evaluation",
      "API security",
    ],
    features: [
      "Authorization chain modelling",
      "IDOR / BOLA detection scenarios",
      "Policy evaluation trace",
      "Allow / deny explanations",
    ],
    status: "Active build",
    caseStudy: {
      whyItMatters:
        "Authorization bugs leak other people’s data through perfectly valid requests. They pass functional tests, evade most scanners, and are trivial to exploit — change an ID in the URL.",
      limitation:
        "Role checks alone answer “can editors update invoices?” but not “can this editor update this invoice?”. Policies are scattered across handlers, so nobody can see the whole decision.",
      idea:
        "Make every authorization decision a visible, step-by-step evaluation. If the trace never checks ownership or tenancy, that gap is the vulnerability.",
      howItWorks: [
        "Identify the subject and resolve their role.",
        "Resolve the target resource, including its owner and tenant.",
        "Check whether the role permits the action at all.",
        "Apply object-level policy: ownership, tenancy and explicit grants.",
        "Return allow/deny with the exact rule that decided it.",
      ],
      decisions: [
        {
          title: "Deny by default",
          detail: "A decision is only “allow” when a rule explicitly grants it.",
        },
        {
          title: "Object-level checks are first-class",
          detail: "Ownership and tenant boundaries are evaluated as part of the policy, not left to each handler.",
        },
        {
          title: "Explainable decisions",
          detail: "Every decision returns its trace, which turns authorization into something you can review and test.",
        },
      ],
      reliability: [
        "Deny-by-default evaluation.",
        "Tenant isolation checked on every object access.",
        "Decision traces support audit and regression testing.",
      ],
      challenges: [
        "Representing real-world policies without making them unreadable.",
        "Covering both role-level and object-level rules in one model.",
        "Explaining decisions to developers who are not security specialists.",
      ],
      implementation: [
        "Policy model covering roles, resources, actions, ownership and tenancy.",
        "Evaluation engine producing decision traces.",
        "IDOR / BOLA scenarios for testing (see the playground below).",
      ],
      lessons: [
        "Most authorization bugs are missing checks, not wrong ones.",
        "If you cannot explain a decision, you cannot test it.",
      ],
      next: ["Policy-as-code export", "API traffic replay against policies", "CI checks for new endpoints"],
      architecture: {
        columns: [
          { title: "Subject", nodes: [{ id: "user", label: "User", sub: "identity", kind: "client" }] },
          { title: "Role", nodes: [{ id: "role", label: "Role", sub: "RBAC", kind: "service" }] },
          { title: "Resource", nodes: [{ id: "res", label: "Resource", sub: "owner · tenant", kind: "store" }] },
          { title: "Action", nodes: [{ id: "act", label: "Action", sub: "read · update · delete", kind: "edge" }] },
          { title: "Policy", nodes: [{ id: "pol", label: "Policy engine", sub: "deny by default", kind: "service" }] },
          { title: "Decision", nodes: [{ id: "dec", label: "Allow / Deny", sub: "+ trace", kind: "client" }] },
        ],
        edges: [
          { from: "user", to: "role" },
          { from: "role", to: "res" },
          { from: "res", to: "act" },
          { from: "act", to: "pol" },
          { from: "pol", to: "dec" },
        ],
      },
      simulation: "boundarylens",
      simulationCaption:
        "Pick a user, action and resource. Compare a role-only check with BoundaryLens’ object-level policy and watch an IDOR appear.",
      cta: { question: "Worried about authorization in your API?", service: "auth" },
    },
  },
  {
    slug: "prepai",
    title: "PrepAI / Mockexa",
    aliases: ["PrepAI", "Mockexa"],
    tier: 1,
    category: "ai",
    summary: "AI-powered interview preparation with multi-personality group discussions.",
    problem:
      "Interview prep tools drill questions but not dynamics — group discussions, interruptions, pressure and follow-up questions.",
    solution:
      "An AI interview system covering technical, HR and group-discussion rounds, with AI participants that have distinct personalities and scoring across six dimensions.",
    stack: ["LLMs"],
    concepts: ["Conversational AI", "AI personas", "Evaluation rubrics", "Prompt engineering"],
    features: [
      "Technical interviews",
      "HR interviews",
      "Group discussions",
      "AI personalities: Leader, Logical, Quiet, Aggressive, Questioning",
      "Scoring: Communication, Content, Leadership, Teamwork, Creativity, Confidence",
    ],
    status: "Prototype",
    caseStudy: {
      whyItMatters:
        "Group discussions reward skills nobody practises alone: entering a conversation, holding ground, building on others. Realistic practice needs realistic participants.",
      limitation:
        "Single-chatbot practice is polite and predictable. Real panels contain dominant speakers, quiet ones and people who challenge everything.",
      idea:
        "Give each AI participant a distinct persona and turn-taking behaviour, then score the candidate on a transparent rubric rather than a single number.",
      howItWorks: [
        "Choose a round: technical, HR or group discussion.",
        "AI participants take turns according to their personalities.",
        "The candidate’s contributions are evaluated against the rubric.",
        "Feedback reports scores across all six dimensions with concrete observations.",
      ],
      decisions: [
        {
          title: "Personas as constraints",
          detail: "Each personality has explicit behavioural rules, which keeps discussions varied but coherent.",
        },
        {
          title: "Multi-dimensional rubric",
          detail: "Six named dimensions make feedback actionable — “raise leadership” beats “score: 6.4”.",
        },
      ],
      reliability: [
        "Rubric-based scoring keeps evaluation consistent between sessions.",
        "Feedback is framed as practice guidance, not a hiring prediction.",
      ],
      challenges: [
        "Keeping personas distinct over long discussions.",
        "Natural turn-taking with several AI speakers.",
        "Scoring open-ended speech fairly.",
      ],
      implementation: [
        "LLM-driven participants with persona prompts.",
        "Round orchestration for technical, HR and GD formats.",
        "Rubric scoring and feedback generation.",
      ],
      lessons: [
        "Personality is a product feature — it needs specification like any other.",
        "Transparent rubrics make AI feedback trustworthy.",
      ],
      next: ["Voice mode", "Progress tracking across sessions", "Domain-specific technical rounds"],
      architecture: {
        columns: [
          { title: "Candidate", nodes: [{ id: "cand", label: "Candidate", kind: "client" }] },
          {
            title: "Orchestrator",
            nodes: [
              { id: "orch", label: "Round orchestrator", sub: "Tech · HR · GD", kind: "service" },
            ],
          },
          {
            title: "Participants",
            nodes: [
              { id: "personas", label: "AI personas", sub: "5 personalities", kind: "worker" },
              { id: "llm", label: "LLM", kind: "external" },
            ],
          },
          {
            title: "Evaluation",
            nodes: [{ id: "score", label: "Rubric scorer", sub: "6 dimensions", kind: "service" }],
          },
        ],
        edges: [
          { from: "cand", to: "orch" },
          { from: "orch", to: "personas", label: "turns" },
          { from: "personas", to: "llm" },
          { from: "orch", to: "score", label: "transcript" },
          { from: "score", to: "cand", label: "feedback" },
        ],
      },
      simulation: "prepai",
      simulationCaption:
        "Watch a simulated group discussion: personalities take turns while the rubric updates after each contribution.",
      cta: { question: "Want LLM-powered features in your product?", service: "ai" },
    },
  },
  {
    slug: "balloonsat",
    title: "BalloonSat Dashboard",
    tier: 1,
    category: "space",
    summary: "Mission-control telemetry dashboard for high-altitude balloon flights.",
    problem:
      "High-altitude balloon flights stream telemetry during a short, unrepeatable window — teams need to read flight state at a glance.",
    solution:
      "A mission-control dashboard for altitude, position, temperature, pressure, velocity, battery, signal strength, GNSS fix and packet status, organised around flight phases.",
    stack: ["GNSS"],
    concepts: ["Telemetry", "Real-time dashboards", "Ground station", "Data visualisation"],
    features: [
      "Altitude & position",
      "Temperature & pressure",
      "Velocity",
      "Battery & signal",
      "GNSS fix",
      "Packet status",
      "Flight-phase awareness",
    ],
    status: "Prototype",
    caseStudy: {
      whyItMatters:
        "A flight happens once. If the ground team misreads a falling battery or a lost GNSS fix, there is no second attempt.",
      limitation:
        "Raw serial logs and generic charts show numbers, not situations. Operators have to mentally reconstruct the flight phase from columns of values.",
      idea:
        "Organise the interface around the mission: phase first, then the few values that matter in that phase, with packet health always visible.",
      howItWorks: [
        "Telemetry packets arrive from the payload.",
        "Each packet is validated and its sequence checked for gaps.",
        "Values update the instrument panel and history charts.",
        "Flight phase is derived from altitude and vertical velocity.",
      ],
      decisions: [
        {
          title: "Phase-aware layout",
          detail: "Pre-launch, ascent, burst, descent and landing each change what the operator needs to see.",
        },
        {
          title: "Packet health is a first-class metric",
          detail: "Sequence gaps and checksum failures are shown next to the data they affect.",
        },
      ],
      reliability: [
        "Malformed packets are flagged, never silently plotted.",
        "Last-known-good values are marked when the link drops.",
      ],
      challenges: [
        "Designing for glanceability under pressure.",
        "Handling intermittent links gracefully.",
      ],
      implementation: [
        "Telemetry parsing and validation.",
        "Mission-control instrument panel.",
        "Flight-phase derivation.",
      ],
      lessons: [
        "Good dashboards answer “what is happening?” before “what are the numbers?”.",
        "Data quality indicators build operator trust.",
      ],
      next: ["Live map with predicted landing zone", "Recorded-flight playback", "Alert thresholds"],
      architecture: {
        columns: [
          { title: "Payload", nodes: [{ id: "pay", label: "BalloonSat", sub: "sensors · GNSS", kind: "external" }] },
          { title: "Link", nodes: [{ id: "radio", label: "Radio downlink", kind: "edge" }] },
          {
            title: "Ground",
            nodes: [
              { id: "parse", label: "Parser", sub: "validate · sequence", kind: "worker" },
              { id: "store", label: "Telemetry store", kind: "store" },
            ],
          },
          { title: "Mission control", nodes: [{ id: "ui", label: "Dashboard", sub: "phase-aware", kind: "client" }] },
        ],
        edges: [
          { from: "pay", to: "radio", label: "packets" },
          { from: "radio", to: "parse" },
          { from: "parse", to: "store" },
          { from: "store", to: "ui" },
          { from: "parse", to: "ui", label: "live" },
        ],
      },
      simulation: "balloonsat",
      simulationCaption:
        "A simulated flight: the balloon climbs through the atmosphere using standard-atmosphere physics while the console tracks every packet.",
      cta: { question: "Need a real-time dashboard for your data?", service: "dashboards" },
    },
  },

  // ── Tier 2 · Substantial projects ────────────────────────────────────────
  {
    slug: "skillscope",
    title: "SkillScope",
    tier: 2,
    category: "ai",
    summary: "Skill analysis that maps what you know against what roles need.",
    problem: "It is hard to see which skills actually separate a profile from a target role.",
    solution: "Analyses skills against role requirements and surfaces the gaps worth closing.",
    stack: [],
    concepts: ["Skill-gap analysis", "Data analysis"],
    status: "Built",
  },
  {
    slug: "algoforge",
    title: "AlgoForge",
    tier: 2,
    category: "fullstack",
    summary: "A workbench for building and exploring algorithms.",
    problem: "Algorithms are learned as static code rather than behaviour you can inspect.",
    solution: "A workspace for implementing algorithms and examining how they behave.",
    stack: [],
    concepts: ["Algorithms", "Data structures", "Visualisation"],
    status: "Built",
  },
  {
    slug: "java-daa-analyzer",
    title: "Java DAA Analyzer",
    tier: 2,
    category: "fullstack",
    summary: "Design & Analysis of Algorithms analyser written in Java.",
    problem: "Asymptotic complexity is abstract until you measure it.",
    solution: "Runs and compares algorithm implementations to make their cost visible.",
    stack: ["Java"],
    concepts: ["Algorithms", "Complexity analysis", "Object-oriented design"],
    status: "Built",
  },
  {
    slug: "screenshot-monitoring",
    title: "Intelligent Screenshot Monitoring System",
    tier: 2,
    category: "ai",
    summary: "Automated screenshot capture with intelligent analysis.",
    problem: "Manually watching screens for important changes does not scale.",
    solution: "Captures screenshots automatically and analyses them to surface what matters.",
    stack: [],
    concepts: ["Automation", "Computer vision", "Monitoring"],
    status: "Built",
  },
  {
    slug: "janmitra",
    title: "JanMitra",
    tier: 2,
    category: "fullstack",
    summary: "Citizen-facing assistance platform.",
    problem: "People struggle to reach the public services and information meant for them.",
    solution: "A single assistance platform that connects citizens with the help they need.",
    stack: [],
    concepts: ["Civic tech", "Accessibility"],
    status: "Built",
  },
  {
    slug: "path-guard",
    title: "Path Guard",
    tier: 2,
    category: "security",
    summary: "Safety-focused guarding system.",
    problem: "Unsafe paths and unchecked access put people and systems at risk.",
    solution: "Monitors and guards the path, raising alerts when something is wrong.",
    stack: [],
    concepts: ["Safety", "Alerting"],
    status: "Built",
  },
  {
    slug: "shambles-seating",
    title: "Shambles Seating",
    tier: 2,
    category: "fullstack",
    summary: "Seating-arrangement planner.",
    problem: "Allocating seats by hand is slow and error-prone.",
    solution: "Generates seating arrangements automatically from a set of constraints.",
    stack: [],
    concepts: ["Constraint solving", "Automation"],
    status: "Built",
  },
  {
    slug: "agnipariksha",
    title: "AGNIPARIKSHA",
    tier: 2,
    category: "fullstack",
    summary: "A trial-by-fire assessment platform.",
    problem: "Practice tests rarely reproduce the pressure of the real thing.",
    solution: "A demanding assessment experience built to test under realistic pressure.",
    stack: [],
    concepts: ["Assessment", "Web application"],
    status: "Built",
  },
  {
    slug: "motionshield",
    title: "MotionShield",
    tier: 2,
    category: "iot",
    summary: "Motion-aware protection system.",
    problem: "Unnoticed movement can mean an intrusion or an accident.",
    solution: "Detects motion and responds with alerts.",
    stack: ["Sensors"],
    concepts: ["Motion detection", "Alerting", "Embedded systems"],
    status: "Built",
  },
  {
    slug: "ayurvedic-dispenser",
    title: "Privacy-Preserving Ayurvedic Smart Wellness Dispenser",
    tier: 2,
    category: "iot",
    summary: "Smart wellness dispenser designed around user privacy.",
    problem: "Personalised wellness devices tend to collect more personal data than they need.",
    solution: "A smart dispenser that personalises dosing while keeping personal data private.",
    stack: ["Sensors"],
    concepts: ["Privacy by design", "Embedded systems", "Healthcare IoT"],
    status: "Prototype",
  },
  {
    slug: "web-security-scanner",
    title: "Web Application Security Scanner",
    tier: 2,
    category: "security",
    summary: "Automated scanner for common web application vulnerabilities.",
    problem: "Common web vulnerabilities slip into production because nobody checks systematically.",
    solution: "Scans web applications for common weaknesses and reports findings.",
    stack: [],
    concepts: ["Web security", "OWASP", "Vulnerability scanning", "Automation"],
    status: "Built",
  },
  {
    slug: "cansat-ground-control",
    title: "CanSat / Ground Control",
    tier: 2,
    category: "space",
    summary: "Exploration of CanSat payloads and ground-control software.",
    problem: "Small satellite payloads are only useful if the ground station can make sense of them.",
    solution: "Explored the payload-to-ground pipeline and ground-control interfaces.",
    stack: ["GNSS"],
    concepts: ["Telemetry", "Ground station"],
    status: "Exploration",
  },

  // ── Tier 3 · Lab / experiments ───────────────────────────────────────────
  {
    slug: "pqc-experiments",
    title: "Post-Quantum Cryptography experiments",
    aliases: ["PQC"],
    tier: 3,
    category: "research",
    summary: "Hands-on experiments with post-quantum cryptographic schemes.",
    problem: "Today’s public-key cryptography will not survive large quantum computers.",
    solution: "Experiments with post-quantum primitives to understand their trade-offs.",
    stack: ["PQC"],
    concepts: ["Cryptography", "Post-quantum"],
    status: "Exploration",
  },
  {
    slug: "ml-kem",
    title: "ML-KEM experiments",
    aliases: ["Kyber"],
    tier: 3,
    category: "research",
    summary: "Exploring ML-KEM, the NIST-standardised post-quantum key-encapsulation mechanism.",
    problem: "Migrating key exchange to post-quantum algorithms requires understanding them in practice.",
    solution: "Experiments with ML-KEM key generation, encapsulation and decapsulation.",
    stack: ["ML-KEM", "PQC"],
    concepts: ["Cryptography", "Key encapsulation"],
    status: "Exploration",
  },
  {
    slug: "scyther",
    title: "Scyther protocol verification",
    tier: 3,
    category: "research",
    summary: "Formal verification of security protocols with Scyther.",
    problem: "Protocol flaws hide in message flows that look correct on paper.",
    solution: "Modelled protocols in Scyther to check secrecy and authentication claims.",
    stack: ["Scyther"],
    concepts: ["Formal verification", "Security protocols"],
    status: "Exploration",
  },
  {
    slug: "tamarin",
    title: "Tamarin exploration",
    tier: 3,
    category: "research",
    summary: "Exploring the Tamarin prover for protocol analysis.",
    problem: "Some protocol properties need more expressive models than push-button tools offer.",
    solution: "Explored Tamarin’s multiset-rewriting models for security protocol proofs.",
    stack: ["Tamarin"],
    concepts: ["Formal verification", "Security protocols"],
    status: "Exploration",
  },
  {
    slug: "react-student-form",
    title: "React Student Form",
    tier: 3,
    category: "fullstack",
    summary: "Validated student registration form in React.",
    problem: "Forms are where most user frustration and bad data begin.",
    solution: "A React form with controlled inputs and validation.",
    stack: ["React", "JavaScript"],
    concepts: ["Form validation"],
    status: "Built",
  },
  {
    slug: "swift-uikit",
    title: "Swift / UIKit applications",
    aliases: ["iOS"],
    tier: 3,
    category: "mobile",
    summary: "Native iOS applications built with Swift and UIKit.",
    problem: "Learning native mobile means learning the platform’s own patterns.",
    solution: "A series of UIKit apps exploring view controllers, navigation and layout.",
    stack: ["Swift", "UIKit"],
    concepts: ["iOS", "Mobile development"],
    status: "Built",
  },
  {
    slug: "java-oop",
    title: "Java OOP work",
    tier: 3,
    category: "fullstack",
    summary: "Object-oriented design exercises and projects in Java.",
    problem: "Good structure is what keeps code changeable.",
    solution: "Projects applying encapsulation, inheritance, interfaces and design patterns.",
    stack: ["Java"],
    concepts: ["Object-oriented design"],
    status: "Built",
  },
  {
    slug: "competitive-coding",
    title: "Algorithms & competitive coding",
    tier: 3,
    category: "research",
    summary: "Implementations of classic algorithms and contest problems.",
    problem: "Efficient solutions start with a strong algorithmic toolkit.",
    solution: "A growing set of algorithm and data-structure implementations.",
    stack: [],
    concepts: ["Algorithms", "Data structures", "Problem solving"],
    status: "Ongoing",
  },
  {
    slug: "computer-networking",
    title: "Computer networking work",
    tier: 3,
    category: "infra",
    summary: "Networking fundamentals, from protocols to topologies.",
    problem: "Distributed systems are only as reliable as the network beneath them.",
    solution: "Coursework and experiments on protocols, addressing and topologies.",
    stack: [],
    concepts: ["Networking", "TCP/IP", "Network topology"],
    status: "Built",
  },
  {
    slug: "devops-experiments",
    title: "DevOps experiments",
    tier: 3,
    category: "infra",
    summary: "Build, container and deployment pipeline experiments.",
    problem: "Shipping reliably is a skill separate from writing code.",
    solution: "Experiments with containers, automation and deployment workflows.",
    stack: ["Docker"],
    concepts: ["CI/CD", "Automation"],
    status: "Ongoing",
  },
  {
    slug: "cloud-deployments",
    title: "Cloud deployments",
    tier: 3,
    category: "infra",
    summary: "Deploying and operating services on Google Cloud.",
    problem: "Cloud platforms are vast; fluency comes from doing.",
    solution: "Hands-on deployments across Google Cloud services, backed by 100+ skill badges.",
    stack: ["Google Cloud"],
    concepts: ["Cloud", "Deployment"],
    status: "Ongoing",
  },
  {
    slug: "fastapi-backends",
    title: "FastAPI backend projects",
    tier: 3,
    category: "fullstack",
    summary: "Typed, documented REST backends with FastAPI.",
    problem: "APIs need validation, documentation and clear contracts.",
    solution: "FastAPI services with typed schemas and auto-generated OpenAPI docs.",
    stack: ["FastAPI", "Python", "REST APIs"],
    concepts: ["API design"],
    status: "Built",
  },
  {
    slug: "dockerized-apps",
    title: "Dockerized applications",
    tier: 3,
    category: "infra",
    summary: "Containerising applications for reproducible environments.",
    problem: "“Works on my machine” is not a deployment strategy.",
    solution: "Applications packaged with Docker and Docker Compose.",
    stack: ["Docker", "Docker Compose"],
    concepts: ["Containers"],
    status: "Built",
  },
  {
    slug: "cybersecurity-experiments",
    title: "Cybersecurity experiments",
    tier: 3,
    category: "security",
    summary: "Hands-on security testing and analysis exercises.",
    problem: "Defence requires understanding how attacks actually work.",
    solution: "Experiments across web, network and application security.",
    stack: [],
    concepts: ["Security testing", "Web security", "Networking"],
    status: "Ongoing",
  },
];

export const tierLabels: Record<Tier, { label: string; code: string; blurb: string }> = {
  1: { label: "Flagship systems", code: "L1", blurb: "Full case studies with interactive simulations." },
  2: { label: "Substantial projects", code: "L2", blurb: "Complete builds with a focused scope." },
  3: { label: "Lab & experiments", code: "L3", blurb: "Explorations, research and fundamentals." },
};

export const flagships = projects.filter((p) => p.tier === 1);

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function projectsByCategory(category: CategoryId) {
  return projects.filter((p) => p.category === category);
}

/** All searchable technology + concept terms for a project. */
export function projectTerms(p: Project) {
  return [...p.stack, ...(p.concepts ?? [])];
}
