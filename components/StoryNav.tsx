"use client";

import { useEffect, useState } from "react";

/** Sticky chapter bar with scroll-spy and a reading-progress line. */
export default function StoryNav({ chapters, accent, title }: { chapters: { id: string; label: string }[]; accent: string; title: string }) {
  const [active, setActive] = useState(chapters[0]?.id);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const els = chapters.map((c) => document.getElementById(c.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-25% 0px -65% 0px" },
    );
    els.forEach((e) => io.observe(e));
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const art = document.getElementById("story");
        if (!art) return;
        const r = art.getBoundingClientRect();
        setProgress(Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - window.innerHeight))));
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => { io.disconnect(); window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, [chapters]);

  return (
    <nav aria-label="Case study chapters" className="sticky top-16 z-30 border-b border-line bg-paper/90 backdrop-blur-md">
      <div className="container-page flex h-12 items-center gap-6">
        <p className="hidden max-w-[16rem] truncate text-[13px] font-semibold text-ink lg:block">{title}</p>
        <ol className="-mx-2 flex flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none] lg:justify-end">
          {chapters.map((c, i) => (
            <li key={c.id} className="shrink-0">
              <a
                href={`#${c.id}`}
                aria-current={c.id === active ? "true" : undefined}
                className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] transition-colors ${c.id === active ? "font-semibold text-ink" : "text-ink-muted hover:text-ink"}`}
              >
                <span className="font-mono text-[10.5px]" style={{ color: c.id === active ? accent : undefined }}>{String(i + 1).padStart(2, "0")}</span>
                {c.label}
              </a>
            </li>
          ))}
        </ol>
      </div>
      <span aria-hidden className="absolute bottom-[-1px] left-0 h-[2px] transition-[width] duration-150" style={{ width: `${progress * 100}%`, background: accent }} />
    </nav>
  );
}
