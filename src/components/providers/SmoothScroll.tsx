"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { registerLenis, scrollToId } from "@/lib/scroll";

/** Lenis smooth scrolling (skipped for reduced motion) + same-page hash link handling. */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let lenis: Lenis | null = null;
    let raf = 0;
    if (!reduce) {
      lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 0.95 });
      registerLenis(lenis);
      const loop = (t: number) => {
        lenis?.raf(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest("a");
      if (!a || a.target === "_blank") return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !url.hash) return;
      const id = decodeURIComponent(url.hash.slice(1));
      if (scrollToId(id)) e.preventDefault();
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(raf);
      lenis?.destroy();
      registerLenis(null);
    };
  }, []);

  // Arriving at a page with a hash (first load or client navigation such as /#contact):
  // content above the target can still change height (lazy sections, live data), so re-align once it settles.
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const id = decodeURIComponent(hash.slice(1));
    const timers = [150, 700, 1500].map((ms) =>
      window.setTimeout(() => {
        const el = document.getElementById(id);
        if (el && Math.abs(el.getBoundingClientRect().top - 72) > 24) scrollToId(id, { immediate: true });
      }, ms),
    );
    // Never fight the user: any manual scroll intent cancels the re-alignment.
    const cancel = () => timers.forEach((t) => window.clearTimeout(t));
    const intents = ["wheel", "touchstart", "keydown"] as const;
    intents.forEach((ev) => window.addEventListener(ev, cancel, { once: true, passive: true }));
    return () => {
      cancel();
      intents.forEach((ev) => window.removeEventListener(ev, cancel));
    };
  }, [pathname]);

  return null;
}
