"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { IsoMachine } from "@/components/iso/IsoMachine";
import { Simulation } from "@/components/sims";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatusDot } from "@/components/ui/StatusDot";
import { Tag } from "@/components/ui/Tag";
import { flagships } from "@/data/projects";
import { machines } from "@/lib/iso";
import { cn } from "@/lib/utils";

/** Every machine on the map, as a working model. */
export function FlagshipSystems() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const p = flagships[active];
  const cs = p.caseStudy!;
  const color = machines[p.slug].color;

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const delta = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (i + delta + flagships.length) % flagships.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <section id="systems" aria-labelledby="systems-title" className="py-16 sm:py-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <SectionHeader
          id="systems-title"
          title="Take the systems for a spin"
          lede="Every machine on the map has a working model. Pick one, poke it, and try to make it fail. Each links to a full case study."
        />

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div
            role="tablist"
            aria-label="Flagship systems"
            aria-orientation="vertical"
            className="flex min-w-0 gap-2 overflow-x-auto pb-2 scrollbar-thin lg:col-span-3 lg:flex-col lg:overflow-visible"
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
                    "flex shrink-0 items-center gap-3 rounded-[20px] py-2 pl-2 pr-4 text-left transition-colors",
                    on ? "bg-ink text-white" : "bg-card text-ink hover:bg-white/70",
                  )}
                >
                  <span className={cn("grid size-11 shrink-0 place-items-center rounded-[14px]", on ? "bg-white/10" : "bg-field")}>
                    <IsoMachine spec={machines[f.slug]} scale={9} className="h-8 w-auto" />
                  </span>
                  <span>
                    <span className="block text-[16px] font-semibold leading-tight">{f.title.split(" /")[0]}</span>
                    <span className={cn("block text-[13px]", on ? "text-white/65" : "text-muted")}>{f.tagline}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div id="flagship-panel" role="tabpanel" aria-labelledby={`tab-${p.slug}`} className="grid min-w-0 grid-cols-1 gap-4 lg:col-span-9">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] p-5" style={{ background: `color-mix(in srgb, ${color} 16%, white)` }}>
                <p className="text-[14px] font-semibold text-ink">The problem</p>
                <p className="mt-1.5 text-[16px] leading-relaxed text-dim">{p.problem}</p>
              </div>
              <div className="rounded-[24px] bg-card p-5">
                <p className="text-[14px] font-semibold text-ink">What it does</p>
                <p className="mt-1.5 text-[16px] leading-relaxed text-dim">{p.solution}</p>
              </div>
            </div>
            <Simulation key={p.slug} id={cs.simulation} />
            <div className="flex flex-wrap items-center gap-3">
              <StatusDot status={p.status} />
              <div className="flex flex-wrap gap-1.5">
                {[...p.stack, ...(p.concepts ?? [])].slice(0, 5).map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </div>
              <Link
                href={`/projects/${p.slug}`}
                className="ml-auto rounded-full bg-ink px-5 py-2.5 text-[15px] font-semibold text-white transition-colors hover:bg-cobalt"
              >
                Read the {p.title.split(" /")[0]} case study
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
