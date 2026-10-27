import type { ProjectStatus } from "@/data/types";
import { cn } from "@/lib/utils";

const tone: Record<ProjectStatus, string> = {
  "Active build": "bg-mint",
  Prototype: "bg-sky",
  "Concept + simulation": "bg-lemon",
  Built: "bg-mint",
  Exploration: "bg-lemon",
  Ongoing: "bg-mint",
};

export function StatusDot({ status, className }: { status: ProjectStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[13.5px] text-muted", className)}>
      <span className={cn("size-2 rounded-full", tone[status])} aria-hidden="true" />
      {status}
    </span>
  );
}
