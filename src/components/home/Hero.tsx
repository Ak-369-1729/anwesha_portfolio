"use client";

import Link from "next/link";
import { SystemsCity } from "@/components/iso/SystemsCity";
import { useLab } from "@/components/providers/LabProvider";
import { flagships } from "@/data/projects";
import { site } from "@/data/site";
import { machines } from "@/lib/iso";

export function Hero() {
  const { mode } = useLab();
  const primary =
    mode === "client"
      ? { href: "/#contact", label: "Start a project" }
      : { href: "/#systems", label: "Explore the systems" };
  const secondary =
    mode === "client" ? { href: "/#systems", label: "Explore the systems" } : { href: "/#log", label: "See the timeline" };

  return (
    <section id="top" aria-labelledby="hero-title" className="relative overflow-hidden pt-24 sm:pt-28">
      <div className="mx-auto grid max-w-[1440px] items-center gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[minmax(0,540px)_minmax(0,1fr)] lg:gap-0 lg:px-10 lg:pb-16">
        <div className="relative z-10 animate-rise">
          <p className="inline-flex items-center gap-2 rounded-full bg-card px-3.5 py-1.5 text-[14.5px] text-dim shadow-[0_1px_0_rgba(21,22,58,0.06)]">
            <span className="size-2 rounded-full bg-mint" aria-hidden="true" />
            {site.availability}
          </p>
          <h1 id="hero-title" className="font-display mt-6 text-[clamp(3.6rem,9vw,7.6rem)] leading-[0.86] text-ink">
            Anwesha Kar
          </h1>
          <p className="mt-7 max-w-[30ch] text-[clamp(1.4rem,2.2vw,1.85rem)] font-medium leading-[1.2] tracking-[-0.01em] text-ink">
            I don’t just build apps.{" "}
            <span className="bg-[linear-gradient(transparent_62%,var(--block-lemon)_62%)]">I build systems.</span>
          </p>
          <p className="mt-4 max-w-[46ch] text-[17.5px] leading-relaxed text-dim">
            AI/ML and full-stack developer: backend APIs, automation, security tooling and the infrastructure underneath.
            Eight of those systems are running on the map.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={primary.href}
              className="rounded-full bg-cobalt px-6 py-3.5 text-[16.5px] font-semibold text-white shadow-[0_12px_28px_-12px_rgba(52,81,242,0.9)] transition-transform hover:-translate-y-0.5"
            >
              {primary.label}
            </Link>
            <Link
              href={secondary.href}
              className="rounded-full bg-card px-6 py-3.5 text-[16.5px] font-semibold text-ink transition-transform hover:-translate-y-0.5"
            >
              {secondary.label}
            </Link>
          </div>
        </div>
        <div className="relative -mx-4 sm:mx-0 lg:-mr-24 lg:ml-4">
          <SystemsCity />
          {/* On phones the map labels would be too small to read, so the systems are listed as chips. */}
          <ul className="mt-2 flex flex-wrap gap-2 px-4 sm:hidden">
            {flagships.map((p) => (
              <li key={p.slug}>
                <Link href={`/projects/${p.slug}`} className="inline-flex items-center gap-2 rounded-full bg-card py-1.5 pl-1.5 pr-3.5 text-[15px] font-medium text-ink">
                  <span className="size-5 rounded-full" style={{ background: machines[p.slug].color }} aria-hidden="true" />
                  {p.title.split(" /")[0]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
