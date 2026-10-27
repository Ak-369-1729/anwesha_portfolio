import { IsoMachine } from "@/components/iso/IsoMachine";
import { site } from "@/data/site";
import { machines } from "@/lib/iso";

const facts = [
  { k: "Studying", v: "Computer Science engineering" },
  { k: "Works across", v: "AI, full-stack, cybersecurity, systems, DevOps, mobile and space tech" },
  { k: "Tools", v: "Python, Java, Swift, React, FastAPI, Docker" },
  { k: "Leadership", v: "Vice Chair, IEEE SIGHT; Google Cloud Arcade facilitator" },
  { k: "Available for", v: site.availability.replace(/^Open to /, "").replace("&", "and") },
];

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="px-3 py-6 sm:px-4">
      <div className="mx-auto grid max-w-[1440px] gap-10 overflow-hidden rounded-[36px] bg-[#e7e1ff] px-6 py-14 sm:px-10 lg:grid-cols-12 lg:py-20">
        <div className="lg:col-span-7">
          <h2 id="about-title" className="font-display text-[clamp(2.3rem,4.6vw,3.9rem)] leading-[0.95] text-ink">
            Hi, I’m Anwesha.
          </h2>
          <div className="mt-6 grid max-w-[60ch] gap-4 text-[18px] leading-relaxed text-dim">
            <p>
              I’m a Computer Science engineering student who builds across AI, full-stack, cybersecurity, systems, DevOps,
              mobile and space technology.
            </p>
            <p>
              The range comes from one habit. Before deciding what to build, I want to understand the whole system: where the
              data comes from, how it fails, who can reach what, and how it gets deployed.
            </p>
            <p>
              That habit started with science-congress projects at school, carried on through an industry cybersecurity
              internship, and runs through every machine on the map. Most of them began with one question:{" "}
              <span className="font-semibold text-ink">what happens when this fails?</span>
            </p>
          </div>
        </div>
        <div className="lg:col-span-5">
          <div className="flex items-end justify-center gap-2 pb-6" aria-hidden="true">
            <IsoMachine spec={machines.balloonsat} scale={22} className="h-36 w-auto" />
            <IsoMachine spec={machines.careeros} scale={22} className="h-28 w-auto" />
          </div>
          <dl className="grid gap-2">
            {facts.map((f) => (
              <div key={f.k} className="grid grid-cols-[120px_1fr] gap-3 rounded-[18px] bg-white/70 px-4 py-3">
                <dt className="text-[14.5px] text-muted">{f.k}</dt>
                <dd className="text-[15.5px] font-medium text-ink">{f.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
