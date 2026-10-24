"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { ArrowRight, Compass, Cpu, FolderGit2, Mail, Search, Sparkles, ToggleRight } from "lucide-react";
import { useLab, type Mode } from "@/components/providers/LabProvider";
import { categoryById } from "@/data/categories";
import { flagships } from "@/data/projects";
import { sections } from "@/data/sections";
import { contactChannels, site } from "@/data/site";
import { allTechnologies } from "@/data/technologies";
import { scrollToId } from "@/lib/scroll";
import { searchProjects } from "@/lib/search";
import { cn } from "@/lib/utils";

type Action =
  | { type: "route"; href: string }
  | { type: "section"; id: string }
  | { type: "mode"; mode: Mode }
  | { type: "external"; href: string }
  | { type: "egg"; egg: "lumos" | "nox" | "mischief" };

interface Item {
  id: string;
  group: string;
  title: string;
  hint?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  action: Action;
}

const EGGS: Record<string, Item> = {
  lumos: {
    id: "egg-lumos",
    group: "✦",
    title: "Lumos",
    hint: "Mark every wire in red pencil",
    icon: Sparkles,
    action: { type: "egg", egg: "lumos" },
  },
  nox: { id: "egg-nox", group: "✦", title: "Nox", hint: "Lights down", icon: Sparkles, action: { type: "egg", egg: "nox" } },
  "mischief managed": {
    id: "egg-mischief",
    group: "✦",
    title: "Mischief managed",
    hint: "Close the map",
    icon: Sparkles,
    action: { type: "egg", egg: "mischief" },
  },
};

const technologies = allTechnologies();

function buildItems(query: string, mode: Mode): Item[] {
  const q = query.trim().toLowerCase();

  const egg = EGGS[q];
  if (egg) return [egg];

  const sectionItems: Item[] = sections
    .filter((s) => s.id !== "top")
    .map((s) => ({
      id: `section-${s.id}`,
      group: "Navigate",
      title: s.label,
      icon: Compass,
      action: { type: "section", id: s.id },
    }));

  const actionItems: Item[] = [
    {
      id: "mode-switch",
      group: "Actions",
      title: mode === "client" ? "Switch to Recruiter mode" : "Switch to Client mode",
      hint: mode === "client" ? "Depth, architecture, research" : "Services and delivery",
      icon: ToggleRight,
      action: { type: "mode", mode: mode === "client" ? "recruiter" : "client" },
    },
    {
      id: "archive",
      group: "Actions",
      title: "Open the full project archive",
      icon: FolderGit2,
      action: { type: "route", href: "/projects" },
    },
    {
      id: "github",
      group: "Actions",
      title: "Open GitHub",
      hint: `@${site.githubUser}`,
      icon: FolderGit2,
      action: { type: "external", href: site.links.github },
    },
    {
      id: "contact",
      group: "Actions",
      title: "Contact — discuss a project",
      icon: Mail,
      action: { type: "section", id: "contact" },
    },
    ...contactChannels()
      .filter((c) => c.id !== "github")
      .map<Item>((c) => ({
        id: `channel-${c.id}`,
        group: "Actions",
        title: `Open ${c.label}`,
        hint: c.note,
        icon: Mail,
        action: { type: "external", href: c.href },
      })),
  ];

  if (!q) {
    const featured: Item[] = flagships.map((p) => ({
      id: `project-${p.slug}`,
      group: "Flagship systems",
      title: p.title,
      hint: categoryById[p.category].short,
      icon: Cpu,
      action: { type: "route", href: `/projects/${p.slug}` },
    }));
    return [...featured, ...actionItems, ...sectionItems];
  }

  const projectItems: Item[] = searchProjects(q)
    .slice(0, 8)
    .map(({ project: p, matched }) => ({
      id: `project-${p.slug}`,
      group: "Projects",
      title: p.title,
      hint: matched.slice(0, 3).join(" · ") || categoryById[p.category].short,
      icon: Cpu,
      action: { type: "route", href: p.tier === 1 ? `/projects/${p.slug}` : `/projects?q=${encodeURIComponent(p.title)}` },
    }));

  const techItems: Item[] = technologies
    .filter((t) => t.name.toLowerCase().includes(q))
    .slice(0, 5)
    .map((t) => ({
      id: `tech-${t.name}`,
      group: "Technologies",
      title: `Projects using ${t.name}`,
      hint: `${t.count}`,
      icon: Search,
      action: { type: "route", href: `/projects?q=${encodeURIComponent(t.name)}` },
    }));

  const match = (s: string) => s.toLowerCase().includes(q);
  return [
    ...projectItems,
    ...techItems,
    ...sectionItems.filter((i) => match(i.title)),
    ...actionItems.filter((i) => match(i.title) || (i.hint && match(i.hint))),
  ];
}

export function CommandPalette() {
  const { paletteOpen, setPaletteOpen, mode, setMode, setLumos, triggerMischief } = useLab();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);
  const listId = useId();

  const items = useMemo(() => buildItems(query, mode), [query, mode]);

  const close = useCallback(() => {
    setPaletteOpen(false);
    setQuery("");
    setActiveIndex(0);
    restoreFocus.current?.focus?.();
  }, [setPaletteOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (!paletteOpen) restoreFocus.current = document.activeElement as HTMLElement;
        setPaletteOpen(!paletteOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paletteOpen, setPaletteOpen]);

  useEffect(() => {
    if (!paletteOpen) return;
    if (!restoreFocus.current) restoreFocus.current = document.activeElement as HTMLElement;
    inputRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [paletteOpen]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const run = useCallback(
    (item: Item) => {
      const a = item.action;
      close();
      const goSection = (id: string) => {
        if (pathname === "/") scrollToId(id);
        else router.push(`/#${id}`);
      };
      switch (a.type) {
        case "route":
          router.push(a.href);
          break;
        case "section":
          goSection(a.id);
          break;
        case "mode":
          setMode(a.mode);
          break;
        case "external":
          window.open(a.href, "_blank", "noopener,noreferrer");
          break;
        case "egg":
          if (a.egg === "lumos") {
            setLumos(true);
            goSection("top");
          } else if (a.egg === "nox") setLumos(false);
          else {
            triggerMischief();
            goSection("colophon");
          }
          break;
      }
    },
    [close, pathname, router, setMode, setLumos, triggerMischief],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (items.length ? (i + 1) % items.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (items.length ? (i - 1 + items.length) % items.length : 0));
    } else if (e.key === "Home") {
      setActiveIndex(0);
    } else if (e.key === "End") {
      setActiveIndex(Math.max(0, items.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = items[activeIndex];
      if (item) run(item);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Tab") {
      // Keep focus inside the dialog: the input is the only tabbable element.
      e.preventDefault();
    }
  };

  if (!paletteOpen) return null;

  let lastGroup = "";
  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center px-3 pt-[12vh] sm:px-6">
      <button
        type="button"
        aria-label="Close command palette"
        tabIndex={-1}
        className="absolute inset-0 bg-paper-deep/70 backdrop-blur-sm"
        onClick={close}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="frame relative w-full max-w-xl bg-sheet shadow-[0_24px_60px_-24px_rgba(27,47,110,0.45)]"
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search size={16} className="text-blueprint" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            placeholder="Search projects, technologies, sections…"
            className="h-14 flex-1 bg-transparent font-sans text-[15px] text-ink placeholder:text-pencil focus:outline-none"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={items[activeIndex] ? `${listId}-${activeIndex}` : undefined}
            aria-autocomplete="list"
            aria-label="Search the lab"
            spellCheck={false}
            autoComplete="off"
          />
          <kbd className="font-cond text-[12.5px] text-pencil">ESC</kbd>
        </div>

        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label="Results"
          data-lenis-prevent
          className="scrollbar-thin max-h-[52vh] overflow-y-auto py-2"
        >
          {items.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-pencil" role="presentation">
              No results for “{query}”. Try <span className="text-ink">AI</span>,{" "}
              <span className="text-ink">FastAPI</span>, <span className="text-ink">Docker</span> or{" "}
              <span className="text-ink">space</span>.
            </li>
          ) : (
            items.map((item, index) => {
              const header = item.group !== lastGroup ? item.group : null;
              lastGroup = item.group;
              const Icon = item.icon;
              const active = index === activeIndex;
              return (
                <li key={item.id} role="presentation">
                  {header ? (
                    <div className="label px-4 pb-1 pt-3 text-[12.5px]" role="presentation">
                      {header}
                    </div>
                  ) : null}
                  <div
                    id={`${listId}-${index}`}
                    role="option"
                    aria-selected={active}
                    data-index={index}
                    onMouseMove={() => setActiveIndex(index)}
                    onClick={() => run(item)}
                    className={cn(
                      "mx-2 flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm",
                      active ? "bg-paper-deep text-ink" : "text-graphite",
                    )}
                  >
                    <Icon size={15} className={active ? "text-blueprint" : "text-pencil"} />
                    <span className="flex-1 truncate">{item.title}</span>
                    {item.hint ? <span className="truncate font-cond text-[13px] text-pencil">{item.hint}</span> : null}
                    {active ? <ArrowRight size={14} className="text-blueprint" aria-hidden="true" /> : null}
                  </div>
                </li>
              );
            })
          )}
        </ul>

        <div className="flex items-center justify-between border-t border-line px-4 py-2 font-cond text-[12.5px] text-pencil">
          <span>↑↓ navigate · ↵ open · esc close</span>
          <span>{items.length} results</span>
        </div>
      </div>
    </div>
  );
}
