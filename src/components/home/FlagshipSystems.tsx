"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Simulation } from "@/components/sims";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatusDot } from "@/components/ui/StatusDot";
import { Tag } from "@/components/ui/Tag";
import { categoryById } from "@/data/categories";
import { flagships } from "@/data/projects";
import { calloutOf } from "@/lib/graph";
import { cn } from "@/lib/utils";

/** Detail drawings: each lettered component on the schematic, as a working model. */
export function FlagshipSystems() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const p = flagships[active];
  const cs = p.caseStudy!;

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const delta = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (i + delta + flagships.length) % flagships.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <section id="systems" aria-labelledby="systems-title" className="py-14 sm:py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <SectionHeader
          id="systems-title"
          title="Run the systems"
          lede="Every component on the drawing has a working model. Pick one, use it, and try to make it fail. Each links to a full case study."
        />

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div
            role="tablist"
            aria-label="Flagship systems"
            aria-orientation="vertical"
            className="flex min-w-0 gap-2 overflow-x-auto pb-1 scrollbar-thin lg:col-span-3 lg:flex-col lg:gap-0 lg:overflow-visible"
          >
            {flagships.map((f, i) => {
              const on = i === active;
              return (
                <button
                  key={f.slug}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  role="tab"
                  id={`tab-${f.slug}`}
                  aria-selected={on}
                  aria-controls="flagship-panel"
                  tabIndex={on ? 0 : -1}
                  onClick={() => setActive(i)}
                  onKeyDown={(e) => onKey(e, i)}
                  className={cn(
                    "flex shrink-0 items-center gap-3 border px-3 py-2.5 text-left transition-colors lg:border-x-0 lg:border-t-0 lg:border-b-line",
                    on ? "border-ink bg-ink text-paper lg:border-b-ink" : "border-line-strong text-ink hover:bg-paper-deep",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-6 shrink-0 place-items-center rounded-full border text-[11px] font-semibold",
                      on ? "border-paper" : "border-ink",
                    )}
                    aria-hidden="true"
                  >
                    {calloutOf(f.slug)}
                  </span>
                  <span className="text-[15px] font-semibold leading-tight">{f.title.split(" /")[0]}</span>
                </button>
              );
            })}
          </div>

          <div id="flagship-panel" role="tabpanel" aria-labelledby={`tab-${p.slug}`} className="grid min-w-0 grid-cols-1 gap-4 lg:col-span-9">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="label">Detail {calloutOf(p.slug)}. The problem</p>
                <p className="mt-1 text-[15.5px] leading-relaxed text-graphite">{p.problem}</p>
              </div>
              <div>
                <p className="label">What it does</p>
                <p className="mt-1 text-[15.5px] leading-relaxed text-graphite">{p.solution}</p>
              </div>
            </div>
            <Simulation key={p.slug} id={cs.simulation} />
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-cond text-[14px] font-medium" style={{ color: categoryById[p.category].color }}>
                {categoryById[p.category].label}
              </span>
              <StatusDot status={p.status} />
              <div className="flex flex-wrap gap-1">
                {[...p.stack, ...(p.concepts ?? [])].slice(0, 6).map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </div>
              <Link href={`/projects/${p.slug}`} className="ml-auto text-[15px] font-semibold text-blueprint underline underline-offset-4 hover:text-ink">
                Read the {p.title.split(" /")[0]} case study
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
