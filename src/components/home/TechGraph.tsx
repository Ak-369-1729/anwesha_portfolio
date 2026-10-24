"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { LazyMount } from "@/components/ui/LazyMount";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { categories, categoryById } from "@/data/categories";
import { projects, projectTerms, tierLabels } from "@/data/projects";
import { projectsInCluster, projectsUsing, techClusters, type TechClusterId } from "@/data/technologies";
import { cn } from "@/lib/utils";

type Selection = { kind: "term"; term: string } | { kind: "cluster"; id: TechClusterId };

const onActivate = (fn: () => void) => (e: React.KeyboardEvent) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    fn();
  }
};

/*
 * Layered network, left → right: ANWESHA → clusters → technologies → projects.
 * A layered layout keeps 42 technologies and 34 projects legible without overlap.
 */
const X = { root: 46, cluster: 156, term: 304, port: 478, project: 735 };
const TERM_ROW = 14;
const GROUP_GAP = 9;
const TOP = 24;

const clusterLayout = (() => {
  let y = TOP;
  return techClusters.map((c) => {
    const terms = c.terms.map((term) => {
      const pos = { x: X.term, y };
      y += TERM_ROW;
      return { term, pos };
    });
    y += GROUP_GAP;
    const mid = (terms[0].pos.y + terms[terms.length - 1].pos.y) / 2;
    return { ...c, pos: { x: X.cluster, y: mid }, terms };
  });
})();
const lastGroup = clusterLayout[clusterLayout.length - 1].terms;
const HEIGHT = lastGroup[lastGroup.length - 1].pos.y + TOP;

const categoryOrder = categories.map((c) => c.id);
const ringProjects = [...projects]
  .sort((a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category) || a.tier - b.tier)
  .map((p, i, arr) => ({ p, pos: { x: X.project, y: TOP + (i / (arr.length - 1)) * (HEIGHT - TOP * 2) } }));
const ringIndex = Object.fromEntries(ringProjects.map((r) => [r.p.slug, r]));

const curve = (x1: number, y1: number, x2: number, y2: number) => {
  const mx = (x1 + x2) / 2;
  return `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
};


export function TechGraph() {
  const [sel, setSel] = useState<Selection>({ kind: "term", term: "Docker" });

  const matches = useMemo(
    () => (sel.kind === "term" ? projectsUsing(sel.term) : projectsInCluster(techClusters.find((c) => c.id === sel.id)!)),
    [sel],
  );
  const matchSet = new Set(matches.map((p) => p.slug));
  const activeTerms = new Set(
    sel.kind === "term" ? [sel.term] : techClusters.find((c) => c.id === sel.id)!.terms,
  );
  const selectedCluster = sel.kind === "cluster" ? sel.id : techClusters.find((c) => c.terms.includes(sel.kind === "term" ? sel.term : ""))?.id;
  const label = sel.kind === "term" ? sel.term : techClusters.find((c) => c.id === sel.id)!.label;

  const isOn = (s: Selection) =>
    s.kind === sel.kind && (s.kind === "term" ? s.term === (sel as { term: string }).term : s.id === (sel as { id: string }).id);

  return (
    <section id="stack" aria-labelledby="stack-title" className="relative bg-bg py-14 sm:py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <SectionHeader
          code="05"
          kicker="Technology graph"
          id="stack-title"
          title={
            <>
              No skill bars. <span className="italic text-ivory-dim">Just what each tool was used to build.</span>
            </>
          }
          lede="Select a technology or a cluster. The graph traces it outward to every project that uses it — the evidence, not a self-rating."
          aside={
            <>
              <span className="block text-ivory">Fig. 05 — Capability network</span>
              {techClusters.reduce((n, c) => n + c.terms.length, 0)} technologies · {projects.length} projects
            </>
          }
        />

        <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="frame relative hidden overflow-hidden md:block lg:col-span-8">
            <LazyMount placeholderClassName="aspect-[1000/660] w-full">
            <svg viewBox={`0 0 1000 ${HEIGHT}`} className="w-full" role="group" aria-label="Technology to project network">
              {/* technology → project links */}
              {clusterLayout.flatMap((c) =>
                c.terms.map((t) =>
                  projectsUsing(t.term).map((p) => {
                    const target = ringIndex[p.slug];
                    const on = activeTerms.has(t.term);
                    return (
                      <path
                        key={`${t.term}-${p.slug}`}
                        d={curve(X.port, t.pos.y, target.pos.x - 6, target.pos.y)}
                        fill="none"
                        stroke={on ? c.color : "#d6e0ec"}
                        strokeOpacity={on ? 0.8 : 0.05}
                        strokeWidth={on ? 1.3 : 1}
                        className="transition-[stroke-opacity] duration-300"
                      />
                    );
                  }),
                ),
              )}
              {clusterLayout.map((c) => (
                <g key={c.id}>
                  <path d={curve(X.root, HEIGHT / 2, X.cluster - 52, c.pos.y)} fill="none" stroke={c.color} strokeOpacity={selectedCluster === c.id ? 0.7 : 0.2} />
                  {c.terms.map((t) => (
                    <path
                      key={t.term}
                      d={curve(X.cluster + 52, c.pos.y, X.term, t.pos.y)}
                      fill="none"
                      stroke={c.color}
                      strokeOpacity={activeTerms.has(t.term) ? 0.8 : 0.15}
                    />
                  ))}
                </g>
              ))}
              <g transform={`translate(${X.root} ${HEIGHT / 2})`}>
                <circle r={30} fill="#12151a" stroke="rgba(236,230,216,0.45)" />
                <text textAnchor="middle" y={-1} fontSize={11} fill="#ece6d8" fontFamily="var(--font-display)">
                  ANWESHA
                </text>
                <text textAnchor="middle" y={11} fontSize={6.5} fill="#8f949c" fontFamily="var(--font-mono)" letterSpacing={0.8}>
                  SYSTEMS LAB
                </text>
              </g>
              {clusterLayout.map((c) => {
                const on = isOn({ kind: "cluster", id: c.id });
                return (
                  <g
                    key={c.id}
                    role="button"
                    tabIndex={0}
                    aria-pressed={on}
                    aria-label={`${c.label} cluster`}
                    onClick={() => setSel({ kind: "cluster", id: c.id })}
                    onKeyDown={onActivate(() => setSel({ kind: "cluster", id: c.id }))}
                    className="cursor-pointer outline-none"
                    transform={`translate(${c.pos.x} ${c.pos.y})`}
                  >
                    <rect x={-52} y={-11} width={104} height={22} fill={on ? c.color : "#12151a"} stroke={c.color} className="transition-colors" />
                    <text textAnchor="middle" y={3.5} fontSize={8.5} fill={on ? "#08090b" : c.color} fontFamily="var(--font-mono)" fontWeight={600} letterSpacing={0.8}>
                      {c.label.toUpperCase()}
                    </text>
                  </g>
                );
              })}
              {clusterLayout.flatMap((c) =>
                c.terms.map((t) => {
                  const on = activeTerms.has(t.term);
                  const count = projectsUsing(t.term).length;
                  return (
                    <g
                      key={t.term}
                      role="button"
                      tabIndex={0}
                      aria-pressed={sel.kind === "term" && sel.term === t.term}
                      aria-label={`${t.term}: ${count} projects`}
                      onClick={() => setSel({ kind: "term", term: t.term })}
                      onKeyDown={onActivate(() => setSel({ kind: "term", term: t.term }))}
                      className="cursor-pointer outline-none"
                    >
                      <rect x={X.term - 6} y={t.pos.y - 7} width={X.port - X.term + 8} height={14} fill={on ? "rgba(124,214,255,0.07)" : "transparent"} />
                      <circle cx={X.term} cy={t.pos.y} r={on ? 4 : 3} fill={on ? c.color : "#0c0e11"} stroke={c.color} strokeWidth={1.2} />
                      <text x={X.term + 10} y={t.pos.y + 3.5} fontSize={10} fill={on ? "#ece6d8" : "#b9b4a8"} fontFamily="var(--font-mono)">
                        {t.term}
                      </text>
                      <text x={X.port - 8} y={t.pos.y + 3.5} textAnchor="end" fontSize={9} fill="#8f949c" fontFamily="var(--font-mono)">
                        {count}
                      </text>
                      <circle cx={X.port} cy={t.pos.y} r={1.6} fill={on ? c.color : "rgba(214,224,236,0.3)"} />
                    </g>
                  );
                }),
              )}
              {ringProjects.map(({ p, pos }) => {
                const on = matchSet.has(p.slug);
                const color = categoryById[p.category].color;
                return (
                  <g key={p.slug} transform={`translate(${pos.x} ${pos.y})`} className="transition-opacity duration-300" opacity={on ? 1 : 0.45}>
                    <circle r={p.tier === 1 ? 4.5 : 3} fill={on ? color : "#12151a"} stroke={color} />
                    <text x={11} y={3.5} fontSize={10} fill={on ? "#ece6d8" : "#8f949c"} fontFamily="var(--font-mono)">
                      {p.title.length > 34 ? `${p.title.slice(0, 32)}…` : p.title}
                    </text>
                  </g>
                );
              })}
            </svg>
            </LazyMount>
          </div>

          {/* Mobile controls (the SVG is too dense for small screens) */}
          <div className="grid gap-3 md:hidden">
            {techClusters.map((c) => (
              <div key={c.id}>
                <button
                  type="button"
                  onClick={() => setSel({ kind: "cluster", id: c.id })}
                  aria-pressed={isOn({ kind: "cluster", id: c.id })}
                  className="label mb-1.5 text-[10px]"
                  style={{ color: c.color }}
                >
                  {c.label} →
                </button>
                <div className="flex flex-wrap gap-1.5">
                  {c.terms.map((t) => {
                    const on = sel.kind === "term" && sel.term === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSel({ kind: "term", term: t })}
                        aria-pressed={on}
                        className={cn(
                          "border px-2 py-1 font-mono text-[10.5px]",
                          on ? "border-ivory bg-ivory text-bg-deep" : "border-line text-ivory-dim",
                        )}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <aside className="frame flex flex-col p-5 lg:col-span-4" aria-live="polite" aria-label="Projects for selection">
            <p className="label text-[10px]">{sel.kind === "term" ? "Technology" : "Cluster"}</p>
            <h3 className="mt-2 font-display text-3xl text-ivory">{label}</h3>
            <p className="mt-1 font-mono text-[11px] text-muted">
              used in {matches.length} project{matches.length === 1 ? "" : "s"}
            </p>
            <ul className="mt-5 grid gap-1">
              {matches.map((p) => {
                const cat = categoryById[p.category];
                const via = projectTerms(p).filter((t) => activeTerms.has(t));
                return (
                  <li key={p.slug}>
                    <Link
                      href={p.tier === 1 ? `/projects/${p.slug}` : `/projects?q=${encodeURIComponent(p.title)}`}
                      className="group flex items-baseline gap-3 border-b border-line py-2 text-sm"
                    >
                      <span className="w-7 shrink-0 font-mono text-[10px]" style={{ color: cat.color }}>
                        {tierLabels[p.tier].code}
                      </span>
                      <span className="flex-1 text-ivory-dim group-hover:text-ice">{p.title}</span>
                      <span className="hidden truncate font-mono text-[10px] text-muted sm:inline">{via.slice(0, 2).join(", ")}</span>
                      <ArrowUpRight size={12} className="shrink-0 text-muted group-hover:text-ice" aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-auto pt-6">
              <p className="label mb-2 text-[10px]">Quick picks</p>
              <div className="flex flex-wrap gap-1.5">
                {["Docker", "FastAPI", "Python", "React", "Redis", "LLMs"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSel({ kind: "term", term: t })}
                    aria-pressed={sel.kind === "term" && sel.term === t}
                    className={cn(
                      "border px-2 py-1 font-mono text-[10.5px]",
                      sel.kind === "term" && sel.term === t ? "border-ice text-ice" : "border-line text-muted hover:text-ivory",
                    )}
                  >
                    {t}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSel({ kind: "cluster", id: "security" })}
                  aria-pressed={isOn({ kind: "cluster", id: "security" })}
                  className="border border-line px-2 py-1 font-mono text-[10.5px] text-muted hover:text-ivory"
                >
                  Cybersecurity
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
