"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { SimButton, SimFrame } from "./SimFrame";

const SKILLS = ["Python", "SQL", "React", "FastAPI", "Docker", "ML", "Security", "Cloud", "DSA", "Communication"] as const;
type Skill = (typeof SKILLS)[number];

const ROLES: { title: string; needs: Skill[] }[] = [
  { title: "Backend intern", needs: ["Python", "FastAPI", "SQL", "Docker"] },
  { title: "ML intern", needs: ["Python", "ML", "SQL"] },
  { title: "Full-stack intern", needs: ["React", "FastAPI", "SQL"] },
  { title: "DevOps intern", needs: ["Docker", "Cloud", "Python"] },
  { title: "Security analyst", needs: ["Security", "Python", "Cloud"] },
  { title: "SWE intern", needs: ["DSA", "Python", "Communication"] },
  { title: "Data analyst", needs: ["SQL", "Python", "Communication"] },
  { title: "Cloud engineer", needs: ["Cloud", "Docker", "Security"] },
];

const CX = 270;
const CY = 165;

const skillPos = SKILLS.map((_, i) => {
  const a = (i / SKILLS.length) * Math.PI * 2 - Math.PI / 2;
  return [CX + Math.cos(a) * 82, CY + Math.sin(a) * 70] as const;
});
const rolePos = ROLES.map((_, i) => {
  const a = (i / ROLES.length) * Math.PI * 2 - Math.PI / 2 + 0.3;
  return [CX + Math.cos(a) * 225, CY + Math.sin(a) * 138] as const;
});

function star(x: number, y: number, r: number) {
  const pts: string[] = [];
  for (let i = 0; i < 8; i++) {
    const rr = i % 2 === 0 ? r : r * 0.32;
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    pts.push(`${x + Math.cos(a) * rr},${y + Math.sin(a) * rr}`);
  }
  return pts.join(" ");
}

export default function CareerConstellation() {
  const [have, setHave] = useState<Set<Skill>>(() => new Set<Skill>(["Python", "SQL"]));
  const [hoverRole, setHoverRole] = useState<number | null>(null);

  const match = (needs: Skill[], set: Set<Skill>) => needs.filter((n) => set.has(n)).length / needs.length;

  const nextBest = useMemo(() => {
    let best: { skill: Skill; gain: number } | null = null;
    for (const s of SKILLS) {
      if (have.has(s)) continue;
      const with_ = new Set(have).add(s);
      const gain = ROLES.reduce((sum, r) => sum + match(r.needs, with_) - match(r.needs, have), 0);
      if (!best || gain > best.gain) best = { skill: s, gain };
    }
    return best;
  }, [have]);

  const toggle = (s: Skill) =>
    setHave((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });

  const ranked = ROLES.map((r, i) => ({ ...r, i, m: match(r.needs, have) })).sort((a, b) => b.m - a.m);

  return (
    <SimFrame
      title="CareerOS · career constellation"
      status="demo data"
      controls={
        <>
          {SKILLS.map((s) => (
            <SimButton key={s} onClick={() => toggle(s)} pressed={have.has(s)}>
              {s}
            </SimButton>
          ))}
        </>
      }
      footer={
        <p className="px-4 py-3 font-mono text-[11px] text-ivory-dim">
          {nextBest ? (
            <>
              Next best skill: <span className="text-amber">{nextBest.skill}</span> — adds{" "}
              {Math.round(nextBest.gain * 100)} match points across {ROLES.length} roles.
            </>
          ) : (
            "Every skill in the demo set selected."
          )}
        </p>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_220px]">
        <svg viewBox="0 0 540 330" role="img" aria-label="Skills connect to roles; brighter stars are closer matches" className="w-full">
          {ROLES.map((r, ri) =>
            r.needs.map((n) => {
              const si = SKILLS.indexOf(n);
              const on = have.has(n);
              const focus = hoverRole === ri;
              return (
                <line
                  key={`${ri}-${n}`}
                  x1={skillPos[si][0]}
                  y1={skillPos[si][1]}
                  x2={rolePos[ri][0]}
                  y2={rolePos[ri][1]}
                  stroke={on ? "#7cd6ff" : "rgba(214,224,236,0.25)"}
                  strokeOpacity={focus ? 0.9 : on ? 0.45 : 0.12}
                  strokeDasharray={on ? "0" : "2 4"}
                  className="transition-all duration-300"
                />
              );
            }),
          )}
          <circle cx={CX} cy={CY} r={18} fill="#12151a" stroke="rgba(236,230,216,0.5)" />
          <text x={CX} y={CY + 3} textAnchor="middle" fontSize={8} fill="#ece6d8" fontFamily="var(--font-mono)">
            YOU
          </text>
          {SKILLS.map((s, i) => {
            const on = have.has(s);
            return (
              <g key={s} transform={`translate(${skillPos[i][0]} ${skillPos[i][1]})`}>
                <circle r={on ? 6 : 4} fill={on ? "#7cd6ff" : "#12151a"} stroke="#7cd6ff" strokeOpacity={on ? 1 : 0.4} className="transition-all" />
                <text y={-10} textAnchor="middle" fontSize={8} fill={on ? "#ece6d8" : "#8f949c"} fontFamily="var(--font-mono)">
                  {s}
                </text>
              </g>
            );
          })}
          {ROLES.map((r, i) => {
            const m = match(r.needs, have);
            const [x, y] = rolePos[i];
            return (
              <g key={r.title} onMouseEnter={() => setHoverRole(i)} onMouseLeave={() => setHoverRole(null)} className="cursor-default">
                <circle cx={x} cy={y} r={22} fill="#d8a657" opacity={m * 0.18} />
                <polygon points={star(x, y, 7 + m * 7)} fill={m === 1 ? "#ece6d8" : "#d8a657"} opacity={0.35 + m * 0.65} className="transition-all duration-300" />
                <text x={x} y={y + 24} textAnchor="middle" fontSize={8.5} fill={m >= 0.66 ? "#ece6d8" : "#8f949c"} fontFamily="var(--font-mono)">
                  {r.title}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="border-t border-line p-4 md:border-l md:border-t-0">
          <p className="label mb-3 text-[10px]">Reachable roles</p>
          <ul className="grid gap-2">
            {ranked.map((r) => (
              <li
                key={r.title}
                onMouseEnter={() => setHoverRole(r.i)}
                onMouseLeave={() => setHoverRole(null)}
                className="font-mono text-[10.5px]"
              >
                <div className="flex justify-between">
                  <span className={r.m >= 0.66 ? "text-ivory" : "text-muted"}>{r.title}</span>
                  <span className={cn(r.m === 1 ? "text-mint" : r.m >= 0.66 ? "text-amber" : "text-muted")}>{Math.round(r.m * 100)}%</span>
                </div>
                <div className="mt-1 h-0.5 bg-line">
                  <div className="h-full bg-amber transition-[width] duration-300" style={{ width: `${r.m * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SimFrame>
  );
}
