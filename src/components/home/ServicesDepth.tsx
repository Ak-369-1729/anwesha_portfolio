"use client";

import Link from "next/link";
import { IsoMachine } from "@/components/iso/IsoMachine";
import { useLab } from "@/components/providers/LabProvider";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getProject } from "@/data/projects";
import { depthAreas, services } from "@/data/services";
import type { Project, ServiceId } from "@/data/types";
import { machineFor } from "@/lib/iso";
import { scrollToId } from "@/lib/scroll";

/** Background tints cycle through the block colours so the grid reads as colour, not as boxes. */
const TINTS = ["#3b5bff", "#ff7b47", "#2fd3a0", "#b8a6ff", "#ffd24a", "#ff7aa8", "#4cc3ff", "#a6e35c", "#3b5bff"];

function Evidence({ slugs }: { slugs: string[] }) {
  const items = slugs.map(getProject).filter((p): p is Project => !!p);
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((p) => (
        <Link
          key={p.slug}
          href={p.tier === 1 ? `/projects/${p.slug}` : `/projects?q=${encodeURIComponent(p.title)}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/80 py-1 pl-1 pr-3 text-[13.5px] font-medium text-ink hover:bg-white"
        >
          <IsoMachine spec={machineFor(p)} scale={6} className="h-5 w-auto" />
          {p.title.split(" /")[0]}
        </Link>
      ))}
    </div>
  );
}

export function ServicesDepth() {
  const { mode, setBriefService } = useLab();

  const startBrief = (id: ServiceId) => {
    setBriefService(id);
    scrollToId("contact");
  };

  const recruiter = mode === "recruiter";
  const items = recruiter
    ? depthAreas.map((d) => ({ key: d.title, title: d.title, body: d.detail, extra: null, evidence: d.evidence, action: null }))
    : services.map((s) => ({
        key: s.id,
        title: s.title,
        body: s.pitch,
        extra: `Includes ${s.deliverables.slice(0, -1).join(", ")} and ${s.deliverables.at(-1)}.`,
        evidence: s.evidence,
        action: { label: s.cta, run: () => startBrief(s.id) },
      }));

  return (
    <section id="services" aria-labelledby="services-title" className="py-16 sm:py-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <SectionHeader
          id="services-title"
          title={recruiter ? "Where the technical depth is" : "What I can build for you"}
          lede={
            recruiter
              ? "Six areas, each tied to the systems that show it. The case studies cover architecture, trade-offs and what I would change next."
              : "Each service points to systems I have already built, so you can check the work before we talk."
          }
          note={recruiter ? "Looking to hire for a project instead? Switch to “For clients” at the top." : "Recruiting? Switch to “For recruiters” at the top."}
        />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s, i) => (
            <li
              key={s.key}
              className="flex flex-col gap-3 rounded-[28px] p-6"
              style={{ background: `color-mix(in srgb, ${TINTS[i % TINTS.length]} 14%, white)` }}
            >
              <h3 className="text-[21px] font-bold leading-tight tracking-[-0.01em] text-ink">{s.title}</h3>
              <p className="text-[16px] leading-relaxed text-dim">{s.body}</p>
              {s.extra ? <p className="text-[14.5px] leading-relaxed text-dim">{s.extra}</p> : null}
              <div className="mt-auto pt-2">
                <Evidence slugs={s.evidence} />
              </div>
              {s.action ? (
                <button
                  type="button"
                  onClick={s.action.run}
                  className="mt-1 self-start rounded-full bg-ink px-4 py-2 text-[14.5px] font-semibold text-white transition-colors hover:bg-cobalt"
                >
                  {s.action.label}
                </button>
              ) : null}
            </li>
          ))}
          {recruiter ? (
            <li className="flex flex-col justify-between gap-4 rounded-[28px] bg-ink p-6 text-white sm:col-span-2 lg:col-span-3 lg:flex-row lg:items-center">
              <p className="max-w-3xl text-[17px] leading-relaxed text-white/85">
                <span className="font-semibold text-white">Experience and leadership.</span> Cybersecurity intern at Adxania
                Cyber Solutions, Vice Chair of IEEE SIGHT at Chandigarh University, and a Google Cloud Arcade facilitator ranked in
                the top 30.
              </p>
              <Link href="/#log" className="self-start rounded-full bg-white px-5 py-2.5 text-[15px] font-semibold text-ink lg:self-auto">
                See the timeline
              </Link>
            </li>
          ) : null}
        </ul>
      </div>
    </section>
  );
}
