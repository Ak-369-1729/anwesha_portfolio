import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { ArchitectureDiagram } from "@/components/projects/ArchitectureDiagram";
import { Simulation } from "@/components/sims";
import { GitHubIcon } from "@/components/ui/BrandIcons";
import { CtaLink } from "@/components/ui/CtaLink";
import { StatusDot } from "@/components/ui/StatusDot";
import { Tag } from "@/components/ui/Tag";
import { categoryById } from "@/data/categories";
import { flagships, getProject } from "@/data/projects";
import { site } from "@/data/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return flagships.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  const description = `${p.summary} ${p.problem}`;
  return {
    title: `${p.title} — case study`,
    description,
    alternates: { canonical: `/projects/${p.slug}` },
    openGraph: { type: "article", title: `${p.title} · ${site.name}`, description, url: `/projects/${p.slug}` },
    twitter: { card: "summary_large_image", title: `${p.title} · ${site.name}`, description },
  };
}

function Block({ n, id, title, children }: { n: number; id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-24 border-t border-line py-10 md:grid md:grid-cols-12 md:gap-6">
      <div className="mb-4 md:col-span-3 md:mb-0">
        <p className="font-mono text-[10.5px] text-ice">{String(n).padStart(2, "0")}</p>
        <h2 id={`${id}-h`} className="label mt-1 text-[11px] text-ivory">
          {title}
        </h2>
      </div>
      <div className="min-w-0 md:col-span-9">{children}</div>
    </section>
  );
}

const List = ({ items, marker = "›" }: { items: string[]; marker?: string }) => (
  <ul className="grid gap-2.5 text-[15px] leading-relaxed text-ivory-dim">
    {items.map((i) => (
      <li key={i} className="flex gap-3">
        <span className="font-mono text-ice" aria-hidden="true">
          {marker}
        </span>
        <span>{i}</span>
      </li>
    ))}
  </ul>
);

export default async function CaseStudyPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p || !p.caseStudy) notFound();
  const cs = p.caseStudy;
  const cat = categoryById[p.category];
  const idx = flagships.findIndex((f) => f.slug === p.slug);
  const prev = flagships[(idx - 1 + flagships.length) % flagships.length];
  const next = flagships[(idx + 1) % flagships.length];

  const toc = [
    "The problem",
    "Why it matters",
    "Existing limitation",
    "The idea",
    "System architecture",
    "How it works",
    "Tech stack",
    "Engineering decisions",
    "Security & reliability",
    "Challenges",
    "Implementation",
    "Live model",
    "What I learned",
    "Next iteration",
    "Source & links",
  ];
  const ids = toc.map((t) => t.toLowerCase().replace(/[^a-z]+/g, "-"));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: p.title,
    description: p.summary,
    author: { "@type": "Person", name: site.name, url: site.url },
    keywords: [...p.stack, ...(p.concepts ?? [])].join(", "),
    url: `${site.url}/projects/${p.slug}`,
  };

  return (
    <article className="relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <header className="relative overflow-hidden border-b border-line bg-bg-deep pt-28">
        <div className="lab-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1440px] px-4 pb-14 sm:px-6 lg:px-10">
          <Link href="/#systems" className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted hover:text-ice">
            <ArrowLeft size={13} aria-hidden="true" /> All flagship systems
          </Link>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="label" style={{ color: cat.color }}>
              {cat.code} · {cat.label}
            </span>
            <span className="font-mono text-[10.5px] text-muted">L1 · Flagship {String(idx + 1).padStart(2, "0")}/{String(flagships.length).padStart(2, "0")}</span>
            <StatusDot status={p.status} />
          </div>
          <h1 className="mt-4 font-display text-[clamp(3rem,9vw,7.5rem)] leading-[0.9] tracking-[-0.02em] text-ivory">{p.title}</h1>
          <p className="mt-5 max-w-2xl font-display text-2xl italic leading-snug text-ivory-dim sm:text-3xl">{p.summary}</p>

          <div className="mt-10 grid gap-px border border-line bg-line md:grid-cols-3">
            <div className="bg-bg-deep p-5">
              <p className="label text-[10px] text-danger/90">Problem</p>
              <p className="mt-2 text-sm leading-relaxed text-ivory-dim">{p.problem}</p>
            </div>
            <div className="bg-bg-deep p-5">
              <p className="label text-[10px] text-mint">What I built</p>
              <p className="mt-2 text-sm leading-relaxed text-ivory-dim">{p.solution}</p>
            </div>
            <div className="bg-bg-deep p-5">
              <p className="label text-[10px] text-ice">Capabilities</p>
              <ul className="mt-2 flex flex-wrap gap-1">
                {(p.features ?? []).map((f) => (
                  <li key={f}>
                    <Tag>{f}</Tag>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <CtaLink href="#live-model">Run the live model</CtaLink>
            <CtaLink href="#system-architecture" variant="ghost">
              Architecture
            </CtaLink>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:px-10">
        <nav aria-label="Case study sections" className="hidden lg:col-span-2 lg:block">
          <ol className="sticky top-24 grid gap-1.5 py-10 font-mono text-[10.5px]">
            {toc.map((t, i) => (
              <li key={t}>
                <a href={`#${ids[i]}`} className="flex gap-2 text-muted hover:text-ice">
                  <span className="text-line-strong">{String(i + 1).padStart(2, "0")}</span>
                  {t}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="pb-10 lg:col-span-10">
          <Block n={1} id={ids[0]} title={toc[0]}>
            <p className="font-display text-3xl leading-snug text-ivory">{p.problem}</p>
          </Block>
          <Block n={2} id={ids[1]} title={toc[1]}>
            <p className="max-w-3xl text-[16px] leading-relaxed text-ivory-dim">{cs.whyItMatters}</p>
          </Block>
          <Block n={3} id={ids[2]} title={toc[2]}>
            <p className="max-w-3xl text-[16px] leading-relaxed text-ivory-dim">{cs.limitation}</p>
          </Block>
          <Block n={4} id={ids[3]} title={toc[3]}>
            <p className="max-w-3xl font-display text-2xl italic leading-snug text-ivory">{cs.idea}</p>
          </Block>
          <Block n={5} id={ids[4]} title={toc[4]}>
            <ArchitectureDiagram architecture={cs.architecture} />
          </Block>
          <Block n={6} id={ids[5]} title={toc[5]}>
            <ol className="grid gap-3">
              {cs.howItWorks.map((s, i) => (
                <li key={s} className="grid grid-cols-[36px_1fr] gap-3 border-b border-line pb-3 text-[15px] leading-relaxed text-ivory-dim last:border-b-0">
                  <span className="font-mono text-[11px] text-ice">{String(i + 1).padStart(2, "0")}</span>
                  {s}
                </li>
              ))}
            </ol>
          </Block>
          <Block n={7} id={ids[6]} title={toc[6]}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="label mb-2 text-[10px]">Technologies</p>
                <div className="flex flex-wrap gap-1.5">
                  {p.stack.map((s) => (
                    <Tag key={s} tone="ice">
                      {s}
                    </Tag>
                  ))}
                </div>
              </div>
              <div>
                <p className="label mb-2 text-[10px]">Concepts</p>
                <div className="flex flex-wrap gap-1.5">
                  {(p.concepts ?? []).map((s) => (
                    <Tag key={s}>{s}</Tag>
                  ))}
                </div>
              </div>
            </div>
          </Block>
          <Block n={8} id={ids[7]} title={toc[7]}>
            <dl className="grid gap-px border border-line bg-line sm:grid-cols-2">
              {cs.decisions.map((d) => (
                <div key={d.title} className="bg-bg p-5">
                  <dt className="text-[15px] font-medium text-ivory">{d.title}</dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-muted">{d.detail}</dd>
                </div>
              ))}
            </dl>
          </Block>
          <Block n={9} id={ids[8]} title={toc[8]}>
            <List items={cs.reliability} marker="◇" />
          </Block>
          <Block n={10} id={ids[9]} title={toc[9]}>
            <List items={cs.challenges} />
          </Block>
          <Block n={11} id={ids[10]} title={toc[10]}>
            <List items={cs.implementation} />
          </Block>
          <Block n={12} id={ids[11]} title={toc[11]}>
            <p className="mb-4 max-w-3xl text-sm leading-relaxed text-muted">{cs.simulationCaption}</p>
            <Simulation id={cs.simulation} />
          </Block>
          <Block n={13} id={ids[12]} title={toc[12]}>
            <List items={cs.lessons} marker="✦" />
          </Block>
          <Block n={14} id={ids[13]} title={toc[13]}>
            <List items={cs.next} marker="→" />
          </Block>
          <Block n={15} id={ids[14]} title={toc[14]}>
            <div className="flex flex-wrap gap-3">
              {p.github ? (
                <CtaLink href={p.github} external variant="ghost">
                  Repository
                </CtaLink>
              ) : null}
              {p.demo ? (
                <CtaLink href={p.demo} external variant="ghost">
                  Live demo
                </CtaLink>
              ) : null}
              <a
                href={site.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-line-strong px-4 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-ivory hover:border-ice hover:text-ice"
              >
                <GitHubIcon size={14} /> @{site.githubUser} on GitHub <ArrowUpRight size={13} aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </div>
          </Block>

          <aside className="frame mt-6 grid gap-6 p-6 sm:p-10 md:grid-cols-12 md:items-end">
            <div className="md:col-span-8">
              <p className="label text-[10px] text-amber">Need something similar?</p>
              <p className="mt-3 font-display text-4xl leading-tight text-ivory sm:text-5xl">{cs.cta.question}</p>
            </div>
            <div className="flex flex-wrap gap-3 md:col-span-4 md:justify-end">
              <CtaLink href={`/?service=${cs.cta.service}#contact`}>Discuss a project</CtaLink>
            </div>
          </aside>

          <nav aria-label="More flagship systems" className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-2">
            <Link href={`/projects/${prev.slug}`} className="group bg-bg p-5 hover:bg-surface">
              <span className="flex items-center gap-2 font-mono text-[10.5px] text-muted">
                <ArrowLeft size={12} aria-hidden="true" /> Previous system
              </span>
              <span className="mt-2 block font-display text-2xl text-ivory group-hover:text-ice">{prev.title}</span>
            </Link>
            <Link href={`/projects/${next.slug}`} className="group bg-bg p-5 text-right hover:bg-surface">
              <span className="flex items-center justify-end gap-2 font-mono text-[10.5px] text-muted">
                Next system <ArrowRight size={12} aria-hidden="true" />
              </span>
              <span className="mt-2 block font-display text-2xl text-ivory group-hover:text-ice">{next.title}</span>
            </Link>
          </nav>
        </div>
      </div>
    </article>
  );
}
