"use client";
import { useInView } from "@/lib/useInView";

/** Scroll reveal. Content is visible without JS; the motion class is only applied when JS runs
 *  and the user has not asked for reduced motion (see the inline script in layout.tsx). */
export default function Reveal({ children, className = "", delay = 0, as: Tag = "div" }: { children: React.ReactNode; className?: string; delay?: number; as?: "div" | "section" | "li" }) {
  const [ref, inView] = useInView<HTMLDivElement>();
  return (
    <Tag ref={ref as never} className={`reveal min-w-0 ${inView ? "is-in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Tag>
  );
}
