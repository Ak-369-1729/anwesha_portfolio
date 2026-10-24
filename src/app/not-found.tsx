import Link from "next/link";
import { flagships } from "@/data/projects";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[100svh] items-center overflow-hidden bg-bg-deep pt-14">
      <div className="lab-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-40" aria-hidden="true">
        <defs>
          <pattern id="steps" width="90" height="60" patternUnits="userSpaceOnUse" patternTransform="rotate(-18)">
            <ellipse cx="20" cy="18" rx="4" ry="7" fill="#d8a657" opacity="0.18" />
            <ellipse cx="38" cy="38" rx="4" ry="7" fill="#d8a657" opacity="0.12" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#steps)" />
      </svg>
      <div className="relative mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <p className="font-mono text-xs text-amber">ERR 404 · ROUTE NOT FOUND</p>
        <h1 className="mt-4 max-w-4xl font-display text-[clamp(2.6rem,7vw,6rem)] leading-[0.95] text-ivory">
          This route does not appear on the <span className="italic text-amber">Marauder’s Map.</span>
        </h1>
        <p className="mt-5 max-w-lg text-ivory-dim">
          The page may have moved, or never existed. Every system that does exist is one click away.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="bg-ice px-4 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-bg-deep hover:bg-ivory">
            Return to the lab
          </Link>
          <Link href="/projects" className="border border-line-strong px-4 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-ivory hover:border-ice hover:text-ice">
            Project archive
          </Link>
        </div>
        <ul className="mt-12 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11px] text-muted">
          {flagships.map((p) => (
            <li key={p.slug}>
              <Link href={`/projects/${p.slug}`} className="hover:text-ice">
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
