/**
 * AECAI production architecture, drawn from AECAI\PROJECT_KNOWLEDGE.md §3–6.
 * Ownership is marked honestly: the console (incl. the parallel dispatch in
 * cv-detection.ts) and the spalling + rebar pipeline are mine; edge functions
 * and database migrations belong to another team member.
 */
type Node = { title: string; host: string; detail: string; mine?: boolean };

const STAGES: { label: string; nodes: Node[] }[] = [
  { label: "App", nodes: [{ title: "Inspection console", host: "Next.js · Vercel", detail: "Inspector uploads photos per location; one action dispatches both models in parallel", mine: true }] },
  { label: "Orchestration", nodes: [{ title: "Edge functions", host: "Supabase", detail: "cv-detect · cv-detect-spalling: submit jobs, poll, store results" }] },
  {
    label: "Inference",
    nodes: [
      { title: "Crack U-Net worker", host: "RunPod serverless GPU", detail: "Scales from zero; weights pulled from Hugging Face at cold start" },
      { title: "Spalling + rebar worker", host: "RunPod serverless GPU", detail: "224 px patches, Gaussian stitching, flip TTA, post-processing", mine: true },
    ],
  },
  { label: "Data", nodes: [{ title: "Runs, findings, images", host: "Supabase Postgres + Storage", detail: "One run per model; one finding per defect region, with geometry and confidence" }] },
  { label: "Decision", nodes: [{ title: "Engineer review & report", host: "Console", detail: "Findings are checked by an engineer before a report is issued", mine: true }] },
];

export default function ArchitectureDiagram({ dark = false }: { dark?: boolean }) {
  const box = dark ? "border-white/12 bg-white/[0.04]" : "border-line bg-surface";
  const mineBox = dark ? "border-[#5FD3CD]/70 bg-[#5FD3CD]/[0.07]" : "border-[#0B6E6B]/60 bg-[#DDF1EF]";
  const muted = dark ? "text-white/55" : "text-ink-muted";
  const strong = dark ? "text-white" : "text-ink";
  const accent = dark ? "text-[#5FD3CD]" : "text-[#0B6E6B]";
  return (
    <figure aria-labelledby="arch-cap">
      <ol className="grid gap-3 lg:grid-cols-5 lg:gap-0" aria-label="AECAI inference pipeline, in order">
        {STAGES.map((st, i) => (
          <li key={st.label} className="relative flex flex-col lg:px-2 first:lg:pl-0 last:lg:pr-0">
            <p className={`mb-2 font-mono text-[10px] uppercase tracking-[0.14em] ${muted}`}>
              {String(i + 1).padStart(2, "0")} · {st.label}
            </p>
            <div className="flex flex-1 flex-col gap-2">
              {st.nodes.map((n) => (
                <div key={n.title} className={`flex flex-1 flex-col rounded-lg border p-3 ${n.mine ? mineBox : box}`}>
                  <span className={`text-[13.5px] font-semibold leading-snug ${strong}`}>{n.title}</span>
                  <span className={`mt-0.5 font-mono text-[10.5px] ${accent}`}>{n.host}</span>
                  <span className={`mt-1.5 text-[12px] leading-snug ${muted}`}>{n.detail}</span>
                  {n.mine ? <span className={`mt-2 font-mono text-[9.5px] uppercase tracking-[0.14em] ${accent}`}>● Built by me</span> : null}
                </div>
              ))}
            </div>
            {i < STAGES.length - 1 ? (
              <span aria-hidden className={`pointer-events-none absolute z-10 hidden lg:block ${accent}`} style={{ right: -7, top: "55%" }}>
                ▸
              </span>
            ) : null}
            {i < STAGES.length - 1 ? <span aria-hidden className={`mx-auto mt-2 block text-center lg:hidden ${accent}`}>▾</span> : null}
          </li>
        ))}
      </ol>
      <figcaption id="arch-cap" className={`mt-4 text-[12.5px] leading-relaxed ${muted}`}>
        AECAI production pipeline. Highlighted parts are mine: the console, the parallel dispatch and the spalling-and-rebar pipeline. Another team member owns the edge functions and database migrations. Every push to main redeploys the app (Vercel) and rebuilds the worker images (RunPod).
      </figcaption>
    </figure>
  );
}
