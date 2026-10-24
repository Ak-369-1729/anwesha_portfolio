import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import { CommandPalette } from "@/components/palette/CommandPalette";
import { Footer } from "@/components/Footer";
import { SiteNav } from "@/components/nav/SiteNav";
import { LabProvider } from "@/components/providers/LabProvider";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { site } from "@/data/site";
import "./globals.css";

/** One family; its width axis does the work of display, text and note faces. */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const title = `${site.name} — AI, Systems & Security Engineer`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: title, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.lab,
  authors: [{ name: site.name, url: site.links.github }],
  creator: site.name,
  keywords: [
    "Anwesha Kar",
    "AI Developer",
    "AI Engineer",
    "Full Stack Developer",
    "Python Developer",
    "FastAPI Developer",
    "React Developer",
    "Backend Developer",
    "Automation Developer",
    "Cybersecurity Developer",
    "Software Engineer",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.lab,
    title,
    description: site.description,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title, description: site.description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f4f7f8",
  colorScheme: "light",
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  url: site.url,
  jobTitle: site.role,
  description: site.description,
  knowsAbout: ["Artificial intelligence", "Backend development", "FastAPI", "React", "Cybersecurity", "DevOps", "Distributed systems"],
  sameAs: [site.links.github, site.links.linkedin, site.links.upwork].filter(Boolean),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={archivo.variable} data-mode="client">
      <body className="min-h-dvh">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
        />
        <LabProvider>
          <SmoothScroll />
          <SiteNav />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Footer />
          <CommandPalette />
        </LabProvider>
      </body>
    </html>
  );
}
