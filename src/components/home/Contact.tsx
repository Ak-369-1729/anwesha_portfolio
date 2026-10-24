"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Mail } from "lucide-react";
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
    <section id="contact" aria-labelledby="contact-title" className="border-t-2 border-ink bg-paper-deep py-16 sm:py-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <p className="text-xl text-graphite sm:text-2xl">
          {mode === "client" ? "Have a problem worth building for?" : "Hiring, or looking for a research collaborator?"}
        </p>
        <h2 id="contact-title" className="font-display mt-2 text-[clamp(2.8rem,9vw,7.5rem)] leading-[0.92] text-ink">
          Let’s build the system.
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <form className="frame p-5 sm:p-6 lg:col-span-8" onSubmit={(e) => e.preventDefault()} aria-labelledby="brief-title">
            <div className="flex items-baseline justify-between">
              <p id="brief-title" className="text-lg font-semibold text-ink">
                Write a project brief
              </p>
              <p className="font-cond text-[14px] text-pencil">Nothing is sent until you choose a channel.</p>
            </div>

            <fieldset className="mt-5">
              <legend className="label mb-2 text-[12.5px]">What is it about?</legend>
              <div className="flex flex-wrap gap-1.5">
                {topics.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={topic === t.id}
                    onClick={() => setTopic(t.id)}
                    className={cn(
                      "border px-2.5 py-1.5 text-[13px] transition-colors",
                      topic === t.id ? "border-ink bg-ink text-paper" : "border-line-strong text-ink hover:border-ink",
                    )}
                  >
                    {t.title}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5">
                <span className="label text-[12.5px]">Your name (optional)</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  className="border border-ink bg-sheet px-3 py-2 text-sm text-ink focus:border-blueprint focus:outline-none"
                />
              </label>
              <label className="grid gap-1.5">
                <span className="label text-[12.5px]">Timeline</span>
                <select
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  className="border border-ink bg-sheet px-3 py-2 text-sm text-ink focus:border-blueprint focus:outline-none"
                >
                  {TIMELINES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="mt-4 grid gap-1.5">
              <span className="label text-[12.5px]">The problem</span>
              <textarea
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                rows={4}
                placeholder="What are you building, who is it for, and what does “done” look like?"
                className="resize-y border border-ink bg-sheet px-3 py-2 text-sm leading-relaxed text-ink placeholder:text-pencil focus:border-blueprint focus:outline-none"
              />
            </label>

            <div className="mt-5">
              <p className="label mb-1.5 text-[12.5px]">Preview</p>
              <pre className="max-h-48 overflow-auto whitespace-pre-wrap border border-line-strong bg-paper px-3 py-2 font-cond text-[13.5px] leading-relaxed text-graphite scrollbar-thin" data-lenis-prevent>
                {brief}
              </pre>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {mailto ? (
                <a
                  href={mailto}
                  className="inline-flex items-center gap-2 bg-blueprint px-4 py-2.5 font-cond text-xs text-paper-deep hover:bg-ink"
                >
                  <Mail size={14} aria-hidden="true" /> Discuss a project
                </a>
              ) : null}
              <button
                type="button"
                onClick={copy}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2.5 font-cond text-xs",
                  mailto ? "border border-line-strong text-ink hover:border-blueprint hover:text-blueprint" : "bg-blueprint text-paper-deep hover:bg-ink",
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
              <p className="label text-[12.5px]">Channels</p>
              <ul className="mt-3 grid gap-1">
                {channels.map((c) => {
                  const Icon = ICONS[c.id];
                  return (
                    <li key={c.id}>
                      <a
                        href={c.href}
                        target={c.id === "email" ? undefined : "_blank"}
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 border-b border-line py-3 text-ink hover:text-blueprint"
                      >
                        <Icon size={16} />
                        <span className="flex-1">
                          <span className="block text-[15px]">{c.label}</span>
                          <span className="block font-cond text-[13px] text-pencil">{c.note}</span>
                        </span>
                        
                      </a>
                    </li>
                  );
                })}
              </ul>
              {!email ? (
                <p className="mt-3 text-[14px] leading-relaxed text-pencil">
                  Copy the brief and send it through any channel above.
                </p>
              ) : null}
            </div>
            <div className="frame p-5">
              <p className="label text-[12.5px]">What happens next</p>
              <ol className="mt-3 grid gap-3 text-[13px] text-graphite">
                {[
                  "I read the brief and reply with clarifying questions.",
                  "We agree scope, milestones and how progress is reported.",
                  "I build in small increments you can review, with docs and handoff included.",
                ].map((s, i) => (
                  <li key={s} className="flex gap-3">
                    <span className="font-cond text-[15px] text-pencil">{i + 1}</span>
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
