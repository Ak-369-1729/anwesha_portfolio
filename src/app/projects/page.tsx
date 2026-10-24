import type { Metadata } from "next";
import { ProjectArchive } from "@/components/projects/ProjectArchive";
import { categories } from "@/data/categories";
import { flagships, projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Project archive",
  description:
    "Every system, project and experiment by Anwesha Kar — AI, backend and FastAPI, full-stack, cybersecurity, infrastructure, mobile and space telemetry.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-24 pt-28 sm:px-6 lg:px-10">
      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-8">
          <p className="label text-ice">Complete archive</p>
          <h1 className="mt-3 font-display text-5xl leading-[0.95] text-ivory sm:text-7xl">
            Everything in the lab, <span className="italic text-ivory-dim">indexed.</span>
          </h1>
        </div>
        <dl className="grid grid-cols-3 content-end gap-4 font-mono md:col-span-4">
          {[
            ["entries", projects.length],
            ["flagship", flagships.length],
            ["clusters", categories.length],
          ].map(([k, v]) => (
            <div key={k} className="border-t border-line pt-2">
              <dt className="text-[10px] uppercase tracking-[0.14em] text-muted">{k}</dt>
              <dd className="text-2xl text-ivory">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="mt-12">
        <ProjectArchive syncQuery level={2} />
      </div>
    </div>
  );
}
