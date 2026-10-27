import { cn } from "@/lib/utils";

export function Tag({
  children,
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  tone?: "default" | "cobalt";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[13px] leading-none",
        tone === "cobalt" ? "bg-[#e6eaff] text-cobalt" : "bg-field text-dim",
        className,
      )}
    >
      {children}
    </span>
  );
}
