"use client";

import Link from "next/link";
import { useLab } from "@/components/providers/LabProvider";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getProject } from "@/data/projects";
import { depthAreas, services } from "@/data/services";
import type { ServiceId } from "@/data/types";
import { scrollToId } from "@/lib/scroll";

function Evidence({ slugs }: { slugs: string[] }) {
  const items = slugs.map(getProject).filter((p) => !!p);
  return (
    <p className="text-[14px] leading-relaxed text-pencil">
      Built in{" "}
      {items.map((p, i) => (
        <span key={p.slug}>
          <Link
            href={p.tier === 1 ? `/projects/${p.slug}` : `/projects?q=${encodeURIComponent(p.title)}`}
            className="inline-block py-1 text-graphite underline decoration-line-strong underline-offset-2 hover:text-blueprint"
          >
            {p.title.split(" /")[0]}
          </Link>
          {i < items.length - 2 ? ", " : i === items.length - 2 ? " and " : ""}
        </span>
      ))}
    </p>
  );
}

export function ServicesDepth() {
  const { mode, setBriefService } = useLab();

  const startBrief = (id: ServiceId) => {
    setBriefService(id);
    scrollToId("contact");
  };

  if (mode === "recruiter") {
    return (
      <section id="services" aria-labelledby="services-title" className="bg-paper-deep py-14 sm:py-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <SectionHeader
            id="services-title"
            title="Where the technical depth is"
            lede="Six areas, each tied to the systems that show it. The case studies cover architecture, trade-offs and what I would change next."
            note="Switch to the client view for services and project briefs."
          />
          <dl className="mt-8 border-t border-ink">
            {depthAreas.map((d) => (
              <div key={d.title} className="grid gap-2 border-b border-line-strong py-5 md:grid-cols-12 md:gap-8">
                <dt className="text-lg font-semibold text-ink md:col-span-4">{d.title}</dt>
                <dd className="grid gap-1 md:col-span-8">
                  <p className="text-[15.5px] leading-relaxed text-graphite">{d.detail}</p>
                  <Evidence slugs={d.evidence} />
                </dd>
              </div>
            ))}
            <div className="grid gap-2 py-5 md:grid-cols-12 md:gap-8">
              <dt className="text-lg font-semibold text-ink md:col-span-4">Experience and leadership</dt>
              <dd className="text-[15.5px] leading-relaxed text-graphite md:col-span-8">
                Cybersecurity intern at Adxania Cyber Solutions, Vice Chair of IEEE SIGHT at Chandigarh University, and a
                Google Cloud Arcade facilitator ranked in the top 30.{" "}
                <Link href="/#log" className="font-semibold text-blueprint underline underline-offset-4">
                  See the timeline
                </Link>
              </dd>
            </div>
          </dl>
        </div>
      </section>
    );
  }

  return (
    <section id="services" aria-labelledby="services-title" className="bg-paper-deep py-14 sm:py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <SectionHeader
          id="services-title"
          title="What I can build for you"
          lede="Each service points to a system I have already built, so you can check the work before we talk."
          note="Recruiting? Switch to the recruiter view at the top of the page."
        />
        <ul className="mt-8 border-t border-ink">
          {services.map((s) => (
            <li key={s.id} className="grid gap-3 border-b border-line-strong py-5 md:grid-cols-12 md:gap-8">
              <h3 className="text-lg font-semibold text-ink md:col-span-3">{s.title}</h3>
              <div className="grid gap-1 md:col-span-6">
                <p className="text-[15.5px] leading-relaxed text-graphite">{s.pitch}</p>
                <p className="font-cond text-[14px] text-graphite">Includes {s.deliverables.slice(0, -1).join(", ")} and {s.deliverables.at(-1)}.</p>
                <Evidence slugs={s.evidence} />
              </div>
              <div className="md:col-span-3 md:text-right">
                <button
                  type="button"
                  onClick={() => startBrief(s.id)}
                  className="border border-ink px-4 py-2 text-[14.5px] font-semibold text-ink transition-colors hover:bg-ink hover:text-paper"
                >
                  {s.cta}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
