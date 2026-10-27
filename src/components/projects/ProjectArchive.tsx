"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { categories } from "@/data/categories";
import { projects, tierLabels } from "@/data/projects";
import type { CategoryId, Tier } from "@/data/types";
import { searchProjects } from "@/lib/search";
import { cn } from "@/lib/utils";
import { FlagshipTile, LabChip, ProjectTile } from "./ProjectModule";

interface Props {
  defaultTier?: Tier | "all";
  /** Read ?q= from the URL on mount (archive page). */
  syncQuery?: boolean;
  showArchiveLink?: boolean;
  /** Heading level for the tier groups; tile titles sit one level below. */
  level?: 2 | 3;
}

const tiers: (Tier | "all")[] = ["all", 1, 2, 3];
const tierName = (t: Tier | "all") => (t === "all" ? "Everything" : tierLabels[t].label);

export function ProjectArchive({ defaultTier = "all", syncQuery, showArchiveLink, level = 3 }: Props) {
  const [tier, setTier] = useState<Tier | "all">(defaultTier);
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [query, setQuery] = useState("");
  const GroupHeading = level === 2 ? "h2" : "h3";
  const tileHeading = level === 2 ? "h3" : "h4";

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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Project level">
          {tiers.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={tier === t}
              onClick={() => setTier(t)}
              className={cn(
                "rounded-full px-4 py-2 text-[15px] font-medium transition-colors",
                tier === t ? "bg-ink text-white" : "bg-card text-ink hover:bg-white/70",
              )}
            >
              {tierName(t)} <span className={tier === t ? "text-white/60" : "text-muted"}>{countFor(t)}</span>
            </button>
          ))}
        </div>
        <label className="relative flex items-center lg:ml-auto lg:w-80">
          <Search size={16} className="absolute left-4 text-muted" aria-hidden="true" />
          <span className="sr-only">Search projects</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search, e.g. FastAPI, security, space"
            className="w-full rounded-full bg-card py-2.5 pl-11 pr-10 text-[15px] text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-cobalt"
          />
          {query ? (
            <button type="button" onClick={() => setQuery("")} className="absolute right-3 p-1 text-muted hover:text-ink" aria-label="Clear search">
              <X size={15} />
            </button>
          ) : null}
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Discipline">
        {categories.map((c) => {
          const on = category === c.id;
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={on}
              onClick={() => setCategory(on ? null : c.id)}
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1.5 text-[14px] transition-colors",
                on ? "bg-ink font-medium text-white" : "text-dim hover:bg-card",
              )}
            >
              <span className="size-2.5 rounded-full" style={{ background: c.block }} aria-hidden="true" />
              {c.short}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-[14.5px] text-muted" aria-live="polite">
        {results.length} of {projects.length} projects
        {query ? ` matching “${query}”` : ""}
      </p>

      {grouped.length === 0 ? (
        <div className="mt-4 rounded-[28px] bg-card p-10 text-center">
          <p className="text-xl font-bold text-ink">No projects match.</p>
          <p className="mt-1 text-[15.5px] text-dim">Clear a filter, or try a broader word such as AI or infrastructure.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-10">
          {grouped.map(({ t, items }) => (
            <div key={t}>
              <GroupHeading className="mb-4 text-[20px] font-bold tracking-[-0.01em] text-ink">
                {tierLabels[t].label} <span className="text-[15px] font-normal text-muted">{tierLabels[t].blurb}</span>
              </GroupHeading>
              <div
                className={cn(
                  "grid gap-4",
                  t === 1 && "sm:grid-cols-2 lg:grid-cols-4",
                  t === 2 && "sm:grid-cols-2 lg:grid-cols-3",
                  t === 3 && "sm:grid-cols-2 lg:grid-cols-4",
                )}
              >
                {items.map((p) =>
                  t === 1 ? (
                    <FlagshipTile key={p.slug} project={p} heading={tileHeading} />
                  ) : t === 2 ? (
                    <ProjectTile key={p.slug} project={p} heading={tileHeading} />
                  ) : (
                    <LabChip key={p.slug} project={p} heading={tileHeading} />
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showArchiveLink ? (
        <Link href="/projects" className="mt-8 inline-flex rounded-full bg-ink px-5 py-2.5 text-[15px] font-semibold text-white hover:bg-cobalt">
          Open the full archive
        </Link>
      ) : null}
    </div>
  );
}
