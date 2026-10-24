import { categoryById } from "@/data/categories";
import { flagships, projectTerms } from "@/data/projects";
import type { Project } from "@/data/types";

/** Terms so common they would connect everything to everything — they explain nothing. */
const IGNORED = new Set(["automation", "web application", "rest apis"]);

export function sharedTerms(a: Project, b: Project) {
  const bt = new Set(projectTerms(b).map((t) => t.toLowerCase()));
  return projectTerms(a).filter((t) => !IGNORED.has(t.toLowerCase()) && bt.has(t.toLowerCase()));
}

export interface Link {
  a: Project;
  b: Project;
  /** What the two have in common: a shared technology, or their shared discipline. */
  via: string;
}

/** Pairs of projects that share a technology, or (for flagships) sit in the same discipline. */
export function linksAmong(list: Project[], sameCategory = false): Link[] {
  const links: Link[] = [];
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i];
      const b = list[j];
      const shared = sharedTerms(a, b);
      if (shared.length) links.push({ a, b, via: shared[0] });
      else if (sameCategory && a.category === b.category) links.push({ a, b, via: categoryById[a.category].short });
    }
  }
  return links;
}

export const flagshipLinks = linksAmong(flagships, true);

/** Drafting callout letter for each flagship (A, B, C…), used on the schematic and its detail drawings. */
export const calloutOf = (slug: string) => String.fromCharCode(65 + flagships.findIndex((p) => p.slug === slug));
