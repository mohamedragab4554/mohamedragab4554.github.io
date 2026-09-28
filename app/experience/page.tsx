import type { Metadata } from "next";
import Link from "next/link";
import { experience, skillGroups } from "@/content/experience";
import { profile } from "@/content/profile";
import { projects } from "@/content/projects";
import SectionHeading from "@/components/SectionHeading";

export const metadata: Metadata = { title: "Experience & skills" };

export default function ExperiencePage() {
  return (
    <>
      <section className="container-page py-16 sm:py-20">
        <SectionHeading
          label="Experience"
          title="Engineering practice first, then AI and digital delivery."
          intro="A year of structural and façade delivery, an industry project with AECOM, and applied R&D in inspection AI, drawing understanding and Scan-to-BIM."
        />
        <ol className="relative space-y-6 border-l border-line pl-6 sm:pl-10">
          {experience.map((r) => (
            <li key={r.role + r.org} className="relative">
              <span aria-hidden className="absolute -left-[31px] top-7 h-3 w-3 rounded-full border-2 border-paper bg-accent-bright sm:-left-[47px]" />
              <div className="card p-6 sm:p-7">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="eyebrow text-accent">{r.kind}</p>
                    <h2 className="mt-1.5 text-xl font-semibold tracking-tight">{r.role}</h2>
                    <p className="text-[15px] text-ink-soft">{profile.showEmployerNames ? r.org : r.orgGeneric} · {r.place}</p>
                  </div>
                  <p className="shrink-0 font-mono text-[12.5px] text-ink-muted">{r.period}</p>
                </div>
                <p className="mt-4 text-[15px] text-ink-soft">{r.summary}</p>
                <ul className="mt-3 space-y-2 text-[14.5px] leading-relaxed text-ink-soft">
                  {r.bullets.map((b) => (
                    <li key={b} className="relative pl-5"><span aria-hidden className="absolute left-0 top-[0.7em] h-px w-2.5 bg-accent-bright" />{b}</li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-wrap items-center gap-1.5">
                  {r.tools.map((t) => <span key={t} className="chip">{t}</span>)}
                  {r.projectSlugs?.map((s) => {
                    const p = projects.find((x) => x.slug === s);
                    return p ? (
                      <Link key={s} href={`/projects/${s}/`} className="ml-auto text-sm font-medium text-accent hover:underline sm:ml-3">
                        Case study: {p.shortTitle} →
                      </Link>
                    ) : null;
                  })}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-line bg-surface/60 py-16 sm:py-20" aria-labelledby="skills">
        <div className="container-page">
          <SectionHeading
            id="skills"
            label="Skills"
            title="Grouped by where I have used them."
            intro="No percentage bars. Each group names the work that evidences it."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {skillGroups.map((g) => (
              <div key={g.title} className="card flex flex-col p-6">
                <h3 className="text-[17px] font-semibold tracking-tight">{g.title}</h3>
                <ul className="mt-3 space-y-1.5 text-[14.5px] text-ink-soft">
                  {g.items.map((i) => <li key={i}>{i}</li>)}
                </ul>
                <p className="mt-auto pt-5 font-mono text-[11px] text-ink-muted">Evidence: {g.evidence}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-ink-muted">Languages: Arabic (native), English (fluent).</p>
        </div>
      </section>
    </>
  );
}
