"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { mapNodes, mapRoutes, accents } from "@/content/story";
import { projects } from "@/content/projects";

const COLS = ["Engineering data in", "Methods", "Outcomes out"];
const X = [16, 50, 84]; // % positions of the three columns
const rowY = (i: number) => 14 + i * 24; // % positions of the four rows

export default function SystemsMap() {
  const [active, setActive] = useState<string>("concrete-defect-detection");
  const [hoverNode, setHoverNode] = useState<string | null>(null);

  const pos = useMemo(() => {
    const m: Record<string, { x: number; y: number }> = {};
    [0, 1, 2].forEach((c) => mapNodes.filter((n) => n.col === c).forEach((n, i) => (m[n.id] = { x: X[c], y: rowY(i) })));
    return m;
  }, []);

  const routes = mapRoutes.filter((r) => (hoverNode ? r.path.includes(hoverNode) : r.project === active));
  const litNodes = new Set(routes.flatMap((r) => r.path));
  const litProjects = new Set(routes.map((r) => r.project));
  const proj = projects.find((p) => p.slug === active)!;
  const acc = accents[active];

  const curve = (a: string, b: string) => {
    const p = pos[a], q = pos[b];
    const mx = (p.x + q.x) / 2, py = p.y + 6, qy = q.y + 6;
    return `M${p.x + 10.5},${py} C${mx},${py} ${mx},${qy} ${q.x - 10.5},${qy}`;
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      {/* desktop map */}
      <div className="relative hidden aspect-[1000/560] md:block">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
          {mapRoutes.map((r, i) => (
            <g key={i}>
              {r.path.slice(0, -1).map((a, j) => (
                <path key={`${j}-${routes.includes(r) ? active + (hoverNode ?? "") : "off"}`} d={curve(a, r.path[j + 1])} fill="none" vectorEffect="non-scaling-stroke"
                  stroke={routes.includes(r) ? accents[r.project].onDark : "rgba(255,255,255,0.12)"}
                  strokeWidth={routes.includes(r) ? 1.8 : 1}
                  className="transition-[stroke,stroke-width] duration-500" />
              ))}
            </g>
          ))}
        </svg>
        {COLS.map((c, i) => (
          <p key={c} className="absolute top-0 -translate-x-1/2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-white/45" style={{ left: `${X[i]}%` }}>{c}</p>
        ))}
        {mapNodes.map((n) => {
          const lit = litNodes.has(n.id);
          return (
            <button
              key={n.id}
              type="button"
              onMouseEnter={() => setHoverNode(n.id)}
              onMouseLeave={() => setHoverNode(null)}
              onFocus={() => setHoverNode(n.id)}
              onBlur={() => setHoverNode(null)}
              onClick={() => {
                const r = mapRoutes.find((x) => x.path.includes(n.id));
                if (r) setActive(r.project);
              }}
              className={`absolute w-[21%] -translate-x-1/2 -translate-y-1/2 rounded-lg border px-3 py-2.5 text-left transition duration-300 ${lit ? "border-white/60 bg-[#13233A]" : "border-white/10 bg-[#0E1B2C]/80 opacity-60 hover:opacity-100"}`}
              style={{ left: `${pos[n.id].x}%`, top: `${pos[n.id].y + 6}%` }}
              aria-describedby={`d-${n.id}`}
            >
              <span className="block text-[13.5px] font-medium leading-tight text-white">{n.label}</span>
              <span id={`d-${n.id}`} className="mt-1 block text-[11.5px] leading-snug text-white/55">{n.detail}</span>
            </button>
          );
        })}
      </div>

      {/* mobile: chain for the active project */}
      <ol className="space-y-2 md:hidden" aria-label="Pipeline for the selected project">
        {mapRoutes.filter((r) => r.project === active).map((r, ri) => (
          <li key={ri} className="rounded-lg border border-white/10 p-3">
            {r.path.map((id, j) => {
              const n = mapNodes.find((x) => x.id === id)!;
              return (
                <div key={id} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: acc.onDark }} />
                  <div className={j < r.path.length - 1 ? "pb-3" : ""}>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-white/45">{COLS[n.col]}</p>
                    <p className="text-[14.5px] text-white">{n.label}</p>
                  </div>
                </div>
              );
            })}
          </li>
        ))}
      </ol>

      {/* project selector + summary */}
      <div className="flex flex-col">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-white/45">Trace a project</p>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Choose a project to trace through the map">
          {projects.map((p) => (
            <button
              key={p.slug}
              type="button"
              onClick={() => setActive(p.slug)}
              aria-pressed={active === p.slug}
              className={`rounded-full border px-3 py-1.5 text-[12.5px] transition ${active === p.slug ? "border-transparent text-[#0A1220]" : litProjects.has(p.slug) ? "border-white/50 text-white" : "border-white/15 text-white/70 hover:border-white/40"}`}
              style={active === p.slug ? { background: accents[p.slug].onDark } : undefined}
            >
              {p.shortTitle}
            </button>
          ))}
        </div>
        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-5" aria-live="polite">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.14em]" style={{ color: acc.onDark }}>{proj.category}</p>
          <p className="mt-1.5 text-[17px] font-semibold leading-snug text-white">{proj.title}</p>
          <dl className="mt-4 grid grid-cols-2 gap-3">
            {proj.metrics.slice(0, 2).map((m) => (
              <div key={m.label}>
                <dd className="text-xl font-semibold text-white">{m.value}</dd>
                <dt className="text-[12px] leading-snug text-white/55">{m.label}</dt>
              </div>
            ))}
          </dl>
          <Link href={`/projects/${proj.slug}/`} className="mt-5 inline-flex text-[13.5px] font-medium hover:underline" style={{ color: acc.onDark }}>
            Open case study →
          </Link>
        </div>
      </div>
    </div>
  );
}
