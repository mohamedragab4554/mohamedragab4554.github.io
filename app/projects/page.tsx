import type { Metadata } from "next";
import { projects } from "@/content/projects";
import ProjectCard from "@/components/ProjectCard";
import SectionHeading from "@/components/SectionHeading";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsIndex() {
  return (
    <section className="container-page py-16 sm:py-20">
      <SectionHeading as="h1" label="Selected work" title="Case studies" intro="Six projects across inspection AI, drawing understanding, Scan-to-BIM and BIM coordination." />
      <div className="grid gap-6 lg:grid-cols-2">
        {projects.map((p, i) => <ProjectCard key={p.slug} p={p} index={i + 1} featured={i === 0} />)}
      </div>
    </section>
  );
}
