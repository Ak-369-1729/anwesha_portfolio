"use client";

import { useCallback, useRef, useState } from "react";
import { useInView, useInterval } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { SimButton, SimFrame } from "./SimFrame";

type Speaker = "Leader" | "Logical" | "Quiet" | "Aggressive" | "Questioning" | "You";
type Round = "gd" | "technical" | "hr";

const PERSONAS: { id: Exclude<Speaker, "You">; color: string; trait: string }[] = [
  { id: "Leader", color: "#87570c", trait: "frames & steers" },
  { id: "Logical", color: "#2d5be3", trait: "reasons in steps" },
  { id: "Quiet", color: "#4a5fa0", trait: "speaks rarely" },
  { id: "Aggressive", color: "#b3301f", trait: "interrupts" },
  { id: "Questioning", color: "#a8456a", trait: "challenges" },
];

const DIMENSIONS = ["Communication", "Content", "Leadership", "Teamwork", "Creativity", "Confidence"] as const;

interface Line {
  who: Speaker;
  text: string;
  /** Score deltas applied after the candidate speaks. */
  delta?: Partial<Record<(typeof DIMENSIONS)[number], number>>;
}

const SCRIPTS: Record<Round, { topic: string; lines: Line[] }> = {
  gd: {
    topic: "Remote work: productivity boost or collaboration cost?",
    lines: [
      { who: "Leader", text: "Let’s frame it: productivity, collaboration, wellbeing — then a recommendation." },
      { who: "Aggressive", text: "Remote is obviously better. Commutes are wasted hours, end of story." },
      { who: "You", text: "Focus-time gains are real — but onboarding new people remotely is harder.", delta: { Content: 2, Communication: 1, Confidence: 1 } },
      { who: "Questioning", text: "Harder how? Is that a tooling problem or a culture problem?" },
      { who: "Logical", text: "If coordination cost grows with team size, hybrid minimises total cost." },
      { who: "Quiet", text: "Maybe it depends on what kind of work each team does." },
      { who: "You", text: "Building on that — deep-work teams lean remote, high-coordination teams hybrid.", delta: { Teamwork: 2, Creativity: 2, Leadership: 1 } },
      { who: "Aggressive", text: "That’s just fence-sitting." },
      { who: "You", text: "It’s a decision rule we can test: measure handoffs per week per team.", delta: { Leadership: 2, Confidence: 2, Content: 1 } },
      { who: "Leader", text: "Good synthesis. Let’s close on that recommendation." },
    ],
  },
  technical: {
    topic: "System design: rate limiting a public API",
    lines: [
      { who: "Questioning", text: "Design a rate limiter for a public API. Where does it live?" },
      { who: "You", text: "At the gateway, keyed per client, backed by Redis so every instance shares state.", delta: { Content: 2, Communication: 1 } },
      { who: "Questioning", text: "Token bucket or fixed window — and why?" },
      { who: "You", text: "Token bucket: it allows short bursts but bounds the average rate.", delta: { Content: 2, Confidence: 1 } },
      { who: "Logical", text: "What happens when Redis is unavailable?" },
      { who: "You", text: "Fall back to a conservative local limit and alert — degrade, don’t fail.", delta: { Creativity: 2, Content: 1, Confidence: 1 } },
      { who: "Questioning", text: "How would you test it?" },
      { who: "You", text: "Load test bursts per client and assert 429s plus correct Retry-After headers.", delta: { Communication: 1, Content: 1, Leadership: 1 } },
    ],
  },
  hr: {
    topic: "Behavioural: handling failure",
    lines: [
      { who: "Leader", text: "Tell me about a time something you built broke." },
      { who: "You", text: "A release broke a feature. I rolled back first, then reproduced it with a test.", delta: { Communication: 2, Confidence: 1 } },
      { who: "Questioning", text: "Whose fault was it?" },
      { who: "You", text: "The gap was in our process — no smoke test on staging. I added one.", delta: { Teamwork: 2, Leadership: 2 } },
      { who: "Leader", text: "What did the team change afterwards?" },
      { who: "You", text: "We made the check part of every deploy, so it can’t be skipped.", delta: { Leadership: 1, Creativity: 1, Content: 1 } },
    ],
  },
};

const BASE = { Communication: 4, Content: 4, Leadership: 3, Teamwork: 4, Creativity: 3, Confidence: 4 };

function scoreAt(round: Round, upto: number) {
  const s = { ...BASE };
  SCRIPTS[round].lines.slice(0, upto + 1).forEach((l) => {
    if (l.delta) for (const [k, v] of Object.entries(l.delta)) s[k as keyof typeof s] = Math.min(10, s[k as keyof typeof s] + v);
  });
  return s;
}

function Radar({ values }: { values: Record<(typeof DIMENSIONS)[number], number> }) {
  const R = 70;
  const pts = DIMENSIONS.map((d, i) => {
    const a = (i / DIMENSIONS.length) * Math.PI * 2 - Math.PI / 2;
    const r = (values[d] / 10) * R;
    return [Math.cos(a) * r, Math.sin(a) * r];
  });
  return (
    <svg viewBox="-110 -95 220 190" className="w-full max-w-[260px]" role="img" aria-label={DIMENSIONS.map((d) => `${d} ${values[d]} of 10`).join(", ")}>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon
          key={f}
          points={DIMENSIONS.map((_, i) => {
            const a = (i / DIMENSIONS.length) * Math.PI * 2 - Math.PI / 2;
            return `${Math.cos(a) * R * f},${Math.sin(a) * R * f}`;
          }).join(" ")}
          fill="none"
          stroke="rgba(27,47,110,0.1)"
        />
      ))}
      <polygon points={pts.map((p) => p.join(",")).join(" ")} fill="rgba(45,91,227,0.18)" stroke="#2d5be3" className="transition-all duration-500" />
      {DIMENSIONS.map((d, i) => {
        const a = (i / DIMENSIONS.length) * Math.PI * 2 - Math.PI / 2;
        return (
          <text key={d} x={Math.cos(a) * (R + 16)} y={Math.sin(a) * (R + 12) + 3} textAnchor="middle" fontSize={7.5} fill="#5e6977" fontFamily="var(--font-archivo)">
            {d} {values[d]}
          </text>
        );
      })}
    </svg>
  );
}

export default function InterviewSim() {
  const [round, setRound] = useState<Round>("gd");
  const [turn, setTurn] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, "0px");
  const script = SCRIPTS[round];
  const advance = useCallback(() => setTurn((t) => (t + 1) % script.lines.length), [script.lines.length]);
  useInterval(advance, 2700, visible);

  const line = script.lines[turn];
  const seats: Speaker[] = [...PERSONAS.map((p) => p.id), "You"];
  const colorOf = (s: Speaker) => (s === "You" ? "#1b2f6e" : PERSONAS.find((p) => p.id === s)!.color);
  const scores = scoreAt(round, turn);
  const transcript = script.lines.slice(Math.max(0, turn - 3), turn + 1);

  return (
    <div ref={ref}>
      <SimFrame
        title="PrepAI · mock session"
        status={`turn ${turn + 1}/${script.lines.length} · scores simulated`}
        controls={
          <>
            {(
              [
                ["gd", "Group discussion"],
                ["technical", "Technical"],
                ["hr", "HR"],
              ] as const
            ).map(([id, label]) => (
              <SimButton
                key={id}
                pressed={round === id}
                onClick={() => {
                  setRound(id);
                  setTurn(0);
                }}
              >
                {label}
              </SimButton>
            ))}
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_240px]">
          <div className="flex items-center justify-center p-4">
            <svg viewBox="-120 -110 240 220" className="w-full max-w-[280px]" role="img" aria-label={`Table: ${line.who} is speaking`}>
              <circle r={52} fill="#fbfcfd" stroke="rgba(27,47,110,0.12)" />
              <text textAnchor="middle" y={-4} fontSize={7.5} fill="#5e6977" fontFamily="var(--font-archivo)">
                {round === "gd" ? "Group discussion" : round === "technical" ? "Technical round" : "HR round"}
              </text>
              <text textAnchor="middle" y={8} fontSize={7} fill="#5e6977" fontFamily="var(--font-archivo)">
                AI panel of 5
              </text>
              {seats.map((s, i) => {
                const a = (i / seats.length) * Math.PI * 2 - Math.PI / 2;
                const x = Math.cos(a) * 82;
                const y = Math.sin(a) * 78;
                const speaking = line.who === s;
                return (
                  <g key={s} transform={`translate(${x} ${y})`}>
                    {speaking ? <circle r={20} fill="none" stroke={colorOf(s)} className="animate-pulse-soft" /> : null}
                    <circle r={13} fill={speaking ? colorOf(s) : "#fbfcfd"} stroke={colorOf(s)} className="transition-all duration-300" />
                    <text textAnchor="middle" y={3} fontSize={7} fill={speaking ? "#f4f7f8" : colorOf(s)} fontFamily="var(--font-archivo)" fontWeight={600}>
                      {s.slice(0, 3)}
                    </text>
                    <text textAnchor="middle" y={26} fontSize={7} fill="#5e6977" fontFamily="var(--font-archivo)">
                      {s}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="border-t border-line p-4 md:border-l md:border-t-0">
            <p className="label text-[12.5px]">Topic</p>
            <p className="mt-1 text-sm text-ink">{script.topic}</p>
            <ol className="mt-4 grid gap-2.5" aria-live="polite">
              {transcript.map((l, i) => (
                <li key={`${round}-${turn}-${i}`} className={cn("text-[13px] leading-snug", i === transcript.length - 1 ? "text-ink" : "text-pencil")}>
                  <span className="font-cond text-[12.5px]" style={{ color: colorOf(l.who) }}>
                    {l.who}
                  </span>{" "}
                  {l.text}
                </li>
              ))}
            </ol>
          </div>
          <div className="flex flex-col items-center border-t border-line p-4 md:border-l md:border-t-0">
            <p className="label self-start text-[12.5px]">Rubric · candidate</p>
            <Radar values={scores} />
            <ul className="mt-1 grid w-full grid-cols-2 gap-x-3 gap-y-1 font-cond text-[12.5px] text-pencil">
              {PERSONAS.map((p) => (
                <li key={p.id}>
                  <span style={{ color: p.color }}>{p.id}</span> · {p.trait}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SimFrame>
    </div>
  );
}
