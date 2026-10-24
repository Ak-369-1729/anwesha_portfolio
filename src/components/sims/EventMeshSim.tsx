"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useInView, useInterval } from "@/lib/hooks";
import { SimButton, SimFrame, SimLog, stamp, type LogLine } from "./SimFrame";

type Stage = "producer" | "auth" | "rate" | "idem" | "queue" | "dispatch" | "consumer" | "dlq" | "gone";
type Fate = "ok" | "limited" | "dedup" | "retrying" | "dead";

interface Packet {
  id: number;
  key: string;
  stage: Stage;
  fate: Fate;
  attempts: number;
  wait: number;
  linger: number;
}

const POS: Record<Exclude<Stage, "gone">, [number, number]> = {
  producer: [62, 120],
  auth: [190, 120],
  rate: [290, 120],
  idem: [390, 120],
  queue: [490, 120],
  dispatch: [590, 120],
  consumer: [705, 120],
  dlq: [590, 238],
};

const ORDER: Stage[] = ["producer", "auth", "rate", "idem", "queue", "dispatch"];
const MAX_ATTEMPTS = 3;
const BUCKET = 4;

interface Snapshot {
  packets: Packet[];
  logs: LogLine[];
  consumerUp: boolean;
  tokens: number;
  stats: { published: number; delivered: number; retries: number; limited: number; deduped: number; dlq: number };
}

function createEngine() {
  const start = performance.now();
  let nextId = 1;
  let logId = 1;
  const seen = new Set<string>();
  const s: Snapshot = {
    packets: [],
    logs: [],
    consumerUp: true,
    tokens: BUCKET,
    stats: { published: 0, delivered: 0, retries: 0, limited: 0, deduped: 0, dlq: 0 },
  };
  const log = (text: string, tone?: LogLine["tone"]) => s.logs.push({ id: logId++, t: stamp(start), text, tone });

  return {
    publish(key?: string) {
      const k = key ?? `evt_${String(nextId).padStart(3, "0")}`;
      s.packets.push({ id: nextId++, key: k, stage: "producer", fate: "ok", attempts: 0, wait: 0, linger: 0 });
      s.stats.published++;
      log(`publish ${k}`);
      return k;
    },
    setConsumer(up: boolean) {
      s.consumerUp = up;
      log(up ? "consumer healthy — health check passing" : "consumer DOWN — health check failing", up ? "ok" : "err");
    },
    replay() {
      const dead = s.packets.filter((p) => p.stage === "dlq");
      dead.forEach((p) => Object.assign(p, { stage: "queue", fate: "ok", attempts: 0, wait: 0 }));
      s.stats.dlq -= dead.length;
      if (dead.length) log(`replay ${dead.length} event(s) from DLQ`, "info");
    },
    step() {
      s.tokens = Math.min(BUCKET, s.tokens + 0.5);
      for (const p of s.packets) {
        if (p.linger > 0) {
          p.linger--;
          if (p.linger === 0) p.stage = "gone";
          continue;
        }
        if (p.stage === "dlq" || p.stage === "gone") continue;
        if (p.wait > 0) {
          p.wait--;
          continue;
        }
        if (p.stage === "rate") {
          if (s.tokens < 1) {
            p.fate = "limited";
            p.linger = 2;
            s.stats.limited++;
            log(`429 rate limited ${p.key}`, "warn");
            continue;
          }
          s.tokens -= 1;
        }
        if (p.stage === "idem") {
          if (seen.has(p.key) && p.attempts === 0 && p.fate === "ok") {
            p.fate = "dedup";
            p.linger = 2;
            s.stats.deduped++;
            log(`duplicate ${p.key} acknowledged, not re-delivered`, "info");
            continue;
          }
          seen.add(p.key);
        }
        if (p.stage === "dispatch") {
          if (s.consumerUp) {
            p.stage = "consumer";
            p.fate = "ok";
            p.linger = 2;
            s.stats.delivered++;
            log(`200 delivered ${p.key}${p.attempts ? ` after ${p.attempts} retr${p.attempts > 1 ? "ies" : "y"}` : ""}`, "ok");
          } else {
            p.attempts++;
            if (p.attempts >= MAX_ATTEMPTS) {
              p.stage = "dlq";
              p.fate = "dead";
              s.stats.dlq++;
              log(`${p.key} exhausted ${MAX_ATTEMPTS} attempts → dead-letter queue`, "err");
            } else {
              p.fate = "retrying";
              p.wait = 2 ** p.attempts;
              s.stats.retries++;
              log(`503 from consumer — retry ${p.attempts}/${MAX_ATTEMPTS - 1} in ${p.wait * 0.6}s (backoff)`, "warn");
            }
          }
          continue;
        }
        const i = ORDER.indexOf(p.stage);
        if (i >= 0 && i < ORDER.length - 1) p.stage = ORDER[i + 1];
      }
      s.packets = s.packets.filter((p) => p.stage !== "gone");
      if (s.logs.length > 40) s.logs.splice(0, s.logs.length - 40);
    },
    snapshot(): Snapshot {
      return {
        packets: s.packets.map((p) => ({ ...p })),
        logs: [...s.logs],
        consumerUp: s.consumerUp,
        tokens: s.tokens,
        stats: { ...s.stats },
      };
    },
  };
}

const COLORS: Record<Fate, string> = {
  ok: "#7cd6ff",
  limited: "#ef7a6b",
  dedup: "#8f949c",
  retrying: "#d8a657",
  dead: "#ef7a6b",
};

const boxes: { id: keyof typeof POS; label: string; sub: string }[] = [
  { id: "producer", label: "Producer", sub: "POST /events" },
  { id: "auth", label: "Auth", sub: "API key" },
  { id: "rate", label: "Rate limit", sub: "per client" },
  { id: "idem", label: "Idempotency", sub: "Redis" },
  { id: "queue", label: "Queue", sub: "durable" },
  { id: "dispatch", label: "Dispatcher", sub: "retry/backoff" },
  { id: "consumer", label: "Consumer", sub: "webhook" },
];

export default function EventMeshSim() {
  const [engine] = useState(createEngine);
  const [snap, setSnap] = useState(() => engine.snapshot());
  const [auto, setAuto] = useState(true);
  const [lastKey, setLastKey] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, "0px");
  const scenario = useRef<number[]>([]);
  const autoCounter = useRef(0);

  const sync = useCallback(() => setSnap(engine.snapshot()), [engine]);

  useEffect(() => {
    const timers = scenario.current;
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  const tick = useCallback(() => {
    if (auto && ++autoCounter.current % 4 === 0) setLastKey(engine.publish());
    engine.step();
    sync();
  }, [auto, engine, sync]);

  useInterval(tick, 600, visible);

  const act = (fn: (e: ReturnType<typeof createEngine>) => void) => {
    fn(engine);
    sync();
  };

  const runFailure = () => {
    scenario.current.forEach((t) => window.clearTimeout(t));
    scenario.current.length = 0;
    setAuto(false);
    act((e) => e.setConsumer(false));
    const steps: [number, () => void][] = [
      [400, () => act((e) => setLastKey(e.publish()))],
      [1200, () => act((e) => e.publish())],
      [9500, () => act((e) => e.setConsumer(true))],
      [10800, () => act((e) => e.replay())],
    ];
    steps.forEach(([ms, fn]) => scenario.current.push(window.setTimeout(fn, ms)));
  };

  const { stats, consumerUp } = snap;
  const dlqCount = snap.packets.filter((p) => p.stage === "dlq").length;

  return (
    <div ref={ref}>
      <SimFrame
        title="EventMesh · delivery pipeline"
        status={
          <span>
            tokens {snap.tokens.toFixed(1)}/{BUCKET} · consumer{" "}
            <span className={consumerUp ? "text-mint" : "text-danger"}>{consumerUp ? "UP" : "DOWN"}</span>
          </span>
        }
        controls={
          <>
            <SimButton tone="ice" onClick={() => act((e) => setLastKey(e.publish()))}>
              Publish
            </SimButton>
            <SimButton onClick={() => act((e) => Array.from({ length: 7 }, () => e.publish()))}>Burst ×7</SimButton>
            <SimButton onClick={() => lastKey && act((e) => e.publish(lastKey))} disabled={!lastKey}>
              Resend duplicate
            </SimButton>
            <SimButton tone={consumerUp ? "danger" : "ice"} onClick={() => act((e) => e.setConsumer(!consumerUp))}>
              {consumerUp ? "Break consumer" : "Recover consumer"}
            </SimButton>
            <SimButton onClick={() => act((e) => e.replay())} disabled={!dlqCount}>
              Replay DLQ ({dlqCount})
            </SimButton>
            <SimButton tone="danger" onClick={runFailure}>
              ▶ Failure scenario
            </SimButton>
            <SimButton onClick={() => setAuto((a) => !a)} pressed={auto}>
              Auto traffic
            </SimButton>
          </>
        }
        footer={
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto]">
            <SimLog lines={snap.logs} />
            <dl className="grid grid-cols-3 gap-x-5 gap-y-2 border-t border-line px-4 py-3 font-mono text-[11px] md:border-l md:border-t-0">
              {(
                [
                  ["published", stats.published, "text-ivory"],
                  ["delivered", stats.delivered, "text-mint"],
                  ["retries", stats.retries, "text-amber"],
                  ["429", stats.limited, "text-danger"],
                  ["deduped", stats.deduped, "text-ivory-dim"],
                  ["in DLQ", dlqCount, "text-danger"],
                ] as const
              ).map(([k, v, c]) => (
                <div key={k}>
                  <dt className="text-[10px] text-muted">{k}</dt>
                  <dd className={c}>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        }
      >
        <div className="overflow-x-auto scrollbar-thin">
          <svg viewBox="0 0 760 290" className="min-w-[620px]" role="img" aria-label="Event pipeline: producer, auth, rate limit, idempotency, queue, dispatcher, consumer and dead-letter queue">
            <defs>
              <pattern id="em-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M20 0H0V20" fill="none" stroke="rgba(214,224,236,0.05)" />
              </pattern>
            </defs>
            <rect width="760" height="290" fill="url(#em-grid)" />
            {/* main rail */}
            <line x1={62} y1={120} x2={705} y2={120} stroke="rgba(214,224,236,0.18)" strokeDasharray="3 5" className="animate-dash" />
            {/* redis tap */}
            <line x1={390} y1={120} x2={390} y2={226} stroke="rgba(216,166,87,0.35)" strokeDasharray="2 4" />
            <line x1={290} y1={120} x2={370} y2={226} stroke="rgba(216,166,87,0.2)" strokeDasharray="2 4" />
            <g transform="translate(390 238)">
              <rect x={-44} y={-14} width={88} height={30} fill="#12151a" stroke="rgba(216,166,87,0.5)" />
              <text textAnchor="middle" y={-1} fill="#d8a657" fontSize={10} fontFamily="var(--font-mono)">REDIS</text>
              <text textAnchor="middle" y={11} fill="#8f949c" fontSize={8} fontFamily="var(--font-mono)">keys · limits</text>
            </g>
            {/* DLQ */}
            <path d="M590 120 V 220" stroke={dlqCount ? "rgba(239,122,107,0.6)" : "rgba(239,122,107,0.25)"} strokeDasharray="3 4" />
            <g transform="translate(590 250)">
              <rect x={-60} y={-24} width={120} height={46} fill="#12151a" stroke="rgba(239,122,107,0.55)" />
              <text textAnchor="middle" y={-9} fill="#ef7a6b" fontSize={10} fontFamily="var(--font-mono)">DEAD-LETTER QUEUE</text>
            </g>
            {/* consumer health ring */}
            <circle cx={705} cy={120} r={34} fill="none" stroke={consumerUp ? "rgba(127,220,180,0.45)" : "rgba(239,122,107,0.7)"} strokeDasharray={consumerUp ? "0" : "4 3"} />
            {boxes.map((b) => {
              const [x, y] = POS[b.id];
              return (
                <g key={b.id} transform={`translate(${x} ${y})`}>
                  <rect x={-40} y={-22} width={80} height={44} fill="#12151a" stroke="rgba(214,224,236,0.22)" />
                  <text textAnchor="middle" y={-3} fill="#ece6d8" fontSize={10.5} fontFamily="var(--font-mono)">
                    {b.label}
                  </text>
                  <text textAnchor="middle" y={11} fill="#8f949c" fontSize={8} fontFamily="var(--font-mono)">
                    {b.sub}
                  </text>
                </g>
              );
            })}
            {snap.packets.map((p) => {
              const base = POS[p.stage as keyof typeof POS] ?? POS.producer;
              const dlqIndex = p.stage === "dlq" ? snap.packets.filter((q) => q.stage === "dlq").indexOf(p) : 0;
              const x = p.stage === "dlq" ? base[0] - 45 + (dlqIndex % 8) * 13 : base[0];
              const y =
                p.stage === "dlq"
                  ? base[1] + 6 + Math.floor(dlqIndex / 8) * 10
                  : base[1] - 34 - (p.id % 3) * 8 + (p.fate === "limited" || p.fate === "dedup" ? -16 : 0);
              return (
                <g
                  key={p.id}
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                    transition: "transform 520ms cubic-bezier(.3,.7,.2,1), opacity 400ms",
                    opacity: p.linger ? 0.55 : 1,
                  }}
                >
                  <circle r={5} fill={COLORS[p.fate]} />
                  {p.fate === "retrying" ? (
                    <text x={8} y={3} fontSize={8} fill="#d8a657" fontFamily="var(--font-mono)">
                      r{p.attempts}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </svg>
        </div>
      </SimFrame>
    </div>
  );
}
