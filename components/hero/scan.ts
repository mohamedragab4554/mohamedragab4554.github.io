/**
 * Procedural scene for the hero: a synthetic three-storey RC frame and a simulated
 * terrestrial laser scan of it (intensity, range noise, distance fall-off, scan shadows,
 * site clutter). No three.js here, so it can run before the WebGL module loads.
 *
 * Illustrative only: it depicts my Scan-to-BIM workflow and carries no project claims.
 * Element and point counts shown in the hero are counts in this synthetic frame.
 */

export type Cls = 0 | 1 | 2 | 3 | 4 | 5; // column, beam, slab, wall, clutter (rejected), ground
export type Elem = {
  cls: Cls; id: string; lvl: string;
  c: [number, number, number]; s: [number, number, number];
  storey?: number; dir?: "x" | "z"; ground?: boolean; pts: number;
};
export type SceneData = {
  S: number; W: number; D: number; H: number; SH: number; ST: number;
  toS: (x: number, y: number, z: number) => [number, number, number];
  elems: Elem[]; shore: { c: [number, number, number]; pts: number };
  N: number; pos: Float32Array; cls: Float32Array; inten: Float32Array; az: Float32Array; rnd: Float32Array;
  xmin: number; xmax: number; small: boolean;
};

/** Camera shared by the WebGL scene and the captured still images. */
export const CAM = { yaw: 0.72, pitch: 0.43, dist: 9.1, fov: 34, target: [0.06, -0.02, 0.05] as [number, number, number], offX: 0.025, offY: 0.07, offYNarrow: 0.02, narrowDist: 1.18 };

export const STAGES = [
  { k: "01", t: "Scan", sh: "Scan", start: 0, msg: "Laser scan captured. Every point carries x, y, z and intensity." },
  { k: "02", t: "AI classify", sh: "Classify", start: 1.35, msg: "The trained model predicts a class for every point." },
  { k: "03", t: "AI detect", sh: "Detect", start: 2.6, msg: "The model groups points into elements and rejects temporary works." },
  { k: "04", t: "BIM model", sh: "Model", start: 3.7, msg: "Each recognised element becomes an IFC object, checked against its points." },
] as const;
export const END = 5.4;
export const COL: Record<number, string> = { 0: "#F0A35E", 1: "#8EA6F5", 2: "#5FD3CD", 3: "#C5B3FF", 4: "#FF7A7A", 5: "#4A6072" };
export const IFC: Record<number, string> = { 0: "IfcColumn", 1: "IfcBeam", 2: "IfcSlab", 3: "IfcWall" };

function rng(seed: number) {
  let a = seed;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

export function buildScene(small: boolean): SceneData {
  const S = 0.16, BX = 4, BZ = 3, ST = 3, SX = 6, SZ = 5, SH = 3.5, W = BX * SX, D = BZ * SZ, H = ST * SH;
  const toS = (x: number, y: number, z: number): [number, number, number] => [(x - W / 2) * S, (y - H / 2) * S, (z - D / 2) * S];
  const DENS = small ? 0.45 : 1;
  const R = rng(20260928);
  const gauss = () => { let u = 0, v = 0; while (!u) u = R(); while (!v) v = R(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const L = "ABCD";
  const elems: Elem[] = [];
  const add = (cls: Cls, id: string, lvl: string, c: [number, number, number], s: [number, number, number], extra?: Partial<Elem>) =>
    elems.push({ cls, id, lvl, c, s, pts: 0, ...(extra || {}) });
  const lvlName = (n: number) => (n === 0 ? "Ground" : n === ST ? "Roof" : "Level " + n);

  add(2, "S-Ground", "Ground", [W / 2, -0.1, D / 2], [W + 0.6, 0.2, D + 0.6], { ground: true });
  for (let l = 1; l <= ST; l++) add(2, "S-" + lvlName(l).replace(" ", ""), lvlName(l), [W / 2, l * SH - 0.125, D / 2], [W + 0.3, 0.25, D + 0.3]);
  const ch = SH - 0.25;
  for (let s = 0; s < ST; s++) for (let i = 0; i <= BX; i++) for (let k = 0; k <= BZ; k++)
    add(0, "C-" + L[k] + (i + 1), lvlName(s) + " → " + lvlName(s + 1), [i * SX, s * SH + ch / 2, k * SZ], [0.45, ch, 0.45], { storey: s });
  for (let l = 1; l <= ST; l++) {
    const y = l * SH - 0.25 - 0.2;
    for (let k = 0; k <= BZ; k++) for (let i = 0; i < BX; i++)
      add(1, "B-" + L[k] + "/" + (i + 1) + "–" + (i + 2), lvlName(l), [i * SX + SX / 2, y, k * SZ], [SX - 0.45, 0.4, 0.3], { storey: l - 1, dir: "x" });
    for (let i = 0; i <= BX; i++) for (let k = 0; k < BZ; k++)
      add(1, "B-" + (i + 1) + "/" + L[k] + "–" + L[k + 1], lvlName(l), [i * SX, y, k * SZ + SZ / 2], [0.3, 0.4, SZ - 0.45], { storey: l - 1, dir: "z" });
  }
  for (let s = 0; s < ST; s++) {
    add(3, "W-Core-N", lvlName(s), [9, s * SH + ch / 2, 6.5], [3, ch, 0.25], { storey: s });
    add(3, "W-Core-W", lvlName(s), [7.5, s * SH + ch / 2, 7.75], [0.25, ch, 2.5], { storey: s });
    add(3, "W-Core-E", lvlName(s), [10.5, s * SH + ch / 2, 7.75], [0.25, ch, 2.5], { storey: s });
  }

  /* ---- scan simulation ---- */
  const stations: [number, number, number][] = [[-4, 1.6, D + 6], [W + 4, 1.6, D + 7]];
  for (let s = 0; s < ST; s++) stations.push([W / 2, s * SH + 1.6, D / 2 + 2]);
  const SR = [W / 2, 1.6, D + 9];
  const P: number[] = [], C: number[] = [], I: number[] = [], Z: number[] = [];
  const colsPlan: [number, number][] = [];
  for (let i = 0; i <= BX; i++) for (let k = 0; k <= BZ; k++) colsPlan.push([i * SX, k * SZ]);
  const shadowed = (x: number, z: number) => {
    const sx = stations[0][0], sz = stations[0][2], dx = x - sx, dz = z - sz, L2 = dx * dx + dz * dz;
    for (const [cx, cz] of colsPlan) {
      const t = ((cx - sx) * dx + (cz - sz) * dz) / L2; if (t <= 0 || t >= 1) continue;
      const px = sx + t * dx - cx, pz = sz + t * dz - cz; if (px * px + pz * pz < 0.09) return true;
    }
    return false;
  };
  const keep = (x: number, y: number, z: number) => {
    let d = 1e9;
    for (const s of stations) { const a = x - s[0], b = y - s[1], c = z - s[2]; d = Math.min(d, Math.sqrt(a * a + b * b + c * c)); }
    return R() < Math.min(1, Math.max(0.35, 1.25 * Math.pow(8 / d, 1.1)));
  };
  const push = (x: number, y: number, z: number, nx: number, ny: number, nz: number, cls: number, mat: number) => {
    if (!keep(x, y, z)) return false;
    const e = 0.012 * gauss(); x += nx * e; y += ny * e; z += nz * e;
    const vx = SR[0] - x, vy = SR[1] - y, vz = SR[2] - z, vl = Math.hypot(vx, vy, vz) || 1;
    const inc = Math.abs((nx * vx + ny * vy + nz * vz) / vl);
    const it = Math.min(1, Math.max(0.05, mat * (0.45 + 0.55 * (nx || ny || nz ? inc : 0.6)) + 0.07 * gauss()));
    const p = toS(x, y, z); P.push(p[0], p[1], p[2]); C.push(cls); I.push(it); Z.push(Math.atan2(x - SR[0], SR[2] - z));
    return true;
  };
  type Dens = { side: number; top?: number; bot?: number };
  const boxSurface = (e: { c: number[]; s: number[]; cls: number; ground?: boolean; pts?: number }, dens: Dens, skip?: string[]) => {
    const [cx, cy, cz] = e.c, [sx, sy, sz] = e.s, mat = 0.62;
    const faces: ["x" | "y" | "z", 1 | -1][] = [["x", 1], ["x", -1], ["y", 1], ["y", -1], ["z", 1], ["z", -1]];
    for (const [ax, sg] of faces) {
      if (skip && skip.includes(ax + (sg > 0 ? "+" : "-"))) continue;
      const area = ax === "x" ? sy * sz : ax === "y" ? sx * sz : sx * sy;
      const f = ax === "y" && e.cls === 2 ? (sg > 0 ? dens.top ?? 0 : dens.bot ?? 0) : dens.side;
      const n = Math.round(area * f * DENS);
      for (let q = 0; q < n; q++) {
        let x = cx + (R() - 0.5) * sx, y = cy + (R() - 0.5) * sy, z = cz + (R() - 0.5) * sz;
        if (ax === "x") x = cx + (sg * sx) / 2; if (ax === "y") y = cy + (sg * sy) / 2; if (ax === "z") z = cz + (sg * sz) / 2;
        if (e.ground && ax === "y" && sg > 0 && shadowed(x, z) && R() < 0.88) continue;
        if (push(x, y, z, ax === "x" ? sg : 0, ax === "y" ? sg : 0, ax === "z" ? sg : 0, e.cls, mat)) e.pts = (e.pts ?? 0) + 1;
      }
    }
  };
  for (const e of elems) {
    if (e.cls === 0) boxSurface(e, { side: 62 }, ["y+", "y-"]);
    else if (e.cls === 1) boxSurface(e, { side: 40 }, ["y+"]);
    else if (e.cls === 3) boxSurface(e, { side: 30 }, ["y+", "y-"]);
    else boxSurface(e, { top: e.ground ? 12 : 11, bot: e.ground ? 0 : 6, side: 26 });
  }
  for (let q = 0, n = Math.round(5200 * DENS); q < n; q++) {
    const x = -4 + R() * (W + 8), z = -4 + R() * (D + 10); if (x > -0.4 && x < W + 0.4 && z > -0.4 && z < D + 0.4) continue;
    if (shadowed(x, z) && R() < 0.85) continue; push(x, -0.2, z, 0, 1, 0, 5, 0.42);
  }
  const tube = (a: number[], b: number[], ppm: number, cls: number, mat: number, r: number) => {
    const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], len = Math.hypot(d[0], d[1], d[2]), n = Math.round(len * ppm * DENS);
    let k = 0;
    for (let q = 0; q < n; q++) { const t = R(); if (push(a[0] + d[0] * t + r * gauss(), a[1] + d[1] * t + r * gauss(), a[2] + d[2] * t + r * gauss(), 0, 0, 0, cls, mat)) k++; }
    return k;
  };
  // scaffold tower on the east end
  const sx0 = W + 1.0, sx1 = W + 2.2;
  for (let z = 1; z <= 14.01; z += 2) {
    tube([sx0, 0, z], [sx0, 9.5, z], 26, 4, 0.9, 0.03); tube([sx1, 0, z], [sx1, 9.5, z], 26, 4, 0.9, 0.03);
    for (let y = 2; y <= 9.5; y += 2) tube([sx0, y, z], [sx1, y, z], 26, 4, 0.9, 0.03);
  }
  for (let y = 2; y <= 9.5; y += 2) { tube([sx0, y, 1], [sx0, y, 14], 22, 4, 0.9, 0.03); tube([sx1, y, 1], [sx1, y, 14], 22, 4, 0.9, 0.03); }
  for (let z = 1; z < 14; z += 4) tube([sx1, 0, z], [sx1, 6, z + 4], 18, 4, 0.9, 0.03);
  for (let y = 2; y <= 8; y += 2) for (let q = 0, n = Math.round(90 * DENS); q < n; q++) push(sx0 + R() * (sx1 - sx0), y + 0.02, 1 + R() * 13, 0, 1, 0, 4, 0.7);
  // temporary shoring under level 1, front-centre bay
  const shore = { c: [15, 1.6, 12.5] as [number, number, number], pts: 0 };
  for (let x = 12.6; x <= 17.41; x += 1.2) for (let z = 10.6; z <= 14.41; z += 1.25) shore.pts += tube([x, 0, z], [x, 3.2, z], 34, 4, 0.8, 0.02);
  for (let z = 10.6; z <= 14.41; z += 1.25) shore.pts += tube([12.4, 3.18, z], [17.6, 3.18, z], 30, 4, 0.75, 0.03);
  // site fence, pallets, stray points
  for (let q = 0, n = Math.round(1100 * DENS); q < n; q++) push(-3 + R() * (W + 6), R() * 2, D + 5 + 0.03 * gauss(), 0, 0, 1, 4, 0.8);
  for (let x = -3; x <= W + 3; x += 3.5) tube([x, 0, D + 5], [x, 2.05, D + 5], 30, 4, 0.9, 0.02);
  for (const [x, z] of [[-2.3, D + 2], [-0.8, D + 2.9], [W - 3, D + 2.4]]) boxSurface({ c: [x, 0.45, z], s: [1.2, 0.9, 1.0], cls: 4 }, { side: 40, top: 40, bot: 0 }, ["y-"]);
  for (let q = 0, n = Math.round(700 * DENS); q < n; q++) push(-3 + R() * (W + 6), R() * H * 1.1, -3 + R() * (D + 8), 0, 0, 0, 4, 0.3);

  let zmin = 1e9, zmax = -1e9; for (const a of Z) { if (a < zmin) zmin = a; if (a > zmax) zmax = a; }
  const N = C.length, pos = new Float32Array(P), cls = new Float32Array(C), inten = new Float32Array(I), az = new Float32Array(N), rnd = new Float32Array(N);
  for (let i = 0; i < N; i++) { az[i] = (Z[i] - zmin) / (zmax - zmin); rnd[i] = R(); }
  let xmin = 1e9, xmax = -1e9; for (let i = 0; i < N; i++) { const x = pos[i * 3]; if (x < xmin) xmin = x; if (x > xmax) xmax = x; }
  return { S, W, D, H, SH, ST, toS, elems, shore, N, pos, cls, inten, az, rnd, xmin, xmax, small };
}
