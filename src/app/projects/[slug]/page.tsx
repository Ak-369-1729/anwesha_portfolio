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
import { calloutOf } from "@/lib/graph";
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
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-24 border-t border-line-strong py-9 md:grid md:grid-cols-12 md:gap-6">
      <div className="mb-3 md:col-span-3 md:mb-0" data-section={n}>
        <h2 id={`${id}-h`} className="text-[17px] font-semibold text-ink">
          {title}
        </h2>
      </div>
      <div className="min-w-0 md:col-span-9">{children}</div>
    </section>
  );
}

const List = ({ items }: { items: string[] }) => (
  <ul className="grid gap-2.5 text-[15px] leading-relaxed text-graphite">
    {items.map((i) => (
      <li key={i} className="flex gap-3">
        <span className="mt-[0.7em] h-px w-3 shrink-0 bg-ink" aria-hidden="true" />
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

      <header className="border-b-2 border-ink pt-24">
        <div className="mx-auto max-w-[1440px] px-4 pb-12 sm:px-6 lg:px-10">
          <Link href="/#systems" className="inline-flex items-center gap-2 text-[15px] text-graphite hover:text-blueprint">
            <ArrowLeft size={14} aria-hidden="true" /> Back to the drawing
          </Link>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="grid size-7 place-items-center rounded-full border border-ink text-[13px] font-semibold text-ink" aria-label={`Detail ${calloutOf(p.slug)}`}>
              {calloutOf(p.slug)}
            </span>
            <span className="font-cond text-[15px] font-medium" style={{ color: cat.color }}>
              {cat.label}
            </span>
            <StatusDot status={p.status} />
          </div>
          <h1 className="font-display mt-4 text-[clamp(2.6rem,7vw,5.5rem)] leading-[0.95] text-ink">{p.title}</h1>
          <p className="mt-4 max-w-2xl text-xl leading-snug text-graphite sm:text-2xl">{p.summary}</p>

          <div className="mt-10 grid border border-ink bg-sheet md:grid-cols-3 md:divide-x md:divide-ink">
            <div className="bg-paper-deep p-5">
              <p className="label">Problem</p>
              <p className="mt-1 text-[15px] leading-relaxed text-graphite">{p.problem}</p>
            </div>
            <div className="bg-paper-deep p-5">
              <p className="label">What I built</p>
              <p className="mt-1 text-[15px] leading-relaxed text-graphite">{p.solution}</p>
            </div>
            <div className="bg-paper-deep p-5">
              <p className="label">Capabilities</p>
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
          <ol className="sticky top-24 grid gap-1.5 py-9 font-cond text-[14.5px]">
            {toc.map((t, i) => (
              <li key={t}>
                <a href={`#${ids[i]}`} className="flex gap-2 text-graphite hover:text-blueprint">
                  {t}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="pb-10 lg:col-span-10">
          <Block n={1} id={ids[0]} title={toc[0]}>
            <p className="max-w-[60ch] text-2xl font-medium leading-snug text-ink">{p.problem}</p>
          </Block>
          <Block n={2} id={ids[1]} title={toc[1]}>
            <p className="max-w-3xl text-[16px] leading-relaxed text-graphite">{cs.whyItMatters}</p>
          </Block>
          <Block n={3} id={ids[2]} title={toc[2]}>
            <p className="max-w-3xl text-[16px] leading-relaxed text-graphite">{cs.limitation}</p>
          </Block>
          <Block n={4} id={ids[3]} title={toc[3]}>
            <p className="max-w-[60ch] text-xl font-medium leading-snug text-ink">{cs.idea}</p>
          </Block>
          <Block n={5} id={ids[4]} title={toc[4]}>
            <ArchitectureDiagram architecture={cs.architecture} />
          </Block>
          <Block n={6} id={ids[5]} title={toc[5]}>
            <ol className="grid gap-3">
              {cs.howItWorks.map((s, i) => (
                <li key={s} className="grid grid-cols-[36px_1fr] gap-3 border-b border-line pb-3 text-[15px] leading-relaxed text-graphite last:border-b-0">
                  <span className="font-cond text-[15px] text-pencil">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </Block>
          <Block n={7} id={ids[6]} title={toc[6]}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="label mb-2">Technologies</p>
                <div className="flex flex-wrap gap-1.5">
                  {p.stack.map((s) => (
                    <Tag key={s} tone="blueprint">
                      {s}
                    </Tag>
                  ))}
                </div>
              </div>
              <div>
                <p className="label mb-2">Concepts</p>
                <div className="flex flex-wrap gap-1.5">
                  {(p.concepts ?? []).map((s) => (
                    <Tag key={s}>{s}</Tag>
                  ))}
                </div>
              </div>
            </div>
          </Block>
          <Block n={8} id={ids[7]} title={toc[7]}>
            <dl className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
              {cs.decisions.map((d) => (
                <div key={d.title} className="border-t border-ink pt-3">
                  <dt className="text-[15px] font-medium text-ink">{d.title}</dt>
                  <dd className="mt-1 text-[15px] leading-relaxed text-graphite">{d.detail}</dd>
                </div>
              ))}
            </dl>
          </Block>
          <Block n={9} id={ids[8]} title={toc[8]}>
            <List items={cs.reliability} />
          </Block>
          <Block n={10} id={ids[9]} title={toc[9]}>
            <List items={cs.challenges} />
          </Block>
          <Block n={11} id={ids[10]} title={toc[10]}>
            <List items={cs.implementation} />
          </Block>
          <Block n={12} id={ids[11]} title={toc[11]}>
            <p className="mb-4 max-w-[65ch] text-[15px] leading-relaxed text-graphite">{cs.simulationCaption}</p>
            <Simulation id={cs.simulation} />
          </Block>
          <Block n={13} id={ids[12]} title={toc[12]}>
            <List items={cs.lessons} />
          </Block>
          <Block n={14} id={ids[13]} title={toc[13]}>
            <List items={cs.next} />
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
                className="inline-flex items-center gap-2 border border-line-strong px-4 py-2.5 font-cond text-xs text-ink hover:border-blueprint hover:text-blueprint"
              >
                <GitHubIcon size={14} /> @{site.githubUser} on GitHub <ArrowUpRight size={13} aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </div>
          </Block>

          <aside className="mt-6 grid gap-6 border-2 border-ink bg-sheet p-6 sm:p-10 md:grid-cols-12 md:items-end">
            <div className="md:col-span-8">
              <p className="text-[15px] text-graphite">Need something similar?</p>
              <p className="font-display mt-2 text-3xl leading-tight text-ink sm:text-4xl">{cs.cta.question}</p>
            </div>
            <div className="flex flex-wrap gap-3 md:col-span-4 md:justify-end">
              <CtaLink href={`/?service=${cs.cta.service}#contact`}>Discuss a project</CtaLink>
            </div>
          </aside>

          <nav aria-label="More flagship systems" className="mt-10 grid border border-ink sm:grid-cols-2 sm:divide-x sm:divide-ink">
            <Link href={`/projects/${prev.slug}`} className="group bg-paper p-5 hover:bg-sheet">
              <span className="flex items-center gap-2 font-cond text-[13px] text-pencil">
                <ArrowLeft size={12} aria-hidden="true" /> Previous system
              </span>
              <span className="mt-1 block text-xl font-semibold text-ink group-hover:text-blueprint">{prev.title}</span>
            </Link>
            <Link href={`/projects/${next.slug}`} className="group bg-paper p-5 text-right hover:bg-sheet">
              <span className="flex items-center justify-end gap-2 font-cond text-[13px] text-pencil">
                Next system <ArrowRight size={12} aria-hidden="true" />
              </span>
              <span className="mt-1 block text-xl font-semibold text-ink group-hover:text-blueprint">{next.title}</span>
            </Link>
          </nav>
        </div>
      </div>
    </article>
  );
}
