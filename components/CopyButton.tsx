"use client";
import { useState } from "react";

export default function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      data-copy={text}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        } catch {
          /* clipboard refused: the address stays visible and selectable */
        }
      }}
      className="shrink-0 rounded-md border border-white/20 px-2.5 py-1 font-mono text-[11px] text-white/80 hover:bg-white/10"
      aria-label={`${label} ${text}`}
    >
      <span data-copy-label>{done ? "Copied" : label}</span>
    </button>
  );
}
