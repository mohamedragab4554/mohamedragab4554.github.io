import type { Metadata } from "next";
import Link from "next/link";
import { dissertation, education, certifications } from "@/content/research";
import { projects } from "@/content/projects";
import SectionHeading from "@/components/SectionHeading";
import ChartBlock from "@/components/charts/Charts";

export const metadata: Metadata = { title: "Research, education & certifications" };

export default function ResearchPage() {
  const diss = projects[0];
  const msc = education[0];
  return (
    <>
      <section className="container-page py-16 sm:py-20">
        <SectionHeading as="h1" label="Research" title="MSc dissertation" intro={dissertation.abstract} />
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="card p-6 sm:p-8">
            <p className="eyebrow text-accent">{dissertation.submitted}</p>
            <h2 className="mt-2 text-xl font-semibold leading-snug">{dissertation.title}</h2>
            <dl className="mt-6 grid gap-4 text-[14.5px] sm:grid-cols-2">
              {[
                ["Institution", dissertation.institution],
                ["Supervisor", dissertation.supervisor],
                ["Industry partner", dissertation.industryPartner],
                ["Module result", dissertation.mark],
              ].map(([k, v]) => (
                <div key={k}><dt className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">{k}</dt><dd className="mt-1 text-ink-soft">{v}</dd></div>
              ))}
            </dl>
            <div className="mt-6 rounded-lg border border-line bg-paper p-4 text-[14px] text-ink-soft">
              <span className="font-medium text-ink">Publication status: </span>{dissertation.publication}
            </div>
            <Link href={`/projects/${diss.slug}/`} className="btn-primary mt-6">Read the case study →</Link>
          </div>
          <div className="card p-6 sm:p-8">
            <p className="eyebrow text-accent">Practitioner survey</p>
            <p className="mt-3 text-[15px] text-ink-soft">{dissertation.survey.respondents} professionals · {dissertation.survey.regions}</p>
            <dl className="mt-5 grid grid-cols-3 gap-3">
              {[
                [dissertation.survey.usedCV, "had used CV tools for inspection"],
                [dissertation.survey.openToAdoption, "open to adopting AI tools"],
                [dissertation.survey.mediumBuildingDuration, "typical inspection, medium building"],
              ].map(([v, l]) => (
                <div key={l} className="rounded-lg border border-line bg-paper p-3">
                  <dt className="sr-only">{l}</dt>
                  <dd className="text-xl font-semibold">{v}</dd>
                  <dd className="mt-1 text-[12px] leading-snug text-ink-muted">{l}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 font-mono text-[10.5px] text-ink-muted">Source: dissertation §4.1</p>
          </div>
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <ChartBlock chart={diss.charts[0]} />
          <ChartBlock chart={diss.charts[3]} />
        </div>
      </section>

      <section className="border-y border-line bg-surface/60 py-16 sm:py-20" aria-labelledby="edu">
        <div className="container-page">
          <SectionHeading id="edu" label="Education" title="Degrees" />
          <div className="grid gap-6 lg:grid-cols-2">
            {education.map((e) => (
              <div key={e.degree} className="card p-6 sm:p-7">
                <p className="font-mono text-[12px] text-ink-muted">{e.period}</p>
                <h3 className="mt-1 text-lg font-semibold leading-snug">{e.degree}</h3>
                <p className="text-[15px] text-ink-soft">{e.institution}</p>
                <p className="mt-3 inline-flex rounded-md bg-accent-tint px-2.5 py-1 text-sm font-medium text-accent">{e.award}</p>
                {e.detail.length ? (
                  <table className="mt-5 w-full text-left text-[14px]">
                    <caption className="sr-only">Module marks</caption>
                    <thead><tr className="border-b border-line text-ink-muted"><th className="py-1.5 font-normal">Module</th><th className="py-1.5 text-right font-normal">Mark</th></tr></thead>
                    <tbody>
                      {e.detail.map((d) => (
                        <tr key={d.module} className="border-b border-line/70">
                          <td className="py-1.5 pr-3 text-ink-soft">{d.module}</td>
                          <td className="py-1.5 text-right font-mono tabular-nums">{d.mark}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : null}
                {e.detail.length ? <p className="mt-2 font-mono text-[10.5px] text-ink-muted">Source: Ulster University statement of academic record. Distinction threshold 70%.</p> : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20" aria-labelledby="certs">
        <SectionHeading id="certs" label="Certifications & memberships" title="Continuing development" />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {certifications.map((c) => (
            <li key={c.name} className="card flex items-start justify-between gap-4 p-5">
              <div>
                <p className="text-[15px] font-medium leading-snug">{c.name}</p>
                <p className="mt-1 text-[13px] text-ink-muted">{c.issuer}</p>
              </div>
              {c.year ? <span className="font-mono text-[12px] text-ink-muted">{c.year}</span> : null}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
