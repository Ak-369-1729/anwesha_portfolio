import { About } from "@/components/home/About";
import { BuildLog } from "@/components/home/BuildLog";
import { Contact } from "@/components/home/Contact";
import { FlagshipSystems } from "@/components/home/FlagshipSystems";
import { Hero } from "@/components/home/Hero";
import { HowIWork } from "@/components/home/HowIWork";
import { ServicesDepth } from "@/components/home/ServicesDepth";
import { TechGraph } from "@/components/home/TechGraph";
import { Timeline } from "@/components/home/Timeline";
import { ProjectArchive } from "@/components/projects/ProjectArchive";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { UniverseSection } from "@/components/universe/UniverseSection";

export default function Home() {
  return (
    <>
      <Hero />
      <UniverseSection />
      <FlagshipSystems />
      <ServicesDepth />
      <section id="projects" aria-labelledby="projects-title" className="relative bg-bg py-14 sm:py-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <SectionHeader
            code="04"
            kicker="Project archive"
            id="projects-title"
            title={
              <>
                Beyond the flagships: <span className="italic text-ivory-dim">builds, research and lab work.</span>
              </>
            }
            lede="Three levels, so nothing is diluted: flagship systems with full case studies, substantial projects with a focused scope, and lab experiments where the fundamentals were learned."
            aside={
              <>
                <span className="block text-ivory">Fig. 04 — Index</span>
                filter by level, cluster or keyword
              </>
            }
          />
          <div className="mt-10">
            <ProjectArchive defaultTier={2} showArchiveLink />
          </div>
        </div>
      </section>
      <TechGraph />
      <HowIWork />
      <About />
      <Timeline />
      <BuildLog />
      <Contact />
    </>
  );
}
