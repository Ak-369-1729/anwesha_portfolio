export interface SectionDef {
  id: string;
  label: string;
  /** Group shown in the persistent navigation. */
  nav?: NavLabel;
}

export type NavLabel = "Work" | "Projects" | "About" | "Timeline" | "Contact";

/** Home page sections in scroll order. */
export const sections: SectionDef[] = [
  { id: "top", label: "Drawing", nav: "Work" },
  { id: "systems", label: "Run the systems", nav: "Work" },
  { id: "services", label: "Services", nav: "Work" },
  { id: "projects", label: "All projects", nav: "Projects" },
  { id: "stack", label: "Tools and where they were used", nav: "Projects" },
  { id: "process", label: "How a project runs", nav: "About" },
  { id: "about", label: "About", nav: "About" },
  { id: "log", label: "Timeline", nav: "Timeline" },
  { id: "buildlog", label: "GitHub activity", nav: "Timeline" },
  { id: "contact", label: "Contact", nav: "Contact" },
];

export const navItems: { label: NavLabel; target: string }[] = [
  { label: "Work", target: "systems" },
  { label: "Projects", target: "projects" },
  { label: "About", target: "about" },
  { label: "Timeline", target: "log" },
  { label: "Contact", target: "contact" },
];
