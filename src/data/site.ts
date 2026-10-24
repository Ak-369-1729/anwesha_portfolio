/**
 * Central identity + contact configuration.
 *
 * Contact channels left as empty strings are not rendered anywhere on the site.
 * Fill them in (or set the matching NEXT_PUBLIC_* environment variable) to
 * switch them on — no component changes required.
 */
export const site = {
  name: "Anwesha Kar",
  shortName: "AK",
  lab: "Anwesha Kar, systems engineering portfolio",
  role: "AI/ML & Full-Stack Developer",
  disciplines: ["AI", "Systems", "Security", "Infrastructure"],
  thesis: "I don’t just build apps. I build systems.",
  description:
    "Anwesha Kar — AI/ML and full-stack developer building backend APIs, automation, security tooling and infrastructure. Case studies, architecture and live system simulations.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://anwesha-systems-lab.vercel.app",
  githubUser: "Ak-369-1729",
  links: {
    github: "https://github.com/Ak-369-1729",
    linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL ?? "",
    upwork: process.env.NEXT_PUBLIC_UPWORK_URL ?? "",
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  },
  availability: "Open to freelance builds, internships & research collaborations",
} as const;

export type ContactChannel = {
  id: "upwork" | "github" | "linkedin" | "email";
  label: string;
  href: string;
  note: string;
};

export function contactChannels(): ContactChannel[] {
  const { links } = site;
  const channels: ContactChannel[] = [
    { id: "upwork", label: "Upwork", href: links.upwork, note: "Contracts & milestones" },
    { id: "email", label: "Email", href: links.email ? `mailto:${links.email}` : "", note: links.email },
    { id: "linkedin", label: "LinkedIn", href: links.linkedin, note: "Internships & roles" },
    { id: "github", label: "GitHub", href: links.github, note: `@${site.githubUser}` },
  ];
  return channels.filter((c) => c.href);
}
