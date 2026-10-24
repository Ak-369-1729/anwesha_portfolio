"use client";

import Link from "next/link";
import { useLab } from "@/components/providers/LabProvider";
import { contactChannels, site } from "@/data/site";
import { navItems } from "@/data/sections";
import { cn } from "@/lib/utils";

export function Footer() {
  const { mischief, setPaletteOpen } = useLab();
  const channels = contactChannels();
  return (
    <footer id="colophon" className="relative border-t border-line bg-bg-deep">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-10 px-4 py-14 sm:px-6 md:grid-cols-12 lg:px-10">
        <div className="md:col-span-5">
          <p className="font-display text-3xl text-ivory">{site.lab}</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
            {site.thesis} AI, backend, security and infrastructure — designed, built and documented end to end.
          </p>
          <p
            className={cn(
              "mt-6 font-display text-lg italic transition-all duration-1000",
              mischief ? "translate-y-0 text-amber" : "translate-y-1 text-muted",
            )}
            aria-live="polite"
          >
            {mischief ? "Mischief managed. The map folds itself away." : "I solemnly swear these systems are up to good."}
          </p>
        </div>

        <div className="md:col-span-2">
          <p className="label mb-3">Navigate</p>
          <ul className="grid gap-2 text-sm">
            {navItems.map((n) => (
              <li key={n.label}>
                <Link href={`/#${n.target}`} className="text-ivory-dim hover:text-ice">
                  {n.label.charAt(0) + n.label.slice(1).toLowerCase()}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/projects" className="text-ivory-dim hover:text-ice">
                Full archive
              </Link>
            </li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <p className="label mb-3">Elsewhere</p>
          <ul className="grid gap-2 text-sm">
            {channels.map((c) => (
              <li key={c.id}>
                <a href={c.href} className="text-ivory-dim hover:text-ice" target={c.id === "email" ? undefined : "_blank"} rel="noopener noreferrer">
                  {c.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          <p className="label mb-3">Colophon</p>
          <p className="text-sm leading-relaxed text-muted">
            Next.js, TypeScript, Three.js and Framer Motion. Set in Instrument Serif, Hanken Grotesk and JetBrains Mono. No
            trackers, no cookies.
          </p>
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="mt-4 font-mono text-[11px] text-muted underline decoration-line-strong underline-offset-4 hover:text-ice"
          >
            Press ⌘K / Ctrl K to search the lab
          </button>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-2 px-4 py-4 font-mono text-[10.5px] text-muted sm:px-6 lg:px-10">
          <span>© {new Date().getFullYear()} {site.name}</span>
          <span>All simulations on this site are illustrative models, labelled as such.</span>
        </div>
      </div>
    </footer>
  );
}
