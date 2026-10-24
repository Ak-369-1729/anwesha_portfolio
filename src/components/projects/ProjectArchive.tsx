"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Search, X } from "lucide-react";
import { categories } from "@/data/categories";
import { projects, tierLabels } from "@/data/projects";
import type { CategoryId, Tier } from "@/data/types";
import { searchProjects } from "@/lib/search";
import { cn } from "@/lib/utils";
import { ProjectModule } from "./ProjectModule";

interface Props {
  defaultTier?: Tier | "all";
  /** Read ?q= from the URL on mount (archive page). */
  syncQuery?: boolean;
  showArchiveLink?: boolean;
  /** Heading level for the tier groups; project titles sit one level below. */
  level?: 2 | 3;
}

const tiers: (Tier | "all")[] = ["all", 1, 2, 3];

export function ProjectArchive({ defaultTier = "all", syncQuery, showArchiveLink, level = 3 }: Props) {
  const GroupHeading = level === 2 ? "h2" : "h3";
  const [tier, setTier] = useState<Tier | "all">(defaultTier);
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!syncQuery) return;
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- adopt the query string once after mount
      setQuery(q);
      setTier("all");
    }
  }, [syncQuery]);

  const results = useMemo(() => {
    const base = query.trim() ? searchProjects(query).map((h) => h.project) : projects;
    return base.filter((p) => (tier === "all" || p.tier === tier) && (!category || p.category === category));
  }, [query, tier, category]);

  const grouped = ([1, 2, 3] as Tier[])
    .map((t) => ({ t, items: results.filter((p) => p.tier === t) }))
    .filter((g) => g.items.length);

  const countFor = (t: Tier | "all") => (t === "all" ? projects.length : projects.filter((p) => p.tier === t).length);

  return (
    <div>
      <div className="flex flex-col gap-3 border-y border-line py-3 lg:flex-row lg:items-center">
        <div className="flex flex-wrap gap-1" role="group" aria-label="Project level">
          {tiers.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={tier === t}
              onClick={() => setTier(t)}
              className={cn(
                "px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.12em] transition-colors",
                tier === t ? "bg-ivory text-bg-deep" : "text-muted hover:text-ivory",
              )}
            >
              {t === "all" ? "All" : tierLabels[t].code}
              {t === "all" ? null : <span className="hidden sm:inline"> {tierLabels[t].label}</span>} · {countFor(t)}
            </button>
          ))}
        </div>
        <label className="relative flex items-center lg:ml-auto lg:w-80">
          <Search size={14} className="absolute left-3 text-muted" aria-hidden="true" />
          <span className="sr-only">Search projects</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try “FastAPI”, “security”, “space”…"
            className="w-full border border-line bg-bg-deep py-2 pl-9 pr-8 text-sm text-ivory placeholder:text-muted focus:border-ice focus:outline-none"
          />
          {query ? (
            <button type="button" onClick={() => setQuery("")} className="absolute right-2 p-1 text-muted hover:text-ivory" aria-label="Clear search">
              <X size={14} />
            </button>
          ) : null}
        </label>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Category">
        {categories.map((c) => {
          const on = category === c.id;
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={on}
              onClick={() => setCategory(on ? null : c.id)}
              className={cn(
                "flex items-center gap-1.5 border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors",
                on ? "border-ivory text-ivory" : "border-line text-muted hover:text-ivory",
              )}
            >
              <span className="size-1.5 rounded-full" style={{ background: c.color }} aria-hidden="true" />
              {c.short}
            </button>
          );
        })}
      </div>

      <p className="mt-4 font-mono text-[10.5px] text-muted" aria-live="polite">
        {results.length} of {projects.length} entries
        {query ? ` matching “${query}”` : ""}
      </p>

      {grouped.length === 0 ? (
        <div className="frame mt-4 p-10 text-center">
          <p className="font-display text-2xl text-ivory">No systems match that signal.</p>
          <p className="mt-2 text-sm text-muted">Clear a filter, or try a broader term such as “AI” or “infrastructure”.</p>
        </div>
      ) : (
        <div className="mt-4 grid gap-8">
          {grouped.map(({ t, items }) => (
            <div key={t}>
              <div className="mb-2 flex items-baseline justify-between">
                <GroupHeading className="label text-[10px]">
                  <span className="text-ice">{tierLabels[t].code}</span> · {tierLabels[t].label}
                </GroupHeading>
                <p className="hidden font-mono text-[10px] text-muted sm:block">{tierLabels[t].blurb}</p>
              </div>
              <div
                className={cn(
                  "grid gap-px border border-line bg-line",
                  t === 3 ? "grid-cols-1" : "sm:grid-cols-2 xl:grid-cols-3",
                )}
              >
                {items.map((p) => (
                  <ProjectModule key={p.slug} project={p} headingLevel={level === 2 ? 3 : 4} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showArchiveLink ? (
        <Link
          href="/projects"
          className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ice hover:text-ivory"
        >
          Open the full archive <ArrowUpRight size={13} aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}
