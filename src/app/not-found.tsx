import Link from "next/link";
import { flagships } from "@/data/projects";

export default function NotFound() {
  return (
    <div className="px-3 pb-16 pt-[72px] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1440px] border-2 border-ink p-1">
        <div className="drafting-grid border border-ink px-6 py-16 sm:px-12 sm:py-24">
          <p className="font-cond text-[15px] text-redline">Error 404. This page is not on the drawing.</p>
          <h1 className="font-display mt-3 max-w-4xl text-[clamp(2.2rem,6vw,4.8rem)] leading-[0.98] text-ink">
            This route does not appear on the Marauder’s Map.
          </h1>
          <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-graphite">
            The page may have moved, or it never existed. Every system that does exist is linked below.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/" className="bg-ink px-5 py-2.5 text-[15px] font-semibold text-paper hover:bg-blueprint">
              Back to the drawing
            </Link>
            <Link href="/projects" className="border border-ink px-5 py-2.5 text-[15px] font-semibold text-ink hover:border-blueprint hover:text-blueprint">
              All projects
            </Link>
          </div>
          <ul className="mt-12 flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
            {flagships.map((p) => (
              <li key={p.slug}>
                <Link href={`/projects/${p.slug}`} className="text-graphite underline decoration-line-strong underline-offset-4 hover:text-blueprint">
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
