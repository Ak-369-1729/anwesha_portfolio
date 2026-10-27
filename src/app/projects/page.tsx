import type { Metadata } from "next";
import { ProjectArchive } from "@/components/projects/ProjectArchive";
import { flagships, projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "All projects",
  description:
    "Every system, project and experiment by Anwesha Kar: AI, backend and FastAPI, full-stack, cybersecurity, infrastructure, mobile and space telemetry.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-24 pt-28 sm:px-6 lg:px-10">
      <h1 className="font-display text-[clamp(2.6rem,6vw,4.8rem)] leading-[0.95] text-ink">All projects</h1>
      <p className="mt-4 max-w-[60ch] text-[18px] leading-relaxed text-dim">
        {projects.length} projects, including the {flagships.length} flagship systems with full case studies. Search by
        technology, problem or discipline.
      </p>
      <div className="mt-10">
        <ProjectArchive syncQuery level={2} />
      </div>
    </div>
  );
}
