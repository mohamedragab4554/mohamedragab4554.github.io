"use client";

import Link from "next/link";
import { useState } from "react";
import { programme } from "@/content/story";

const LANES = ["Education", "Engineering", "AI & digital"] as const;

/** Career laid out like a construction programme (Gantt). */
export default function Programme() {
  const { start, end, bars } = programme;
  const [sel, setSel] = useState(bars.length - 2);
  const pct = (v: number) => ((v - start) / (end - start)) * 100;
  const years = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  const cur = bars[sel];

  return (
    <div>
      {/* desktop / tablet */}
      <div className="hidden md:block">
        <div className="relative ml-[120px]">
          <div className="relative h-6">
            {years.map((y) => (
              <span key={y} className="absolute -translate-x-1/2 font-mono text-[11px] text-ink-muted" style={{ left: `${pct(y)}%` }}>{y}</span>
            ))}
          </div>
        </div>
        <div className="relative">
          {LANES.map((lane) => {
            const rows = Math.max(...bars.filter((b) => b.lane === lane).map((b) => (b.row ?? 0) + 1));
            return (
            <div key={lane} className="relative flex items-center border-t border-line" style={{ height: 22 + rows * 36 }}>
              <span className="w-[120px] shrink-0 pr-3 font-mono text-[11px] uppercase tracking-wider text-ink-muted">{lane}</span>
              <div className="relative h-full flex-1">
                {years.map((y) => (
                  <span key={y} aria-hidden className="absolute inset-y-0 w-px bg-line/70" style={{ left: `${pct(y)}%` }} />
                ))}
                {bars.map((b, i) => b.lane !== lane ? null : (
                  <button
                    key={b.label}
                    type="button"
                    onClick={() => setSel(i)}
                    onMouseEnter={() => setSel(i)}
                    onFocus={() => setSel(i)}
                    aria-pressed={sel === i}
                    className={`group absolute h-7 min-w-[10px] rounded-[5px] border text-left transition ${sel === i ? "border-accent bg-accent text-[#06121F] shadow-glow" : "border-accent/30 bg-accent-tint text-ink hover:border-accent/70"}`}
                    style={{ left: `${pct(b.from)}%`, width: `${Math.max(pct(b.to) - pct(b.from), 1.2)}%`, top: 11 + (b.row ?? 0) * 36 }}
                    title={b.label}
                  >
                    <span className={`pointer-events-none absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-[12px] font-medium ${
                      (b.side ?? "in") === "in" ? `left-2 ${sel === i ? "text-[#06121F]" : ""}` : b.side === "left" ? "right-[calc(100%+8px)] text-ink-soft" : "left-[calc(100%+8px)] text-ink-soft"
                    } ${sel === i && b.side !== "in" ? "font-semibold text-ink" : ""}`}>
                      {b.side === "in" && b.short && pct(b.to) - pct(b.from) < 14 ? b.short : b.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            );
          })}
          <div className="border-t border-line" />
          <span aria-hidden className="absolute bottom-0 top-0 w-px bg-accent-bright" style={{ left: `calc(120px + (100% - 120px) * ${pct(2026.75) / 100})` }} />
          <span className="absolute -bottom-5 -translate-x-1/2 font-mono text-[10px] text-accent" style={{ left: `calc(120px + (100% - 120px) * ${pct(2026.75) / 100})` }}>today</span>
        </div>
        <div className="mt-10 flex flex-col gap-2 rounded-xl border border-line bg-surface p-5 sm:flex-row sm:items-center sm:justify-between" aria-live="polite">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-accent">{cur.lane}</p>
            <p className="mt-1 text-[17px] font-semibold">{cur.label}</p>
            <p className="text-[14.5px] text-ink-soft">{cur.detail}</p>
          </div>
          {cur.href ? <Link href={cur.href} className="btn-ghost shrink-0">Open →</Link> : null}
        </div>
      </div>

      {/* mobile */}
      <ol className="space-y-3 md:hidden">
        {[...bars].reverse().map((b) => (
          <li key={b.label} className="flex gap-3 rounded-lg border border-line bg-surface p-4">
            <span className="mt-1 font-mono text-[11px] text-ink-muted">{Math.floor(b.from)}</span>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-accent">{b.lane}</p>
              <p className="font-semibold">{b.label}</p>
              <p className="text-[14px] text-ink-soft">{b.detail}</p>
              {b.href ? <Link href={b.href} className="mt-1 inline-block text-[13.5px] font-medium text-accent">Open →</Link> : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
