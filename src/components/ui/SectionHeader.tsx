import { cn } from "@/lib/utils";

interface Props {
  code: string;
  kicker: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
  id?: string;
}

/** Research-notebook style section heading: folio code, kicker, serif title, optional margin note. */
export function SectionHeader({ code, kicker, title, lede, aside, className, id }: Props) {
  return (
    <header className={cn("grid gap-6 border-t border-line pt-6 md:grid-cols-12", className)}>
      <div className="flex items-start gap-3 md:col-span-3">
        <span className="font-mono text-xs text-ice">§{code}</span>
        <span className="label">{kicker}</span>
      </div>
      <div className="md:col-span-6">
        <h2 id={id} className="font-display text-4xl leading-[1.02] tracking-tight text-ivory sm:text-5xl">
          {title}
        </h2>
        {lede ? <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ivory-dim">{lede}</p> : null}
      </div>
      {aside ? (
        <aside className="font-mono text-[11px] leading-relaxed text-muted md:col-span-3 md:text-right">
          {aside}
        </aside>
      ) : null}
    </header>
  );
}
