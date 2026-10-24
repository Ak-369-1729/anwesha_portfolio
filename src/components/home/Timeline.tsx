import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { timeline, type TimelineKind } from "@/data/timeline";

const KIND: Record<TimelineKind, string> = {
  experience: "Experience",
  leadership: "Leadership",
  award: "Award",
  research: "Research",
  project: "Systems",
  milestone: "Milestone",
};

/** Oldest first, drawn as a single datum line. Undated entries are grouped by era, never given invented dates. */
export function Timeline() {
  const eras = [...new Set(timeline.map((e) => e.period))];
  return (
    <section id="log" aria-labelledby="log-title" className="py-14 sm:py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <SectionHeader
          id="log-title"
          title="Timeline"
          lede="Awards, research, leadership, projects and industry work, oldest first. Only confirmed dates are shown; everything else is grouped by stage."
        />
        <div className="mt-8 grid gap-10">
          {eras.map((era) => (
            <div key={era} className="grid gap-4 md:grid-cols-12">
              <h3 className="text-[17px] font-semibold text-ink md:col-span-3">{era}</h3>
              <ol className="relative border-l-2 border-ink pl-6 md:col-span-9">
                {timeline
                  .filter((e) => e.period === era)
                  .map((e) => (
                    <li key={e.id} className="relative pb-6 last:pb-0">
                      <span className="absolute -left-[31px] top-1.5 size-2.5 rounded-full border-2 border-ink bg-paper" aria-hidden="true" />
                      <p className="font-cond text-[13.5px] text-pencil">{KIND[e.kind]}</p>
                      <p className="text-[17px] font-semibold leading-snug text-ink">
                        {e.link ? (
                          <Link href={e.link} className="underline-offset-4 hover:text-blueprint hover:underline">
                            {e.title}
                          </Link>
                        ) : (
                          e.title
                        )}
                        {e.org ? <span className="font-normal text-graphite">, {e.org}</span> : null}
                      </p>
                      <p className="mt-0.5 max-w-[65ch] text-[15px] leading-relaxed text-graphite">{e.detail}</p>
                    </li>
                  ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
