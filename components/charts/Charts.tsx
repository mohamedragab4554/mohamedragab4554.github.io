"use client";

import { useState } from "react";
import type { Chart } from "@/content/types";
import { useInView } from "@/lib/useInView";

const COLORS = ["var(--viz-1)", "var(--viz-2)", "var(--viz-3)"];

type Fmt = "fixed2" | "fixed3" | "percent" | "int" | undefined;
const fmt = (v: number, f: Fmt) =>
  f === "percent" ? `${(v * 100).toFixed(1)}%` : f === "int" ? Math.round(v).toLocaleString("en-GB") : f === "fixed2" ? v.toFixed(2) : v.toFixed(3);

type Tip = { xPct: number; yPct: number; lines: string[] } | null;

function Tooltip({ tip }: { tip: Tip }) {
  if (!tip) return null;
  return (
    <div
      role="status"
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+10px)] whitespace-nowrap rounded-md border border-line bg-surface px-2.5 py-1.5 text-[12px] shadow-card"
      style={{ left: `${tip.xPct}%`, top: `${tip.yPct}%` }}
    >
      {tip.lines.map((l, i) => (
        <div key={i} className={i === 0 ? "font-medium text-ink" : "font-mono text-ink-soft"}>{l}</div>
      ))}
    </div>
  );
}

function Legend({ names }: { names: string[] }) {
  if (names.length < 2) return null;
  return (
    <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[12px] text-ink-soft" aria-label="Legend">
      {names.map((n, i) => (
        <li key={n} className="flex items-center gap-2">
          <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: COLORS[i] }} />
          {n}
        </li>
      ))}
    </ul>
  );
}

function DataTable({ chart }: { chart: Chart }) {
  const cats = chart.kind === "line" ? chart.x.map(String) : chart.categories;
  const f = chart.format as Fmt;
  return (
    <details className="mt-3 text-[12px] text-ink-soft">
      <summary className="cursor-pointer select-none font-mono text-[11px] uppercase tracking-wider text-ink-muted hover:text-ink">View data table</summary>
      <div className="mt-2 max-h-72 overflow-auto rounded-md border border-line">
        <table className="w-full border-collapse text-left">
          <thead className="bg-paper">
            <tr>
              <th className="px-3 py-1.5 font-medium">{chart.kind === "line" ? chart.xLabel : "Category"}</th>
              {chart.series.map((s) => (
                <th key={s.name} className="px-3 py-1.5 font-medium">{s.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cats.map((c, i) => (
              <tr key={c} className="border-t border-line">
                <td className="px-3 py-1">{c}</td>
                {chart.series.map((s) => (
                  <td key={s.name} className="px-3 py-1 font-mono tabular-nums">{fmt(s.values[i], f)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

/* ---------------- grouped vertical columns ---------------- */
function GroupedBar({ c }: { c: Extract<Chart, { kind: "grouped-bar" }> }) {
  const [tip, setTip] = useState<Tip>(null);
  const W = 640, H = 290, L = 40, R = 8, T = 16, B = 34;
  const max = c.max ?? Math.max(...c.series.flatMap((s) => s.values)) * 1.1;
  const pw = W - L - R, ph = H - T - B;
  const band = pw / c.categories.length;
  const n = c.series.length;
  const bw = Math.min(24, (band * 0.62) / n);
  const gap = n > 1 ? 7 : 2;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);
  const y = (v: number) => T + ph - (v / max) * ph;
  return (
    <div className="relative" onMouseLeave={() => setTip(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${c.title}. Data table available below.`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="var(--viz-grid)" strokeWidth={1} />
            <text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill="var(--viz-axis)" className="font-mono">{t.toFixed(max <= 1 ? 2 : 1)}</text>
          </g>
        ))}
        {c.categories.map((cat, ci) => {
          const gx = L + ci * band + band / 2 - (n * bw + (n - 1) * gap) / 2;
          return (
            <g key={cat}>
              {c.series.map((s, si) => {
                const v = s.values[ci];
                const x = gx + si * (bw + gap);
                const top = y(v);
                const h = T + ph - top;
                const r = Math.min(4, h);
                const d = `M${x},${T + ph} L${x},${top + r} Q${x},${top} ${x + r},${top} L${x + bw - r},${top} Q${x + bw},${top} ${x + bw},${top + r} L${x + bw},${T + ph} Z`;
                return (
                  <g key={s.name}>
                    <path d={d} fill={COLORS[si]} className="bar-v" style={{ transitionDelay: `${ci * 90 + si * 40}ms` }} />
                    <text x={x + bw / 2} y={top - 5} textAnchor="middle" fontSize={9.5} fill="#3b4450" className="font-mono">{fmt(v, c.format)}</text>
                    <rect
                      x={x - 3} y={T} width={bw + 6} height={ph} fill="transparent"
                      onMouseEnter={() => setTip({ xPct: ((x + bw / 2) / W) * 100, yPct: (top / H) * 100, lines: [cat, `${s.name}: ${fmt(v, c.format)}`] })}
                    >
                      <title>{`${cat} · ${s.name}: ${fmt(v, c.format)}`}</title>
                    </rect>
                  </g>
                );
              })}
              <text x={L + ci * band + band / 2} y={H - 12} textAnchor="middle" fontSize={12} fill="#3b4450">{cat}</text>
            </g>
          );
        })}
        <line x1={L} x2={W - R} y1={T + ph} y2={T + ph} stroke="#c9cbc4" strokeWidth={1} />
      </svg>
      <Tooltip tip={tip} />
      <Legend names={c.series.map((s) => s.name)} />
    </div>
  );
}

/* ---------------- horizontal bars ---------------- */
function HBar({ c }: { c: Extract<Chart, { kind: "hbar" }> }) {
  const [tip, setTip] = useState<Tip>(null);
  const n = c.series.length;
  const bh = n > 1 ? 9 : 14;
  const rowH = n > 1 ? 2 * bh + 2 + 10 : bh + 12;
  const W = 640, L = 150, R = 52, T = 8, B = 26;
  const H = T + B + c.categories.length * rowH;
  const max = c.max ?? Math.max(...c.series.flatMap((s) => s.values)) * 1.1;
  const pw = W - L - R;
  const x = (v: number) => L + (v / max) * pw;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);
  return (
    <div className="relative" onMouseLeave={() => setTip(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${c.title}. Data table available below.`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={x(t)} x2={x(t)} y1={T} y2={H - B} stroke="var(--viz-grid)" strokeWidth={1} />
            <text x={x(t)} y={H - 8} textAnchor="middle" fontSize={11} fill="var(--viz-axis)" className="font-mono">{t.toFixed(2)}</text>
          </g>
        ))}
        {c.categories.map((cat, ci) => {
          const y0 = T + ci * rowH + 5;
          return (
            <g key={cat}>
              <text x={L - 10} y={y0 + (n * bh + (n - 1) * 2) / 2 + 4} textAnchor="end" fontSize={12} fill="#3b4450">{cat}</text>
              {c.series.map((s, si) => {
                const v = s.values[ci];
                const yy = y0 + si * (bh + 2);
                const w = Math.max(1, x(v) - L);
                const r = Math.min(4, w);
                const d = `M${L},${yy} L${L + w - r},${yy} Q${L + w},${yy} ${L + w},${yy + r} L${L + w},${yy + bh - r} Q${L + w},${yy + bh} ${L + w - r},${yy + bh} L${L},${yy + bh} Z`;
                return (
                  <g key={s.name}>
                    <path d={d} fill={COLORS[si]} opacity={si === 0 ? 1 : 0.85} className="bar-h" style={{ transitionDelay: `${ci * 45}ms` }} />
                    {si === 0 || n === 1 ? (
                      <text x={L + w + 6} y={yy + bh - 1} fontSize={10.5} fill="#3b4450" className="font-mono">{fmt(v, c.format)}</text>
                    ) : null}
                    <rect
                      x={L} y={yy - 1} width={pw} height={bh + 2} fill="transparent"
                      onMouseEnter={() => setTip({ xPct: ((L + w) / W) * 100, yPct: (yy / H) * 100, lines: [cat, `${s.name}: ${fmt(v, c.format)}`] })}
                    >
                      <title>{`${cat} · ${s.name}: ${fmt(v, c.format)}`}</title>
                    </rect>
                  </g>
                );
              })}
            </g>
          );
        })}
        {c.reference ? (
          <g>
            <line x1={x(c.reference.value)} x2={x(c.reference.value)} y1={T} y2={H - B} stroke="#101418" strokeWidth={1} opacity={0.55} />
            <text x={x(c.reference.value) - 4} y={H - B - 5} textAnchor="end" fontSize={10.5} fill="#101418" className="font-mono">{c.reference.label}</text>
          </g>
        ) : null}
        <line x1={L} x2={L} y1={T} y2={H - B} stroke="#c9cbc4" strokeWidth={1} />
      </svg>
      <Tooltip tip={tip} />
      <Legend names={c.series.map((s) => s.name)} />
    </div>
  );
}

/* ---------------- line ---------------- */
function Line({ c }: { c: Extract<Chart, { kind: "line" }> }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 640, H = 280, L = 44, R = 92, T = 14, B = 34;
  const min = c.min ?? 0, max = c.max ?? 1;
  const pw = W - L - R, ph = H - T - B;
  const xs = c.x;
  const x = (v: number) => L + ((v - xs[0]) / (xs[xs.length - 1] - xs[0])) * pw;
  const y = (v: number) => T + ph - ((v - min) / (max - min)) * ph;
  const ticks = Array.from({ length: 5 }, (_, i) => min + ((max - min) * i) / 4);
  const xticks = xs.filter((v, i) => i === 0 || i === xs.length - 1 || v % 5 === 0);
  const tip: Tip =
    hover === null
      ? null
      : { xPct: (x(xs[hover]) / W) * 100, yPct: (y(Math.max(...c.series.map((s) => s.values[hover]))) / H) * 100, lines: [`${c.xLabel} ${xs[hover]}`, ...c.series.map((s) => `${s.name}: ${fmt(s.values[hover], c.format)}`)] };
  return (
    <div className="relative" onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${c.title}. Data table available below.`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="var(--viz-grid)" strokeWidth={1} />
            <text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill="var(--viz-axis)" className="font-mono">{t.toFixed(2)}</text>
          </g>
        ))}
        {xticks.map((t) => (
          <text key={t} x={x(t)} y={H - 14} textAnchor="middle" fontSize={11} fill="var(--viz-axis)" className="font-mono">{t}</text>
        ))}
        <text x={L + pw / 2} y={H - 1} textAnchor="middle" fontSize={11} fill="var(--viz-axis)">{c.xLabel}</text>
        {c.highlight ? (
          <g>
            <line x1={x(c.highlight.x)} x2={x(c.highlight.x)} y1={T} y2={T + ph} stroke="#101418" opacity={0.25} strokeWidth={1} />
            <text x={x(c.highlight.x)} y={T + ph - 6} textAnchor="middle" fontSize={10.5} fill="#3b4450" className="font-mono">{c.highlight.label}</text>
          </g>
        ) : null}
        {hover !== null ? <line x1={x(xs[hover])} x2={x(xs[hover])} y1={T} y2={T + ph} stroke="#101418" opacity={0.35} strokeWidth={1} /> : null}
        {c.series.map((s, si) => {
          const d = s.values.map((v, i) => `${i ? "L" : "M"}${x(xs[i]).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
          const last = s.values.length - 1;
          return (
            <g key={s.name}>
              <path d={d} fill="none" stroke={COLORS[si]} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" pathLength={1} className="line-draw" style={{ transitionDelay: `${si * 200}ms` }} />
              <circle cx={x(xs[last])} cy={y(s.values[last])} r={4} fill={COLORS[si]} stroke="#fff" strokeWidth={2} />
              <text x={x(xs[last]) + 8} y={y(s.values[last]) + (si === 0 ? -4 : 12)} fontSize={11} fill="#3b4450">{s.name}</text>
              {hover !== null ? <circle cx={x(xs[hover])} cy={y(s.values[hover])} r={4} fill={COLORS[si]} stroke="#fff" strokeWidth={2} /> : null}
            </g>
          );
        })}
        {xs.map((v, i) => (
          <rect key={v} x={x(v) - pw / xs.length / 2} y={T} width={pw / xs.length} height={ph} fill="transparent" onMouseEnter={() => setHover(i)}>
            <title>{`${c.xLabel} ${v} · ` + c.series.map((s) => `${s.name}: ${fmt(s.values[i], c.format)}`).join(" · ")}</title>
          </rect>
        ))}
        <line x1={L} x2={W - R} y1={T + ph} y2={T + ph} stroke="#c9cbc4" strokeWidth={1} />
      </svg>
      <Tooltip tip={tip} />
      <Legend names={c.series.map((s) => s.name)} />
    </div>
  );
}

export default function ChartBlock({ chart }: { chart: Chart }) {
  const [ref, inView] = useInView<HTMLElement>();
  return (
    <figure ref={ref} className={`viz card min-w-0 p-5 sm:p-6 ${inView ? "viz-in" : ""}`}>
      <figcaption>
        <h4 className="text-[15px] font-semibold text-ink">{chart.title}</h4>
        {chart.subtitle ? <p className="mt-1 text-[13px] text-ink-muted">{chart.subtitle}</p> : null}
      </figcaption>
      <div className="-mx-1 mt-4 overflow-x-auto px-1 [&>div]:min-w-[540px]">
        {chart.kind === "grouped-bar" ? <GroupedBar c={chart} /> : chart.kind === "hbar" ? <HBar c={chart} /> : <Line c={chart} />}
      </div>
      {chart.note ? <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">{chart.note}</p> : null}
      <DataTable chart={chart} />
      <p className="mt-2 break-words font-mono text-[10.5px] text-ink-muted">Source: {chart.source}</p>
    </figure>
  );
}
