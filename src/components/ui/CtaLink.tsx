import Link from "next/link";
import { cn } from "@/lib/utils";

interface Props {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  external?: boolean;
  className?: string;
}

export function CtaLink({ href, children, variant = "primary", external, className }: Props) {
  const cls = cn(
    "inline-flex items-center rounded-full px-6 py-3 text-[16px] font-semibold transition-transform hover:-translate-y-0.5",
    variant === "primary"
      ? "bg-cobalt text-white shadow-[0_12px_28px_-14px_rgba(52,81,242,0.9)]"
      : "bg-card text-ink",
    className,
  );
  if (external) {
    return (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer">
        {children}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
