"use client";

import Link from "next/link";
import { useRef } from "react";
import type { Project } from "@/content/types";
import { accents } from "@/content/story";

/** Dimensional project card: gentle 3D tilt on fine pointers, a hover layer that reveals
 *  methods and metrics, and a static equivalent for touch, keyboard and reduced motion. */
export default function WorkCard({ p, index, large = false }: { p: Project; index: number; large?: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const acc = accents[p.slug];

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse" || document.documentElement.dataset.motion !== "ok") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-y * 4).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(x * 5).toFixed(2)}deg`);
    el.style.setProperty("--mx", `${(x + 0.5) * 100}%`);
    el.style.setProperty("--my", `${(y + 0.5) * 100}%`);
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <Link
      ref={ref}
      href={`/projects/${p.slug}/`}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`work-card group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0F1C2E] text-white ${large ? "md:col-span-2 md:flex-row" : ""}`}
      style={{ ["--acc" as string]: acc.onDark }}
    >
      <div className={`relative overflow-hidden ${large ? "md:w-[56%]" : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.hero.src} alt={p.hero.alt} width={p.hero.width} height={p.hero.height} loading="lazy"
          className={`w-full object-cover transition-transform duration-700 group-hover:scale-[1.04] ${large ? "h-64 md:h-full md:min-h-[380px]" : "h-56"}`} />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#0F1C2E] via-[#0F1C2E]/20 to-transparent" />
        <span className="absolute left-4 top-4 rounded bg-[#0A1220]/80 px-2 py-1 font-mono text-[11px] text-white backdrop-blur">{String(index).padStart(2, "0")}</span>
        {/* hover layer: methods */}
        <div className="absolute inset-x-4 bottom-4 flex translate-y-2 flex-wrap gap-1.5 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
          {p.tools.slice(0, 4).map((t) => (
            <span key={t} className="rounded-full border border-white/25 bg-[#0A1220]/75 px-2.5 py-1 font-mono text-[10.5px] text-white/90 backdrop-blur">{t}</span>
          ))}
        </div>
      </div>
      <div className="relative flex flex-1 flex-col p-6">
        <span aria-hidden className="absolute left-6 top-0 h-[2px] w-10" style={{ background: acc.onDark }} />
        <p className="font-mono text-[10.5px] uppercase tracking-[0.14em]" style={{ color: acc.onDark }}>{p.category}</p>
        <h3 className={`mt-2 font-semibold leading-tight ${large ? "text-2xl md:text-[1.9rem]" : "text-xl"}`}>{p.title}</h3>
        <p className="mt-1.5 text-[13px] text-white/55">{p.context}</p>
        <p className="mt-3 text-[15px] leading-relaxed text-white/75">{p.summary}</p>
        <dl className="mt-auto grid grid-cols-2 gap-4 border-t border-white/10 pt-5 sm:grid-cols-3">
          {p.metrics.slice(0, large ? 3 : 2).map((m) => (
            <div key={m.label}>
              <dd className="text-xl font-semibold tabular-nums">{m.value}</dd>
              <dt className="text-[12px] leading-snug text-white/55">{m.label}</dt>
            </div>
          ))}
        </dl>
        <span className="mt-5 text-[13.5px] font-medium" style={{ color: acc.onDark }}>
          Read the case study <span aria-hidden className="inline-block transition-transform group-hover:translate-x-1">→</span>
        </span>
      </div>
      <span aria-hidden className="work-glare pointer-events-none absolute inset-0" />
    </Link>
  );
}
