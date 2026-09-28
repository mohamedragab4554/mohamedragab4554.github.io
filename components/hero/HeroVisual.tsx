"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import HeroFallback from "./HeroFallback";

const HeroCanvas = dynamic(() => import("./HeroCanvas"), { ssr: false });

const STAGES = [
  { k: "01", t: "Scan", d: "raw points" },
  { k: "02", t: "Segment", d: "classes, noise removed" },
  { k: "03", t: "Detect", d: "elements" },
  { k: "04", t: "Model", d: "IFC geometry" },
];

function capability(): { webgl: boolean; lite: boolean } {
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    const weak = (nav.hardwareConcurrency ?? 8) <= 2 || (nav.deviceMemory ?? 8) <= 2 || nav.connection?.saveData === true;
    const lite = window.innerWidth < 768 || (nav.hardwareConcurrency ?? 8) <= 4;
    return { webgl: !!gl && !weak, lite };
  } catch {
    return { webgl: false, lite: true };
  }
}

export default function HeroVisual() {
  const [mode, setMode] = useState<"poster" | "3d">("poster");
  const [lite, setLite] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [ready, setReady] = useState(false);
  const [stage, setStage] = useState(3);
  const [replay, setReplay] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const cap = capability();
    setLite(cap.lite);
    if (!cap.webgl) return;
    const start = () => { setStage(0); setMode("3d"); };
    // load the 3D module after first paint so it never delays the content
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const id = w.requestIdleCallback ? w.requestIdleCallback(start, { timeout: 900 }) : window.setTimeout(start, 250);
    return () => { if (!w.requestIdleCallback) clearTimeout(id); };
  }, []);

  return (
    <div className="relative h-full w-full">
      <HeroFallback className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${ready ? "opacity-0" : "opacity-100"}`} />
      {mode === "3d" ? (
        <div className={`absolute inset-0 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}>
          <HeroCanvas onReady={() => setReady(true)} onStage={setStage} reduced={reduced} replayKey={replay} lite={lite} />
        </div>
      ) : null}

      {/* stage readout */}
      <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] sm:bottom-5 sm:left-5">
        {STAGES.map((s, i) => (
          <span key={s.t} className={`flex items-center gap-1.5 transition-colors duration-500 ${i <= stage ? "text-[#CDE9E7]" : "text-white/30"}`}>
            <span className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${i === stage ? "bg-[#F0A35E]" : i < stage ? "bg-[#5FD3CD]" : "bg-white/25"}`} />
            {s.k} {s.t}
          </span>
        ))}
        {mode === "3d" && !reduced ? (
          <button
            type="button"
            onClick={() => { setStage(0); setReplay((r) => r + 1); }}
            className="pointer-events-auto ml-auto rounded border border-white/20 px-2 py-0.5 text-white/70 hover:bg-white/10 hover:text-white"
          >
            Replay
          </button>
        ) : null}
      </div>
    </div>
  );
}
