"use client";

import Link from "next/link";
import { useLab } from "@/components/providers/LabProvider";
import { flagships, projects } from "@/data/projects";
import { site } from "@/data/site";
import { Schematic } from "./Schematic";

/** The homepage is one drawing sheet: the system schematic above, the title block below it. */
export function Hero() {
  const { mode } = useLab();
  const primary =
    mode === "client"
      ? { href: "/#contact", label: "Start a project" }
      : { href: "/#systems", label: "Run the systems" };
  const secondary =
    mode === "client" ? { href: "/#services", label: "What I can build" } : { href: "/#log", label: "Timeline" };

  return (
    <section id="top" aria-labelledby="hero-title" className="px-3 pb-10 pt-[68px] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1440px] border-2 border-ink p-1">
        <div className="drafting-grid grid gap-6 border border-ink p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
          <div className="min-w-0 pt-3">
            <Schematic />
          </div>

          {/* Title block: the drawing's identity, and the way in. */}
          <div className="order-first grid content-start border border-ink bg-sheet md:grid-cols-2 lg:order-none lg:grid-cols-1">
            <div className="border-b border-ink p-4 md:col-span-2 lg:col-span-1">
              <p className="label">Drawn by</p>
              <h1 id="hero-title" className="font-display mt-1 text-[clamp(2.4rem,4vw,3.2rem)] leading-[0.95] text-ink">
                Anwesha Kar
              </h1>
            </div>
            <div className="border-b border-ink p-4 md:col-span-2 lg:col-span-1">
              <p className="label">Title</p>
              <p className="mt-1 text-xl font-medium leading-snug text-ink">{site.thesis}</p>
            </div>
            <div className="border-b border-ink p-4 md:border-r lg:border-r-0">
              <p className="label">Discipline</p>
              <p className="mt-1 text-[15px] leading-snug text-graphite">
                AI/ML and full-stack development, backend APIs, security and infrastructure.
              </p>
            </div>
            <div className="border-b border-ink p-4">
              <p className="label">Status</p>
              <p className="mt-1 text-[15px] leading-snug text-graphite">{site.availability}.</p>
            </div>
            <div className="grid gap-2 p-4 md:col-span-2 lg:col-span-1">
              <Link
                href={primary.href}
                className="bg-ink px-5 py-2.5 text-center text-[15px] font-semibold text-paper transition-colors hover:bg-blueprint"
              >
                {primary.label}
              </Link>
              <Link
                href={secondary.href}
                className="border border-ink px-5 py-2.5 text-center text-[15px] font-semibold text-ink transition-colors hover:border-blueprint hover:text-blueprint"
              >
                {secondary.label}
              </Link>
              <p className="pt-1 text-center font-cond text-[13px] text-pencil">
                {flagships.length} of {projects.length} projects on this drawing
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
