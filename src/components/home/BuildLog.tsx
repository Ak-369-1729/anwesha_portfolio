"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GitCommitHorizontal, RefreshCw, Star } from "lucide-react";
import { GitHubIcon } from "@/components/ui/BrandIcons";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { projects } from "@/data/projects";
import { site } from "@/data/site";

interface Repo {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  fork: boolean;
}

interface GhEvent {
  id: string;
  type: string;
  repo: { name: string };
  created_at: string;
  payload: { commits?: unknown[]; size?: number; ref_type?: string };
}

interface Data {
  publicRepos: number;
  repos: Repo[];
  events: GhEvent[];
  fetchedAt: number;
}

type State = { status: "loading" } | { status: "ready"; data: Data } | { status: "error" };

const CACHE_KEY = "ak-buildlog-v1";
const TTL = 15 * 60 * 1000;
const API = "https://api.github.com";

async function load(): Promise<Data> {
  const headers = { Accept: "application/vnd.github+json" };
  const [user, repos, events] = await Promise.all([
    fetch(`${API}/users/${site.githubUser}`, { headers }),
    fetch(`${API}/users/${site.githubUser}/repos?per_page=100&sort=pushed`, { headers }),
    fetch(`${API}/users/${site.githubUser}/events/public?per_page=40`, { headers }),
  ]);
  if (!user.ok || !repos.ok) throw new Error(`GitHub responded ${user.status}/${repos.status}`);
  const u = (await user.json()) as { public_repos: number };
  return {
    publicRepos: u.public_repos,
    repos: ((await repos.json()) as Repo[]).filter((r) => !r.fork),
    events: events.ok ? ((await events.json()) as GhEvent[]) : [],
    fetchedAt: Date.now(),
  };
}

const key = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Links a repository to a flagship case study when its name matches the project's slug, title or alias. */
const caseStudyFor = (repo: string) => {
  const k = key(repo);
  return projects.find(
    (p) => p.tier === 1 && [p.slug, p.title.split(" /")[0], ...(p.aliases ?? [])].some((n) => key(n) === k),
  );
};

function ago(iso: string) {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 3600) return `${Math.max(1, Math.round(d / 60))}m ago`;
  if (d < 86400) return `${Math.round(d / 3600)}h ago`;
  if (d < 86400 * 30) return `${Math.round(d / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en", { month: "short", year: "numeric" });
}

function describe(e: GhEvent) {
  const repo = e.repo.name.split("/")[1] ?? e.repo.name;
  switch (e.type) {
    case "PushEvent": {
      const n = e.payload.size ?? e.payload.commits?.length ?? 0;
      return n ? `pushed ${n} commit${n === 1 ? "" : "s"} to ${repo}` : `pushed to ${repo}`;
    }
    case "CreateEvent":
      return `created ${e.payload.ref_type ?? "ref"} in ${repo}`;
    case "PullRequestEvent":
      return `pull request activity in ${repo}`;
    case "IssuesEvent":
      return `issue activity in ${repo}`;
    case "WatchEvent":
      return `starred ${e.repo.name}`;
    default:
      return `${e.type.replace("Event", "").toLowerCase()} · ${repo}`;
  }
}

export function BuildLog() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached && attempt === 0) {
        const data = JSON.parse(cached) as Data;
        if (Date.now() - data.fetchedAt < TTL) {
          // eslint-disable-next-line react-hooks/set-state-in-effect -- serve a fresh session cache instantly
          setState({ status: "ready", data });
          return;
        }
      }
    } catch {
      /* cache unavailable */
    }
    setState({ status: "loading" });
    load()
      .then((data) => {
        if (cancelled) return;
        setState({ status: "ready", data });
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
        } catch {
          /* ignore */
        }
      })
      .catch(() => !cancelled && setState({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const languages =
    state.status === "ready"
      ? Object.entries(
          state.data.repos.reduce<Record<string, number>>((acc, r) => {
            if (r.language) acc[r.language] = (acc[r.language] ?? 0) + 1;
            return acc;
          }, {}),
        ).sort((a, b) => b[1] - a[1])
      : [];
  const langTotal = languages.reduce((s, [, n]) => s + n, 0);
  const palette = ["#2d5be3", "#87570c", "#2b7a4b", "#a8456a", "#4a5fa0", "#6b48b0", "#6a5c0e", "#5e6977"];

  return (
    <section id="buildlog" aria-labelledby="buildlog-title" className="py-14 sm:py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <SectionHeader
          id="buildlog-title"
          title="Recent GitHub activity"
          lede="Repositories, languages and public activity, fetched from the GitHub API in your browser when you load the page."
          note={
            <a href={site.links.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-blueprint underline underline-offset-4">
              <GitHubIcon size={13} /> github.com/{site.githubUser}
            </a>
          }
        />

        <div className="mt-10" aria-live="polite" aria-busy={state.status === "loading"}>
          {state.status === "loading" ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12" role="status">
              <span className="sr-only">Loading GitHub activity…</span>
              {[0, 1].map((k) => (
                <div key={k} className={`frame p-5 ${k === 0 ? "lg:col-span-8" : "lg:col-span-4"}`}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <div key={i} className="mb-3 h-9 animate-pulse-soft bg-paper-deep" />
                  ))}
                </div>
              ))}
            </div>
          ) : state.status === "error" ? (
            <div className="frame flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center">
              <div className="flex-1">
                <p className="font-cond text-[13px] text-ochre">GitHub didn’t respond</p>
                <p className="mt-1 text-sm text-graphite">
                  GitHub’s API didn’t answer — usually a rate limit or a network block. The full profile is one click away.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAttempt((a) => a + 1)}
                className="inline-flex items-center gap-2 border border-line-strong px-3 py-2 font-cond text-[13px] text-ink hover:border-blueprint hover:text-blueprint"
              >
                <RefreshCw size={13} aria-hidden="true" /> Retry
              </button>
              <a
                href={site.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blueprint px-3 py-2 font-cond text-[13px] text-paper-deep hover:bg-ink"
              >
                <GitHubIcon size={13} /> Open GitHub
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="frame lg:col-span-8">
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line px-5 py-3">
                  <p className="label text-[12.5px]">Recently pushed repositories</p>
                  <p className="font-cond text-[13px] text-pencil">
                    {state.data.publicRepos} public repos · fetched {ago(new Date(state.data.fetchedAt).toISOString())}
                  </p>
                </div>
                {state.data.repos.length ? (
                  <ul>
                    {state.data.repos.slice(0, 8).map((r) => {
                      const study = caseStudyFor(r.name);
                      return (
                        <li
                          key={r.name}
                          className="relative grid gap-1 border-b border-line px-5 py-3 last:border-b-0 hover:bg-sheet sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-4"
                        >
                          <span>
                            <a
                              href={r.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-cond text-[13px] text-ink after:absolute after:inset-0 hover:text-blueprint"
                            >
                              {r.name}
                              <span className="sr-only"> (opens GitHub in a new tab)</span>
                            </a>
                            {r.description ? <span className="mt-0.5 block text-[13px] text-pencil">{r.description}</span> : null}
                          </span>
                          <span className="flex items-center gap-3 font-cond text-[13px] text-pencil">
                            {study ? (
                              <Link href={`/projects/${study.slug}`} className="relative z-10 text-blueprint hover:text-ink">
                                Case study
                              </Link>
                            ) : null}
                            {r.language ? <span>{r.language}</span> : null}
                            {r.stargazers_count ? (
                              <span className="inline-flex items-center gap-1">
                                <Star size={11} aria-hidden="true" /> {r.stargazers_count}
                              </span>
                            ) : null}
                            <span>{ago(r.pushed_at)}</span>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="px-5 py-6 text-sm text-pencil">No public repositories yet.</p>
                )}
              </div>
              <div className="grid content-start gap-4 lg:col-span-4">
                <div className="frame p-5">
                  <p className="label text-[12.5px]">Languages by repository</p>
                  {langTotal ? (
                    <>
                      <div className="mt-3 flex h-2 overflow-hidden" aria-hidden="true">
                        {languages.map(([l, n], i) => (
                          <span key={l} style={{ width: `${(n / langTotal) * 100}%`, background: palette[i % palette.length] }} />
                        ))}
                      </div>
                      <ul className="mt-3 grid grid-cols-2 gap-1.5 font-cond text-[13px]">
                        {languages.slice(0, 8).map(([l, n], i) => (
                          <li key={l} className="flex items-center gap-2 text-graphite">
                            <span className="size-2" style={{ background: palette[i % palette.length] }} aria-hidden="true" />
                            {l} <span className="text-pencil">{n}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-pencil">No language data yet.</p>
                  )}
                </div>
                <div className="frame p-5">
                  <p className="label text-[12.5px]">Recent public activity</p>
                  {state.data.events.length ? (
                    <ul className="mt-3 grid gap-2">
                      {state.data.events.slice(0, 7).map((e) => (
                        <li key={e.id} className="flex gap-2 text-[14px] leading-snug text-graphite">
                          <GitCommitHorizontal size={14} className="mt-0.5 shrink-0 text-blueprint" aria-hidden="true" />
                          <span className="flex-1">{describe(e)}</span>
                          <span className="shrink-0 font-cond text-[12.5px] text-pencil">{ago(e.created_at)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-pencil">No recent public events.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
