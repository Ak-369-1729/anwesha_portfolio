import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  external?: boolean;
  className?: string;
  onClick?: () => void;
}

export function CtaLink({ href, children, variant = "primary", external, className, onClick }: Props) {
  const styles =
    variant === "primary"
      ? "bg-ice text-bg-deep hover:bg-ivory"
      : "border border-line-strong text-ivory hover:border-ice hover:text-ice";
  const cls = cn(
    "group inline-flex items-center gap-2 px-4 py-2.5 font-mono text-xs font-medium uppercase tracking-[0.14em] transition-colors",
    styles,
    className,
  );
  const icon = (
    <ArrowUpRight
      size={14}
      aria-hidden="true"
      className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
    />
  );
  if (external) {
    return (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer" onClick={onClick}>
        {children}
        {icon}
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Link href={href} className={cls} onClick={onClick}>
      {children}
      {icon}
    </Link>
  );
}
