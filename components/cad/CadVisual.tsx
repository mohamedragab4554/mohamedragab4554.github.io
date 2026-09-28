"use client";

import { useEffect, useRef, useState } from "react";

/**
 * CAD-to-BIM visual: three stacked structural plans, AI detection on each, then a
 * level-by-level 3D build on top of the plans. Loads when it approaches the viewport;
 * a still of the stacked plans is server-rendered, and low-power devices keep a still
 * of the finished model.
 */
export default function CadVisual() {
  const root = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"poster" | "static">("poster");

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let dispose: (() => void) | undefined, cancelled = false;
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    let gl = false;
    try { const c = document.createElement("canvas"); gl = !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { gl = false; }
    const weak = (nav.hardwareConcurrency ?? 8) <= 2 || (nav.deviceMemory ?? 8) <= 2 || nav.connection?.saveData === true;
    if (!gl || weak) { setMode("static"); return; }
    const small = window.innerWidth < 768 || (nav.hardwareConcurrency ?? 8) <= 4;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const load = () => {
      Promise.all([import("./cadData"), import("./CadScene")])
        .then(([data, mod]) => {
          if (cancelled) return;
          dispose = mod.startCad(el, data.buildCad(), { reduced, small, onReady: () => el.classList.add("ready") });
        })
        .catch(() => setMode("static"));
    };
    const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { io.disconnect(); load(); } }, { rootMargin: "600px 0px" });
    io.observe(el);
    return () => { cancelled = true; io.disconnect(); dispose?.(); el.classList.remove("ready"); };
  }, []);

  const still = mode === "static" ? "model" : "plans";
  return (
    <div
      ref={root}
      className={`hv ${mode === "static" ? "hv-static" : ""}`}
      role="img"
      aria-label="Illustrative CAD-to-BIM sequence: three 2D structural plans (foundation, level 1 and roof) are stacked at their level heights; a trained AI model detects piles, columns, circular columns, beams, walls and openings on each plan; the detected elements are then built level by level into a 3D model on top of the plans."
    >
      <picture>
        <source media="(max-width: 519px)" srcSet={`/images/cad/${still}-m.webp`} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="hv-still" src={`/images/cad/${still}-d.webp`} alt="" aria-hidden="true" loading="lazy" decoding="async" />
      </picture>
      <canvas data-h="gl" className="hv-gl" aria-hidden="true" />
      <div data-h="labels" aria-hidden="true" />
      <div data-h="hud" className="hv-hud" aria-live="polite">
        <div className="hv-ttl"><span data-h="stage">01 Plans</span><i data-h="pts" /></div>
        <div className="hv-msg" data-h="msg">Three 2D structural plans, stacked at their level heights.</div>
        <div className="hv-ai">
          <svg className="hv-nn" viewBox="0 0 44 30" aria-hidden="true">
            <g>
              {[4, 12, 18, 26].flatMap((y1) => [8, 22].map((y2) => <line key={`a${y1}-${y2}`} x1="4" y1={y1} x2="22" y2={y2} />))}
              {[8, 22].flatMap((y1) => [5, 15, 25].map((y2) => <line key={`b${y1}-${y2}`} x1="22" y1={y1} x2="40" y2={y2} />))}
            </g>
            <g>
              {[4, 12, 18, 26].map((y) => <circle key={`i${y}`} cx="4" cy={y} r="1.8" />)}
              {[8, 22].map((y) => <circle key={`h${y}`} cx="22" cy={y} r="2.2" />)}
              <circle cx="40" cy="5" r="1.8" className="o0" /><circle cx="40" cy="15" r="1.8" className="o1" /><circle cx="40" cy="25" r="1.8" className="o2" />
            </g>
          </svg>
          <div>
            <b>Trained AI model</b>
            <span>8-class plan segmentation trained on 21,009 labelled tiles</span>
            <span className="hv-io">Fed: 3 structural plans</span>
          </div>
        </div>
        <ul data-h="list" />
      </div>
      <p className="hv-note">Illustrative sequence on synthetic plans. The element classes match my real 8-class plan model.</p>
      <div data-h="tip" className="hv-tip" aria-hidden="true" />
      <div className="hv-bar">
        <div data-h="chips" className="hv-chips" />
        <span data-h="hint" className="hv-hint">Drag to rotate · hover an element to see what the AI detected</span>
        <button data-h="replay" className="hv-replay" type="button">Replay</button>
      </div>
    </div>
  );
}
