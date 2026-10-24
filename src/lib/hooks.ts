"use client";

import { useEffect, useState, type RefObject } from "react";

/** True while the element is within `rootMargin` of the viewport. */
export function useInView(ref: RefObject<Element | null>, rootMargin = "0px", once = false) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && once) io.disconnect();
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, once]);
  return inView;
}

/** Interval that only ticks while `active` is true. */
export function useInterval(callback: () => void, ms: number, active = true) {
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(callback, ms);
    return () => window.clearInterval(id);
  }, [callback, ms, active]);
}
