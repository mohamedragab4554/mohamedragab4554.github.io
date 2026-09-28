"use client";

import { useState } from "react";
import CompareSlider from "./CompareSlider";
import { inferenceImages, inferenceLayers } from "@/content/story";

/** The same real site photo through three models. Every layer is an actual output from the
 *  MSc external-validation run; nothing is re-drawn. */
export default function InferenceViewer({ accent = "#F0A35E", compact = false }: { accent?: string; compact?: boolean }) {
  const [img, setImg] = useState(0);
  const [layer, setLayer] = useState<(typeof inferenceLayers)[number]["key"]>("unet");
  const cur = inferenceImages[img];
  const L = inferenceLayers.find((l) => l.key === layer)!;
  const base = `/images/inference/${cur.id}`;

  return (
    <div className={`grid gap-6 ${compact ? "lg:grid-cols-[minmax(0,420px)_1fr]" : "lg:grid-cols-[minmax(0,460px)_1fr]"} lg:items-start`}>
      <div className="mx-auto w-full max-w-[460px]">
        <CompareSlider
          key={cur.id + layer}
          before={{ src: `${base}_input.webp`, label: "Input", alt: `Site photo: ${cur.title}` }}
          after={{ src: `${base}_${layer}.webp`, label: L.name, alt: `${L.name} output on the same photo` }}
          width={960}
          height={1280}
          initial={50}
          accent={accent}
        />
      </div>

      <div className="min-w-0">
        <fieldset>
          <legend className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/55">Site photo</legend>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {inferenceImages.map((m, i) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setImg(i)}
                aria-pressed={i === img}
                className={`group relative overflow-hidden rounded-md border transition ${i === img ? "border-white/80" : "border-white/10 hover:border-white/40"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/images/inference/${m.id}_input.webp`} alt="" width={960} height={1280} loading="lazy" className="aspect-[3/4] w-full object-cover opacity-80 transition group-hover:opacity-100" />
                <span className="sr-only">{m.title}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-7">
          <legend className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/55">Model output</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {inferenceLayers.map((l) => (
              <label
                key={l.key}
                className={`cursor-pointer rounded-lg border p-3.5 transition ${layer === l.key ? "border-white/70 bg-white/[0.07]" : "border-white/10 hover:border-white/30"}`}
              >
                <input type="radio" name="layer" value={l.key} checked={layer === l.key} onChange={() => setLayer(l.key)} className="sr-only" />
                <span className="flex items-center gap-2 text-[14.5px] font-medium text-white">
                  <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: layer === l.key ? accent : "rgba(255,255,255,.25)" }} />
                  {l.name}
                </span>
                <span className="mt-1 block text-[13px] leading-snug text-white/65">{l.note}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-7 rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: accent }}>What to look for</p>
          <p className="mt-1.5 text-[15px] font-medium text-white">{cur.title}</p>
          <p className="mt-1 text-[14px] leading-relaxed text-white/70">{cur.look}</p>
        </div>
        <p className="mt-4 text-[12px] leading-relaxed text-white/50">
          Real outputs from the dissertation&apos;s external validation on industry site photographs (Belfast). Drag the divider or use the slider to compare with the untouched input.
        </p>
      </div>
    </div>
  );
}
