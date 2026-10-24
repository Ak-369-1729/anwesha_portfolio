import { SectionHeader } from "@/components/ui/SectionHeader";
import { site } from "@/data/site";

const params = [
  { k: "Discipline", v: "Computer Science engineering" },
  { k: "Focus", v: "AI · Systems · Security · Infrastructure" },
  { k: "Builds across", v: "AI, full-stack, cybersecurity, systems, DevOps, mobile, space tech" },
  { k: "Works in", v: "Python · Java · Swift · React · FastAPI · Docker" },
  { k: "Leadership", v: "Vice Chair, IEEE SIGHT · Google Cloud Arcade Facilitator" },
  { k: "Status", v: site.availability },
];

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="relative bg-bg py-14 sm:py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <SectionHeader code="07" kicker="About" id="about-title" title={<>Curiosity, <span className="italic text-ivory-dim">applied systematically.</span></>} />
        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <p className="font-display text-2xl italic leading-snug text-amber">
              “What happens when this fails?”
            </p>
            <p className="mt-2 font-mono text-[10.5px] text-muted">— the question behind most of this site</p>
          </div>
          <div className="grid gap-5 text-[16px] leading-relaxed text-ivory-dim lg:col-span-5">
            <p>
              I’m <span className="text-ivory">Anwesha</span>, a Computer Science engineering student who builds across AI,
              full-stack, cybersecurity, systems, DevOps, mobile and space technology.
            </p>
            <p>
              That range isn’t a lack of focus — it’s one habit applied everywhere: understand the whole system first. Where the
              data comes from, how it fails, who can reach what, and how it gets deployed — then decide what to build.
            </p>
            <p>
              The thread runs from national science-congress projects at school, through an industry cybersecurity internship,
              to the flagship systems above — each one an answer to a question I couldn’t leave alone.
            </p>
          </div>
          <dl className="frame grid content-start gap-0 p-0 lg:col-span-4">
            {params.map((p) => (
              <div key={p.k} className="grid grid-cols-[110px_1fr] gap-3 border-b border-line px-4 py-3 last:border-b-0">
                <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{p.k}</dt>
                <dd className="text-[13px] text-ivory">{p.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
