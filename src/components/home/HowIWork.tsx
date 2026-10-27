import { SectionHeader } from "@/components/ui/SectionHeader";
import { processSteps, workingPrinciples } from "@/data/process";

const STEP_COLOURS = ["#3b5bff", "#4cc3ff", "#2fd3a0", "#a6e35c", "#ffd24a", "#ff7b47", "#ff7aa8"];

/** A real sequence: seven numbered stops along one road. */
export function HowIWork() {
  return (
    <section id="process" aria-labelledby="process-title" className="py-16 sm:py-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <SectionHeader
          id="process-title"
          title="How a project runs"
          lede="Seven stops, each one leaving you something to read or run, so you always know where the work is and what you’ll be handed at the end."
        />

        <ol className="relative mt-12 grid gap-4 md:grid-cols-7 md:gap-3">
          <span className="absolute left-0 right-0 top-[26px] hidden h-2 rounded-full bg-white md:block" aria-hidden="true" />
          {processSteps.map((s, i) => (
            <li key={s.id} className="relative flex gap-4 md:block">
              <span
                className="relative z-10 grid size-[52px] shrink-0 place-items-center rounded-full text-[19px] font-bold text-ink ring-[6px] ring-field"
                style={{ background: STEP_COLOURS[i] }}
              >
                {i + 1}
              </span>
              <div className="md:mt-4">
                <p className="text-[18px] font-bold text-ink">{s.title}</p>
                <p className="mt-1 text-[14.5px] leading-snug text-dim">{s.detail}</p>
                <p className="mt-2 inline-block rounded-full bg-card px-2.5 py-1 text-[13px] font-medium text-ink">{s.artifact}</p>
              </div>
            </li>
          ))}
        </ol>

        <dl className="mt-14 grid gap-4 rounded-[32px] bg-card p-6 sm:grid-cols-2 sm:p-8 lg:grid-cols-3">
          {workingPrinciples.map((w) => (
            <div key={w.title} className="p-2">
              <dt className="text-[18px] font-bold text-ink">{w.title}</dt>
              <dd className="mt-1 text-[15.5px] leading-relaxed text-dim">{w.detail}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
