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
    <div role="radiogroup" aria-label="Who is reading" className={cn("flex border border-ink", className)}>
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
              "px-2.5 py-1 text-[13.5px] font-medium transition-colors",
              active ? "bg-ink text-paper" : "text-ink hover:bg-paper-deep",
            )}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
