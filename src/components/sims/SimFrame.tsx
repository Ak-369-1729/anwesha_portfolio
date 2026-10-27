import { cn } from "@/lib/utils";

interface Props {
  title: string;
  status?: React.ReactNode;
  controls?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

/** A working model, clearly marked as a simulation. */
export function SimFrame({ title, status, controls, children, footer, className }: Props) {
  return (
    <div className={cn("flex flex-col overflow-hidden rounded-[28px] bg-card shadow-[0_24px_60px_-40px_rgba(21,22,58,0.45)]", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 pb-2 pt-4">
        <p className="text-[16px] font-semibold text-ink">
          {title}{" "}
          <span className="ml-1 rounded-full bg-field px-2 py-0.5 text-[12.5px] font-medium text-muted">simulation</span>
        </p>
        {status ? <div className="text-[13.5px] text-muted">{status}</div> : null}
      </div>
      {controls ? <div className="flex flex-wrap gap-2 px-5 pb-3">{controls}</div> : null}
      <div className="relative mx-3 flex-1 overflow-hidden rounded-[20px] bg-field/60">{children}</div>
      {footer ? <div className="px-2 pb-2">{footer}</div> : <div className="h-3" />}
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
        "rounded-full px-3.5 py-1.5 text-[14px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        pressed
          ? "bg-ink text-white"
          : tone === "danger"
            ? "bg-[#ffe4e7] text-[#a91d33] hover:bg-[#ffd3d9]"
            : tone === "primary"
              ? "bg-[#e6eaff] text-[#2238c7] hover:bg-[#d8deff]"
              : "bg-field text-dim hover:bg-field-deep hover:text-ink",
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
      <ol aria-live="polite" aria-label={label} className="h-[112px] overflow-hidden text-[13.5px] leading-[1.6]">
        {lines.slice(-6).map((l) => (
          <li
            key={l.id}
            className={cn(
              "truncate",
              l.tone === "ok" && "text-green",
              l.tone === "warn" && "text-amber",
              l.tone === "err" && "text-red",
              (!l.tone || l.tone === "info") && "text-dim",
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
