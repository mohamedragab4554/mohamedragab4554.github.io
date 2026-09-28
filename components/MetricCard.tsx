import type { Metric } from "@/content/types";
import { cite } from "@/lib/cite";

export default function MetricCard({ m, dark = false }: { m: Metric; dark?: boolean }) {
  return (
    <div
      className={`relative flex flex-col rounded-xl border p-5 ${dark ? "border-white/12 bg-white/[0.04]" : "border-line bg-surface shadow-card"}`}
      title={`Source: ${cite(m.source)}`}
    >
      <span aria-hidden className={`absolute left-5 top-0 h-[3px] w-8 rounded-b ${dark ? "bg-accent-onDark" : "bg-accent-bright"}`} />
      <span className={`mt-1 text-[2rem] font-semibold leading-none tracking-tight ${dark ? "text-white" : "text-ink"}`}>{m.value}</span>
      <span className={`mt-3 text-sm font-medium ${dark ? "text-white/90" : "text-ink"}`}>{m.label}</span>
      {m.context ? <span className={`mt-1 font-mono text-[11px] leading-snug ${dark ? "text-white/55" : "text-ink-muted"}`}>{m.context}</span> : null}
    </div>
  );
}
