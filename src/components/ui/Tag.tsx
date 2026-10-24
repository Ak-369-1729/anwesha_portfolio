import { cn } from "@/lib/utils";

export function Tag({
  children,
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  tone?: "default" | "blueprint";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap border px-1.5 py-0.5 font-cond text-[12.5px] leading-none",
        tone === "blueprint" ? "border-blueprint/50 text-blueprint" : "border-line-strong text-graphite",
        className,
      )}
    >
      {children}
    </span>
  );
}
