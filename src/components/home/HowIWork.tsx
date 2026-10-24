"use client";

import { useCallback, useRef, useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { processSteps, workingPrinciples } from "@/data/process";
import { useInView, useInterval } from "@/lib/hooks";
import { cn, pad } from "@/lib/utils";

export function HowIWork() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, "0px");
  const advance = useCallback(() => setActive((a) => (a + 1) % processSteps.length), []);
  useInterval(advance, 2600, visible && !paused);
  const step = processSteps[active];

  return (
    <section id="process" aria-labelledby="process-title" className="relative bg-bg-deep py-14 sm:py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <SectionHeader
          code="06"
          kicker="How I work"
          id="process-title"
          title={
            <>
              A process you can see, <span className="italic text-ivory-dim">not just trust.</span>
            </>
          }
          lede="Every engagement moves through the same seven stages. Each one leaves an artifact behind, so you always know where the work is and what you will be handed at the end."
          aside={
            <>
              <span className="block text-ivory">Fig. 06 — Delivery pipeline</span>
              hover a stage to hold the signal
            </>
          }
        />

        <div ref={ref} className="mt-10" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <ol className="relative grid gap-px border border-line bg-line md:grid-cols-7">
            {processSteps.map((s, i) => {
              const on = i === active;
              const done = i < active;
              return (
                <li key={s.id} className="bg-bg-deep">
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    onFocus={() => {
                      setActive(i);
                      setPaused(true);
                    }}
                    onBlur={() => setPaused(false)}
                    aria-current={on ? "step" : undefined}
                    className={cn("relative h-full w-full p-4 text-left transition-colors", on ? "bg-surface-2" : "hover:bg-surface")}
                  >
                    <span
                      className={cn("absolute inset-x-0 top-0 h-px origin-left transition-transform duration-500", on || done ? "scale-x-100" : "scale-x-0")}
                      style={{ background: on ? "#7cd6ff" : "rgba(124,214,255,0.4)" }}
                      aria-hidden="true"
                    />
                    <span className="flex items-center gap-2 font-mono text-[10px] text-muted">
                      <span className={cn("size-1.5 rounded-full transition-colors", on ? "bg-ice" : done ? "bg-ice/40" : "bg-line-strong")} aria-hidden="true" />
                      {pad(i + 1)}
                    </span>
                    <span className={cn("mt-2 block font-mono text-[12px] uppercase tracking-[0.16em]", on ? "text-ivory" : "text-ivory-dim")}>{s.title}</span>
                    <span className="mt-2 block text-[12px] leading-snug text-muted md:hidden">{s.detail}</span>
                  </button>
                </li>
              );
            })}
          </ol>
          <div className="frame mt-4 hidden gap-6 p-6 md:grid md:grid-cols-12" aria-live="polite">
            <p className="font-display text-4xl text-ivory md:col-span-3">{step.title}</p>
            <p className="text-[15px] leading-relaxed text-ivory-dim md:col-span-6">{step.detail}</p>
            <div className="md:col-span-3">
              <p className="label text-[10px]">You receive</p>
              <p className="mt-1 font-mono text-[12px] text-mint">{step.artifact}</p>
            </div>
          </div>
        </div>

        <ul className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {workingPrinciples.map((w, i) => (
            <li key={w.title} className="bg-bg-deep p-5">
              <span className="font-mono text-[10px] text-amber">P.{pad(i + 1)}</span>
              <h3 className="mt-2 text-[15px] font-medium text-ivory">{w.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{w.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
