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
    <footer id="colophon" className="border-t-2 border-ink bg-paper-deep">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-12 sm:px-6 md:grid-cols-12 lg:px-10">
        <div className="md:col-span-5">
          <p className="font-display text-3xl text-ink">{site.name}</p>
          <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-graphite">
            AI, backend, security and infrastructure work, designed, built and documented end to end.
          </p>
          <p
            className={cn("mt-5 text-[15px] transition-colors duration-700", mischief ? "text-redline" : "text-pencil")}
            aria-live="polite"
          >
            {mischief ? "Mischief managed. The map folds itself away." : "I solemnly swear these systems are up to good."}
          </p>
        </div>
        <nav aria-label="Footer" className="md:col-span-2">
          <p className="label mb-2">Pages</p>
          <ul className="grid gap-1.5 text-[15px]">
            {navItems.map((n) => (
              <li key={n.label}>
                <Link href={`/#${n.target}`} className="text-graphite hover:text-blueprint">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/projects" className="text-graphite hover:text-blueprint">
                Full archive
              </Link>
            </li>
          </ul>
        </nav>
        <div className="md:col-span-2">
          <p className="label mb-2">Elsewhere</p>
          <ul className="grid gap-1.5 text-[15px]">
            {channels.map((c) => (
              <li key={c.id}>
                <a href={c.href} className="text-graphite hover:text-blueprint" target={c.id === "email" ? undefined : "_blank"} rel="noopener noreferrer">
                  {c.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-3">
          <p className="label mb-2">Colophon</p>
          <p className="text-[15px] leading-relaxed text-graphite">
            Built with Next.js and TypeScript, set in Archivo. No trackers and no cookies. Every simulation is an illustrative
            model.
          </p>
          <button type="button" onClick={() => setPaletteOpen(true)} className="mt-3 text-[15px] font-semibold text-blueprint underline underline-offset-4">
            Search the site
          </button>
        </div>
      </div>
      <div className="border-t border-ink">
        <p className="mx-auto max-w-[1440px] px-4 py-3 font-cond text-[13.5px] text-pencil sm:px-6 lg:px-10">
          © {new Date().getFullYear()} {site.name}
        </p>
      </div>
    </footer>
  );
}
