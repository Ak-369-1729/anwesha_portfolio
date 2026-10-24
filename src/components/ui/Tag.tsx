import { cn } from "@/lib/utils";

export function Tag({
  children,
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  tone?: "default" | "ice" | "amber" | "mint";
  className?: string;
}) {
  const tones = {
    default: "border-line text-ivory-dim",
    ice: "border-ice/30 text-ice",
    amber: "border-amber/35 text-amber",
    mint: "border-mint/30 text-mint",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap border px-1.5 py-0.5 font-mono text-[10.5px] leading-none tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
