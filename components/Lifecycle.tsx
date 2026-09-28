"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { lifecycle } from "@/content/ai";

/** Interactive AI lifecycle: five pipeline nodes and one detail panel. Auto-advances until the visitor interacts. */
export default function Lifecycle() {
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!auto || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let visible = false;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.4 });
    if (root.current) io.observe(root.current);
    const id = window.setInterval(() => { if (visible && !document.hidden) setI((x) => (x + 1) % lifecycle.length); }, 4200);
    return () => { clearInterval(id); io.disconnect(); };
  }, [auto]);

  const pick = (n: number) => { setAuto(false); setI(n); };
  const onKey = (e: React.KeyboardEvent) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return; e.preventDefault();
    const n = (i + d + lifecycle.length) % lifecycle.length; pick(n); tabs.current[n]?.focus();
  };
  const st = lifecycle[i];

  return (
    <div ref={root} onMouseEnter={() => setAuto(false)}>
      <div className="relative">
        <span aria-hidden className="pointer-events-none absolute left-[10%] right-[10%] top-[19px] hidden h-px bg-line md:block" />
        <span aria-hidden className="pointer-events-none absolute left-[10%] top-[19px] hidden h-px bg-gradient-to-r from-accent to-[#8EA6F5] shadow-glow transition-[width] duration-700 md:block" style={{ width: `${(i / (lifecycle.length - 1)) * 80}%` }} />
        <div role="tablist" aria-label="AI lifecycle stages" onKeyDown={onKey} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-5 md:gap-0 md:overflow-visible md:px-0">
          {lifecycle.map((s, n) => {
            const on = n === i, done = n < i;
            return (
              <button
                key={s.k}
                ref={(el) => { tabs.current[n] = el; }}
                role="tab" type="button" id={`lc-tab-${s.k}`} aria-selected={on} aria-controls="lc-panel" tabIndex={on ? 0 : -1}
                onClick={() => pick(n)}
                className="group flex shrink-0 flex-col items-center gap-3 rounded-lg px-2 py-1 text-center md:shrink"
              >
                <span className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border font-mono text-[12px] transition duration-300 ${on ? "border-accent bg-accent text-[#06121F] shadow-glow" : done ? "border-accent/70 bg-[#07131c] text-accent" : "border-line bg-surface text-ink-muted group-hover:border-accent/50"}`}>
                  {s.k}
                </span>
                <span className={`max-w-[11rem] text-[13px] font-medium leading-snug transition-colors ${on ? "text-ink" : "text-ink-muted group-hover:text-ink-soft"}`}>{s.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div id="lc-panel" role="tabpanel" aria-labelledby={`lc-tab-${st.k}`} className="card mt-6 grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div className="min-w-0">
          <p className="eyebrow text-accent">Stage {st.k} of 05</p>
          <h3 className="mt-2 text-[1.5rem] leading-snug">{st.title}</h3>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{st.lead}</p>
          <div className="mt-5 flex flex-wrap gap-1.5">{st.tools.map((t) => <span key={t} className="chip">{t}</span>)}</div>
          <Link href={st.href} className="mt-6 inline-flex text-[13.5px] font-medium text-accent hover:underline">{st.hrefLabel} →</Link>
        </div>
        <ul className="grid min-w-0 gap-3 sm:grid-cols-2">
          {st.facts.map((f) => (
            <li key={f} className="rounded-lg border border-line bg-paper/60 p-4 text-[14px] leading-relaxed text-ink-soft">
              <span aria-hidden className="mb-2 block h-[2px] w-6 bg-accent shadow-glow" />
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
