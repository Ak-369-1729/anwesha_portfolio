import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { timeline, type TimelineKind } from "@/data/timeline";

const KIND: Record<TimelineKind, { label: string; colour: string }> = {
  experience: { label: "Experience", colour: "#2fd3a0" },
  leadership: { label: "Leadership", colour: "#ffd24a" },
  award: { label: "Award", colour: "#ff7aa8" },
  research: { label: "Research", colour: "#b8a6ff" },
  project: { label: "Systems", colour: "#3b5bff" },
  milestone: { label: "Milestone", colour: "#4cc3ff" },
};

/** Oldest first. Undated entries are grouped by stage, never given invented dates. */
export function Timeline() {
  const eras = [...new Set(timeline.map((e) => e.period))];
  return (
    <section id="log" aria-labelledby="log-title" className="py-16 sm:py-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <SectionHeader
          id="log-title"
          title="The story so far"
          lede="Awards, research, leadership, projects and industry work, oldest first. Only confirmed dates are shown; the rest is grouped by stage."
        />
        <div className="mt-10 grid gap-6">
          {eras.map((era) => (
            <div key={era} className="grid gap-4 rounded-[32px] bg-card p-6 sm:p-8 md:grid-cols-12">
              <h3 className="font-display text-[1.9rem] leading-none text-ink md:col-span-3">{era}</h3>
              <ol className="grid gap-5 md:col-span-9">
                {timeline
                  .filter((e) => e.period === era)
                  .map((e) => {
                    const k = KIND[e.kind];
                    return (
                      <li key={e.id} className="flex gap-4">
                        <span className="mt-1.5 size-3.5 shrink-0 rounded-full" style={{ background: k.colour }} aria-hidden="true" />
                        <div>
                          <p className="text-[18px] font-bold leading-snug text-ink">
                            {e.link ? (
                              <Link href={e.link} className="underline-offset-4 hover:text-cobalt hover:underline">
                                {e.title}
                              </Link>
                            ) : (
                              e.title
                            )}
                            {e.org ? <span className="font-normal text-dim">, {e.org}</span> : null}
                          </p>
                          <p className="mt-0.5 max-w-[65ch] text-[15.5px] leading-relaxed text-dim">
                            <span className="font-medium text-muted">{k.label}.</span> {e.detail}
                          </p>
                        </div>
                      </li>
                    );
                  })}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
