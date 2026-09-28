import type { PipelineStep } from "@/content/types";

/** Engineering-style pipeline diagram built only from verified steps. */
export default function Pipeline({ steps, dark = false, label }: { steps: PipelineStep[]; dark?: boolean; label: string }) {
  return (
    <figure aria-label={label} className="w-full">
      <ol className="grid gap-3 md:grid-flow-col md:auto-cols-fr md:gap-0">
        {steps.map((s, i) => (
          <li key={s.title} className="relative flex md:block">
            <div className={`relative z-10 flex-1 rounded-lg border p-4 md:mr-6 ${dark ? "border-white/15 bg-navy-800" : "border-line bg-surface"}`}>
              <div className={`font-mono text-[11px] ${dark ? "text-accent-onDark" : "text-accent"}`}>{String(i + 1).padStart(2, "0")}</div>
              <div className={`mt-1 text-[15px] font-semibold ${dark ? "text-white" : "text-ink"}`}>{s.title}</div>
              <p className={`mt-1.5 text-[13px] leading-snug ${dark ? "text-white/65" : "text-ink-muted"}`}>{s.detail}</p>
            </div>
            {i < steps.length - 1 ? (
              <span aria-hidden className={`absolute right-0 top-1/2 hidden h-px w-6 -translate-y-1/2 md:block ${dark ? "bg-white/30" : "bg-ink/25"}`}>
                <span className={`absolute -right-px -top-[3.5px] h-0 w-0 border-y-4 border-l-[6px] border-y-transparent ${dark ? "border-l-white/40" : "border-l-ink/35"}`} />
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </figure>
  );
}
