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

  const field = "rounded-[14px] bg-field px-4 py-2.5 text-[15.5px] text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-cobalt";

  return (
    <section id="contact" aria-labelledby="contact-title" className="px-3 py-6 sm:px-4">
      <div className="mx-auto max-w-[1440px] overflow-hidden rounded-[36px] bg-cobalt px-6 py-14 text-white sm:px-10 lg:py-20">
        <p className="text-xl text-white sm:text-2xl">
          {mode === "client" ? "Have a problem worth building for?" : "Hiring, or looking for a research collaborator?"}
        </p>
        <h2 id="contact-title" className="font-display mt-2 text-[clamp(2.8rem,8.5vw,7rem)] leading-[0.9]">
          Let’s build the system.
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <form className="rounded-[28px] bg-card p-5 text-ink sm:p-7 lg:col-span-8" onSubmit={(e) => e.preventDefault()} aria-labelledby="brief-title">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p id="brief-title" className="text-[21px] font-bold tracking-[-0.01em]">
                Write a project brief
              </p>
              <p className="text-[14.5px] text-muted">Nothing is sent until you choose a channel.</p>
            </div>

            <fieldset className="mt-5">
              <legend className="label mb-2">What is it about?</legend>
              <div className="flex flex-wrap gap-2">
                {topics.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={topic === t.id}
                    onClick={() => setTopic(t.id)}
                    className={cn(
                      "rounded-full px-3.5 py-1.5 text-[14.5px] font-medium transition-colors",
                      topic === t.id ? "bg-ink text-white" : "bg-field text-dim hover:bg-field-deep hover:text-ink",
                    )}
                  >
                    {t.title}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5">
                <span className="label">Your name (optional)</span>
                <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={field} />
              </label>
              <label className="grid gap-1.5">
                <span className="label">Timeline</span>
                <select value={timeline} onChange={(e) => setTimeline(e.target.value)} className={field}>
                  {TIMELINES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="mt-4 grid gap-1.5">
              <span className="label">The problem</span>
              <textarea
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                rows={4}
                placeholder="What are you building, who is it for, and what does “done” look like?"
                className={cn(field, "resize-y leading-relaxed")}
              />
            </label>

            <div className="mt-5">
              <p className="label mb-1.5">Preview</p>
              <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-[14px] bg-[#f6f7fd] px-4 py-3 font-sans text-[14.5px] leading-relaxed text-dim scrollbar-thin" data-lenis-prevent>
                {brief}
              </pre>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {mailto ? (
                <a href={mailto} className="inline-flex items-center gap-2 rounded-full bg-cobalt px-5 py-3 text-[15.5px] font-semibold text-white hover:bg-ink">
                  <Mail size={16} aria-hidden="true" /> Discuss a project
                </a>
              ) : null}
              <button
                type="button"
                onClick={copy}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-5 py-3 text-[15.5px] font-semibold",
                  mailto ? "bg-field text-ink hover:bg-field-deep" : "bg-cobalt text-white hover:bg-ink",
                )}
              >
                {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                {copied ? "Copied" : "Copy brief"}
              </button>
              <span className="sr-only" aria-live="polite">
                {copied ? "Brief copied to clipboard" : ""}
              </span>
            </div>
          </form>

          <div className="grid content-start gap-4 lg:col-span-4">
            <div className="rounded-[28px] bg-white/10 p-5">
              <p className="text-[15px] text-white">Channels</p>
              <ul className="mt-3 grid gap-2">
                {channels.map((c) => {
                  const Icon = ICONS[c.id];
                  return (
                    <li key={c.id}>
                      <a
                        href={c.href}
                        target={c.id === "email" ? undefined : "_blank"}
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-[18px] bg-white px-4 py-3 text-ink transition-transform hover:-translate-y-0.5"
                      >
                        <Icon size={18} />
                        <span className="flex-1">
                          <span className="block text-[16px] font-semibold">{c.label}</span>
                          <span className="block text-[13.5px] text-muted">{c.note}</span>
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
              {!email ? <p className="mt-3 text-[14.5px] leading-relaxed text-white">Copy the brief and send it through any channel above.</p> : null}
            </div>
            <div className="rounded-[28px] bg-white/10 p-5">
              <p className="text-[15px] text-white">What happens next</p>
              <ol className="mt-3 grid gap-3 text-[15px] text-white">
                {[
                  "I read the brief and reply with clarifying questions.",
                  "We agree scope, milestones and how progress is reported.",
                  "I build in small increments you can review, with docs and handoff included.",
                ].map((s, i) => (
                  <li key={s} className="flex gap-3">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-lemon text-[13px] font-bold text-ink">{i + 1}</span>
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
