import { cn } from "@/lib/utils";

interface Props {
  title: string;
  status?: React.ReactNode;
  controls?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

/** A detail drawing: one working model, clearly marked as a simulation. */
export function SimFrame({ title, status, controls, children, footer, className }: Props) {
  return (
    <div className={cn("flex flex-col overflow-hidden border border-ink bg-sheet", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-ink px-4 py-2.5">
        <p className="text-[15px] font-semibold text-ink">
          {title} <span className="font-cond font-normal text-pencil">simulation</span>
        </p>
        {status ? <div className="font-cond text-[13px] text-pencil">{status}</div> : null}
      </div>
      {controls ? <div className="flex flex-wrap gap-2 border-b border-line-strong px-4 py-2.5">{controls}</div> : null}
      <div className="relative flex-1">{children}</div>
      {footer ? <div className="border-t border-line-strong">{footer}</div> : null}
    </div>
  );
}

export function SimButton({
  children,
  onClick,
  tone = "default",
  pressed,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  tone?: "default" | "danger" | "primary";
  pressed?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      disabled={disabled}
      className={cn(
        "border px-2.5 py-1 font-cond text-[13.5px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        pressed
          ? "border-ink bg-ink text-paper"
          : tone === "danger"
            ? "border-redline text-redline hover:bg-redline/10"
            : tone === "primary"
              ? "border-blueprint text-blueprint hover:bg-blueprint/10"
              : "border-line-strong text-graphite hover:border-ink hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

export interface LogLine {
  id: number;
  t: string;
  text: string;
  tone?: "ok" | "warn" | "err" | "info";
}

export function SimLog({ lines, label = "Event log" }: { lines: LogLine[]; label?: string }) {
  return (
    <div className="px-4 py-3">
      <p className="label mb-1.5">{label}</p>
      <ol aria-live="polite" aria-label={label} className="h-[110px] overflow-hidden font-cond text-[13px] leading-[1.6]">
        {lines.slice(-6).map((l) => (
          <li
            key={l.id}
            className={cn(
              "truncate",
              l.tone === "ok" && "text-verdigris",
              l.tone === "warn" && "text-ochre",
              l.tone === "err" && "text-redline",
              (!l.tone || l.tone === "info") && "text-graphite",
            )}
          >
            <span className="text-pencil">{l.t}</span> {l.text}
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Timestamp label for log lines, relative to sim start. */
export function stamp(start: number) {
  const s = (performance.now() - start) / 1000;
  return `+${s.toFixed(1).padStart(5, "0")}s`;
}
