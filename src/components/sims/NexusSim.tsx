"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useInView, useInterval } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { SimButton, SimFrame, SimLog, type LogLine } from "./SimFrame";

interface NetNode {
  id: string;
  x: number;
  y: number;
  role: "edge" | "core" | "server" | "host";
}

const NODES: NetNode[] = [
  { id: "INET", x: 34, y: 150, role: "edge" },
  { id: "FW", x: 112, y: 150, role: "edge" },
  { id: "CORE", x: 212, y: 150, role: "core" },
  { id: "WEB", x: 212, y: 46, role: "server" },
  { id: "AUTH", x: 212, y: 256, role: "server" },
  { id: "SW-A", x: 318, y: 92, role: "core" },
  { id: "SW-B", x: 318, y: 210, role: "core" },
  { id: "DB", x: 430, y: 40, role: "server" },
  { id: "WS-01", x: 430, y: 110, role: "host" },
  { id: "WS-02", x: 500, y: 74, role: "host" },
  { id: "WS-03", x: 430, y: 190, role: "host" },
  { id: "WS-04", x: 500, y: 236, role: "host" },
  { id: "IOT-1", x: 420, y: 272, role: "host" },
];

const EDGES: [string, string][] = [
  ["INET", "FW"],
  ["FW", "CORE"],
  ["CORE", "WEB"],
  ["CORE", "AUTH"],
  ["CORE", "SW-A"],
  ["CORE", "SW-B"],
  ["WEB", "DB"],
  ["SW-A", "DB"],
  ["SW-A", "WS-01"],
  ["SW-A", "WS-02"],
  ["SW-B", "WS-03"],
  ["SW-B", "WS-04"],
  ["SW-B", "IOT-1"],
];

const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));
const CANDIDATES = ["WS-01", "WS-02", "WS-03", "WS-04", "IOT-1", "WEB"];
const THRESHOLD = 0.62;

type Phase = "monitoring" | "scoring" | "detected" | "isolated" | "verifying" | "restored";

const PHASE_COPY: Record<Phase, string> = {
  monitoring: "Monitoring flows",
  scoring: "Anomaly score rising",
  detected: "Anomaly detected",
  isolated: "Node isolated in twin",
  verifying: "Verifying & cleaning",
  restored: "Node restored",
};

/** Hosts reachable from CORE when `cut` is removed from the graph. */
function reachable(cut: string | null) {
  const seen = new Set<string>(["CORE"]);
  const stack = ["CORE"];
  while (stack.length) {
    const cur = stack.pop()!;
    for (const [a, b] of EDGES) {
      const next = a === cur ? b : b === cur ? a : null;
      if (next && next !== cut && !seen.has(next)) {
        seen.add(next);
        stack.push(next);
      }
    }
  }
  return seen.size;
}

const baseScores = () => Object.fromEntries(NODES.map((n) => [n.id, 0.28 + Math.random() * 0.14]));

export default function NexusSim() {
  const [phase, setPhase] = useState<Phase>("monitoring");
  const [target, setTarget] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>(() => Object.fromEntries(NODES.map((n) => [n.id, 0.34])));
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [auto, setAuto] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, "0px");
  const timers = useRef<number[]>([]);
  const logId = useRef(1);
  const clock = useRef(0);
  const idle = useRef(0);

  const log = useCallback((text: string, tone?: LogLine["tone"]) => {
    const id = logId.current++;
    const t = `t+${String(clock.current).padStart(4, "0")}`;
    setLogs((l) => [...l.slice(-30), { id, t, text, tone }]);
  }, []);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((t) => window.clearTimeout(t));
  }, []);

  const inject = useCallback(() => {
    if (phase !== "monitoring" && phase !== "restored") return;
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current.length = 0;
    const victim = CANDIDATES[Math.floor(Math.random() * CANDIDATES.length)];
    setTarget(victim);
    setPhase("scoring");
    log(`unusual flow pattern from ${victim} (simulated)`, "info");
    const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
    at(2600, () => {
      setPhase("detected");
      log(`[IF] ${victim} score > τ=${THRESHOLD} — flagged`, "warn");
    });
    at(4000, () => {
      setPhase("isolated");
      const before = reachable(null);
      const after = reachable(victim);
      log(`[TWIN] isolate ${victim}: edges cut, reachable ${before} → ${after} nodes`, "err");
    });
    at(7600, () => {
      setPhase("verifying");
      log(`[TWIN] ${victim} quarantined — verifying`, "info");
    });
    at(9800, () => {
      setPhase("restored");
      log(`[TWIN] ${victim} restored, edges re-attached`, "ok");
    });
    at(12500, () => {
      setPhase("monitoring");
      setTarget(null);
    });
  }, [phase, log]);

  const tick = useCallback(() => {
    clock.current += 4;
    setScores((prev) => {
      const next = baseScores();
      if (target) {
        const t = prev[target] ?? 0.4;
        const goal = phase === "scoring" || phase === "detected" ? 0.86 : phase === "isolated" ? 0.7 : 0.36;
        next[target] = t + (goal - t) * 0.35;
      }
      return next;
    });
    if (auto && (phase === "monitoring" || phase === "restored")) {
      idle.current++;
      if (idle.current > 10) {
        idle.current = 0;
        inject();
      }
    }
  }, [target, phase, auto, inject]);

  useInterval(tick, 400, visible);

  const isolated = target && (phase === "isolated" || phase === "verifying");
  const flagged = target && (phase === "detected" || phase === "isolated" || phase === "verifying");
  const ranked = [...NODES].sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0)).slice(0, 5);
  const reach = reachable(isolated ? target : null);

  return (
    <div ref={ref}>
      <SimFrame
        title="NEXUS · digital twin"
        status={
          <span className={cn(flagged ? "text-amber" : phase === "restored" ? "text-mint" : "text-muted")}>
            {PHASE_COPY[phase]}
            {target ? ` · ${target}` : ""}
          </span>
        }
        controls={
          <>
            <SimButton tone="danger" onClick={inject} disabled={phase !== "monitoring" && phase !== "restored"}>
              Inject anomaly
            </SimButton>
            <SimButton onClick={() => setAuto((a) => !a)} pressed={auto}>
              Auto
            </SimButton>
            <span className="ml-auto self-center font-mono text-[10px] text-muted">
              reachable from core: <span className="text-ivory">{reach}</span>/{NODES.length}
            </span>
          </>
        }
        footer={<SimLog lines={logs} label="detection log" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_210px]">
          <svg viewBox="0 0 540 300" role="img" aria-label="Network topology digital twin" className="w-full">
            {EDGES.map(([a, b]) => {
              const A = byId[a];
              const B = byId[b];
              const cut = isolated && (a === target || b === target);
              const hot = flagged && !isolated && (a === target || b === target);
              return (
                <line
                  key={`${a}-${b}`}
                  x1={A.x}
                  y1={A.y}
                  x2={B.x}
                  y2={B.y}
                  stroke={cut ? "#ef7a6b" : hot ? "#d8a657" : "rgba(124,214,255,0.45)"}
                  strokeOpacity={cut ? 0.35 : 1}
                  strokeWidth={hot ? 1.6 : 1}
                  strokeDasharray={cut ? "2 6" : "4 8"}
                  className={cut ? "" : "animate-dash"}
                  style={{ animationDuration: hot ? "0.5s" : "1.6s" }}
                />
              );
            })}
            {NODES.map((n) => {
              const isTarget = n.id === target;
              const color = isTarget
                ? phase === "restored"
                  ? "#7fdcb4"
                  : flagged
                    ? isolated
                      ? "#ef7a6b"
                      : "#d8a657"
                    : "#d8a657"
                : n.role === "core"
                  ? "#ece6d8"
                  : n.role === "server"
                    ? "#7cd6ff"
                    : "#b9c7ff";
              const size = n.role === "core" ? 9 : n.role === "server" ? 8 : 6;
              return (
                <g key={n.id} transform={`translate(${n.x} ${n.y})`}>
                  {isTarget && phase !== "monitoring" ? (
                    <circle r={size + 10} fill="none" stroke={color} strokeOpacity={0.6} className="animate-pulse-soft" />
                  ) : null}
                  {isolated && isTarget ? (
                    <rect x={-size - 14} y={-size - 14} width={(size + 14) * 2} height={(size + 14) * 2} fill="none" stroke="#ef7a6b" strokeDasharray="3 3" />
                  ) : null}
                  {n.role === "core" ? (
                    <rect x={-size} y={-size} width={size * 2} height={size * 2} fill="#12151a" stroke={color} />
                  ) : (
                    <circle r={size} fill="#12151a" stroke={color} strokeWidth={1.4} />
                  )}
                  <circle r={2} fill={color} />
                  <text y={size + 13} textAnchor="middle" fontSize={8.5} fill="#8f949c" fontFamily="var(--font-mono)">
                    {n.id}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="border-t border-line p-4 md:border-l md:border-t-0">
            <p className="label mb-3 text-[10px]">Isolation Forest · top scores</p>
            <ul className="grid gap-2.5">
              {ranked.map((n) => {
                const s = scores[n.id] ?? 0;
                const over = s > THRESHOLD;
                return (
                  <li key={n.id} className="font-mono text-[10.5px]">
                    <div className="flex justify-between">
                      <span className={over ? "text-amber" : "text-ivory-dim"}>{n.id}</span>
                      <span className={over ? "text-amber" : "text-muted"}>{s.toFixed(2)}</span>
                    </div>
                    <div className="relative mt-1 h-1 bg-line">
                      <div
                        className={cn("h-full transition-[width] duration-300", over ? "bg-amber" : "bg-ice/60")}
                        style={{ width: `${Math.min(100, s * 100)}%` }}
                      />
                      <div className="absolute inset-y-[-3px] w-px bg-danger" style={{ left: `${THRESHOLD * 100}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 font-mono text-[10px] leading-relaxed text-muted">
              Red tick = threshold τ {THRESHOLD}. Scores are simulated for illustration.
            </p>
          </div>
        </div>
      </SimFrame>
    </div>
  );
}
