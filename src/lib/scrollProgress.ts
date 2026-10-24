"use client";

import { useEffect, useState, type RefObject } from "react";

/** A scroll position (0..1) that can be read imperatively or subscribed to without re-rendering React. */
export interface ScrollProgress {
  get(): number;
  subscribe(fn: (v: number) => void): () => void;
}

function createStore(): ScrollProgress & { set(v: number): void } {
  let value = 0;
  const listeners = new Set<(v: number) => void>();
  return {
    get: () => value,
    set(v) {
      if (v === value) return;
      value = v;
      listeners.forEach((fn) => fn(v));
    },
    subscribe(fn) {
      listeners.add(fn);
      fn(value);
      return () => listeners.delete(fn);
    },
  };
}

/**
 * Progress of an element through the viewport.
 * `start` / `end` are viewport fractions: progress is 0 when the element's top reaches
 * `start × viewport height` and 1 when its bottom reaches `end × viewport height`.
 * [0, 1] = pinned/sticky style ("start start" → "end end"); [1, 0] = fully passing through.
 * Without a ref, tracks the whole page.
 */
export function useScrollProgress(ref?: RefObject<HTMLElement | null>, start = 0, end = 1): ScrollProgress {
  const [store] = useState(createStore);

  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const vh = window.innerHeight;
      let p: number;
      const el = ref?.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const distance = rect.height + (start - end) * vh;
        p = distance > 0 ? (start * vh - rect.top) / distance : 0;
      } else {
        const max = document.documentElement.scrollHeight - vh;
        p = max > 0 ? window.scrollY / max : 0;
      }
      store.set(Math.min(1, Math.max(0, p)));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [ref, start, end, store]);

  return store;
}

/** Piecewise-linear mapping of progress onto an output range. */
export const ramp = (input: number[], output: number[]) => (v: number) => {
  if (v <= input[0]) return output[0];
  for (let i = 1; i < input.length; i++) {
    if (v <= input[i]) {
      const t = (v - input[i - 1]) / (input[i] - input[i - 1]);
      return output[i - 1] + (output[i] - output[i - 1]) * t;
    }
  }
  return output[output.length - 1];
};
