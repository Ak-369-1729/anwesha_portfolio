export interface SectionDef {
  id: string;
  label: string;
  code: string;
  /** Group shown in the persistent navigation. */
  nav?: "LAB" | "PROJECTS" | "ABOUT" | "LOG" | "CONTACT";
}

/** Home page sections in scroll order. */
export const sections: SectionDef[] = [
  { id: "top", label: "Intro", code: "00" },
  { id: "lab", label: "Engineering Universe", code: "01", nav: "LAB" },
  { id: "systems", label: "Flagship systems", code: "02", nav: "LAB" },
  { id: "services", label: "Services & depth", code: "03", nav: "LAB" },
  { id: "projects", label: "Project archive", code: "04", nav: "PROJECTS" },
  { id: "stack", label: "Technology graph", code: "05", nav: "PROJECTS" },
  { id: "process", label: "How I work", code: "06", nav: "ABOUT" },
  { id: "about", label: "About", code: "07", nav: "ABOUT" },
  { id: "log", label: "Engineering timeline", code: "08", nav: "LOG" },
  { id: "buildlog", label: "Build log", code: "09", nav: "LOG" },
  { id: "contact", label: "Contact", code: "10", nav: "CONTACT" },
];

export const navItems = [
  { label: "LAB", target: "lab" },
  { label: "PROJECTS", target: "projects" },
  { label: "ABOUT", target: "about" },
  { label: "LOG", target: "log" },
  { label: "CONTACT", target: "contact" },
] as const;
