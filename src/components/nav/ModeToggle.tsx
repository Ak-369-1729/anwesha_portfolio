"use client";

import { useLab, type Mode } from "@/components/providers/LabProvider";
import { cn } from "@/lib/utils";

const modes: { id: Mode; label: string; hint: string }[] = [
  { id: "client", label: "For clients", hint: "Services, delivery and how to start a project" },
  { id: "recruiter", label: "For recruiters", hint: "Architecture, depth, research and experience" },
];

export function ModeToggle({ className }: { className?: string }) {
  const { mode, setMode } = useLab();
  return (
    <div role="radiogroup" aria-label="Who is reading" className={cn("flex rounded-full bg-card p-1", className)}>
      {modes.map((m) => {
        const active = mode === m.id;
        return (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={active}
            title={m.hint}
            onClick={() => setMode(m.id)}
            className={cn(
              "rounded-full px-3 py-1 text-[14px] font-medium transition-colors",
              active ? "bg-ink text-white" : "text-dim hover:text-ink",
            )}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
