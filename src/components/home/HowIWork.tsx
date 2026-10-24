import { SectionHeader } from "@/components/ui/SectionHeader";
import { processSteps, workingPrinciples } from "@/data/process";

/** A real sequence, so it is drawn as a numbered flowchart. */
export function HowIWork() {
  return (
    <section id="process" aria-labelledby="process-title" className="py-14 sm:py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <SectionHeader
          id="process-title"
          title="How a project runs"
          lede="Seven stages, each one leaving something you can read or run, so you always know where the work is and what you will be handed at the end."
        />

        <ol className="mt-8 grid gap-y-3 md:grid-cols-7 md:gap-y-0">
          {processSteps.map((s, i) => (
            <li key={s.id} className="relative flex md:block">
              <div className="flex-1 border border-ink bg-sheet p-3 md:mr-5 md:min-h-[230px]">
                <p className="text-[15px] font-semibold text-ink">
                  <span className="mr-1.5 font-cond font-normal text-pencil">{i + 1}</span>
                  {s.title}
                </p>
                <p className="mt-2 text-[14px] leading-snug text-graphite">{s.detail}</p>
                <p className="mt-3 border-t border-line-strong pt-2 font-cond text-[13.5px] text-blueprint">You get: {s.artifact.toLowerCase()}</p>
              </div>
              {i < processSteps.length - 1 ? (
                <svg className="absolute right-0 top-8 hidden h-3 w-5 md:block" viewBox="0 0 20 12" aria-hidden="true">
                  <path d="M0 6 H17 M12 1 L18 6 L12 11" fill="none" stroke="var(--ink)" strokeWidth="1.25" />
                </svg>
              ) : null}
            </li>
          ))}
        </ol>

        <dl className="mt-12 grid gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          {workingPrinciples.map((w) => (
            <div key={w.title} className="border-t border-ink pt-3">
              <dt className="text-[16px] font-semibold text-ink">{w.title}</dt>
              <dd className="mt-1 text-[15px] leading-relaxed text-graphite">{w.detail}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
