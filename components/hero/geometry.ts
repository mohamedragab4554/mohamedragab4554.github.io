/**
 * Procedural geometry for the hero visual: an abstract reinforced-concrete frame
 * (4 × 3 bays, 4 storeys). Shared by the WebGL scene and the static SVG fallback,
 * so both show exactly the same structure.
 *
 * This is an illustrative visual of a scan → segment → detect → model workflow.
 * It is not a model output and carries no project claims.
 */

export const BAYS_X = 4;
export const BAYS_Z = 3;
export const STOREYS = 4;
export const SPAN_X = 6; // m
export const SPAN_Z = 5; // m
export const STOREY_H = 3.5; // m

export const WIDTH = BAYS_X * SPAN_X; // 24
export const DEPTH = BAYS_Z * SPAN_Z; // 15
export const HEIGHT = STOREYS * STOREY_H; // 14

/** Scale metres into scene units and centre on the origin. */
export const S = 0.16;
export const toScene = (x: number, y: number, z: number): [number, number, number] => [
  (x - WIDTH / 2) * S,
  (y - HEIGHT / 2) * S,
  (z - DEPTH / 2) * S,
];

export type Seg = [[number, number, number], [number, number, number]];

/** Model edges: columns, beams and slab outlines, ordered bottom-up so they can "build". */
export function frameEdges(): Seg[] {
  const segs: Seg[] = [];
  for (let s = 0; s < STOREYS; s++) {
    const y0 = s * STOREY_H;
    const y1 = (s + 1) * STOREY_H;
    for (let i = 0; i <= BAYS_X; i++)
      for (let k = 0; k <= BAYS_Z; k++) segs.push([toScene(i * SPAN_X, y0, k * SPAN_Z), toScene(i * SPAN_X, y1, k * SPAN_Z)]);
    for (let k = 0; k <= BAYS_Z; k++)
      for (let i = 0; i < BAYS_X; i++) segs.push([toScene(i * SPAN_X, y1, k * SPAN_Z), toScene((i + 1) * SPAN_X, y1, k * SPAN_Z)]);
    for (let i = 0; i <= BAYS_X; i++)
      for (let k = 0; k < BAYS_Z; k++) segs.push([toScene(i * SPAN_X, y1, k * SPAN_Z), toScene(i * SPAN_X, y1, (k + 1) * SPAN_Z)]);
  }
  // ground slab outline
  const g = [toScene(0, 0, 0), toScene(WIDTH, 0, 0), toScene(WIDTH, 0, DEPTH), toScene(0, 0, DEPTH)];
  for (let i = 0; i < 4; i++) segs.unshift([g[i], g[(i + 1) % 4]]);
  return segs;
}

/** Axis-aligned boxes (scene units) for the three "detected" elements. */
export type Detection = { label: string; min: [number, number, number]; max: [number, number, number] };
export function detections(): Detection[] {
  const c = 0.3; // half column width (m) plus box margin
  return [
    { label: "IfcColumn", min: toScene(0 - c, 0, DEPTH - c), max: toScene(0 + c, 2 * STOREY_H, DEPTH + c) },
    { label: "IfcBeam", min: toScene(1 * SPAN_X, 2 * STOREY_H - 0.7, DEPTH - c), max: toScene(3 * SPAN_X, 2 * STOREY_H + 0.1, DEPTH + c) },
    { label: "IfcSlab", min: toScene(2 * SPAN_X, 4 * STOREY_H - 0.3, 0), max: toScene(4 * SPAN_X, 4 * STOREY_H + 0.1, 2 * SPAN_Z) },
  ];
}

/** Structural setting-out grid on the ground (lines 1–5 and A–D), as on a GA drawing. */
export type Bubble = { label: string; at: [number, number, number] };
export function setOutGrid(): { segs: Seg[]; bubbles: Bubble[] } {
  const segs: Seg[] = [], bubbles: Bubble[] = [];
  const ext = 2.4;
  for (let i = 0; i <= BAYS_X; i++) {
    segs.push([toScene(i * SPAN_X, 0, -ext), toScene(i * SPAN_X, 0, DEPTH + ext)]);
    bubbles.push({ label: String(i + 1), at: toScene(i * SPAN_X, 0, DEPTH + ext + 0.9) });
  }
  for (let k = 0; k <= BAYS_Z; k++) {
    segs.push([toScene(-ext, 0, k * SPAN_Z), toScene(WIDTH + ext, 0, k * SPAN_Z)]);
    bubbles.push({ label: "ABCD"[k], at: toScene(-ext - 0.9, 0, k * SPAN_Z) });
  }
  return { segs, bubbles };
}

/** Slab rectangles (scene units), for the faint BIM surfaces. */
export function slabs(): [number, number, number][][] {
  const out: [number, number, number][][] = [];
  for (let s = 1; s <= STOREYS; s++) {
    const y = s * STOREY_H;
    out.push([toScene(0, y, 0), toScene(WIDTH, y, 0), toScene(WIDTH, y, DEPTH), toScene(0, y, DEPTH)]);
  }
  return out;
}

export function boxEdges(d: Detection): Seg[] {
  const [x0, y0, z0] = d.min;
  const [x1, y1, z1] = d.max;
  const p = [
    [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1],
    [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1],
  ] as [number, number, number][];
  const e = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
  return e.map(([a, b]) => [p[a], p[b]]);
}

/** Seeded PRNG so server and client render identical fallbacks. */
export function rng(seed = 7) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export type Cloud = { target: Float32Array; start: Float32Array; cls: Float32Array; rnd: Float32Array; count: number };

/** Sample a scan-like point cloud on the frame surfaces plus site clutter. */
export function pointCloud(density = 1): Cloud {
  const r = rng(11);
  const T: number[] = [], C: number[] = [];
  const push = (x: number, y: number, z: number, cls: number) => { T.push(...toScene(x, y, z)); C.push(cls); };
  const n = (v: number) => Math.max(1, Math.round(v * density));
  const cw = 0.45; // column width (m)
  for (let s = 0; s < STOREYS; s++)
    for (let i = 0; i <= BAYS_X; i++)
      for (let k = 0; k <= BAYS_Z; k++)
        for (let q = 0; q < n(48); q++) {
          const face = Math.floor(r() * 4), t = r() - 0.5;
          const dx = face < 2 ? (face ? cw / 2 : -cw / 2) : t * cw;
          const dz = face < 2 ? t * cw : (face === 2 ? cw / 2 : -cw / 2);
          push(i * SPAN_X + dx, s * STOREY_H + r() * STOREY_H, k * SPAN_Z + dz, 0);
        }
  for (let s = 1; s <= STOREYS; s++) {
    const y = s * STOREY_H;
    for (let k = 0; k <= BAYS_Z; k++)
      for (let i = 0; i < BAYS_X; i++)
        for (let q = 0; q < n(26); q++) push(i * SPAN_X + r() * SPAN_X, y - r() * 0.6, k * SPAN_Z + (r() - 0.5) * 0.35, 1);
    for (let i = 0; i <= BAYS_X; i++)
      for (let k = 0; k < BAYS_Z; k++)
        for (let q = 0; q < n(22); q++) push(i * SPAN_X + (r() - 0.5) * 0.35, y - r() * 0.6, k * SPAN_Z + r() * SPAN_Z, 1);
    for (let q = 0; q < n(820); q++) push(r() * WIDTH, y + (r() - 0.5) * 0.08, r() * DEPTH, 2);
  }
  for (let q = 0; q < n(700); q++) push(-2 + r() * (WIDTH + 4), (r() - 0.5) * 0.1, -2 + r() * (DEPTH + 4), 2); // ground
  // clutter: scaffolding, props and noise that the segmentation step removes
  for (let q = 0; q < n(1500); q++) {
    const edge = r() < 0.55;
    const x = edge ? (r() < 0.5 ? -1.2 : WIDTH + 1.2) + (r() - 0.5) * 0.6 : r() * WIDTH;
    push(x, r() * HEIGHT * 0.95, -1.5 + r() * (DEPTH + 3), 3);
  }
  const count = C.length;
  const start = new Float32Array(count * 3), rnd = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const th = r() * Math.PI * 2, ph = Math.acos(2 * r() - 1), rad = 2.6 + r() * 1.6;
    start[i * 3] = rad * Math.sin(ph) * Math.cos(th);
    start[i * 3 + 1] = rad * Math.cos(ph) * 0.55;
    start[i * 3 + 2] = rad * Math.sin(ph) * Math.sin(th);
    rnd[i] = r();
  }
  return { target: new Float32Array(T), start, cls: new Float32Array(C), rnd, count };
}

/** Simple perspective projection for the SVG fallback (matches the 3D camera). */
export function projector(width: number, height: number, yaw = -0.72, pitch = 0.44, dist = 8.3, fov = 34, lookY = -0.3) {
  const f = height / 2 / Math.tan(((fov / 2) * Math.PI) / 180);
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  return ([x, y0, z]: [number, number, number]): [number, number, number] => {
    const y = y0 - lookY;
    const x1 = cy * x - sy * z, z1 = sy * x + cy * z;
    const y2 = cp * y - sp * z1, z2 = sp * y + cp * z1;
    const zc = dist - z2;
    return [width / 2 + (f * x1) / zc, height / 2 - (f * y2) / zc, zc];
  };
}
