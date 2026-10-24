import type { ProjectStatus } from "@/data/types";
import { cn } from "@/lib/utils";

const tone: Record<ProjectStatus, string> = {
  "Active build": "bg-mint",
  Prototype: "bg-ice",
  "Concept + simulation": "bg-amber",
  Built: "bg-mint",
  Exploration: "bg-amber",
  Ongoing: "bg-mint",
};

export function StatusDot({ status, className }: { status: ProjectStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 font-mono text-[10.5px] text-muted", className)}>
      <span className={cn("size-1.5 rounded-full", tone[status])} aria-hidden="true" />
      {status}
    </span>
  );
}
