import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { GitHubIcon } from "@/components/ui/BrandIcons";
import { StatusDot } from "@/components/ui/StatusDot";
import { Tag } from "@/components/ui/Tag";
import { categoryById } from "@/data/categories";
import { tierLabels } from "@/data/projects";
import type { Project } from "@/data/types";

function Links({ p }: { p: Project }) {
  const items = [
    p.tier === 1 ? { href: `/projects/${p.slug}`, label: "Case study", external: false } : null,
    p.github ? { href: p.github, label: "GitHub", external: true } : null,
    p.demo ? { href: p.demo, label: "Live demo", external: true } : null,
  ].filter((x): x is { href: string; label: string; external: boolean } => !!x);
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap gap-3">
      {items.map((l) =>
        l.external ? (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ivory-dim hover:text-ice"
          >
            {l.label === "GitHub" ? <GitHubIcon size={11} /> : null}
            {l.label} <ArrowUpRight size={11} aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        ) : (
          <Link
            key={l.label}
            href={l.href}
            className="inline-flex items-center gap-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ice hover:text-ivory"
          >
            {l.label} <ArrowUpRight size={11} aria-hidden="true" />
          </Link>
        ),
      )}
    </div>
  );
}

/** Compact engineering module — problem / solution / stack / status / links. */
export function ProjectModule({ project: p, headingLevel = 3 }: { project: Project; headingLevel?: 3 | 4 }) {
  const Heading = headingLevel === 3 ? "h3" : "h4";
  const cat = categoryById[p.category];
  const tags = [...p.stack, ...(p.concepts ?? [])].slice(0, p.tier === 3 ? 3 : 5);

  if (p.tier === 3) {
    return (
      <article className="grid gap-2 bg-bg px-4 py-3 sm:grid-cols-[88px_1fr_auto] sm:items-baseline sm:gap-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: cat.color }}>
          {tierLabels[p.tier].code} · {cat.code}
        </span>
        <div className="min-w-0">
          <Heading className="text-[15px] text-ivory">{p.title}</Heading>
          <p className="text-[13px] leading-snug text-muted">{p.summary}</p>
        </div>
        <div className="flex flex-wrap gap-1 sm:justify-end">
          {tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex flex-col bg-bg p-4 transition-colors hover:bg-surface">
      <span className="absolute left-0 top-0 h-px w-8 transition-all group-hover:w-16" style={{ background: cat.color }} aria-hidden="true" />
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: cat.color }}>
          {tierLabels[p.tier].code} · {cat.code} · {cat.short}
        </span>
        <StatusDot status={p.status} />
      </div>
      <Heading className="mt-2.5 font-display text-[1.6rem] leading-tight text-ivory">
        {p.tier === 1 ? (
          <Link href={`/projects/${p.slug}`} className="after:absolute after:inset-0 hover:text-ice">
            {p.title}
          </Link>
        ) : (
          p.title
        )}
      </Heading>
      <dl className="mt-3 grid gap-2 text-[13px] leading-snug">
        <div className="grid grid-cols-[60px_1fr] gap-2">
          <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Problem</dt>
          <dd className="text-ivory-dim">{p.problem}</dd>
        </div>
        <div className="grid grid-cols-[60px_1fr] gap-2">
          <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Built</dt>
          <dd className="text-ivory-dim">{p.solution}</dd>
        </div>
      </dl>
      <div className="mt-auto pt-4">
        <div className="flex flex-wrap gap-1">
          {tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
        <div className="relative z-10 mt-3">
          <Links p={p} />
        </div>
      </div>
    </article>
  );
}
