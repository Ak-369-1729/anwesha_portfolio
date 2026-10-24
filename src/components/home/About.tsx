import { SectionHeader } from "@/components/ui/SectionHeader";
import { site } from "@/data/site";

const spec = [
  { k: "Studying", v: "Computer Science engineering" },
  { k: "Works across", v: "AI, full-stack, cybersecurity, systems, DevOps, mobile and space technology" },
  { k: "Tools", v: "Python, Java, Swift, React, FastAPI, Docker" },
  { k: "Leadership", v: "Vice Chair, IEEE SIGHT; Google Cloud Arcade facilitator" },
  { k: "Available for", v: site.availability.replace(/^Open to /, "").replace("&", "and") },
];

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="bg-paper-deep py-14 sm:py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <SectionHeader id="about-title" title="About" />
        <div className="mt-8 grid gap-10 lg:grid-cols-12">
          <div className="grid max-w-[62ch] gap-5 text-[17px] leading-relaxed text-graphite lg:col-span-7">
            <p>
              I’m Anwesha, a Computer Science engineering student who builds across AI, full-stack, cybersecurity, systems,
              DevOps, mobile and space technology.
            </p>
            <p>
              The range comes from one habit. Before deciding what to build, I want to understand the whole system: where the
              data comes from, how it fails, who can reach what, and how it gets deployed.
            </p>
            <p>
              That habit started with science-congress projects at school, carried on through an industry cybersecurity
              internship, and runs through every system on this drawing. Most of them began with one question:{" "}
              <span className="text-ink">what happens when this fails?</span>
            </p>
          </div>
          <dl className="self-start border border-ink bg-sheet lg:col-span-5">
            {spec.map((s) => (
              <div key={s.k} className="grid grid-cols-[120px_1fr] gap-3 border-b border-line-strong px-4 py-3 last:border-b-0">
                <dt className="font-cond text-[14px] text-pencil">{s.k}</dt>
                <dd className="text-[15px] text-ink">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
