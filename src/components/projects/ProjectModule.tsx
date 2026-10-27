import Link from "next/link";
import { IsoMachine } from "@/components/iso/IsoMachine";
import { StatusDot } from "@/components/ui/StatusDot";
import { Tag } from "@/components/ui/Tag";
import { categoryById } from "@/data/categories";
import type { Project } from "@/data/types";
import { machineFor } from "@/lib/iso";

type Heading = "h3" | "h4";

function ExternalLinks({ p }: { p: Project }) {
  const links = [
    p.github ? { href: p.github, label: "Code" } : null,
    p.demo ? { href: p.demo, label: "Live demo" } : null,
  ].filter((l): l is { href: string; label: string } => !!l);
  if (!links.length) return null;
  return (
    <div className="relative z-10 flex gap-2">
      {links.map((l) => (
        <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="rounded-full bg-field px-3 py-1 text-[13.5px] font-medium text-ink hover:bg-field-deep">
          {l.label}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      ))}
    </div>
  );
}

/** Flagship: a big tile led by its machine illustration. */
export function FlagshipTile({ project: p, heading: H = "h3" }: { project: Project; heading?: Heading }) {
  const spec = machineFor(p);
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[28px] bg-card">
      <div className="grid h-44 place-items-center" style={{ background: `color-mix(in srgb, ${spec.color} 18%, white)` }}>
        <IsoMachine spec={spec} scale={24} className="h-32 w-auto transition-transform duration-300 group-hover:-translate-y-1.5" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13.5px] font-medium" style={{ color: categoryById[p.category].color }}>
            {categoryById[p.category].short}
          </span>
          <StatusDot status={p.status} />
        </div>
        <H className="text-[22px] font-bold leading-tight tracking-[-0.015em] text-ink">
          <Link href={`/projects/${p.slug}`} className="after:absolute after:inset-0">
            {p.title}
          </Link>
        </H>
        <p className="text-[15px] leading-relaxed text-dim">{p.summary}</p>
        <div className="mt-auto pt-2">
          <ExternalLinks p={p} />
        </div>
      </div>
    </article>
  );
}

/** Substantial project: a medium tile with a small block in its discipline's colour. */
export function ProjectTile({ project: p, heading: H = "h3" }: { project: Project; heading?: Heading }) {
  const spec = machineFor(p);
  const tags = [...p.stack, ...(p.concepts ?? [])].slice(0, 3);
  return (
    <article className="flex flex-col gap-3 rounded-[24px] bg-card p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-[14px]" style={{ background: `color-mix(in srgb, ${spec.color} 20%, white)` }}>
          <IsoMachine spec={spec} scale={10} className="h-8 w-auto" />
        </span>
        <div className="min-w-0">
          <H className="text-[17.5px] font-bold leading-snug text-ink">{p.title}</H>
          <span className="text-[13.5px] font-medium" style={{ color: categoryById[p.category].color }}>
            {categoryById[p.category].short}
          </span>
        </div>
      </div>
      <p className="text-[15px] leading-relaxed text-dim">
        {p.problem} {p.solution}
      </p>
      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
        {tags.map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
        <ExternalLinks p={p} />
      </div>
    </article>
  );
}

/** Lab work: a compact chip. */
export function LabChip({ project: p, heading: H = "h3" }: { project: Project; heading?: Heading }) {
  const spec = machineFor(p);
  return (
    <article className="flex items-start gap-3 rounded-[20px] bg-card p-3.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-[11px]" style={{ background: `color-mix(in srgb, ${spec.color} 20%, white)` }}>
        <IsoMachine spec={spec} scale={7} className="h-6 w-auto" />
      </span>
      <div className="min-w-0">
        <H className="text-[15.5px] font-semibold leading-snug text-ink">{p.title}</H>
        <p className="text-[14px] leading-snug text-dim">{p.summary}</p>
      </div>
    </article>
  );
}
