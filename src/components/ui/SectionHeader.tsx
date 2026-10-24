import { cn } from "@/lib/utils";

interface Props {
  id: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  /** A short red-pencil margin note — only when it tells the reader how to use the section. */
  note?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ id, title, lede, note, className }: Props) {
  return (
    <header className={cn("grid gap-x-10 gap-y-3 border-t-2 border-ink pt-5 md:grid-cols-12", className)}>
      <h2 id={id} className="font-display text-[clamp(1.9rem,3.6vw,2.9rem)] leading-[1.02] text-ink md:col-span-7">
        {title}
      </h2>
      {lede || note ? (
        <div className="md:col-span-5 md:pt-1">
          {lede ? <p className="max-w-[60ch] text-[16px] leading-relaxed text-graphite">{lede}</p> : null}
          {note ? <p className="mt-2 font-cond text-[14px] text-redline">{note}</p> : null}
        </div>
      ) : null}
    </header>
  );
}
