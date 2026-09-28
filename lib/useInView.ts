"use client";
import { useEffect, useRef, useState } from "react";

/** True once the element has entered the viewport (never flips back). */
export function useInView<T extends Element>(rootMargin = "0px 0px -12% 0px") {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    if (!("IntersectionObserver" in window)) { setInView(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } }, { rootMargin });
    io.observe(el);
    const fallback = window.setTimeout(() => setInView(true), 4000);
    return () => { io.disconnect(); clearTimeout(fallback); };
  }, [inView, rootMargin]);
  return [ref, inView] as const;
}
