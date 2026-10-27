import Link from "next/link";
import { IsoMachine } from "@/components/iso/IsoMachine";
import { flagships } from "@/data/projects";

const lost = { color: "#ff7aa8", parts: [{ x: 0, y: 0, w: 1.2, d: 1.2, h: 1.6 }] };

export default function NotFound() {
  return (
    <div className="mx-auto grid min-h-[80svh] max-w-[1440px] items-center gap-10 px-4 pb-16 pt-28 sm:px-6 md:grid-cols-12 lg:px-10">
      <div className="md:col-span-7">
        <p className="inline-flex rounded-full bg-card px-3.5 py-1.5 text-[14.5px] text-dim">Error 404</p>
        <h1 className="font-display mt-5 text-[clamp(2.4rem,6vw,4.8rem)] leading-[0.95] text-ink">
          This route does not appear on the Marauder’s Map.
        </h1>
        <p className="mt-5 max-w-lg text-[18px] leading-relaxed text-dim">
          The page may have moved, or it never existed. Every system that does exist is one click away.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="rounded-full bg-cobalt px-6 py-3 text-[16px] font-semibold text-white">
            Back to the map
          </Link>
          <Link href="/projects" className="rounded-full bg-card px-6 py-3 text-[16px] font-semibold text-ink">
            All projects
          </Link>
        </div>
        <ul className="mt-10 flex flex-wrap gap-2">
          {flagships.map((p) => (
            <li key={p.slug}>
              <Link href={`/projects/${p.slug}`} className="inline-block rounded-full bg-card px-3.5 py-1.5 text-[14.5px] font-medium text-ink hover:bg-white/70">
                {p.title.split(" /")[0]}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="grid place-items-center md:col-span-5" aria-hidden="true">
        <IsoMachine spec={lost} scale={60} className="h-64 w-auto -rotate-6" />
      </div>
    </div>
  );
}
