"use client";

import { useState } from "react";
import type { PipelineStep } from "@/content/types";

/** Interactive workflow: choose a stage to see what happens there. */
export default function StepExplorer({ steps, accent }: { steps: PipelineStep[]; accent: string }) {
  const [i, setI] = useState(0);
  return (
    <div>
      <div role="tablist" aria-label="Workflow stages" className="grid gap-2 sm:grid-flow-col sm:auto-cols-fr">
        {steps.map((s, k) => (
          <button
            key={s.title}
            role="tab"
            id={`step-${k}`}
            aria-selected={i === k}
            aria-controls="step-panel"
            onClick={() => setI(k)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") { e.preventDefault(); setI((k + 1) % steps.length); (document.getElementById(`step-${(k + 1) % steps.length}`) as HTMLElement)?.focus(); }
              if (e.key === "ArrowLeft") { e.preventDefault(); setI((k - 1 + steps.length) % steps.length); (document.getElementById(`step-${(k - 1 + steps.length) % steps.length}`) as HTMLElement)?.focus(); }
            }}
            tabIndex={i === k ? 0 : -1}
            className={`group relative rounded-lg border px-4 py-3 text-left transition ${i === k ? "border-ink/80 bg-surface shadow-card" : "border-line bg-paper hover:border-ink/30"}`}
          >
            <span className="font-mono text-[11px]" style={{ color: i === k ? accent : undefined }}>{String(k + 1).padStart(2, "0")}</span>
            <span className="block text-[15px] font-semibold">{s.title}</span>
            <span aria-hidden className="absolute inset-x-4 bottom-0 h-[2px] origin-left scale-x-0 transition-transform duration-300 group-aria-selected:scale-x-100" style={{ background: accent }} />
            {k < steps.length - 1 ? <span aria-hidden className="absolute -right-[9px] top-1/2 z-10 hidden -translate-y-1/2 text-ink/30 sm:block">›</span> : null}
          </button>
        ))}
      </div>
      <div id="step-panel" role="tabpanel" aria-labelledby={`step-${i}`} className="mt-4 rounded-lg border border-line bg-surface p-5">
        <p className="font-mono text-[11px] uppercase tracking-wider" style={{ color: accent }}>Stage {i + 1} of {steps.length}</p>
        <p className="mt-1 text-lg font-semibold">{steps[i].title}</p>
        <p className="mt-1 text-[15px] leading-relaxed text-ink-soft">{steps[i].detail}</p>
      </div>
    </div>
  );
}
