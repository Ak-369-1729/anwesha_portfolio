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
    "inline-flex items-center px-5 py-2.5 text-[15px] font-semibold transition-colors",
    variant === "primary"
      ? "bg-ink text-paper hover:bg-blueprint"
      : "border border-ink text-ink hover:border-blueprint hover:text-blueprint",
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
