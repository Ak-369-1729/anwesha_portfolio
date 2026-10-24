"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { categories } from "@/data/categories";
import { projects, tierLabels } from "@/data/projects";
import type { CategoryId, Tier } from "@/data/types";
import { searchProjects } from "@/lib/search";
import { cn } from "@/lib/utils";
import { PartRow } from "./ProjectModule";

interface Props {
  defaultTier?: Tier | "all";
  /** Read ?q= from the URL on mount (archive page). */
  syncQuery?: boolean;
  showArchiveLink?: boolean;
  /** Heading level for the tier groups. */
  level?: 2 | 3;
}

const tiers: (Tier | "all")[] = ["all", 1, 2, 3];
const tierName = (t: Tier | "all") => (t === "all" ? "Everything" : tierLabels[t].label);

/** The archive as a drawing's parts list: one numbered row per project, grouped by level. */
export function ProjectArchive({ defaultTier = "all", syncQuery, showArchiveLink, level = 3 }: Props) {
  const [tier, setTier] = useState<Tier | "all">(defaultTier);
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [query, setQuery] = useState("");
  const GroupHeading = level === 2 ? "h2" : "h3";

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
  let item = 0;

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Project level">
          {tiers.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={tier === t}
              onClick={() => setTier(t)}
              className={cn(
                "border px-3 py-1.5 text-[14px] font-medium transition-colors",
                tier === t ? "border-ink bg-ink text-paper" : "border-line-strong text-ink hover:border-ink",
              )}
            >
              {tierName(t)} <span className={tier === t ? "text-paper/70" : "text-pencil"}>{countFor(t)}</span>
            </button>
          ))}
        </div>
        <label className="relative flex items-center lg:ml-auto lg:w-80">
          <Search size={15} className="absolute left-3 text-pencil" aria-hidden="true" />
          <span className="sr-only">Search projects</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search, e.g. FastAPI, security, space"
            className="w-full border border-ink bg-sheet py-2 pl-9 pr-8 text-[15px] text-ink placeholder:text-pencil focus:border-blueprint focus:outline-none"
          />
          {query ? (
            <button type="button" onClick={() => setQuery("")} className="absolute right-2 p-1 text-pencil hover:text-ink" aria-label="Clear search">
              <X size={15} />
            </button>
          ) : null}
        </label>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5" role="group" aria-label="Discipline">
        {categories.map((c) => {
          const on = category === c.id;
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={on}
              onClick={() => setCategory(on ? null : c.id)}
              className={cn(
                "flex items-center gap-1.5 py-1 font-cond text-[14px] transition-colors",
                on ? "font-semibold text-ink underline underline-offset-4" : "text-pencil hover:text-ink",
              )}
            >
              <span className="size-2 rounded-full" style={{ background: c.color }} aria-hidden="true" />
              {c.short}
            </button>
          );
        })}
      </div>

      <p className="mt-4 font-cond text-[13.5px] text-pencil" aria-live="polite">
        {results.length} of {projects.length} projects
        {query ? ` matching “${query}”` : ""}
      </p>

      {grouped.length === 0 ? (
        <div className="mt-4 border border-dashed border-ink p-10 text-center">
          <p className="text-lg font-semibold text-ink">No projects match.</p>
          <p className="mt-1 text-[15px] text-graphite">Clear a filter, or try a broader word such as AI or infrastructure.</p>
        </div>
      ) : (
        <table className="mt-3 w-full border-collapse border-t-2 border-ink">
          <caption className="sr-only">Projects</caption>
          <thead className="hidden sm:table-header-group">
            <tr className="border-b border-ink text-left font-cond text-[13px] text-pencil">
              <th scope="col" className="py-2 pr-3 font-medium">Item</th>
              <th scope="col" className="py-2 pr-4 font-medium">Project</th>
              <th scope="col" className="py-2 pr-4 font-medium">Problem and what it does</th>
              <th scope="col" className="hidden py-2 pr-4 font-medium lg:table-cell">Made with</th>
              <th scope="col" className="hidden py-2 pr-4 font-medium md:table-cell">Status</th>
              <th scope="col" className="py-2 text-right font-medium"><span className="sr-only">Links</span></th>
            </tr>
          </thead>
          {grouped.map(({ t, items }) => (
            <Fragment key={t}>
              <tbody>
                <tr>
                  <td colSpan={6} className="border-b border-ink pb-2 pt-6">
                    <GroupHeading className="text-[17px] font-semibold text-ink">
                      {tierLabels[t].label}{" "}
                      <span className="font-cond text-[14px] font-normal text-pencil">{tierLabels[t].blurb}</span>
                    </GroupHeading>
                  </td>
                </tr>
              </tbody>
              <tbody className="divide-y divide-line-strong">
                {items.map((p) => (
                  <PartRow key={p.slug} project={p} item={++item} />
                ))}
              </tbody>
            </Fragment>
          ))}
        </table>
      )}

      {showArchiveLink ? (
        <Link href="/projects" className="mt-6 inline-block text-[15px] font-semibold text-blueprint underline underline-offset-4 hover:text-ink">
          Open the full archive
        </Link>
      ) : null}
    </div>
  );
}
