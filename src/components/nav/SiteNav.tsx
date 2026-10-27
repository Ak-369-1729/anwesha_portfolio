"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { useLab } from "@/components/providers/LabProvider";
import { navItems, sections } from "@/data/sections";
import { site } from "@/data/site";
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- platform is only known on the client
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- close the mobile sheet after navigation
    setOpen(false);
  }, [pathname]);

  const activeNav = onHome
    ? sections.find((s) => s.id === active)?.nav
    : pathname.startsWith("/projects")
      ? "Projects"
      : undefined;

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-field/85 backdrop-blur-md">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-ink focus:px-3 focus:py-1.5 focus:text-white"
      >
        Skip to content
      </a>
      <nav aria-label="Primary" className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-4 sm:px-6 lg:px-10">
        <Link href="/" className="text-[19px] font-bold tracking-[-0.02em] text-ink">
          {site.name}
        </Link>

        <ul className="ml-auto hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link
                href={`/#${item.target}`}
                aria-current={activeNav === item.label ? "true" : undefined}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[15.5px] transition-colors",
                  activeNav === item.label ? "bg-card font-semibold text-ink" : "text-dim hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <ModeToggle className="ml-auto hidden sm:flex md:ml-2" />

        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="ml-auto flex items-center gap-2 rounded-full bg-ink px-3.5 py-2 text-[14.5px] font-medium text-white transition-colors hover:bg-cobalt sm:ml-0"
          aria-keyshortcuts={isMac ? "Meta+K" : "Control+K"}
        >
          <Search size={14} aria-hidden="true" />
          <span>Search</span>
          <kbd className="hidden font-cond text-white/60 lg:inline">{isMac ? "⌘K" : "Ctrl K"}</kbd>
        </button>

        <button
          type="button"
          className="p-1.5 text-ink md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {open ? (
        <div id="mobile-menu" className="mx-3 mb-3 rounded-[24px] bg-card px-4 pb-5 pt-2 md:hidden">
          <ul className="grid">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link href={`/#${item.target}`} onClick={() => setOpen(false)} className="block border-b border-line py-3 text-[18px] font-medium text-ink">
                  {item.label}
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
