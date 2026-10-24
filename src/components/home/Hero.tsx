"use client";

import { useEffect, useRef } from "react";
import { ArrowDown } from "lucide-react";
import { useLab } from "@/components/providers/LabProvider";
import { CtaLink } from "@/components/ui/CtaLink";
import { categories } from "@/data/categories";
import { flagships, projects } from "@/data/projects";
import { site } from "@/data/site";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { scrollToId } from "@/lib/scroll";
import { ramp, useScrollProgress } from "@/lib/scrollProgress";
import { pad } from "@/lib/utils";
import { IntroCanvas } from "./IntroCanvas";

const builds = [
  "AI-powered apps",
  "FastAPI backends",
  "REST APIs",
  "Automation",
  "Dashboards",
  "Auth & access control",
  "Docker & deployment",
];

/** Scroll choreography: which layer is visible at which point of the pinned intro. */
const LAYERS = {
  intro: ramp([0, 0.16, 0.26], [1, 1, 0]),
  introY: ramp([0, 0.26], [0, -60]),
  question: ramp([0.2, 0.28, 0.42, 0.5], [0, 1, 1, 0]),
  built: ramp([0.54, 0.62, 0.8, 0.9], [0, 1, 1, 0]),
  enter: ramp([0.86, 0.95], [0, 1]),
  cue: ramp([0, 0.1], [1, 0]),
};

const rise = (delay: number) => ({ animationDelay: `${delay}ms` });

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLDivElement>(null);
  const builtRef = useRef<HTMLDivElement>(null);
  const enterRef = useRef<HTMLParagraphElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const { mode } = useLab();
  const progress = useScrollProgress(ref, 0, 1);

  useEffect(() => {
    if (reduce) return;
    return progress.subscribe((p) => {
      if (introRef.current) {
        introRef.current.style.opacity = String(LAYERS.intro(p));
        introRef.current.style.transform = `translateY(${LAYERS.introY(p)}px)`;
        introRef.current.style.visibility = p > 0.27 ? "hidden" : "visible";
      }
      if (questionRef.current) questionRef.current.style.opacity = String(LAYERS.question(p));
      if (builtRef.current) builtRef.current.style.opacity = String(LAYERS.built(p));
      if (enterRef.current) enterRef.current.style.opacity = String(LAYERS.enter(p));
      if (cueRef.current) {
        cueRef.current.style.opacity = String(LAYERS.cue(p));
        cueRef.current.style.visibility = p > 0.1 ? "hidden" : "visible";
      }
    });
  }, [progress, reduce]);

  const primary =
    mode === "client"
      ? { href: "/#contact", label: "Discuss your project" }
      : { href: "/#systems", label: "View flagship systems" };
  const secondary =
    mode === "client" ? { href: "/#services", label: "What I build" } : { href: "/#log", label: "Engineering timeline" };

  const stats = [
    { k: "systems indexed", v: pad(projects.length) },
    { k: "flagship", v: pad(flagships.length) },
    { k: "clusters", v: pad(categories.length) },
  ];

  return (
    <section
      id="top"
      ref={ref}
      aria-label="Introduction"
      className={reduce ? "relative h-[100svh] min-h-[640px]" : "relative h-[300svh]"}
    >
      <div className="sticky top-0 h-[100svh] min-h-[640px] overflow-hidden bg-bg-deep">
        <div className="lab-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
        <IntroCanvas progress={progress} staticFrame={reduce ? 0.7 : undefined} />

        {/* corner telemetry */}
        <div className="pointer-events-none absolute inset-x-0 top-16 z-10 mx-auto flex max-w-[1440px] justify-between px-4 sm:px-6 lg:px-10">
          <span className="label">Fig. 00 — Origin</span>
          <dl className="hidden gap-5 sm:flex">
            {stats.map((s) => (
              <div key={s.k} className="flex items-baseline gap-1.5">
                <dt className="label text-[10px]">{s.k}</dt>
                <dd className="font-mono text-xs text-ivory">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Layer A — identity, thesis, CTAs (visible immediately, animated by CSS so it never waits for JS) */}
        <div
          ref={introRef}
          className="relative z-10 mx-auto flex h-full max-w-[1440px] flex-col justify-center px-4 will-change-[opacity,transform] sm:px-6 lg:px-10"
        >
          <p className="label mb-5 animate-rise text-ice" style={rise(60)}>
            {site.lab}
          </p>
          <h1
            className="animate-rise font-display text-[clamp(3.6rem,13vw,10.5rem)] leading-[0.86] tracking-[-0.02em] text-ivory"
            style={rise(120)}
          >
            Anwesha
            <br />
            <span className="italic text-ivory-dim">Kar</span>
          </h1>
          <p className="mt-6 animate-rise font-mono text-[11px] tracking-[0.3em] text-ice sm:text-xs" style={rise(300)}>
            {site.disciplines.map((d) => d.toUpperCase()).join(" • ")}
          </p>
          <div className="mt-6 max-w-xl animate-rise" style={rise(380)}>
            <p className="font-display text-2xl leading-snug text-ivory sm:text-3xl">{site.thesis}</p>
            <p className="mt-3 text-[15px] leading-relaxed text-ivory-dim">
              {site.role} — backend APIs, automation, security tooling and the infrastructure that keeps them running.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <CtaLink href={primary.href}>{primary.label}</CtaLink>
              <CtaLink href={secondary.href} variant="ghost">
                {secondary.label}
              </CtaLink>
            </div>
          </div>

          <div
            className="absolute inset-x-4 bottom-8 flex animate-rise flex-wrap items-end justify-between gap-4 sm:inset-x-6 lg:inset-x-10"
            style={rise(600)}
          >
            <div className="max-w-2xl">
              <p className="label mb-2 text-[10px]">Builds</p>
              <ul className="flex flex-wrap gap-x-3 gap-y-1.5 font-mono text-[11px] text-ivory-dim">
                {builds.map((b, i) => (
                  <li key={b} className="flex items-center gap-3">
                    {i > 0 ? (
                      <span className="text-line-strong" aria-hidden="true">
                        /
                      </span>
                    ) : null}
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <p className="hidden items-center gap-2 font-mono text-[10.5px] text-mint sm:flex">
              <span className="size-1.5 animate-pulse-soft rounded-full bg-mint" aria-hidden="true" />
              {site.availability}
            </p>
          </div>
        </div>

        {!reduce ? (
          <>
            {/* Layer B — the question */}
            <div
              ref={questionRef}
              style={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6"
            >
              <p className="max-w-3xl text-center font-display text-[clamp(2.2rem,6vw,4.8rem)] italic leading-[1.02] text-ivory">
                Every system starts as a question.
              </p>
            </div>

            {/* Layer C — the answer */}
            <div
              ref={builtRef}
              style={{ opacity: 0 }}
              className="pointer-events-none absolute inset-x-0 bottom-[12%] z-10 flex justify-center px-6"
            >
              <p className="max-w-3xl text-center font-display text-[clamp(2rem,5vw,4rem)] leading-[1.02] text-ivory">
                These are the ones I <span className="italic text-ice">decided to build.</span>
              </p>
            </div>

            <p
              ref={enterRef}
              style={{ opacity: 0 }}
              className="label pointer-events-none absolute inset-x-0 bottom-10 z-10 text-center text-ice"
            >
              Entering the Engineering Universe
            </p>

            <div
              ref={cueRef}
              className="absolute right-4 top-24 z-20 flex flex-col items-end gap-2 sm:bottom-28 sm:right-6 sm:top-auto lg:right-10"
            >
              <span className="label hidden text-[10px] sm:block">Scroll to assemble the system</span>
              <button
                type="button"
                onClick={() => scrollToId("lab")}
                className="flex items-center gap-2 border border-line-strong bg-bg-deep/60 px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ivory-dim backdrop-blur hover:border-ice hover:text-ice"
              >
                Skip intro <ArrowDown size={12} aria-hidden="true" />
              </button>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
