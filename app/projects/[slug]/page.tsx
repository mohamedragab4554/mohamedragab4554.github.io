import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects, getProject } from "@/content/projects";
import { profile } from "@/content/profile";
import { cite } from "@/lib/cite";
import { accents, compares, inputs } from "@/content/story";
import Gallery from "@/components/Gallery";
import ChartBlock from "@/components/charts/Charts";
import CountUp from "@/components/CountUp";
import Reveal from "@/components/Reveal";
import StoryNav from "@/components/StoryNav";
import StepExplorer from "@/components/StepExplorer";
import CompareSlider from "@/components/CompareSlider";
import InferenceViewer from "@/components/InferenceViewer";
import ArchitectureDiagram from "@/components/ArchitectureDiagram";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  return p ? { title: p.title, description: p.summary, openGraph: { images: [p.hero.src] } } : {};
}

const CHAPTERS = [
  { id: "challenge", label: "Challenge" },
  { id: "inputs", label: "Input data" },
  { id: "workflow", label: "Workflow" },
  { id: "result", label: "Result" },
  { id: "impact", label: "Impact" },
];

function Chapter({ id, n, title, accent, children }: { id: string; n: number; title: string; accent: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-32 py-14 sm:py-16">
      <div className="container-page grid gap-6 lg:grid-cols-[240px_1fr] lg:gap-12">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: accent }}>Chapter {String(n).padStart(2, "0")}</p>
          <h2 className="mt-2 text-[1.7rem] leading-tight sm:text-[2rem]">{title}</h2>
          <span aria-hidden className="mt-4 block h-[2px] w-10" style={{ background: accent }} />
        </Reveal>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}

const Bullets = ({ items, accent }: { items: string[]; accent: string }) => (
  <ul className="space-y-3 text-[16px] leading-relaxed text-ink-soft">
    {items.map((t, i) => (
      <Reveal as="li" key={t} delay={i * 60} className="relative pl-6">
        <span aria-hidden className="absolute left-0 top-[0.72em] h-px w-3" style={{ background: accent }} />
        {t}
      </Reveal>
    ))}
  </ul>
);

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();
  const acc = accents[p.slug];
  const idx = projects.findIndex((x) => x.slug === p.slug);
  const next = projects[(idx + 1) % projects.length];
  const context = profile.showEmployerNames ? p.context : p.context.replace(/AGECS/g, "Construction-tech R&D firm");
  const industryOk = profile.useIndustryPhotos || p.slug !== "concrete-defect-detection";
  const gallery = industryOk ? p.gallery : p.gallery.filter((g) => g.src.includes("val-batch") || g.src.includes("loss"));
  const pairs = compares[p.slug] ?? [];
  const inputGallery = gallery.slice(0, 1);
  const restGallery = gallery.slice(1);

  return (
    <article id="story" style={{ ["--acc" as string]: acc.onLight }}>
      {/* ---------- opening ---------- */}
      <header className="relative overflow-hidden bg-[#0A1220] text-white">
        <div aria-hidden className="blueprint pointer-events-none absolute inset-0 opacity-60" />
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(55% 80% at 85% 20%, ${acc.onDark}22, transparent 70%)` }} />
        <div className="container-page relative grid gap-10 pb-14 pt-10 sm:pt-14 lg:grid-cols-[1.05fr_1fr] lg:items-center">
          <div>
            <nav aria-label="Breadcrumb" className="font-mono text-[11px] text-white/55">
              <Link href="/#work" className="hover:text-white">Selected work</Link> <span aria-hidden>/</span> {String(idx + 1).padStart(2, "0")} of {String(projects.length).padStart(2, "0")}
            </nav>
            <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: acc.onDark }}>{p.category}</p>
            <h1 className="mt-3 text-[2.3rem] leading-[1.05] sm:text-5xl lg:text-[3.4rem]">{p.title}</h1>
            <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-white/75">{p.summary}</p>
            <dl className="mt-8 grid gap-4 border-t border-white/10 pt-6 text-[14px] sm:grid-cols-3">
              <div><dt className="font-mono text-[10.5px] uppercase tracking-wider text-white/55">Context</dt><dd className="mt-1 text-white/85">{context}</dd></div>
              <div><dt className="font-mono text-[10.5px] uppercase tracking-wider text-white/55">Period</dt><dd className="mt-1 text-white/85">{p.period}</dd></div>
              <div><dt className="font-mono text-[10.5px] uppercase tracking-wider text-white/55">My role</dt><dd className="mt-1 text-white/85">{p.role}</dd></div>
            </dl>
            {p.links?.length ? (
              <div className="mt-6 flex flex-wrap gap-2">
                {p.links.map((l) => (
                  <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="btn-ghost-dark text-[13px]">
                    {l.label} <span aria-hidden>↗</span>
                  </a>
                ))}
              </div>
            ) : null}
          </div>
          <figure className="relative">
            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0F1C2E] shadow-[0_40px_80px_-40px_rgba(0,0,0,.8)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.hero.src} alt={p.hero.alt} width={p.hero.width} height={p.hero.height} className="max-h-[440px] w-full object-cover" fetchPriority="high" />
            </div>
            <figcaption className="mt-2 text-[12.5px] text-white/55">{p.hero.caption}</figcaption>
          </figure>
        </div>
        {/* key results strip */}
        <div className="container-page relative pb-10">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 lg:grid-cols-4">
            {p.metrics.map((m) => (
              <div key={m.label} className="bg-[#0C1626] p-5" title={`Source: ${cite(m.source)}`}>
                <dd className="text-[1.7rem] font-semibold leading-none tracking-tight"><CountUp value={m.value} /></dd>
                <dt className="mt-2.5 text-[13px] font-medium text-white/90">{m.label}</dt>
                {m.context ? <dd className="mt-1 font-mono text-[10.5px] leading-snug text-white/50">{m.context}</dd> : null}
              </div>
            ))}
          </dl>
        </div>
      </header>

      <StoryNav chapters={CHAPTERS} accent={acc.onLight} title={p.shortTitle} />

      {/* ---------- 01 challenge ---------- */}
      <Chapter id="challenge" n={1} title="The engineering challenge" accent={acc.onLight}>
        <div className="max-w-3xl space-y-4 text-[17px] leading-relaxed text-ink-soft">
          {p.challenge.map((c, i) => <Reveal key={c} delay={i * 80}><p>{c}</p></Reveal>)}
        </div>
      </Chapter>

      {/* ---------- 02 input data ---------- */}
      <div className="border-y border-line bg-surface/70">
        <Chapter id="inputs" n={2} title="Input data" accent={acc.onLight}>
          <div className="grid gap-3 sm:grid-cols-2">
            {(inputs[p.slug] ?? []).map((it, i) => (
              <Reveal key={it.label} delay={i * 70}>
                <div className="h-full rounded-xl border border-line bg-surface p-5">
                  <span aria-hidden className="block h-1.5 w-1.5 rounded-full" style={{ background: acc.onLight }} />
                  <p className="mt-3 font-semibold">{it.label}</p>
                  <p className="mt-1 text-[14.5px] leading-snug text-ink-soft">{it.detail}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Chapter>
      </div>

      {/* full-width visual moment: the input */}
      {inputGallery[0] ? (
        <Reveal as="section">
          <figure className="bg-[#0A1220] py-10 sm:py-14">
            <div className="container-page">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={inputGallery[0].src} alt={inputGallery[0].alt} width={inputGallery[0].width} height={inputGallery[0].height} loading="lazy" className="mx-auto max-h-[620px] w-auto max-w-full rounded-lg" />
              <figcaption className="mx-auto mt-3 max-w-3xl text-center text-[13px] text-white/60">{inputGallery[0].caption}</figcaption>
            </div>
          </figure>
        </Reveal>
      ) : null}

      {/* ---------- 03 workflow ---------- */}
      <Chapter id="workflow" n={3} title="The AI & engineering workflow" accent={acc.onLight}>
        <Reveal><StepExplorer steps={p.approach} accent={acc.onLight} /></Reveal>
        <div className="mt-10">
          <p className="eyebrow text-ink-muted">What I did</p>
          <div className="mt-4"><Bullets items={p.whatIDid} accent={acc.onLight} /></div>
        </div>
        <div className="mt-8 flex flex-wrap gap-1.5" aria-label="Tools and technologies">
          {p.tools.map((t) => <span key={t} className="chip">{t}</span>)}
        </div>
      </Chapter>

      {/* full-width visual moment: input → output */}
      {p.slug === "concrete-defect-detection" && industryOk ? (
        <section className="bg-[#0A1220] py-16 text-white sm:py-20" aria-labelledby="viewer-h">
          <div className="container-page">
            <Reveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: acc.onDark }}>Input → output</p>
              <h2 id="viewer-h" className="mt-2 max-w-3xl text-[1.8rem] leading-tight sm:text-[2.2rem]">The field test, one photo at a time.</h2>
            </Reveal>
            <div className="mt-8"><InferenceViewer accent={acc.onDark} /></div>
          </div>
        </section>
      ) : p.slug === "aecai-inspection-platform" ? (
        <section className="bg-[#0A1220] py-16 text-white sm:py-20" aria-labelledby="arch-h">
          <div className="container-page">
            <Reveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: acc.onDark }}>Production architecture</p>
              <h2 id="arch-h" className="mt-2 max-w-3xl text-[1.8rem] leading-tight sm:text-[2.2rem]">One photo, two GPU workers, one engineer's decision.</h2>
            </Reveal>
            <Reveal delay={100}><div className="mt-8"><ArchitectureDiagram dark /></div></Reveal>
          </div>
        </section>
      ) : pairs.length ? (
        <section className="bg-[#0A1220] py-16 text-white sm:py-20" aria-labelledby="compare-h">
          <div className="container-page">
            <Reveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: acc.onDark }}>Input → output</p>
              <h2 id="compare-h" className="mt-2 text-[1.8rem] leading-tight sm:text-[2.2rem]">Drag to compare.</h2>
            </Reveal>
            <div className="mt-8 grid gap-10">
              {pairs.map((c) => (
                <Reveal key={c.before.src}>
                  <div className={`mx-auto ${c.width < 500 ? "max-w-[520px]" : "max-w-[900px]"}`}>
                    <CompareSlider before={c.before} after={c.after} width={c.width} height={c.height} accent={acc.onDark} fit="contain" />
                    <p className="mt-3 text-[13.5px] text-white/60">{c.caption}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ---------- 04 result ---------- */}
      <Chapter id="result" n={4} title="Technical result" accent={acc.onLight}>
        <Bullets items={p.results} accent={acc.onLight} />
        {p.charts.length ? (
          <div className={`mt-10 grid gap-6 ${p.charts.length > 1 ? "xl:grid-cols-2" : ""}`}>
            {p.charts.map((c, i) => <Reveal key={c.title} delay={(i % 2) * 90}><ChartBlock chart={c} /></Reveal>)}
          </div>
        ) : null}
        {p.honestNotes?.length ? (
          <Reveal>
            <div className="mt-10 rounded-xl border border-line p-5" style={{ background: acc.tint }}>
              <p className="eyebrow" style={{ color: acc.onLight }}>Limitations, stated plainly</p>
              <ul className="mt-2 space-y-1.5 text-[14.5px] leading-relaxed text-ink-soft">
                {p.honestNotes.map((n) => <li key={n}>{n}</li>)}
              </ul>
            </div>
          </Reveal>
        ) : null}
      </Chapter>

      {/* full-width visual moment: gallery */}
      {restGallery.length ? (
        <section className="border-y border-line bg-surface/70 py-14 sm:py-16" aria-labelledby="gallery-h">
          <div className="container-page">
            <Reveal><h2 id="gallery-h" className="text-[1.5rem]">Outputs & artefacts</h2></Reveal>
            <div className="mt-6"><Gallery items={restGallery} /></div>
          </div>
        </section>
      ) : null}

      {/* ---------- 05 impact ---------- */}
      <Chapter id="impact" n={5} title="Practical impact & relevance" accent={acc.onLight}>
        <Bullets items={p.relevance} accent={acc.onLight} />
        <details className="group mt-10 rounded-xl border border-line bg-surface p-5">
          <summary className="cursor-pointer list-none font-medium">
            <span className="eyebrow mr-2" style={{ color: acc.onLight }}>Evidence</span>
            Where every figure on this page comes from
            <span aria-hidden className="float-right transition-transform group-open:rotate-45">+</span>
          </summary>
          <p className="mt-3 text-[14px] text-ink-soft">Each metric is taken from a primary record, not from a CV. Hover a metric to see its source. The underlying files are available for review at interview.</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-[13.5px] text-ink-muted">
            {Array.from(new Set(p.sources.map(cite))).map((s) => <li key={s}>{s}</li>)}
          </ul>
          {p.disclosure ? <p className="mt-4 text-[13px] text-ink-muted">{p.disclosure}</p> : null}
        </details>
      </Chapter>

      {/* ---------- next ---------- */}
      <Link href={`/projects/${next.slug}/`} className="group block bg-[#0A1220] text-white">
        <div className="container-page flex flex-col gap-3 py-14 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/55">Next case study</p>
            <p className="mt-2 text-[1.8rem] font-semibold leading-tight sm:text-[2.4rem]" style={{ fontFamily: "var(--font-display)" }}>{next.title}</p>
          </div>
          <span className="text-2xl transition-transform group-hover:translate-x-2" style={{ color: accents[next.slug].onDark }} aria-hidden>→</span>
        </div>
      </Link>
    </article>
  );
}
