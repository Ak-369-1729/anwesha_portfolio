"use client";

import Link from "next/link";
import { IsoMachine } from "@/components/iso/IsoMachine";
import { useLab } from "@/components/providers/LabProvider";
import { contactChannels, site } from "@/data/site";
import { navItems } from "@/data/sections";
import { machines } from "@/lib/iso";
import { cn } from "@/lib/utils";

export function Footer() {
  const { mischief, setPaletteOpen } = useLab();
  const channels = contactChannels();
  return (
    <footer id="colophon" className="mx-3 mb-3 overflow-hidden rounded-[32px] bg-ink text-white sm:mx-4">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-6 py-14 sm:px-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="flex items-end gap-1" aria-hidden="true">
            {(["eventmesh", "nexus", "chronoheritage", "boundarylens"] as const).map((k) => (
              <IsoMachine key={k} spec={machines[k]} scale={13} className="h-14 w-auto" />
            ))}
          </div>
          <p className="font-display mt-5 text-4xl">{site.name}</p>
          <p className="mt-2 max-w-sm text-[16px] leading-relaxed text-white/70">
            AI, backend, security and infrastructure work, designed, built and documented end to end.
          </p>
          <p className={cn("mt-5 text-[15px] transition-colors duration-700", mischief ? "text-lemon" : "text-white/50")} aria-live="polite">
            {mischief ? "Mischief managed. The map folds itself away." : "I solemnly swear these systems are up to good."}
          </p>
        </div>
        <nav aria-label="Footer" className="md:col-span-2">
          <p className="mb-3 text-[14px] text-white/50">Pages</p>
          <ul className="grid gap-2 text-[16px]">
            {navItems.map((n) => (
              <li key={n.label}>
                <Link href={`/#${n.target}`} className="text-white/85 hover:text-white">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/projects" className="text-white/85 hover:text-white">
                All projects
              </Link>
            </li>
          </ul>
        </nav>
        <div className="md:col-span-2">
          <p className="mb-3 text-[14px] text-white/50">Elsewhere</p>
          <ul className="grid gap-2 text-[16px]">
            {channels.map((c) => (
              <li key={c.id}>
                <a href={c.href} className="text-white/85 hover:text-white" target={c.id === "email" ? undefined : "_blank"} rel="noopener noreferrer">
                  {c.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-3">
          <p className="mb-3 text-[14px] text-white/50">About this site</p>
          <p className="text-[15px] leading-relaxed text-white/70">
            Built with Next.js and TypeScript, set in Bricolage Grotesque. No trackers or cookies. Every simulation is an
            illustrative model.
          </p>
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="mt-4 rounded-full bg-white/10 px-4 py-2 text-[15px] font-medium text-white hover:bg-white/20"
          >
            Search the site
          </button>
        </div>
      </div>
      <p className="mx-auto max-w-[1440px] px-6 pb-8 text-[14px] text-white/50 sm:px-10">© {new Date().getFullYear()} {site.name}</p>
    </footer>
  );
}
