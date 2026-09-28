"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { showcase, accents } from "@/content/story";
import ArchitectureDiagram from "@/components/ArchitectureDiagram";

export default function Showcase() {
  const [active, setActive] = useState(0);
  const [img, setImg] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const lane = showcase[active];
  const acc = accents[lane.accent];

  const select = (i: number) => {
    setActive(i);
    setImg(0);
  };
  const onKey = (e: React.KeyboardEvent) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = (active + d + showcase.length) % showcase.length;
    select(n);
    tabs.current[n]?.focus();
  };
  const main = lane.images[img];

  return (
    <div>
      <div role="tablist" aria-label="Areas of work" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" onKeyDown={onKey}>
        {showcase.map((l, i) => {
          const on = i === active;
          return (
            <button
              key={l.key}
              ref={(el) => { tabs.current[i] = el; }}
              role="tab"
              id={`sc-tab-${l.key}`}
              aria-selected={on}
              aria-controls={`sc-panel-${l.key}`}
              tabIndex={on ? 0 : -1}
              type="button"
              onClick={() => select(i)}
              className={`shrink-0 rounded-full border px-4 py-2 text-[13.5px] font-medium transition ${on ? "border-transparent text-white" : "border-line bg-paper text-ink-soft hover:border-ink/30 hover:text-ink"}`}
              style={on ? { background: accents[l.accent].onLight } : undefined}
            >
              <span className="mr-2 font-mono text-[10.5px] opacity-70">{String(i + 1).padStart(2, "0")}</span>
              {l.tab}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`sc-panel-${lane.key}`}
        aria-labelledby={`sc-tab-${lane.key}`}
        className="mt-6 grid gap-8 rounded-2xl border border-line bg-paper p-5 shadow-card sm:p-7 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]"
      >
        {lane.diagram ? (
          <div className="min-w-0 rounded-xl border border-line bg-surface/60 p-4 sm:p-5 lg:col-span-2">
            <ArchitectureDiagram />
          </div>
        ) : null}
        <div className="min-w-0">
          {lane.diagram ? (
            <>
              {lane.images[0] ? (
                <figure>
                  <a href={lane.images[0].src} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl border border-line" aria-label={`Open full-size image: ${lane.images[0].caption}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={lane.images[0].src} alt={lane.images[0].alt} width={lane.images[0].width} height={lane.images[0].height} loading="lazy" className="h-auto w-full" />
                  </a>
                  <figcaption className="mt-2 text-[13px] text-ink-muted">{lane.images[0].caption}</figcaption>
                </figure>
              ) : null}
            </>
          ) : (
            <>
              <a href={main.src} target="_blank" rel="noopener noreferrer" className="group block overflow-hidden rounded-xl border border-line bg-[#eef0ec]" aria-label={`Open full-size image: ${main.caption}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={main.src}
                  src={main.src}
                  alt={main.alt}
                  width={main.width}
                  height={main.height}
                  loading="lazy"
                  className="mx-auto max-h-[440px] w-auto object-contain transition-transform duration-500 group-hover:scale-[1.01]"
                />
              </a>
              <p className="mt-2 text-[13px] text-ink-muted">{main.caption}</p>
            </>
          )}
          {!lane.diagram && lane.images.length > 1 ? (
            <ul className="mt-4 grid grid-cols-3 gap-3" aria-label="More images">
              {lane.images.map((f, i) => {
                const on = i === img;
                const inner = (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.src} alt="" width={f.width} height={f.height} loading="lazy" className="h-20 w-full object-cover object-top sm:h-24" />
                );
                return (
                  <li key={f.src}>
                    <button
                        type="button"
                        onClick={() => setImg(i)}
                        aria-pressed={on}
                        aria-label={`Show image: ${f.caption}`}
                        className={`block w-full overflow-hidden rounded-lg border-2 transition ${on ? "" : "border-transparent opacity-70 hover:opacity-100"}`}
                        style={on ? { borderColor: acc.onLight } : undefined}
                      >
                        {inner}
                      </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-col">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.14em]" style={{ color: acc.onLight }}>{lane.tab}</p>
          <h3 className="mt-2 text-[1.45rem] leading-snug">{lane.title}</h3>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{lane.body}</p>
          <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-line pt-5">
            {lane.facts.map((f) => (
              <div key={f.label} className="min-w-0">
                <dd className="break-words text-[1.15rem] font-semibold leading-tight text-ink">{f.value}</dd>
                <dt className="mt-1 text-[12px] leading-snug text-ink-muted">{f.label}</dt>
              </div>
            ))}
          </dl>
          <Link href={lane.href} className="mt-auto inline-flex pt-6 text-[14px] font-medium hover:underline" style={{ color: acc.onLight }}>
            {lane.hrefLabel} →
          </Link>
        </div>
      </div>
    </div>
  );
}
