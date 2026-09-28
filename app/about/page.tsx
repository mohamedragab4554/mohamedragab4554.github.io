import type { Metadata } from "next";
import Link from "next/link";
import { profile } from "@/content/profile";
import SectionHeading from "@/components/SectionHeading";
import Contact from "@/components/Contact";

export const metadata: Metadata = { title: "About" };

const principles = [
  { t: "Validate where it will be used", d: "Curated benchmarks flatter models. I test on site photos, real sheets and raw scans, and report the gap." },
  { t: "Measure what an engineer needs", d: "Crack width against EN 1992 limits, element geometry an IFC can hold, findings an engineer can sign off." },
  { t: "Keep a human in the loop", d: "Approval gates, review UIs and traceable evidence for every generated element." },
  { t: "Write it down", d: "Progress logs, bug registers, lessons learned and handover documents, so the next person can continue the work." },
];

export default function AboutPage() {
  return (
    <>
      <section className="container-page grid gap-12 py-16 sm:py-20 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
        <div>
          <SectionHeading label="About" title="A structural engineer building AI for the problems I met in practice." />
          <div className="prose-tight max-w-2xl text-[16.5px] leading-relaxed text-ink-soft">
            <p>
              I trained as a civil engineer in Egypt, graduating with an A+ steel-structures project. I then spent a year at National
              Consulting Engineers producing structural calculations and drawings for more than 115 façade and secondary-structure
              packages to US codes. That work taught me how engineering information is actually produced, checked and handed over.
            </p>
            <p>
              I moved to Belfast for an MSc in Digital Construction Analytics and BIM at Ulster University and graduated with
              Distinction. My industry project with AECOM linked crack detection to a Revit model and Power BI. My dissertation benchmarked
              YOLO, U-Net and FPN models for concrete defects and then tested them on real site imagery from an industry partner.
            </p>
            <p>
              I am co-founder and CTO of AECAI, an AI-assisted structural inspection platform, and I carry out R&D at
              {profile.showEmployerNames ? " AGECS" : " a construction-technology firm"} on structural drawing understanding and Scan-to-BIM. The common thread
              is turning photos, drawings and scans into engineering data that people can trust and act on.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/#work" className="btn-primary">View projects</Link>
            <a href={profile.cvHref} download className="btn-ghost">Download CV</a>
          </div>
        </div>
        <div className="lg:pt-24">
          <div className="card overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={profile.headshot.src} alt={`Portrait of ${profile.name}`} width={profile.headshot.width} height={profile.headshot.height} className="aspect-square w-full bg-[#e9ecef] object-cover object-top" />
            <div className="p-5 text-sm text-ink-soft">
              <p className="font-semibold text-ink">{profile.name}</p>
              <p>{profile.title}</p>
              <p className="mt-2 font-mono text-[11px] text-ink-muted">{profile.membership}</p>
            </div>
          </div>
        </div>
      </section>
      <section className="border-t border-line bg-surface/60 py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading label="Working principles" title="How I approach engineering AI" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((p, i) => (
              <div key={p.t} className="card p-6">
                <span className="font-mono text-[11px] text-accent">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-2 font-semibold">{p.t}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-ink-soft">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Contact />
    </>
  );
}
