import { cn } from "@/lib/utils";

interface Props {
  id: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  /** A short aside that tells the reader how to use the section. */
  note?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ id, title, lede, note, className }: Props) {
  return (
    <header className={cn("grid gap-x-12 gap-y-4 md:grid-cols-12 md:items-end", className)}>
      <h2 id={id} className="font-display text-[clamp(2.3rem,4.6vw,3.9rem)] leading-[0.95] text-ink md:col-span-7">
        {title}
      </h2>
      {lede || note ? (
        <div className="md:col-span-5">
          {lede ? <p className="max-w-[58ch] text-[17px] leading-relaxed text-dim">{lede}</p> : null}
          {note ? <p className="mt-2 text-[15px] text-muted">{note}</p> : null}
        </div>
      ) : null}
    </header>
  );
}
