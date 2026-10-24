"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Box, Map as MapIcon } from "lucide-react";
import { useLab } from "@/components/providers/LabProvider";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { categories, categoryById } from "@/data/categories";
import { tierLabels } from "@/data/projects";
import type { CategoryId } from "@/data/types";
import { useInView, useMediaQuery } from "@/lib/hooks";
import { useScrollProgress } from "@/lib/scrollProgress";
import { cn } from "@/lib/utils";
import { clusterAnchors, connectionsOf, universeNodes } from "./layout";
import { UniverseMap2D } from "./UniverseMap2D";

const Universe3D = dynamic(() => import("./Universe3D"), { ssr: false });

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

const indexOfSlug = (slug: string) => universeNodes.findIndex((n) => n.project.slug === slug);

export function UniverseSection() {
  const { lumos } = useLab();
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLElement | null)[]>([]);
  const focusLabelRef = useRef<HTMLElement | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [cluster, setCluster] = useState<CategoryId | null>(null);
  const [view, setView] = useState<"auto" | "3d" | "2d">("auto");
  const [webgl, setWebgl] = useState(false);
  const [ready3D, setReady3D] = useState(false);

  const capable = useMediaQuery("(min-width: 900px) and (pointer: fine)");
  const near = useInView(stageRef, "600px 0px", true);
  const onScreen = useInView(stageRef, "100px 0px");
  const scrollYProgress = useScrollProgress(sectionRef, 1, 0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- WebGL support can only be probed in the browser
    setWebgl(hasWebGL());
  }, []);

  const want3D = view === "3d" || (view === "auto" && capable);
  const use3D = want3D && webgl && near;
  const show3D = use3D && ready3D;

  const focus = hovered ?? selected;
  const shown = focus ?? indexOfSlug("eventmesh");
  const node = universeNodes[shown];
  const p = node.project;
  const cat = categoryById[p.category];
  const connections = connectionsOf(shown)
    .sort((a, b) => b.shared.length - a.shared.length || a.node.project.tier - b.node.project.tier)
    .slice(0, 5);
  const chain = [p.title.split(" /")[0], ...p.stack, ...(p.concepts ?? []).slice(0, 3), cat.short];

  const select = (i: number) => {
    setSelected((cur) => (cur === i ? null : i));
    setCluster(null);
  };

  return (
    <section id="lab" ref={sectionRef} aria-labelledby="lab-title" className="relative bg-bg-deep py-14 sm:py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <SectionHeader
          code="01"
          kicker="Engineering Universe"
          id="lab-title"
          title={
            <>
              Every project is a node. <span className="italic text-ivory-dim">Shared technology is the gravity.</span>
            </>
          }
          lede={`${universeNodes.length} systems across ${categories.length} clusters. Lines connect projects that share a technology or concept — hover to trace relationships, select to inspect, filter a cluster to see a discipline.`}
          aside={
            <>
              <span className="block text-ivory">Fig. 01 — Constellation</span>
              drag to orbit · hover to trace
              <br />
              type <span className="text-amber">lumos</span> in ⌘K
            </>
          }
        />

        <div className="mt-8 flex flex-wrap items-center gap-2" role="toolbar" aria-label="Filter clusters">
          <button
            type="button"
            onClick={() => setCluster(null)}
            aria-pressed={cluster === null}
            className={cn(
              "border px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.12em] transition-colors",
              cluster === null ? "border-ivory text-ivory" : "border-line text-muted hover:text-ivory",
            )}
          >
            All · {universeNodes.length}
          </button>
          {categories.map((c) => {
            const count = universeNodes.filter((n) => n.project.category === c.id).length;
            const on = cluster === c.id;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  setCluster(on ? null : c.id);
                  setSelected(null);
                }}
                className={cn(
                  "flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.12em] transition-colors",
                  on ? "text-bg-deep" : "border-line text-muted hover:text-ivory",
                )}
                style={on ? { background: c.color, borderColor: c.color } : undefined}
              >
                <span className="size-1.5 rounded-full" style={{ background: on ? "#08090b" : c.color }} aria-hidden="true" />
                {c.short} · {count}
              </button>
            );
          })}
          <div className="ml-auto flex border border-line" role="group" aria-label="Rendering">
            <button
              type="button"
              onClick={() => setView("3d")}
              aria-pressed={want3D}
              disabled={!webgl}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 font-mono text-[10.5px] uppercase",
                want3D ? "bg-surface-2 text-ivory" : "text-muted",
                !webgl && "cursor-not-allowed opacity-40",
              )}
              title={webgl ? "3D universe" : "WebGL is not available in this browser"}
            >
              <Box size={12} aria-hidden="true" /> 3D
            </button>
            <button
              type="button"
              onClick={() => setView("2d")}
              aria-pressed={!want3D}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 font-mono text-[10.5px] uppercase",
                !want3D ? "bg-surface-2 text-ivory" : "text-muted",
              )}
            >
              <MapIcon size={12} aria-hidden="true" /> Map
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div
            ref={stageRef}
            className="frame relative aspect-[4/3.4] overflow-hidden sm:aspect-[16/10] lg:col-span-8 lg:aspect-auto lg:h-[620px]"
          >
            <div className="lab-grid-fine pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
            <div className={cn("absolute inset-0 transition-opacity duration-700", show3D ? "opacity-0" : "opacity-100")}>
              {!show3D && near ? (
                <UniverseMap2D
                  focus={focus}
                  selected={selected}
                  cluster={cluster}
                  lumos={lumos}
                  onHover={setHovered}
                  onSelect={select}
                />
              ) : null}
            </div>
            {use3D ? (
              <div className={cn("absolute inset-0 transition-opacity duration-700", show3D ? "opacity-100" : "opacity-0")}>
                <Universe3D
                  focus={focus}
                  selected={selected}
                  cluster={cluster}
                  lumos={lumos}
                  active={onScreen}
                  scrollProgress={scrollYProgress}
                  labelRefs={labelRefs}
                  focusLabelRef={focusLabelRef}
                  onHover={setHovered}
                  onSelect={select}
                  onReady={() => setReady3D(true)}
                />
                <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                  {clusterAnchors.map((a, i) => (
                    <span
                      key={a.id}
                      ref={(el) => {
                        labelRefs.current[i] = el;
                      }}
                      className="absolute left-0 top-0 -translate-y-6 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.14em] will-change-transform"
                      style={{ color: a.color }}
                    >
                      <span className="-translate-x-1/2 inline-block">{categoryById[a.id].short}</span>
                    </span>
                  ))}
                  <span
                    ref={focusLabelRef}
                    className="absolute left-0 top-0 whitespace-nowrap opacity-0 transition-opacity will-change-transform"
                  >
                    <span className="ml-4 inline-block -translate-y-1/2 border border-ice/40 bg-bg-deep/85 px-2 py-1 font-mono text-[10.5px] text-ivory">
                      {focus !== null ? universeNodes[focus].project.title : ""}
                    </span>
                  </span>
                </div>
              </div>
            ) : null}

            <div className="pointer-events-none absolute bottom-3 left-3 flex flex-wrap gap-3 font-mono text-[10px] text-muted">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-ivory" aria-hidden="true" /> L1 flagship
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-ivory" aria-hidden="true" /> L2 project
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-1 rounded-full bg-ivory" aria-hidden="true" /> L3 lab
              </span>
            </div>
            <div className="pointer-events-none absolute right-3 top-3 font-mono text-[10px] text-muted">
              {show3D ? "WEBGL · LIVE" : "MAP · SVG"}
            </div>
          </div>

          {/* Inspector */}
          <aside aria-live="polite" className="frame flex flex-col p-5 lg:col-span-4" aria-label="Node inspector">
            <div className="flex items-center justify-between">
              <span className="label" style={{ color: cat.color }}>
                {cat.code} · {cat.label}
              </span>
              <span className="font-mono text-[10px] text-muted">
                {tierLabels[p.tier].code} {focus === null ? "· preview" : ""}
              </span>
            </div>
            <h3 className="mt-4 font-display text-3xl leading-tight text-ivory">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ivory-dim">{p.summary}</p>

            <div className="mt-5">
              <p className="label mb-2 text-[10px]">Tech chain</p>
              <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 font-mono text-[11px]">
                {chain.map((c, i) => (
                  <li key={`${c}-${i}`} className="flex items-center gap-1.5">
                    {i > 0 ? (
                      <span className="text-ice" aria-hidden="true">
                        →
                      </span>
                    ) : null}
                    <span className={i === 0 ? "text-ivory" : i === chain.length - 1 ? "" : "text-ivory-dim"} style={i === chain.length - 1 ? { color: cat.color } : undefined}>
                      {c}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-5 flex-1">
              <p className="label mb-2 text-[10px]">Connected through</p>
              {connections.length ? (
                <ul className="grid gap-1">
                  {connections.map((c) => (
                    <li key={c.node.project.slug}>
                      <button
                        type="button"
                        onClick={() => select(indexOfSlug(c.node.project.slug))}
                        className="flex w-full items-baseline justify-between gap-3 border-b border-line py-1.5 text-left text-[13px] text-ivory-dim hover:text-ice"
                      >
                        <span className="truncate">{c.node.project.title}</span>
                        <span className="shrink-0 font-mono text-[10px] text-muted">{c.shared.slice(0, 2).join(", ")}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">A standalone node — no shared technologies yet.</p>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {p.tier === 1 ? (
                <Link
                  href={`/projects/${p.slug}`}
                  className="inline-flex items-center gap-1.5 bg-ice px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-bg-deep hover:bg-ivory"
                >
                  Open case study <ArrowUpRight size={13} aria-hidden="true" />
                </Link>
              ) : (
                <Link
                  href={`/projects?q=${encodeURIComponent(p.title)}`}
                  className="inline-flex items-center gap-1.5 border border-line-strong px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ivory hover:border-ice hover:text-ice"
                >
                  View in archive <ArrowUpRight size={13} aria-hidden="true" />
                </Link>
              )}
            </div>
          </aside>
        </div>

        <details className="group mt-4 border border-line">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted hover:text-ivory">
            Browse every node as a list
            <span className="transition-transform group-open:rotate-45" aria-hidden="true">
              +
            </span>
          </summary>
          <div className="grid gap-x-6 gap-y-5 border-t border-line p-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => (
              <div key={c.id}>
                <p className="label mb-2 text-[10px]" style={{ color: c.color }}>
                  {c.label}
                </p>
                <ul className="grid gap-1">
                  {universeNodes
                    .map((n, i) => ({ n, i }))
                    .filter(({ n }) => n.project.category === c.id)
                    .map(({ n, i }) => (
                      <li key={n.project.slug}>
                        <button
                          type="button"
                          onClick={() => {
                            select(i);
                            stageRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
                          }}
                          className={cn("text-left text-[13px] hover:text-ice", selected === i ? "text-ice" : "text-ivory-dim")}
                        >
                          {n.project.title}
                          <span className="ml-1.5 font-mono text-[10px] text-muted">{tierLabels[n.project.tier].code}</span>
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </details>
      </div>
    </section>
  );
}
