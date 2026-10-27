"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { IsoMachine } from "@/components/iso/IsoMachine";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { projectTerms } from "@/data/projects";
import { projectsInCluster, projectsUsing, techClusters, type TechClusterId } from "@/data/technologies";
import { machineFor } from "@/lib/iso";
import { cn } from "@/lib/utils";

type Selection = { kind: "term"; term: string } | { kind: "cluster"; id: TechClusterId };

const SHELF: Record<TechClusterId, string> = {
  ai: "#3b5bff",
  backend: "#ff7b47",
  frontend: "#4cc3ff",
  infrastructure: "#ffd24a",
  security: "#ff7aa8",
  mobile: "#b8a6ff",
  data: "#2fd3a0",
  systems: "#a6e35c",
};

/** Tools grouped on shelves by discipline. Picking one shows every project it was used in. */
export function TechGraph() {
  const [sel, setSel] = useState<Selection>({ kind: "term", term: "Docker" });
  const cluster = sel.kind === "cluster" ? techClusters.find((c) => c.id === sel.id)! : null;
  const matches = useMemo(() => (sel.kind === "term" ? projectsUsing(sel.term) : projectsInCluster(cluster!)), [sel, cluster]);
  const active = new Set(sel.kind === "term" ? [sel.term] : cluster!.terms);
  const label = sel.kind === "term" ? sel.term : cluster!.label;

  return (
    <section id="stack" aria-labelledby="stack-title" className="py-16 sm:py-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <SectionHeader
          id="stack-title"
          title="The toolbox, and where each tool was used"
          lede="No skill bars or self-ratings. Pick a tool, or a whole shelf, to see the projects it actually went into."
        />
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="grid gap-3 sm:grid-cols-2 lg:col-span-8">
            {techClusters.map((c) => {
              const shelfOn = sel.kind === "cluster" && sel.id === c.id;
              return (
                <div key={c.id} className="rounded-[24px] p-4" style={{ background: `color-mix(in srgb, ${SHELF[c.id]} ${shelfOn ? 34 : 16}%, white)` }}>
                  <button
                    type="button"
                    onClick={() => setSel({ kind: "cluster", id: c.id })}
                    aria-pressed={shelfOn}
                    className="text-[17px] font-bold tracking-[-0.01em] text-ink hover:underline"
                  >
                    {c.label}
                  </button>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {c.terms.map((t) => {
                      const on = active.has(t) && sel.kind === "term";
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setSel({ kind: "term", term: t })}
                          aria-pressed={on}
                          className={cn(
                            "rounded-full px-3 py-1.5 text-[14px] font-medium transition-colors",
                            on ? "bg-ink text-white" : "bg-white/85 text-ink hover:bg-white",
                          )}
                        >
                          {t}
                          <span className={cn("ml-1.5", on ? "text-white/60" : "text-muted")}>{projectsUsing(t).length}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <aside className="self-start rounded-[28px] bg-ink p-6 text-white lg:sticky lg:top-24 lg:col-span-4" aria-live="polite" aria-label="Projects for the selected tool">
            <p className="text-[14px] text-white/60">{sel.kind === "term" ? "Tool" : "Shelf"}</p>
            <h3 className="font-display mt-1 text-[2.4rem] leading-none">{label}</h3>
            <p className="mt-2 text-[15px] text-white/70">
              Used in {matches.length} project{matches.length === 1 ? "" : "s"}
            </p>
            <ul className="mt-5 grid gap-1.5">
              {matches.map((p) => {
                const via = projectTerms(p).filter((t) => active.has(t));
                return (
                  <li key={p.slug}>
                    <Link
                      href={p.tier === 1 ? `/projects/${p.slug}` : `/projects?q=${encodeURIComponent(p.title)}`}
                      className="flex items-center gap-3 rounded-[16px] bg-white/5 p-2 pr-3 transition-colors hover:bg-white/12"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-[11px] bg-white/10">
                        <IsoMachine spec={machineFor(p)} scale={7} className="h-6 w-auto" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-semibold">{p.title}</span>
                        {sel.kind === "cluster" ? <span className="block truncate text-[13px] text-white/55">{via.slice(0, 3).join(", ")}</span> : null}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
