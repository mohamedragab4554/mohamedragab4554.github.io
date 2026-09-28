import { boxEdges, detections, frameEdges, projector, setOutGrid } from "./geometry";

/** Static line drawing of the same frame. Server-rendered, so the hero has a visual at first paint
 *  and a complete fallback for reduced motion, no WebGL, or low-power devices. */
export default function HeroFallback({ className = "" }: { className?: string }) {
  const W = 820, H = 680;
  const P = projector(W, H);
  const line = (a: [number, number, number], b: [number, number, number]) => {
    const p = P(a), q = P(b);
    return `M${p[0].toFixed(1)},${p[1].toFixed(1)}L${q[0].toFixed(1)},${q[1].toFixed(1)}`;
  };
  const edges = frameEdges().map(([a, b]) => line(a, b)).join("");
  const dets = detections();
  const grid = setOutGrid();
  const gridPath = grid.segs.map(([a, b]) => line(a, b)).join("");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} aria-hidden preserveAspectRatio="xMidYMid meet">
      <path d={gridPath} stroke="#9FB3C8" strokeOpacity={0.3} strokeWidth={1} strokeDasharray="5 4" fill="none" />
      {grid.bubbles.map((b) => {
        const q = P(b.at);
        return (
          <g key={b.label}>
            <circle cx={q[0]} cy={q[1]} r={9} fill="none" stroke="#FFFFFF" strokeOpacity={0.35} />
            <text x={q[0]} y={q[1] + 3.5} textAnchor="middle" fontSize={9.5} fontFamily="var(--font-mono), monospace" fill="#FFFFFF" fillOpacity={0.6}>{b.label}</text>
          </g>
        );
      })}
      <path d={edges} stroke="#5FD3CD" strokeOpacity={0.55} strokeWidth={1} fill="none" />
      {dets.map((d) => {
        const lp = P([d.min[0], d.max[1], d.max[2]]);
        return (
          <g key={d.label}>
            <path d={boxEdges(d).map(([a, b]) => line(a, b)).join("")} stroke="#F0A35E" strokeWidth={1.3} fill="none" />
            <rect x={lp[0]} y={lp[1] - 20} width={d.label.length * 6.6 + 10} height={15} rx={3} fill="#F0A35E" />
            <text x={lp[0] + 5} y={lp[1] - 9} fontSize={10} fontFamily="var(--font-mono), monospace" fill="#0A1220">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}
