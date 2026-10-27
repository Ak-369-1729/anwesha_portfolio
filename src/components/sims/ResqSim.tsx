"use client";

import { useCallback, useRef, useState } from "react";
import { useInView, useInterval } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { SimButton, SimFrame } from "./SimFrame";

type Priority = "sos" | "injured" | "needs" | "safe";

const PRI: Record<Priority, { label: string; color: string; share: number }> = {
  sos: { label: "SOS / critical", color: "#d33547", share: 0.1 },
  injured: { label: "Injured / urgent", color: "#a35f00", share: 0.16 },
  needs: { label: "Needs / status", color: "#3451f2", share: 0.34 },
  safe: { label: "Safe check-in", color: "#666989", share: 0.4 },
};
const ORDER: Priority[] = ["sos", "injured", "needs", "safe"];
const SECTORS = ["A", "B", "C", "D"];

interface Cell {
  priority: Priority;
  /** 1 for an individual report, >1 for a merged summary. */
  count: number;
  sector?: string;
}

interface Frame {
  id: number;
  cap: number;
  demand: number;
  cells: Cell[];
  sos: number;
  fifoSos: number;
}

function generate(n: number) {
  const reports: { priority: Priority; sector: string }[] = [];
  for (let i = 0; i < n; i++) {
    const r = Math.random();
    let acc = 0;
    let priority: Priority = "safe";
    for (const p of ORDER) {
      acc += PRI[p].share;
      if (r < acc) {
        priority = p;
        break;
      }
    }
    reports.push({ priority, sector: SECTORS[Math.floor(Math.random() * SECTORS.length)] });
  }
  return reports;
}

/** Information-pressure policy: critical stays intact, the rest degrades into bounded summaries. */
function shape(reports: { priority: Priority; sector: string }[], cap: number): Cell[] {
  const cells: Cell[] = [];
  const of = (p: Priority) => reports.filter((r) => r.priority === p);
  const sos = of("sos");
  sos.forEach((r) => cells.push({ priority: "sos", count: 1, sector: r.sector }));
  let room = Math.max(0, cap - cells.length);

  for (const p of ["injured", "needs", "safe"] as Priority[]) {
    const list = of(p);
    if (!list.length) continue;
    const laterDemand = ORDER.slice(ORDER.indexOf(p) + 1).reduce((s, q) => s + Math.min(1, of(q).length), 0);
    if (list.length <= room - laterDemand) {
      list.forEach((r) => cells.push({ priority: p, count: 1, sector: r.sector }));
      room -= list.length;
      continue;
    }
    // merge by sector, then across sectors if still too large
    const bySector = SECTORS.map((s) => ({ s, n: list.filter((r) => r.sector === s).length })).filter((x) => x.n);
    if (bySector.length <= Math.max(1, room - laterDemand)) {
      bySector.forEach(({ s, n }) => cells.push({ priority: p, count: n, sector: s }));
      room -= bySector.length;
    } else {
      cells.push({ priority: p, count: list.length });
      room -= 1;
    }
  }
  return cells;
}

function fifoSos(reports: { priority: Priority }[], cap: number) {
  return reports.slice(0, cap).filter((r) => r.priority === "sos").length;
}

export default function ResqSim() {
  const [disaster, setDisaster] = useState(false);
  const [cap, setCap] = useState(22);
  const [frames, setFrames] = useState<Frame[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, "0px");
  const nextId = useRef(1);

  const step = useCallback(() => {
    const demand = disaster ? 26 + Math.floor(Math.random() * 10) : 8 + Math.floor(Math.random() * 6);
    const reports = generate(demand);
    const cells = shape(reports, cap);
    const frame: Frame = {
      id: nextId.current++,
      cap,
      demand,
      cells,
      sos: reports.filter((r) => r.priority === "sos").length,
      fifoSos: fifoSos(reports, cap),
    };
    setFrames((f) => [...f.slice(-8), frame]);
  }, [disaster, cap]);

  useInterval(step, 1100, visible);

  const setMode = (d: boolean) => {
    setDisaster(d);
    setCap(d ? 7 : 22);
  };

  const latest = frames[frames.length - 1];
  const pressure = latest ? latest.demand / latest.cap : 0;
  const merged = latest ? latest.cells.filter((c) => c.count > 1) : [];
  const represented = latest ? latest.cells.reduce((s, c) => s + c.count, 0) : 0;

  const W = 560;
  const H = 210;
  const colW = 50;
  const gap = 10;

  return (
    <div ref={ref}>
      <SimFrame
        title="RESQMesh · information pressure"
        status={
          <span className={disaster ? "text-red" : "text-green"}>{disaster ? "Disaster mode" : "Normal network"}</span>
        }
        controls={
          <>
            <SimButton onClick={() => setMode(false)} pressed={!disaster}>
              Normal network
            </SimButton>
            <SimButton tone="danger" onClick={() => setMode(true)} pressed={disaster}>
              Disaster mode
            </SimButton>
            <label className="ml-auto flex items-center gap-2 font-cond text-[13px] text-muted">
              capacity
              <input
                type="range"
                min={4}
                max={24}
                value={cap}
                onChange={(e) => setCap(Number(e.target.value))}
                className="w-28 accent-[#3451f2]"
                aria-label="Channel capacity in slots per frame"
              />
              <span className="w-6 text-ink">{cap}</span>
            </label>
          </>
        }
        footer={
          <div className="flex flex-wrap gap-x-5 gap-y-2 px-4 py-3 font-cond text-[13px]">
            {ORDER.map((p) => (
              <span key={p} className="flex items-center gap-1.5 text-muted">
                <span className="size-2" style={{ background: PRI[p].color }} aria-hidden="true" /> {PRI[p].label}
              </span>
            ))}
            <span className="flex items-center gap-1.5 text-muted">
              <span className="hatch size-2 border border-amber/50" aria-hidden="true" /> merged summary (×n)
            </span>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_220px]">
          <div className="overflow-x-auto scrollbar-thin p-3">
            <svg viewBox={`0 0 ${W} ${H + 30}`} className="min-w-[480px]" role="img" aria-label="Channel frames over time; each column is one transmission window">
              <defs>
                <pattern id="rq-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <rect width="5" height="5" fill="rgba(21,22,58,0)" />
                  <line x1="0" y1="0" x2="0" y2="5" stroke="rgba(255,255,255,0.55)" strokeWidth="2" />
                </pattern>
              </defs>
              {frames.map((f, i) => {
                const x = W - (frames.length - i) * (colW + gap);
                const slot = H / Math.max(f.cap, f.cells.length);
                return (
                  <g key={f.id} style={{ transform: `translateX(${x}px)`, transition: "transform 900ms ease" }}>
                    <rect x={0} y={0} width={colW} height={H} fill="rgba(21,22,58,0.03)" stroke="rgba(21,22,58,0.08)" />
                    {f.cells.map((c, k) => {
                      const y = H - (k + 1) * slot;
                      return (
                        <g key={k}>
                          <rect x={2} y={y + 1} width={colW - 4} height={Math.max(1, slot - 2)} fill={PRI[c.priority].color} opacity={c.priority === "safe" ? 0.55 : 0.9} />
                          {c.count > 1 ? (
                            <>
                              <rect x={2} y={y + 1} width={colW - 4} height={Math.max(1, slot - 2)} fill="url(#rq-hatch)" />
                              {slot >= 11 ? (
                                <text x={colW / 2} y={y + slot / 2 + 3} textAnchor="middle" fontSize={Math.min(9, slot - 3)} fill="#eef0fb" fontFamily="var(--font-bricolage)" fontWeight={700}>
                                  ×{c.count}
                                  {c.sector ? ` ${c.sector}` : ""}
                                </text>
                              ) : null}
                            </>
                          ) : null}
                        </g>
                      );
                    })}
                    <text x={colW / 2} y={H + 14} textAnchor="middle" fontSize={8} fill="#666989" fontFamily="var(--font-bricolage)">
                      ρ {(f.demand / f.cap).toFixed(1)}
                    </text>
                  </g>
                );
              })}
              <text x={4} y={H + 26} fontSize={8} fill="#666989" fontFamily="var(--font-bricolage)">
                ← older frames
              </text>
            </svg>
          </div>
          <dl className="grid content-start gap-3 border-t border-line p-4 font-cond text-[13px] md:border-l md:border-t-0">
            <div>
              <dt className="text-[12.5px] text-muted">information pressure ρ</dt>
              <dd className={cn("text-2xl", pressure > 1.5 ? "text-red" : pressure > 1 ? "text-amber" : "text-green")}>
                {pressure.toFixed(2)}
              </dd>
              <div className="mt-1 h-1 bg-line">
                <div className="h-full bg-gradient-to-r from-green via-amber to-red transition-[width] duration-500" style={{ width: `${Math.min(100, (pressure / 5) * 100)}%` }} />
              </div>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">demand / capacity</dt>
              <dd className="text-ink">
                {latest?.demand ?? 0} / {latest?.cap ?? cap}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">SOS delivered intact</dt>
              <dd className="text-green">
                {latest?.sos ?? 0}/{latest?.sos ?? 0}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">naive FIFO would deliver</dt>
              <dd className={latest && latest.fifoSos < latest.sos ? "text-red" : "text-dim"}>
                {latest?.fifoSos ?? 0}/{latest?.sos ?? 0}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">reports represented</dt>
              <dd className="text-ink">
                {represented}/{latest?.demand ?? 0}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">summaries merged</dt>
              <dd className="text-amber">{merged.length}</dd>
            </div>
          </dl>
        </div>
      </SimFrame>
    </div>
  );
}
