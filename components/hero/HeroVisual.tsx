"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hero visual: an illustrative Scan-to-BIM sequence driven by a trained-AI narrative.
 * First paint is a still image of the same frame (server-rendered, no JS needed); the WebGL
 * scene loads straight away and cross-fades in. Devices without WebGL, or low-power ones,
 * keep a still of the finished model.
 */
function capability(): { webgl: boolean; small: boolean } {
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    const weak = (nav.hardwareConcurrency ?? 8) <= 2 || (nav.deviceMemory ?? 8) <= 2 || nav.connection?.saveData === true;
    const small = window.innerWidth < 768 || (nav.hardwareConcurrency ?? 8) <= 4;
    return { webgl: !!gl && !weak, small };
  } catch {
    return { webgl: false, small: true };
  }
}

export default function HeroVisual() {
  const root = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"poster" | "static">("poster");

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const cap = capability();
    if (!cap.webgl) { setMode("static"); return; }
    let dispose: (() => void) | undefined;
    let cancelled = false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    Promise.all([import("./scan"), import("./HeroScene")])
      .then(([scan, mod]) => {
        if (cancelled) return;
        const Sc = scan.buildScene(cap.small);
        dispose = mod.startHero(el, Sc, { reduced, onReady: () => el.classList.add("ready") });
      })
      .catch(() => setMode("static"));
    return () => { cancelled = true; dispose?.(); el.classList.remove("ready"); };
  }, []);

  const still = mode === "static" ? "model" : "scan";
  return (
    <div
      ref={root}
      className={`hv ${mode === "static" ? "hv-static" : ""}`}
      role="img"
      aria-label="Illustrative Scan-to-BIM sequence: a laser scan of a three-storey concrete frame is fed to a trained AI model, which classifies every point, detects each column, beam, slab and wall, and rejects temporary shoring. The recognised elements then become IFC objects."
    >
      <picture>
        <source media="(max-width: 519px)" srcSet={`/images/hero/${still}-m.webp`} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="hv-still" src={`/images/hero/${still}-d.webp`} alt="" aria-hidden="true" fetchPriority="high" decoding="async" />
      </picture>
      <canvas data-h="gl" className="hv-gl" aria-hidden="true" />
      <div data-h="labels" aria-hidden="true" />
      <div data-h="hud" className="hv-hud" aria-live="polite">
        <div className="hv-ttl"><span data-h="stage">01 Scan</span><i data-h="pts" /></div>
        <div className="hv-msg" data-h="msg">Laser scan captured. Every point carries x, y, z and intensity.</div>
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
            <span>Learned from labelled scans of each element type</span>
            <span className="hv-io">Fed this scan: <em data-h="in">0</em> points</span>
          </div>
        </div>
        <ul data-h="list" />
      </div>
      <p className="hv-note">Illustrative sequence on a synthetic frame. Real trained-model outputs are shown below and in the case studies.</p>
      <div data-h="tip" className="hv-tip" aria-hidden="true" />
      <div className="hv-bar">
        <div data-h="chips" className="hv-chips" />
        <span data-h="hint" className="hv-hint">Drag to rotate · hover an element to see what the AI recognised</span>
        <button data-h="replay" className="hv-replay" type="button">Replay</button>
      </div>
    </div>
  );
}
