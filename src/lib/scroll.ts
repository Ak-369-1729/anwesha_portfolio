import type Lenis from "lenis";

let lenis: Lenis | null = null;

export function registerLenis(instance: Lenis | null) {
  lenis = instance;
}

/* Lenis honours the CSS scroll-padding-top (4.5rem) on <html>, so no extra offset is applied here. */

/** Scroll to a section id on the current page, using Lenis when it is active. */
export function scrollToId(id: string, { immediate = false }: { immediate?: boolean } = {}) {
  const el = id === "top" ? document.body : document.getElementById(id);
  if (!el) return false;
  if (lenis) {
    lenis.scrollTo(id === "top" ? 0 : el, { immediate });
  } else {
    const reduce = immediate || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (id === "top") window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    else el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }
  history.replaceState(null, "", id === "top" ? window.location.pathname : `#${id}`);
  return true;
}
