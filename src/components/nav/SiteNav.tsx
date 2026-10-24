"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { useLab } from "@/components/providers/LabProvider";
import { navItems, sections } from "@/data/sections";
import { site } from "@/data/site";
import { useScrollProgress } from "@/lib/scrollProgress";
import { cn } from "@/lib/utils";
import { ModeToggle } from "./ModeToggle";

function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState("top");
  useEffect(() => {
    if (!enabled) return;
    const els = sections.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [enabled]);
  return active;
}

export function SiteNav() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const active = useActiveSection(onHome);
  const { setPaletteOpen } = useLab();
  const [open, setOpen] = useState(false);
  const [isMac, setIsMac] = useState(true);
  const progress = useScrollProgress();
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(
    () =>
      progress.subscribe((p) => {
        if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      }),
    [progress],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- platform is only known on the client
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- close the mobile sheet after navigation
    setOpen(false);
  }, [pathname]);

  const activeSection = sections.find((s) => s.id === active);
  const activeNav = onHome ? activeSection?.nav : pathname.startsWith("/projects") ? "PROJECTS" : undefined;

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-bg/75 backdrop-blur-md">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:bg-ivory focus:px-3 focus:py-1.5 focus:text-bg-deep"
      >
        Skip to content
      </a>
      <nav aria-label="Primary" className="mx-auto flex h-14 max-w-[1440px] items-center gap-4 px-4 sm:px-6 lg:px-10">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-display text-2xl leading-none text-ivory">AK</span>
          <span className="font-mono text-sm text-ice transition-transform group-hover:translate-x-0.5">/</span>
          <span className="label hidden xl:inline">Systems Lab</span>
          <span className="sr-only">{site.name} — home</span>
        </Link>

        <span className="hidden font-mono text-[10.5px] text-muted lg:inline" aria-live="off">
          {onHome && activeSection ? `§${activeSection.code} · ${activeSection.label}` : pathname.startsWith("/projects/") ? "§ case study" : ""}
        </span>

        <ul className="ml-auto hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link
                href={`/#${item.target}`}
                aria-current={activeNav === item.label ? "true" : undefined}
                className={cn(
                  "relative px-2.5 py-1.5 font-mono text-[11px] tracking-[0.16em] transition-colors",
                  activeNav === item.label ? "text-ivory" : "text-muted hover:text-ivory",
                )}
              >
                {activeNav === item.label ? (
                  <span className="absolute inset-x-2.5 -bottom-[11px] h-px bg-ice" aria-hidden="true" />
                ) : null}
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <ModeToggle className="ml-auto hidden sm:flex md:ml-2" />

        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="ml-auto flex items-center gap-2 border border-line px-2.5 py-1.5 font-mono text-[11px] text-muted transition-colors hover:border-ice hover:text-ivory sm:ml-0"
          aria-keyshortcuts={isMac ? "Meta+K" : "Control+K"}
        >
          <kbd className="font-mono">{isMac ? "⌘" : "Ctrl"} K</kbd>
          <span className="sr-only">Open command palette</span>
        </button>

        <button
          type="button"
          className="p-1.5 text-ivory md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      <div
        ref={barRef}
        aria-hidden="true"
        className="absolute inset-x-0 bottom-[-1px] h-px origin-left scale-x-0 bg-gradient-to-r from-ice via-ice to-amber"
      />

      {open ? (
        <div id="mobile-menu" className="border-t border-line bg-bg-deep/95 px-4 pb-6 pt-4 md:hidden">
          <ul className="grid gap-1">
            {navItems.map((item, i) => (
              <li key={item.label}>
                <Link
                  href={`/#${item.target}`}
                  onClick={() => setOpen(false)}
                  className="flex items-baseline justify-between border-b border-line py-3 font-mono text-sm tracking-[0.16em] text-ivory"
                >
                  {item.label}
                  <span className="text-[10px] text-muted">0{i + 1}</span>
                </Link>
              </li>
            ))}
          </ul>
          <ModeToggle className="mt-5 w-fit sm:hidden" />
        </div>
      ) : null}
    </header>
  );
}
