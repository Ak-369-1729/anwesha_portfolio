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

export default function Home() {
  return (
    <>
      <Hero />
      <FlagshipSystems />
      <ServicesDepth />
      <section id="projects" aria-labelledby="projects-title" className="py-16 sm:py-24">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <SectionHeader
            id="projects-title"
            title="Everything else I’ve built"
            lede="Complete projects with a focused scope, and the lab work where the fundamentals were learned."
          />
          <div className="mt-8">
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
