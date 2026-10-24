"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Check, Copy, Mail } from "lucide-react";
import { useLab } from "@/components/providers/LabProvider";
import { GitHubIcon, LinkedInIcon, UpworkIcon } from "@/components/ui/BrandIcons";
import { serviceById, services } from "@/data/services";
import { contactChannels, site, type ContactChannel } from "@/data/site";
import type { ServiceId } from "@/data/types";
import { cn } from "@/lib/utils";

type Topic = ServiceId | "role" | "research";

const EXTRA_TOPICS: { id: Topic; title: string }[] = [
  { id: "role", title: "Internship / role" },
  { id: "research", title: "Research collaboration" },
];

const TIMELINES = ["As soon as possible", "Within a month", "1–3 months", "Exploring for now"];

const ICONS: Record<ContactChannel["id"], React.ComponentType<{ size?: number }>> = {
  upwork: UpworkIcon,
  github: GitHubIcon,
  linkedin: LinkedInIcon,
  email: Mail,
};

export function Contact() {
  const { mode, briefService, setBriefService } = useLab();
  const [topic, setTopic] = useState<Topic>("backend");
  const [problem, setProblem] = useState("");
  const [timeline, setTimeline] = useState(TIMELINES[1]);
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);
  const channels = contactChannels();
  const email = site.links.email;

  useEffect(() => {
    if (briefService) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- adopt a service chosen by a CTA elsewhere on the page
      setTopic(briefService);
      setBriefService(null);
    }
  }, [briefService, setBriefService]);

  useEffect(() => {
    // Contextual CTAs on case-study pages link to /?service=<id>#contact
    const s = new URLSearchParams(window.location.search).get("service") as ServiceId | null;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read the pre-selected service once after mount
    if (s && s in serviceById) setTopic(s);
    else if (mode === "recruiter") setTopic("role");
  }, [mode]);

  const topicTitle =
    topic in serviceById ? serviceById[topic as ServiceId].title : EXTRA_TOPICS.find((t) => t.id === topic)!.title;

  const brief = useMemo(
    () =>
      [
        `Hi Anwesha,`,
        ``,
        `Topic: ${topicTitle}`,
        `Timeline: ${timeline}`,
        ``,
        problem.trim() || "<Describe the problem, who it is for, and what “done” looks like>",
        ``,
        name.trim() ? `— ${name.trim()}` : "",
      ]
        .join("\n")
        .trim(),
    [topicTitle, timeline, problem, name],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(brief);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const mailto = email
    ? `mailto:${email}?subject=${encodeURIComponent(`Project: ${topicTitle}`)}&body=${encodeURIComponent(brief)}`
    : "";

  const topics: { id: Topic; title: string }[] = [...services.map((s) => ({ id: s.id as Topic, title: s.title })), ...EXTRA_TOPICS];

  return (
    <section id="contact" aria-labelledby="contact-title" className="relative overflow-hidden bg-bg-deep py-20 sm:py-28">
      <div className="lab-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="flex items-start gap-3 border-t border-line pt-6">
          <span className="font-mono text-xs text-ice">§10</span>
          <span className="label">Contact</span>
        </div>
        <p className="mt-10 font-display text-2xl italic text-ivory-dim sm:text-3xl">
          {mode === "client" ? "Have a problem worth building for?" : "Hiring, or looking for a research collaborator?"}
        </p>
        <h2 id="contact-title" className="mt-3 font-display text-[clamp(3rem,10vw,8.5rem)] leading-[0.9] tracking-[-0.02em] text-ivory">
          Let’s build <span className="italic text-ice">the system.</span>
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <form className="frame p-5 sm:p-6 lg:col-span-8" onSubmit={(e) => e.preventDefault()} aria-labelledby="brief-title">
            <div className="flex items-baseline justify-between">
              <p id="brief-title" className="label text-[10px] text-ice">
                Project brief composer
              </p>
              <p className="font-mono text-[10px] text-muted">nothing is sent until you choose a channel</p>
            </div>

            <fieldset className="mt-5">
              <legend className="label mb-2 text-[10px]">What is it about?</legend>
              <div className="flex flex-wrap gap-1.5">
                {topics.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={topic === t.id}
                    onClick={() => setTopic(t.id)}
                    className={cn(
                      "border px-2.5 py-1.5 text-[13px] transition-colors",
                      topic === t.id ? "border-ice bg-ice/10 text-ivory" : "border-line text-muted hover:text-ivory",
                    )}
                  >
                    {t.title}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5">
                <span className="label text-[10px]">Your name (optional)</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  className="border border-line bg-bg-deep px-3 py-2 text-sm text-ivory focus:border-ice focus:outline-none"
                />
              </label>
              <label className="grid gap-1.5">
                <span className="label text-[10px]">Timeline</span>
                <select
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  className="border border-line bg-bg-deep px-3 py-2 text-sm text-ivory focus:border-ice focus:outline-none"
                >
                  {TIMELINES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="mt-4 grid gap-1.5">
              <span className="label text-[10px]">The problem</span>
              <textarea
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                rows={4}
                placeholder="What are you building, who is it for, and what does “done” look like?"
                className="resize-y border border-line bg-bg-deep px-3 py-2 text-sm leading-relaxed text-ivory placeholder:text-muted focus:border-ice focus:outline-none"
              />
            </label>

            <div className="mt-5">
              <p className="label mb-1.5 text-[10px]">Preview</p>
              <pre className="max-h-48 overflow-auto whitespace-pre-wrap border border-line bg-bg px-3 py-2 font-mono text-[11.5px] leading-relaxed text-ivory-dim scrollbar-thin" data-lenis-prevent>
                {brief}
              </pre>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {mailto ? (
                <a
                  href={mailto}
                  className="inline-flex items-center gap-2 bg-ice px-4 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-bg-deep hover:bg-ivory"
                >
                  <Mail size={14} aria-hidden="true" /> Discuss a project
                </a>
              ) : null}
              <button
                type="button"
                onClick={copy}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.14em]",
                  mailto ? "border border-line-strong text-ivory hover:border-ice hover:text-ice" : "bg-ice text-bg-deep hover:bg-ivory",
                )}
              >
                {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
                {copied ? "Copied" : "Copy brief"}
              </button>
              <span className="sr-only" aria-live="polite">
                {copied ? "Brief copied to clipboard" : ""}
              </span>
            </div>
          </form>

          <div className="grid content-start gap-4 lg:col-span-4">
            <div className="frame p-5">
              <p className="label text-[10px]">Channels</p>
              <ul className="mt-3 grid gap-1">
                {channels.map((c) => {
                  const Icon = ICONS[c.id];
                  return (
                    <li key={c.id}>
                      <a
                        href={c.href}
                        target={c.id === "email" ? undefined : "_blank"}
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 border-b border-line py-3 text-ivory hover:text-ice"
                      >
                        <Icon size={16} />
                        <span className="flex-1">
                          <span className="block text-[15px]">{c.label}</span>
                          <span className="block font-mono text-[10.5px] text-muted">{c.note}</span>
                        </span>
                        <ArrowUpRight size={14} className="text-muted group-hover:text-ice" aria-hidden="true" />
                      </a>
                    </li>
                  );
                })}
              </ul>
              {!email ? (
                <p className="mt-3 text-[12.5px] leading-relaxed text-muted">
                  Copy the brief and send it through any channel above.
                </p>
              ) : null}
            </div>
            <div className="frame p-5">
              <p className="label text-[10px]">What happens next</p>
              <ol className="mt-3 grid gap-3 text-[13px] text-ivory-dim">
                {[
                  "I read the brief and reply with clarifying questions.",
                  "We agree scope, milestones and how progress is reported.",
                  "I build in small increments you can review, with docs and handoff included.",
                ].map((s, i) => (
                  <li key={s} className="flex gap-3">
                    <span className="font-mono text-[10.5px] text-ice">0{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
