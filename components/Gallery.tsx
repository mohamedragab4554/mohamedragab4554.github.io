"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Figure } from "@/content/types";

export default function Gallery({ items }: { items: Figure[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const show = (i: number) => {
    setOpen(i);
    dialogRef.current?.showModal();
  };
  const close = useCallback(() => {
    dialogRef.current?.close();
    setOpen(null);
  }, []);
  const step = useCallback(
    (d: number) => setOpen((o) => (o === null ? o : (o + d + items.length) % items.length)),
    [items.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (open === null) return;
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step]);

  const cur = open !== null ? items[open] : null;

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        {items.map((f, i) => (
          <figure key={f.src} className={`group ${f.wide ? "sm:col-span-2" : ""}`}>
            <button
              type="button"
              onClick={() => show(i)}
              className="block w-full overflow-hidden rounded-lg border border-line bg-[#eef0ec] text-left"
              aria-label={`Enlarge image: ${f.caption}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={f.src}
                alt={f.alt}
                width={f.width}
                height={f.height}
                loading="lazy"
                className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.015]"
              />
            </button>
            <figcaption className="mt-2 text-[13px] leading-snug text-ink-muted">
              <span className="mr-1.5 font-mono text-[11px] text-accent">Fig. {String(i + 1).padStart(2, "0")}</span>
              {f.caption}
            </figcaption>
          </figure>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(null)}
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
        className="m-auto max-h-[92vh] w-[min(96vw,1400px)] rounded-xl border border-white/10 bg-navy p-0 text-white backdrop:bg-black/70"
        aria-label="Image viewer"
      >
        {cur ? (
          <div className="flex max-h-[92vh] flex-col">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-2.5">
              <p className="line-clamp-2 text-sm text-white/80">{cur.caption}</p>
              <div className="flex shrink-0 gap-1">
                <button type="button" onClick={() => step(-1)} className="rounded px-2.5 py-1.5 hover:bg-white/10" aria-label="Previous image">←</button>
                <button type="button" onClick={() => step(1)} className="rounded px-2.5 py-1.5 hover:bg-white/10" aria-label="Next image">→</button>
                <button type="button" onClick={close} className="rounded px-2.5 py-1.5 hover:bg-white/10" aria-label="Close image viewer" autoFocus>✕</button>
              </div>
            </div>
            <div className="overflow-auto bg-white p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cur.src} alt={cur.alt} className="mx-auto h-auto max-h-[80vh] w-auto max-w-full" />
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
