export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/** Deterministic 0..1 pseudo-random from a string seed (stable across server/client). */
export function seeded(seed: string, salt = 0) {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 13;
  h = Math.imul(h, 0x5bd1e995);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967295;
}

export const pad = (n: number, width = 2) => String(n).padStart(width, "0");

export function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}
