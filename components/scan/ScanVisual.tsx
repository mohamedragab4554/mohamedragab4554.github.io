"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Real Scan-to-BIM visual: Kladno station laser scan (public benchmark) + my final IFC model.
 * Loads its ~1 MB of data only when the section approaches the viewport. Phones load
 * 50,000 points; desktops 120,000.
 */
export default function ScanVisual() {
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
    const bin = (u: string) => fetch(u).then((r) => { if (!r.ok) throw new Error(u); return r.arrayBuffer(); });
    const load = () => {
      Promise.all([import("./ScanScene"), fetch("/data/kladno/meta.json").then((r) => r.json()), bin("/data/kladno/points-a.bin"), small ? Promise.resolve(null) : bin("/data/kladno/points-b.bin"), bin("/data/kladno/mesh.bin")])
        .then(([mod, meta, a, b, m]) => {
          if (cancelled) return;
          let pts = new Uint8Array(a);
          if (b) { const all = new Uint8Array(a.byteLength + b.byteLength); all.set(new Uint8Array(a), 0); all.set(new Uint8Array(b), a.byteLength); pts = all; }
          dispose = mod.startScan(el, meta, pts, new Int16Array(m), { reduced, small, onReady: () => el.classList.add("ready") });
        })
        .catch(() => setMode("static"));
    };
    const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { io.disconnect(); load(); } }, { rootMargin: "600px 0px" });
    io.observe(el);
    return () => { cancelled = true; io.disconnect(); dispose?.(); el.classList.remove("ready"); };
  }, []);

  const still = mode === "static" ? "model" : "scan";
  return (
    <div
      ref={root}
      className={`hv ${mode === "static" ? "hv-static" : ""}`}
      role="img"
      aria-label="Scan-to-BIM on real data: a laser scan of Kladno railway station (250.5 million points, 120,000 shown) is segmented into walls, slabs, roof and openings, each element is extracted, and my final IFC model of the station is revealed storey by storey inside the scan."
    >
      <picture>
        <source media="(max-width: 519px)" srcSet={`/images/scan3d/${still}-m.webp`} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="hv-still" src={`/images/scan3d/${still}-d.webp`} alt="" aria-hidden="true" loading="lazy" decoding="async" />
      </picture>
      <canvas data-h="gl" className="hv-gl" aria-hidden="true" />
      <div data-h="labels" aria-hidden="true" />
      <div data-h="hud" className="hv-hud" aria-live="polite">
        <div className="hv-ttl"><span data-h="stage">01 Scan</span><i data-h="pts" /></div>
        <div className="hv-msg" data-h="msg">Real laser scan of Kladno railway station: 250.5 M points (120,000 shown).</div>
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
            <b>My Scan-to-BIM engine</b>
            <span>Density analysis + my geometry classifiers (PCA, connected components) → IFC</span>
            <span className="hv-io">Fed: <em data-h="in">250.5 M</em> scan points</span>
          </div>
        </div>
        <ul data-h="list" />
      </div>
      <p className="hv-note">Real scan (public Kladno station benchmark) and my final IFC output, shown in their shared coordinates.</p>
      <div data-h="tip" className="hv-tip" aria-hidden="true" />
      <div className="hv-bar">
        <div data-h="chips" className="hv-chips" />
        <span data-h="hint" className="hv-hint">Drag to rotate · hover the model to see its supporting points</span>
        <button data-h="replay" className="hv-replay" type="button" aria-label="Replay the sequence">Replay</button>
      </div>
    </div>
  );
}
