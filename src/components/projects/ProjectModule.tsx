import Link from "next/link";
import { categoryById } from "@/data/categories";
import type { Project } from "@/data/types";
import { StatusDot } from "@/components/ui/StatusDot";

/** One row of the parts list: what it is, what it solves, what it is made of, where to look. */
export function PartRow({ project: p, item }: { project: Project; item: number }) {
  const cat = categoryById[p.category];
  const made = [...p.stack, ...(p.concepts ?? [])].slice(0, p.tier === 3 ? 3 : 4);
  const links = [
    p.tier === 1 ? { href: `/projects/${p.slug}`, label: "Case study", external: false } : null,
    p.github ? { href: p.github, label: "Code", external: true } : null,
    p.demo ? { href: p.demo, label: "Live demo", external: true } : null,
  ].filter((l): l is { href: string; label: string; external: boolean } => !!l);

  return (
    <tr className="group align-top">
      <td className="hidden py-3 pr-3 font-cond text-[13px] text-pencil sm:table-cell">{item}</td>
      <th scope="row" className="py-3 pr-4 text-left font-normal">
        {p.tier === 1 ? (
          <Link href={`/projects/${p.slug}`} className="text-[15.5px] font-semibold text-ink underline-offset-4 hover:text-blueprint hover:underline">
            {p.title}
          </Link>
        ) : (
          <span className="text-[15.5px] font-semibold text-ink">{p.title}</span>
        )}
        <span className="mt-0.5 block font-cond text-[13px]" style={{ color: cat.color }}>
          {cat.label}
        </span>
      </th>
      <td className="py-3 pr-4 text-[14.5px] leading-relaxed text-graphite">
        {p.tier === 3 ? p.summary : `${p.problem} ${p.solution}`}
      </td>
      <td className="hidden py-3 pr-4 font-cond text-[13.5px] leading-relaxed text-graphite lg:table-cell">{made.join(", ") || "—"}</td>
      <td className="hidden py-3 pr-4 md:table-cell">
        <StatusDot status={p.status} />
      </td>
      <td className="py-3 text-right">
        {links.map((l) =>
          l.external ? (
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="block text-[14px] font-semibold text-blueprint hover:text-ink">
              {l.label}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : (
            <Link key={l.label} href={l.href} className="block whitespace-nowrap text-[14px] font-semibold text-blueprint hover:text-ink">
              {l.label}
            </Link>
          ),
        )}
      </td>
    </tr>
  );
}
