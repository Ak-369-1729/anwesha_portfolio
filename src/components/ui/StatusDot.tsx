import type { ProjectStatus } from "@/data/types";
import { cn } from "@/lib/utils";

const tone: Record<ProjectStatus, string> = {
  "Active build": "bg-verdigris",
  Prototype: "bg-blueprint",
  "Concept + simulation": "bg-ochre",
  Built: "bg-verdigris",
  Exploration: "bg-ochre",
  Ongoing: "bg-verdigris",
};

export function StatusDot({ status, className }: { status: ProjectStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 font-cond text-[13px] text-pencil", className)}>
      <span className={cn("size-2 rounded-full", tone[status])} aria-hidden="true" />
      {status}
    </span>
  );
}
