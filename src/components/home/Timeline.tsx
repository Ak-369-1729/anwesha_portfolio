"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { timeline, type TimelineKind } from "@/data/timeline";
import { useScrollProgress } from "@/lib/scrollProgress";
import { cn } from "@/lib/utils";

const KIND: Record<TimelineKind, { label: string; color: string }> = {
  experience: { label: "Experience", color: "#7fdcb4" },
  leadership: { label: "Leadership", color: "#d8a657" },
  award: { label: "Award", color: "#e6a3b8" },
  research: { label: "Research", color: "#c7a0ff" },
  project: { label: "Systems", color: "#7cd6ff" },
  milestone: { label: "Milestone", color: "#b9c7ff" },
};

export function Timeline() {
  const ref = useRef<HTMLOListElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const signalRef = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(ref, 0.7, 0.55);

  useEffect(
    () =>
      progress.subscribe((p) => {
        if (lineRef.current) lineRef.current.style.transform = `scaleY(${p})`;
        if (signalRef.current) signalRef.current.style.top = `${p * 100}%`;
      }),
    [progress],
  );

  return (
    <section id="log" aria-labelledby="log-title" className="relative bg-bg-deep py-14 sm:py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <SectionHeader
          code="08"
          kicker="Engineering timeline"
          id="log-title"
          title={
            <>
              From the first question <span className="italic text-ivory-dim">to the current build.</span>
            </>
          }
          lede="Projects, research, leadership, awards and industry experience on one line. Dates are shown only where they are confirmed; everything else is grouped by era."
          aside={
            <>
              <span className="block text-ivory">Fig. 08 — Signal trace</span>
              scroll to propagate the signal
            </>
          }
        />

        <ol ref={ref} className="relative mx-auto mt-14 max-w-5xl">
          <div className="absolute bottom-0 left-[11px] top-0 w-px bg-line md:left-1/2" aria-hidden="true" />
          <div
            ref={lineRef}
            className="absolute left-[11px] top-0 h-full w-px origin-top scale-y-0 bg-gradient-to-b from-ice via-ice to-amber transition-transform duration-200 ease-out md:left-1/2"
            aria-hidden="true"
          />
          <div
            ref={signalRef}
            className="absolute left-[11px] top-0 z-10 -translate-x-1/2 -translate-y-1/2 transition-[top] duration-200 ease-out md:left-1/2"
            aria-hidden="true"
          >
            <span className="block size-3 rounded-full bg-ice shadow-[0_0_18px_4px_rgba(124,214,255,0.55)]" />
          </div>

          {timeline.map((e, i) => {
            const k = KIND[e.kind];
            const left = i % 2 === 0;
            return (
              <li key={e.id} className={cn("relative grid py-5 pl-10 md:grid-cols-2 md:pl-0", i > 0 && "md:-mt-12")}>
                <span
                  className="absolute left-[11px] top-8 size-2 -translate-x-1/2 rotate-45 border bg-bg-deep md:left-1/2"
                  style={{ borderColor: k.color }}
                  aria-hidden="true"
                />
                <div className={cn(left ? "md:col-start-1 md:pr-12 md:text-right" : "md:col-start-2 md:pl-12")}>
                  <p className={cn("flex items-center gap-2 font-mono text-[10.5px]", left && "md:justify-end")}>
                    <span style={{ color: k.color }}>{k.label.toUpperCase()}</span>
                    <span className="text-muted">· {e.period}</span>
                  </p>
                  <h3 className="mt-1.5 font-display text-2xl leading-tight text-ivory">
                    {e.link ? (
                      <Link href={e.link} className="hover:text-ice">
                        {e.title}
                      </Link>
                    ) : (
                      e.title
                    )}
                  </h3>
                  {e.org ? <p className="mt-0.5 text-sm text-ivory-dim">{e.org}</p> : null}
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{e.detail}</p>
                </div>
              </li>
            );
          })}
          <li className="relative pl-10 pt-6 md:pl-0 md:text-center">
            <p className="font-mono text-[10.5px] text-ice">NOW · signal continues</p>
            <p className="mt-1 text-sm text-muted">The next node on this line could be your project.</p>
          </li>
        </ol>
      </div>
    </section>
  );
}
