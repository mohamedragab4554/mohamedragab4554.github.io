import Link from "next/link";
import type { Project } from "@/content/types";

export default function ProjectCard({ p, index, featured = false }: { p: Project; index: number; featured?: boolean }) {
  const metrics = p.metrics.slice(0, featured ? 3 : 2);
  return (
    <Link
      href={`/projects/${p.slug}/`}
      className={`group card flex flex-col overflow-hidden transition-all hover:-translate-y-0.5 hover:border-ink/25 ${featured ? "lg:col-span-2 lg:flex-row" : ""}`}
    >
      <div className={`relative overflow-hidden border-b border-line bg-[#0B1424] ${featured ? "lg:w-[58%] lg:border-b-0 lg:border-r" : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.hero.src}
          alt={p.hero.alt}
          width={p.hero.width}
          height={p.hero.height}
          loading="lazy"
          className={`w-full object-cover transition-transform duration-500 group-hover:scale-[1.02] ${featured ? "h-60 lg:h-full" : "h-52"}`}
        />
        <span className="absolute left-3 top-3 rounded bg-navy/85 px-2 py-1 font-mono text-[11px] text-white">{String(index).padStart(2, "0")}</span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="eyebrow text-accent">{p.category}</p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink">{p.title}</h3>
        <p className="mt-1 text-sm text-ink-muted">{p.context}</p>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{p.summary}</p>
        <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4 sm:grid-cols-3">
          {metrics.map((m) => (
            <div key={m.label}>
              <dt className="sr-only">{m.label}</dt>
              <dd className="text-lg font-semibold text-ink">{m.value}</dd>
              <dd className="text-[12px] leading-snug text-ink-muted">{m.label}</dd>
            </div>
          ))}
        </dl>
        <span className="mt-auto pt-5 text-sm font-medium text-accent">
          Read case study <span aria-hidden className="inline-block transition-transform group-hover:translate-x-1">→</span>
        </span>
      </div>
    </Link>
  );
}
