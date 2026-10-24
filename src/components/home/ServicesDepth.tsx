"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLab } from "@/components/providers/LabProvider";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getProject } from "@/data/projects";
import { depthAreas, services } from "@/data/services";
import type { ServiceId } from "@/data/types";
import { scrollToId } from "@/lib/scroll";
import { pad } from "@/lib/utils";

function Evidence({ slugs }: { slugs: string[] }) {
  return (
    <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10.5px] text-muted">
      <span className="text-[9.5px] uppercase tracking-[0.14em]">evidence</span>
      {slugs.map((slug) => {
        const p = getProject(slug);
        if (!p) return null;
        return p.tier === 1 ? (
          <Link key={slug} href={`/projects/${slug}`} className="inline-block py-1.5 text-ivory-dim underline decoration-line-strong underline-offset-2 hover:text-ice">
            {p.title.split(" /")[0]}
          </Link>
        ) : (
          <Link key={slug} href={`/projects?q=${encodeURIComponent(p.title)}`} className="inline-block py-1.5 text-ivory-dim hover:text-ice">
            {p.title.split(" /")[0]}
          </Link>
        );
      })}
    </p>
  );
}

export function ServicesDepth() {
  const { mode, setBriefService } = useLab();

  const startBrief = (id: ServiceId) => {
    setBriefService(id);
    scrollToId("contact");
  };

  return (
    <section id="services" aria-labelledby="services-title" className="relative bg-bg-deep py-14 sm:py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        {mode === "client" ? (
          <>
            <SectionHeader
              code="03"
              kicker="Client mode · services"
              id="services-title"
              title={
                <>
                  What I can build <span className="italic text-ivory-dim">for your product.</span>
                </>
              }
              lede="Every service is tied to a system I have actually built — follow the evidence links. Pick one to start a project brief."
              aside={
                <>
                  <span className="block text-ivory">Switch to Recruiter mode</span>
                  for architecture, research & experience
                </>
              }
            />
            <ul className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s, i) => (
                <li key={s.id} className="group flex flex-col bg-bg-deep p-5 transition-colors hover:bg-surface">
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-[10px] text-ice">S.{pad(i + 1)}</span>
                    <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted">{s.deliverables.length} deliverables</span>
                  </div>
                  <h3 className="mt-3 font-display text-2xl leading-tight text-ivory">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ivory-dim">{s.pitch}</p>
                  <ul className="mt-3 grid gap-1 text-[13px] text-muted">
                    {s.deliverables.map((d) => (
                      <li key={d} className="flex gap-2">
                        <span className="text-ice" aria-hidden="true">
                          ›
                        </span>
                        {d}
                      </li>
                    ))}
                  </ul>
                  <Evidence slugs={s.evidence} />
                  <button
                    type="button"
                    onClick={() => startBrief(s.id)}
                    className="mt-auto flex items-center gap-2 pt-5 text-left font-mono text-[11px] uppercase tracking-[0.14em] text-ivory hover:text-ice"
                  >
                    {s.cta} <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <SectionHeader
              code="03"
              kicker="Recruiter mode · technical depth"
              id="services-title"
              title={
                <>
                  Where the depth is, <span className="italic text-ivory-dim">and the proof.</span>
                </>
              }
              lede="Six areas of technical depth, each linked to the systems that demonstrate it. Case studies include architecture, decisions, trade-offs and what I would change next."
              aside={
                <>
                  <span className="block text-ivory">Switch to Client mode</span>
                  for services and project briefs
                </>
              }
            />
            <ul className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
              {depthAreas.map((d, i) => (
                <li key={d.title} className="flex flex-col bg-bg-deep p-5">
                  <span className="font-mono text-[10px] text-amber">D.{pad(i + 1)}</span>
                  <h3 className="mt-3 font-display text-2xl leading-tight text-ivory">{d.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ivory-dim">{d.detail}</p>
                  <Evidence slugs={d.evidence} />
                </li>
              ))}
              <li className="flex flex-col justify-between bg-surface p-5 sm:col-span-2 lg:col-span-3 lg:flex-row lg:items-center">
                <p className="text-sm text-ivory-dim">
                  <span className="text-ivory">Experience & leadership:</span> Cybersecurity Intern at Adxania Cyber Solutions ·
                  Vice Chair, IEEE SIGHT · Google Cloud Arcade Facilitator (Top 30).
                </p>
                <Link href="/#log" className="mt-3 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ice hover:text-ivory lg:mt-0">
                  Engineering timeline <ArrowRight size={13} aria-hidden="true" />
                </Link>
              </li>
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
