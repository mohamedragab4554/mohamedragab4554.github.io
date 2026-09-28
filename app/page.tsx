import Link from "next/link";
import { profile, proofStrip, pillars } from "@/content/profile";
import { projects } from "@/content/projects";
import { dissertation } from "@/content/research";
import SectionHeading from "@/components/SectionHeading";
import ChartBlock from "@/components/charts/Charts";
import Contact from "@/components/Contact";
import HeroVisual from "@/components/hero/HeroVisual";
import CountUp from "@/components/CountUp";
import { cite } from "@/lib/cite";
import Reveal from "@/components/Reveal";
import SystemsMap from "@/components/SystemsMap";
import InferenceViewer from "@/components/InferenceViewer";
import WorkCard from "@/components/WorkCard";
import Programme from "@/components/Programme";
import Showcase from "@/components/Showcase";

export default function Home() {
  const field = projects[0].charts[1];
  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden bg-[#0A1220] text-white" aria-labelledby="hero-title">
        <div aria-hidden className="blueprint pointer-events-none absolute inset-0 opacity-70" />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_70%_at_75%_40%,rgba(95,211,205,0.10),transparent_70%)]" />
        <div className="container-page relative grid gap-8 pb-10 pt-10 sm:pt-14 lg:min-h-[640px] lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:items-center lg:gap-6 lg:pb-12">
          <div className="relative z-10">
            <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="boot-line inline-block text-[19px] font-semibold tracking-tight text-white" style={{ animationDelay: "0ms" }}>{profile.name}</span>
              <span className="boot-line inline-block font-mono text-[12px] uppercase tracking-[0.14em] text-accent-onDark" style={{ animationDelay: "160ms" }}>{profile.title}</span>
            </p>
            <h1 id="hero-title" className="mt-5 max-w-[36rem] text-[2.5rem] leading-[1.03] sm:text-[3.3rem] lg:text-[3.35rem] xl:text-[3.75rem]">
              {profile.headline}
            </h1>
            <p className="mt-6 max-w-[35rem] text-[17.5px] leading-relaxed text-white/75">
              {profile.intro} Where benchmarks and site data disagree, I trust the site.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#work" className="btn bg-accent-onDark font-semibold text-[#0A1220] hover:bg-[#8BE3DE]">View projects</Link>
              <a href={profile.cvHref} download className="btn-ghost-dark">Download CV</a>
              <Link href="#contact" className="btn-ghost-dark">Contact</Link>
            </div>
            <dl className="mt-8 grid max-w-[35rem] gap-2 border-t border-white/10 pt-5 text-[13.5px] sm:grid-cols-[4.5rem_1fr]">
              <dt className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-white/45 sm:pt-[3px]">Now</dt>
              <dd className="text-white/85">Co-founder &amp; CTO, AECAI <span className="text-white/35">·</span> R&amp;D AI-Construction Specialist, {profile.showEmployerNames ? "AGECS" : "construction-tech R&D"}</dd>
              <dt className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-white/45 sm:mt-0 sm:pt-[3px]">Before</dt>
              <dd className="text-white/85">Structural &amp; façade design engineer, National Consulting Engineers (US) <span className="text-white/35">·</span> AECOM × Ulster industry project</dd>
            </dl>
          </div>

          <div className="relative -mx-4 h-[340px] sm:mx-0 sm:h-[440px] lg:-mr-16 lg:h-[580px]">
            <HeroVisual />
            <p className="absolute right-3 top-2 max-w-[15rem] text-right font-mono text-[10px] leading-snug text-white/40 sm:right-5">
              Illustrative sequence of my Scan-to-BIM workflow. Real model outputs are shown below and in the case studies.
            </p>
          </div>
        </div>

        <div className="container-page relative pb-14">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 lg:grid-cols-4">
            {proofStrip.map((m) => (
              <div key={m.label} className="bg-[#0C1626] p-5 sm:p-6" title={`Source: ${cite(m.source)}`}>
                <dd className="text-[1.85rem] font-semibold leading-none tracking-tight sm:text-[2.2rem]"><CountUp value={m.value} /></dd>
                <dt className="mt-3 text-[13.5px] font-medium text-white/90">{m.label}</dt>
                <dd className="mt-1 font-mono text-[10.5px] leading-snug text-white/50">{m.context}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------- SYSTEMS MAP ---------- */}
      <section id="systems" className="scroll-mt-16 border-t border-white/[0.06] bg-[#0C1626] py-20 text-white sm:py-24" aria-labelledby="systems-title">
        <div className="container-page">
          <Reveal>
            <SectionHeading id="systems-title" dark label="Systems map" title="From engineering data to decisions an engineer can sign off." intro="Four kinds of input, four method families, four outcomes. Pick a project, or hover a step, to trace the route it takes." />
          </Reveal>
          <Reveal delay={100}><SystemsMap /></Reveal>
        </div>
      </section>

      {/* ---------- INFERENCE VIEWER ---------- */}
      {profile.useIndustryPhotos ? (
        <section className="border-t border-white/[0.06] bg-[#0A1220] py-20 text-white sm:py-24" aria-labelledby="viewer-title">
          <div className="container-page">
            <Reveal>
              <SectionHeading id="viewer-title" dark label="Live evidence" title="Three models, one real site photo." intro="On the curated benchmark these detectors scored within 0.02 mAP50 of each other. On site they behave very differently. Switch models and drag the divider." />
            </Reveal>
            <Reveal delay={100}><InferenceViewer /></Reveal>
          </div>
        </section>
      ) : null}

      {/* ---------- BEYOND THE MODEL ---------- */}
      <section id="beyond" className="scroll-mt-16 border-t border-line bg-surface/70 py-20 sm:py-24" aria-labelledby="beyond-title">
        <div className="container-page">
          <Reveal>
            <SectionHeading id="beyond-title" label="Beyond the model" title="BIM, dashboards, automation and deployment." intro="A detector on its own changes nothing on site. These are the parts that put results in front of engineers and asset owners, all taken from my own project files." />
          </Reveal>
          <Reveal delay={100}><Showcase /></Reveal>
        </div>
      </section>

      {/* ---------- SELECTED WORK ---------- */}
      <section id="work" className="scroll-mt-16 bg-paper py-20 sm:py-24" aria-labelledby="work-title">
        <div className="container-page">
          <Reveal>
            <SectionHeading id="work-title" label="Selected work" title="Six case studies, each traced to its source files." intro="Research, a product, applied R&D and industry projects. Each one follows the same arc: the engineering challenge, the input data, the workflow, the result and why it matters." />
          </Reveal>
          <div className="grid gap-6 md:grid-cols-2">
            {projects.map((p, i) => (
              <Reveal key={p.slug} delay={(i % 2) * 90} className={i === 0 || i === projects.length - 1 ? "md:col-span-2" : ""}>
                <WorkCard p={p} index={i + 1} large={i === 0 || i === projects.length - 1} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CAPABILITIES + FIELD CHART ---------- */}
      <section className="border-t border-line bg-surface/70 py-20 sm:py-24" aria-labelledby="bring">
        <div className="container-page mb-16">
          <Reveal>
            <div className="grid gap-6 rounded-2xl bg-[#0A1220] p-6 text-white sm:p-8 lg:grid-cols-[1.1fr_2fr] lg:items-center">
              <div>
                <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-accent-onDark">Why it matters</p>
                <p className="mt-2 text-[1.3rem] font-semibold leading-snug">The industry need is real, and adoption is still early.</p>
                <p className="mt-2 text-[12.5px] text-white/55">21 inspection and engineering professionals, UK, KSA, UAE and Egypt. MSc dissertation §4.1.</p>
              </div>
              <dl className="grid gap-4 sm:grid-cols-3">
                {[["4–7 days", "to inspect a medium-sized building by hand"], ["9%", "had used computer-vision tools in their work"], ["~75%", "were open to adopting them"]].map(([v, l]) => (
                  <div key={l} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <dd className="text-[1.7rem] font-semibold leading-none">{v}</dd>
                    <dt className="mt-2 text-[13px] leading-snug text-white/65">{l}</dt>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </div>
        <div className="container-page">
          <Reveal>
            <SectionHeading id="bring" label="What I bring" title="Structural judgement, BIM fluency and ML depth in one person." intro="Most AI for construction is built by engineers without ML depth, or by ML teams without site knowledge. My work sits in the overlap." />
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((p, i) => (
              <Reveal key={p.title} delay={i * 70} className="h-full">
                <div className="card flex h-full flex-col p-6">
                  <h3 className="text-[17px]">{p.title}</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-ink-soft">{p.body}</p>
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
                    {p.tags.map((t) => <span key={t} className="chip">{t}</span>)}
                  </div>
                  <Link href={p.href} className="mt-4 text-[13px] font-medium text-accent hover:underline">{p.hrefLabel} →</Link>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:items-center">
            <Reveal>
              <p className="eyebrow text-accent">Why field testing matters</p>
              <h3 className="mt-3 text-2xl">The benchmark picks one detector. The site picks another.</h3>
              <p className="mt-3 text-[15.5px] leading-relaxed text-ink-soft">
                On 44 manually verified site photos, YOLO11x-seg correctly cleared 13 crack-free images. YOLOv8x-seg cleared only 1, even though its benchmark mAP50 was
                slightly higher. That result decides which detector goes into a product.
              </p>
              <Link href={`/projects/${projects[0].slug}/`} className="mt-5 inline-flex text-sm font-medium text-accent hover:underline">Read the full study →</Link>
            </Reveal>
            <Reveal delay={120}><ChartBlock chart={field} /></Reveal>
          </div>
        </div>
      </section>

      {/* ---------- PROGRAMME ---------- */}
      <section className="border-t border-line bg-paper py-20 sm:py-24" aria-labelledby="programme">
        <div className="container-page">
          <Reveal>
            <SectionHeading id="programme" label="Programme" title="Career, laid out like a construction programme." intro="Education, engineering practice and AI work, running in parallel. Select a bar for details." />
          </Reveal>
          <Reveal delay={100}><Programme /></Reveal>
          <Link href="/experience/" className="btn-ghost mt-12">Full experience & skills →</Link>
        </div>
      </section>

      {/* ---------- RESEARCH ---------- */}
      <section className="border-t border-line bg-surface/70 py-20 sm:py-24" aria-labelledby="research">
        <div className="container-page">
          <Reveal>
            <SectionHeading id="research" label="Research & education" title="A Distinction MSc, with research grounded in industry." />
          </Reveal>
          <Reveal>
            <div className="card grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.4fr_1fr]">
              <div>
                <p className="eyebrow text-accent">MSc dissertation · {dissertation.submitted}</p>
                <h3 className="mt-2 text-xl leading-snug">{dissertation.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{dissertation.abstract}</p>
                <p className="mt-4 text-sm text-ink-muted">{dissertation.publication}</p>
              </div>
              <dl className="grid grid-cols-2 gap-3 self-start">
                {[["Distinction", "MSc classification"], ["81%", "Intro to Data Science"], ["80%", "Industry Project (AECOM)"], [String(dissertation.survey.respondents), "Practitioners surveyed"]].map(([v, l]) => (
                  <div key={l} className="rounded-lg border border-line bg-paper p-4">
                    <dd className="text-2xl font-semibold"><CountUp value={v} /></dd>
                    <dt className="mt-1 text-[12.5px] text-ink-muted">{l}</dt>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
          <Link href="/research/" className="btn-ghost mt-8">Research, education & certificates →</Link>
        </div>
      </section>

      <Contact />
    </>
  );
}
