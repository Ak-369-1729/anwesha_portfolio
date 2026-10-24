"use client";

import { useLab, type Mode } from "@/components/providers/LabProvider";
import { cn } from "@/lib/utils";

const modes: { id: Mode; label: string; hint: string }[] = [
  { id: "client", label: "Client", hint: "Services, delivery and how to start a project" },
  { id: "recruiter", label: "Recruiter", hint: "Architecture, depth, research and experience" },
];

export function ModeToggle({ className }: { className?: string }) {
  const { mode, setMode } = useLab();
  return (
    <div role="radiogroup" aria-label="Viewing mode" className={cn("flex border border-line bg-bg-deep/60 p-0.5", className)}>
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
              "px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.14em] transition-colors",
              active ? "bg-ivory text-bg-deep" : "text-muted hover:text-ivory",
            )}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
