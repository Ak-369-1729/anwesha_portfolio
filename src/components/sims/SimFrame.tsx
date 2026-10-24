import { cn } from "@/lib/utils";

interface Props {
  title: string;
  status?: React.ReactNode;
  controls?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

/** Shared chrome for every interactive system model. All sims are labelled as illustrative. */
export function SimFrame({ title, status, controls, children, footer, className }: Props) {
  return (
    <div className={cn("frame flex flex-col overflow-hidden bg-bg-deep/80", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="size-1.5 animate-pulse-soft rounded-full bg-mint" aria-hidden="true" />
          <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ivory">{title}</span>
          <span className="font-mono text-[10px] text-muted">· simulation</span>
        </div>
        {status ? <div className="font-mono text-[10px] text-muted">{status}</div> : null}
      </div>
      {controls ? <div className="flex flex-wrap gap-2 border-b border-line px-4 py-2.5">{controls}</div> : null}
      <div className="relative flex-1">{children}</div>
      {footer ? <div className="border-t border-line">{footer}</div> : null}
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
  tone?: "default" | "danger" | "ice";
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
        "border px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.12em] transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        pressed
          ? "border-ivory bg-ivory text-bg-deep"
          : tone === "danger"
            ? "border-danger/40 text-danger hover:bg-danger/10"
            : tone === "ice"
              ? "border-ice/40 text-ice hover:bg-ice/10"
              : "border-line-strong text-ivory-dim hover:border-ivory hover:text-ivory",
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

export function SimLog({ lines, label = "event log" }: { lines: LogLine[]; label?: string }) {
  return (
    <div className="px-4 py-3">
      <p className="label mb-1.5 text-[10px]">{label}</p>
      <ol aria-live="polite" aria-label={label} className="h-[104px] overflow-hidden font-mono text-[11px] leading-[1.6]">
        {lines.slice(-6).map((l) => (
          <li
            key={l.id}
            className={cn(
              "truncate",
              l.tone === "ok" && "text-mint",
              l.tone === "warn" && "text-amber",
              l.tone === "err" && "text-danger",
              (!l.tone || l.tone === "info") && "text-ivory-dim",
            )}
          >
            <span className="text-muted">{l.t}</span> {l.text}
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
