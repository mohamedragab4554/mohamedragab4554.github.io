"use client";

import { useId, useRef, useState } from "react";

type Side = { src: string; label: string; alt?: string };

/** Before/after comparison. Drag, click, or use the keyboard (arrow keys) on the range control. */
export default function CompareSlider({
  before, after, width, height, initial = 50, className = "", accent = "#5FD3CD", fit = "cover",
}: { before: Side; after: Side; width: number; height: number; initial?: number; className?: string; accent?: string; fit?: "cover" | "contain" }) {
  const [pos, setPos] = useState(initial);
  const box = useRef<HTMLDivElement>(null);
  const id = useId();
  const drag = useRef(false);

  const fromPointer = (clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };

  return (
    <div className={`select-none ${className}`}>
      <div
        ref={box}
        className="relative w-full touch-pan-y overflow-hidden rounded-lg bg-[#0B1522]"
        style={{ aspectRatio: `${width} / ${height}` }}
        onPointerDown={(e) => { drag.current = true; (e.target as Element).setPointerCapture?.(e.pointerId); fromPointer(e.clientX); }}
        onPointerMove={(e) => { if (drag.current) fromPointer(e.clientX); }}
        onPointerUp={() => { drag.current = false; }}
        onPointerCancel={() => { drag.current = false; }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={after.src} alt={after.alt ?? after.label} width={width} height={height} loading="lazy" draggable={false}
          className={`absolute inset-0 h-full w-full ${fit === "cover" ? "object-cover" : "object-contain"}`} />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={before.src} alt={before.alt ?? before.label} width={width} height={height} loading="lazy" draggable={false}
            className={`absolute inset-0 h-full w-full ${fit === "cover" ? "object-cover" : "object-contain"}`} />
        </div>
        <div aria-hidden className="absolute inset-y-0 w-px bg-white/90 shadow-[0_0_0_1px_rgba(0,0,0,.25)]" style={{ left: `${pos}%` }}>
          <span className="absolute left-1/2 top-1/2 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 bg-[#0A1220]/80 font-mono text-[11px] text-white backdrop-blur"
            style={{ borderColor: accent }}>⇆</span>
        </div>
        <span className="pointer-events-none absolute left-2 top-2 rounded bg-[#0A1220]/80 px-2 py-1 font-mono text-[10.5px] uppercase tracking-wider text-white">{before.label}</span>
        <span className="pointer-events-none absolute right-2 top-2 rounded px-2 py-1 font-mono text-[10.5px] uppercase tracking-wider text-[#0A1220]" style={{ background: accent }}>{after.label}</span>
      </div>
      <label htmlFor={id} className="sr-only">Comparison position: left shows {before.label}, right shows {after.label}</label>
      <input id={id} type="range" min={0} max={100} value={Math.round(pos)} onChange={(e) => setPos(Number(e.target.value))}
        className="compare-range mt-3 w-full" style={{ accentColor: accent }} />
    </div>
  );
}
