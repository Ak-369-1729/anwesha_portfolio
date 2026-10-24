"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Simulation } from "@/components/sims";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatusDot } from "@/components/ui/StatusDot";
import { Tag } from "@/components/ui/Tag";
import { categoryById } from "@/data/categories";
import { flagships } from "@/data/projects";
import { cn, pad } from "@/lib/utils";

export function FlagshipSystems() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const p = flagships[active];
  const cs = p.caseStudy!;
  const cat = categoryById[p.category];

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const delta = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (i + delta + flagships.length) % flagships.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <section id="systems" aria-labelledby="systems-title" className="relative bg-bg py-14 sm:py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <SectionHeader
          code="02"
          kicker="Flagship systems"
          id="systems-title"
          title={
            <>
              Eight systems, <span className="italic text-ivory-dim">running live.</span>
            </>
          }
          lede="Each flagship has a full case study. Here, each one runs as an interactive model so you can see how it behaves — especially when things go wrong."
          aside={
            <>
              <span className="block text-ivory">Fig. 02 — Live models</span>
              select a system · interact with the model
            </>
          }
        />

        <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div role="tablist" aria-label="Flagship systems" aria-orientation="vertical" className="flex min-w-0 gap-1 overflow-x-auto pb-1 scrollbar-thin lg:col-span-4 lg:flex-col lg:overflow-visible">
            {flagships.map((f, i) => {
              const on = i === active;
              const c = categoryById[f.category];
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
                    "group relative min-w-[210px] shrink-0 border px-4 py-3 text-left transition-colors lg:min-w-0",
                    on ? "border-line-strong bg-surface-2" : "border-transparent hover:border-line hover:bg-surface",
                  )}
                >
                  {on ? <span className="absolute inset-y-0 left-0 w-px" style={{ background: c.color }} aria-hidden="true" /> : null}
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-[10px] text-muted">{pad(i + 1)}</span>
                    <span className={cn("font-display text-xl leading-none", on ? "text-ivory" : "text-ivory-dim")}>{f.title}</span>
                    <span className="ml-auto font-mono text-[9.5px] uppercase tracking-[0.14em]" style={{ color: c.color }}>
                      {c.code}
                    </span>
                  </div>
                  <p className={cn("mt-1.5 pl-7 text-[12.5px] leading-snug", on ? "text-ivory-dim" : "text-muted")}>{f.summary}</p>
                </button>
              );
            })}
          </div>

          <div id="flagship-panel" role="tabpanel" aria-labelledby={`tab-${p.slug}`} className="grid min-w-0 grid-cols-1 gap-4 lg:col-span-8">
            <div className="grid gap-px border border-line bg-line sm:grid-cols-2">
              <div className="bg-bg p-4">
                <p className="label text-[10px] text-danger/90">Problem</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ivory-dim">{p.problem}</p>
              </div>
              <div className="bg-bg p-4">
                <p className="label text-[10px] text-mint">System</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ivory-dim">{p.solution}</p>
              </div>
            </div>
            <Simulation key={p.slug} id={cs.simulation} />
            <div className="flex flex-wrap items-center gap-3">
              <span className="label text-[10px]" style={{ color: cat.color }}>
                {cat.label}
              </span>
              <StatusDot status={p.status} />
              <div className="flex flex-wrap gap-1">
                {[...p.stack, ...(p.concepts ?? [])].slice(0, 6).map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </div>
              <Link
                href={`/projects/${p.slug}`}
                className="ml-auto inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ice hover:text-ivory"
              >
                Read the case study <ArrowUpRight size={13} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
