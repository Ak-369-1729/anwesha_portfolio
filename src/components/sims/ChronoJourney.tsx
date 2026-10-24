"use client";

import { useCallback, useRef, useState } from "react";
import { useInView, useInterval } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { SimButton, SimFrame } from "./SimFrame";

type NodeId = "web" | "api" | "db" | "worker";

const NODES: Record<NodeId, { x: number; y: number; label: string; sub: string; color: string }> = {
  web: { x: 90, y: 110, label: "Next.js", sub: "timeline UI", color: "#b9c7ff" },
  api: { x: 260, y: 110, label: "FastAPI", sub: "typed API", color: "#d8a657" },
  db: { x: 430, y: 110, label: "PostGIS", sub: "space + time", color: "#7fdcb4" },
  worker: { x: 260, y: 220, label: "Worker", sub: "Python jobs", color: "#7cd6ff" },
};

const STEPS: {
  title: string;
  detail: string;
  active: NodeId[];
  path: [NodeId, NodeId] | null;
  code: string;
}[] = [
  {
    title: "Explore",
    detail: "A visitor scrubs the timeline to 1100–1300 CE around a location. The frontend turns that into a query.",
    active: ["web"],
    path: ["web", "api"],
    code: "GET /api/sites?era=1100-1300\n    &lat=15.33&lng=76.46&radius_km=20",
  },
  {
    title: "Validate",
    detail: "FastAPI parses the request into a typed schema — malformed eras or coordinates are rejected at the edge.",
    active: ["api"],
    path: ["api", "db"],
    code: "class SiteQuery(BaseModel):\n    era_start: int\n    era_end: int\n    lat: float\n    lng: float\n    radius_km: float = 20",
  },
  {
    title: "Query",
    detail: "Distance and era filters run inside PostGIS, next to the data, using spatial indexes.",
    active: ["db"],
    path: ["db", "api"],
    code: "SELECT id, name, era\nFROM sites\nWHERE ST_DWithin(geom::geography,\n  ST_MakePoint(:lng, :lat)::geography,\n  :radius_m)\n  AND era && int4range(:start, :end);",
  },
  {
    title: "Process",
    detail: "New archive material is handed to the worker, so heavy processing never blocks a user request.",
    active: ["api", "worker"],
    path: ["api", "worker"],
    code: "job = enqueue(\"process_archive\", item_id)\n# worker: process → write results\n# API keeps serving meanwhile",
  },
  {
    title: "Compose",
    detail: "Docker Compose starts all four services with one command — the same way on every machine.",
    active: ["web", "api", "db", "worker"],
    path: null,
    code: "services:\n  web:    { build: ./web }\n  api:    { build: ./api, depends_on: [db] }\n  db:     { image: postgis/postgis }\n  worker: { build: ./worker }",
  },
];

const EDGES: [NodeId, NodeId][] = [
  ["web", "api"],
  ["api", "db"],
  ["api", "worker"],
  ["worker", "db"],
];

export default function ChronoJourney() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, "0px");
  const advance = useCallback(() => setStep((s) => (s + 1) % STEPS.length), []);
  useInterval(advance, 4200, visible && playing);

  const s = STEPS[step];
  const from = s.path ? NODES[s.path[0]] : null;
  const to = s.path ? NODES[s.path[1]] : null;

  return (
    <div ref={ref}>
      <SimFrame
        title="ChronoHeritage · request journey"
        status={`step ${step + 1}/${STEPS.length}`}
        controls={
          <>
            {STEPS.map((st, i) => (
              <SimButton
                key={st.title}
                onClick={() => {
                  setStep(i);
                  setPlaying(false);
                }}
                pressed={i === step}
              >
                {i + 1}. {st.title}
              </SimButton>
            ))}
            <span className="ml-auto">
              <SimButton onClick={() => setPlaying((p) => !p)}>{playing ? "Pause" : "Play"}</SimButton>
            </span>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_300px]">
          <svg viewBox="0 0 520 280" role="img" aria-label={`Architecture: ${s.title} — ${s.detail}`} className="w-full">
            <rect x={20} y={40} width={480} height={225} fill="none" stroke="rgba(124,214,255,0.25)" strokeDasharray="5 5" />
            <text x={30} y={56} fontSize={9} fill="#7cd6ff" fontFamily="var(--font-mono)">
              docker compose · network: heritage
            </text>
            {/* era strip */}
            <g transform="translate(20 12)">
              {Array.from({ length: 13 }, (_, i) => (
                <g key={i} transform={`translate(${i * 40} 0)`}>
                  <line y1={0} y2={6} stroke="rgba(214,224,236,0.3)" />
                  <text y={16} fontSize={7} fill="#8f949c" fontFamily="var(--font-mono)">
                    {800 + i * 100}
                  </text>
                </g>
              ))}
              <rect x={120} y={-2} width={80} height={10} fill="rgba(216,166,87,0.25)" stroke="#d8a657" opacity={step <= 2 ? 1 : 0.3} className="transition-opacity" />
            </g>
            {EDGES.map(([a, b]) => {
              const A = NODES[a];
              const B = NODES[b];
              const on = s.path && ((s.path[0] === a && s.path[1] === b) || (s.path[0] === b && s.path[1] === a));
              return (
                <line
                  key={`${a}-${b}`}
                  x1={A.x}
                  y1={A.y}
                  x2={B.x}
                  y2={B.y}
                  stroke={on ? "#7cd6ff" : "rgba(214,224,236,0.18)"}
                  strokeWidth={on ? 1.6 : 1}
                  strokeDasharray="4 6"
                  className={on ? "animate-dash" : ""}
                />
              );
            })}
            {from && to ? (
              <circle key={step} r={5} fill="#ece6d8">
                <animate attributeName="cx" values={`${from.x};${to.x}`} dur="1.4s" repeatCount="indefinite" />
                <animate attributeName="cy" values={`${from.y};${to.y}`} dur="1.4s" repeatCount="indefinite" />
              </circle>
            ) : null}
            {(Object.keys(NODES) as NodeId[]).map((id) => {
              const n = NODES[id];
              const on = s.active.includes(id);
              return (
                <g key={id} transform={`translate(${n.x} ${n.y})`} className="transition-opacity duration-500" opacity={on ? 1 : 0.4}>
                  <rect x={-58} y={-26} width={116} height={52} fill="#12151a" stroke={on ? n.color : "rgba(214,224,236,0.2)"} strokeWidth={on ? 1.5 : 1} />
                  <text textAnchor="middle" y={-3} fontSize={12} fill="#ece6d8" fontFamily="var(--font-mono)">
                    {n.label}
                  </text>
                  <text textAnchor="middle" y={13} fontSize={8.5} fill="#8f949c" fontFamily="var(--font-mono)">
                    {n.sub}
                  </text>
                  {on && step === STEPS.length - 1 ? (
                    <circle cx={50} cy={-18} r={3} fill="#7fdcb4" className="animate-pulse-soft" />
                  ) : null}
                </g>
              );
            })}
          </svg>
          <div className="flex flex-col border-t border-line p-4 md:border-l md:border-t-0">
            <p className="label text-[10px] text-ice">
              {step + 1} · {s.title}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ivory-dim">{s.detail}</p>
            <pre className={cn("mt-4 flex-1 overflow-x-auto whitespace-pre border border-line bg-bg-deep p-3 font-mono text-[10.5px] leading-relaxed text-ivory-dim scrollbar-thin")}>
              {s.code}
            </pre>
            <p className="mt-2 font-mono text-[10px] text-muted">Illustrative pattern — not production source.</p>
          </div>
        </div>
      </SimFrame>
    </div>
  );
}
