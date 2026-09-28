"use client";
import { useEffect, useRef, useState } from "react";
import { useInView } from "@/lib/useInView";

/** Animates the numeric part of a real metric ("0.941", "115+", "58 → 19" stays static). */
export default function CountUp({ value, className = "" }: { value: string; className?: string }) {
  const [ref, inView] = useInView<HTMLSpanElement>();
  const m = value.match(/^([^\d]*)(\d[\d,]*\.?\d*)(.*)$/);
  const animatable = !!m && !/[→·]/.test(value);
  const [shown, setShown] = useState(value);
  const mounted = useRef(0);
  useEffect(() => { mounted.current = performance.now(); }, []);
  useEffect(() => {
    if (!animatable || !inView || !m) return;
    if (document.documentElement.dataset.motion !== "ok") return;
    if (performance.now() - mounted.current < 250) return; // already on screen at load: no jump
    const raw = m[2].replace(/,/g, "");
    const target = parseFloat(raw);
    const dec = raw.includes(".") ? raw.split(".")[1].length : 0;
    const comma = m[2].includes(",");
    const t0 = performance.now(), dur = 1100;
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      const v = target * e;
      const s = dec ? v.toFixed(dec) : Math.round(v).toString();
      setShown(m[1] + (comma ? Number(s).toLocaleString("en-GB", { minimumFractionDigits: dec, maximumFractionDigits: dec }) : s) + m[3]);
      if (p < 1) raf = requestAnimationFrame(step);
      else setShown(value);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);
  return <span ref={ref} className={`tabular-nums ${className}`}>{shown}</span>;
}
