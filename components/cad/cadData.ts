/**
 * Synthetic CAD-to-BIM scene: three structural plans (foundation, level 1, level 2 / roof)
 * of a 4 × 2 bay RC frame, drawn with CAD conventions, plus the 3D elements they describe.
 * Illustrative only; element counts are counts in this synthetic frame.
 */

export type CCls = 0 | 1 | 2 | 3 | 4 | 5 | 6; // column, circular column, beam, wall, opening, pile, slab
export type CadElem = {
  cls: CCls; id: string; plan: 0 | 1 | 2; lvl: string;
  c: [number, number, number]; s: [number, number, number]; // 3D centre and size (m)
  cyl?: boolean; grow: "up" | "down" | "x" | "z" | "plate";
  fp: { x: number; z: number; w: number; d: number; round?: boolean }; // plan footprint (m)
};

export const CAD = {
  BX: 4, BZ: 2, SX: 6, SZ: 6, SH: 4.2, S: 0.16,
  PLANS: ["Foundation plan", "Level 1 plan", "Level 2 plan · roof"],
  STAGES: [
    { k: "01", t: "Plans", sh: "Plans", start: 0, msg: "Three 2D structural plans, stacked at their level heights." },
    { k: "02", t: "AI detect", sh: "Detect", start: 0.35, msg: "The trained model reads each plan and detects every structural element." },
    { k: "03", t: "Build 3D", sh: "Build", start: 1.6, msg: "Detected elements are extruded level by level into a 3D model." },
  ],
  END: 4.5,
  COL: { 0: "#F0A35E", 1: "#FFC98F", 2: "#8EA6F5", 3: "#C5B3FF", 4: "#6CC0EC", 5: "#E0C36A", 6: "#5FD3CD" } as Record<number, string>,
  NAME: { 0: "Column", 1: "Circular column", 2: "Beam", 3: "Wall", 4: "Opening", 5: "Pile", 6: "Slab" } as Record<number, string>,
  IFC: { 0: "IfcColumn", 1: "IfcColumn", 2: "IfcBeam", 3: "IfcWall", 4: "IfcOpeningElement", 5: "IfcPile", 6: "IfcSlab" } as Record<number, string>,
  DET: [0.35, 0.6, 0.85], // detection sweep start per plan (s)
  SWEEP: 0.6, // sweep duration per plan (s)
  BUILD: [1.95, 2.6, 3.25], // build start per level (s)
  EXPLODE: 0.8, // extra plan spacing (× storey height) while the AI reads the plans
  SETTLE: [1.5, 1.95] as [number, number], // plans settle to real storey height
  CAM: { yaw: 0.78, pitch: 0.5, dist: 10.6, fov: 34, target: [0.0, 0.0, 0.0] as [number, number, number], offX: 0.0, offY: 0.08, narrowDist: 1.22 },
};

export function buildCad() {
  const { BX, BZ, SX, SZ, SH, S } = CAD;
  const W = BX * SX, D = BZ * SZ, H = 2 * SH;
  const YC = (H - 3.5) / 2; // vertical centre of the scene (piles go 3.5 m below ground)
  const toS = (x: number, y: number, z: number): [number, number, number] => [(x - W / 2) * S, (y - YC) * S, (z - D / 2) * S];
  const planY = [0, SH, 2 * SH];
  const L = "ABC";
  const els: CadElem[] = [];
  const round = (i: number, k: number) => k === BZ && i >= 1 && i <= BX - 1; // front row interior columns are circular
  const lvlName = ["Ground", "Level 1", "Level 2 · roof"];

  // foundation plan: piles, ground beams, storey-0 columns, core walls
  for (let i = 0; i <= BX; i++) for (let k = 0; k <= BZ; k++)
    els.push({ cls: 5, id: "P-" + L[k] + (i + 1), plan: 0, lvl: "Below ground", c: [i * SX, -1.75, k * SZ], s: [0.6, 3.5, 0.6], cyl: true, grow: "down", fp: { x: i * SX, z: k * SZ, w: 0.6, d: 0.6, round: true } });
  const beamsAt = (plan: 0 | 1 | 2, yTop: number, depth: number, width: number) => {
    for (let k = 0; k <= BZ; k++) for (let i = 0; i < BX; i++)
      els.push({ cls: 2, id: "B-" + L[k] + "/" + (i + 1) + "–" + (i + 2), plan, lvl: lvlName[plan], c: [i * SX + SX / 2, yTop - depth / 2, k * SZ], s: [SX - 0.45, depth, width], grow: "x", fp: { x: i * SX + SX / 2, z: k * SZ, w: SX - 0.45, d: width } });
    for (let i = 0; i <= BX; i++) for (let k = 0; k < BZ; k++)
      els.push({ cls: 2, id: "B-" + (i + 1) + "/" + L[k] + "–" + L[k + 1], plan, lvl: lvlName[plan], c: [i * SX, yTop - depth / 2, k * SZ + SZ / 2], s: [width, depth, SZ - 0.45], grow: "z", fp: { x: i * SX, z: k * SZ + SZ / 2, w: width, d: SZ - 0.45 } });
  };
  beamsAt(0, 0, 0.5, 0.35);
  const colsAt = (plan: 0 | 1) => {
    const y0 = planY[plan], h = SH - 0.25;
    for (let i = 0; i <= BX; i++) for (let k = 0; k <= BZ; k++) {
      const r = round(i, k);
      els.push({ cls: r ? 1 : 0, id: "C-" + L[k] + (i + 1), plan, lvl: lvlName[plan] + " → " + lvlName[plan + 1], c: [i * SX, y0 + h / 2, k * SZ], s: r ? [0.5, h, 0.5] : [0.45, h, 0.45], cyl: r, grow: "up", fp: { x: i * SX, z: k * SZ, w: r ? 0.5 : 0.45, d: r ? 0.5 : 0.45, round: r } });
    }
  };
  const coreAt = (plan: 0 | 1) => {
    const y0 = planY[plan], h = SH - 0.25, t = 0.25;
    const wall = (id: string, x0: number, z0: number, x1: number, z1: number) => {
      const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, lx = Math.max(Math.abs(x1 - x0), t), lz = Math.max(Math.abs(z1 - z0), t);
      els.push({ cls: 3, id, plan, lvl: lvlName[plan], c: [cx, y0 + h / 2, cz], s: [lx, h, lz], grow: "up", fp: { x: cx, z: cz, w: lx, d: lz } });
    };
    wall("W-Core-N", 13.5, 1.5, 16.5, 1.5);
    wall("W-Core-W", 13.5, 1.5, 13.5, 4.5);
    wall("W-Core-E", 16.5, 1.5, 16.5, 4.5);
    wall("W-Core-S1", 13.5, 4.5, 14.4, 4.5);
    wall("W-Core-S2", 15.6, 4.5, 16.5, 4.5);
    els.push({ cls: 4, id: "D-Core", plan, lvl: lvlName[plan], c: [15, y0 + 1.05, 4.5], s: [1.2, 2.1, 0.25], grow: "plate", fp: { x: 15, z: 4.5, w: 1.2, d: 0.25 } });
  };
  colsAt(0); coreAt(0);
  // level 1 plan: L1 framing (downstand beams below the slab), storey-1 columns, core, back wall with windows
  beamsAt(1, SH - 0.25, 0.45, 0.3);
  colsAt(1); coreAt(1);
  const y1 = planY[1], hw = SH - 0.25;
  const backWall = (id: string, x0: number, x1: number) => els.push({ cls: 3, id, plan: 1, lvl: lvlName[1], c: [(x0 + x1) / 2, y1 + hw / 2, -0.1], s: [x1 - x0, hw, 0.2], grow: "up", fp: { x: (x0 + x1) / 2, z: -0.1, w: x1 - x0, d: 0.2 } });
  backWall("W-A/1–2", 0.25, 6 - 0.25); backWall("W-A/2–3a", 6.25, 7.5); backWall("W-A/2–3b", 10.5, 11.75);
  els.push({ cls: 4, id: "O-A/2–3", plan: 1, lvl: lvlName[1], c: [9, y1 + 1.9, -0.1], s: [3, 1.6, 0.2], grow: "plate", fp: { x: 9, z: -0.1, w: 3, d: 0.2 } });
  // level 2 plan (roof framing)
  beamsAt(2, 2 * SH - 0.25, 0.45, 0.3);
  // slabs (generated from the plan outlines, not detected)
  const slabs: CadElem[] = [0, 1, 2].map((p) => ({ cls: 6, id: "S-" + ["Ground", "Level1", "Roof"][p], plan: p as 0 | 1 | 2, lvl: lvlName[p], c: [W / 2, planY[p] - 0.125, D / 2], s: [W + 0.4, 0.25, D + 0.4], grow: "plate", fp: { x: W / 2, z: D / 2, w: W, d: D } }));

  /* ---- CAD linework per plan: [x0,z0,x1,z1] segments in metres ---- */
  type Seg = [number, number, number, number];
  const lines: Seg[][] = [[], [], []], grid: Seg[][] = [[], [], []];
  const dashed = (out: Seg[], x0: number, z0: number, x1: number, z1: number, on = 0.45, off = 0.3) => {
    const len = Math.hypot(x1 - x0, z1 - z0), ux = (x1 - x0) / len, uz = (z1 - z0) / len;
    for (let t = 0; t < len; t += on + off) { const e = Math.min(len, t + on); out.push([x0 + ux * t, z0 + uz * t, x0 + ux * e, z0 + uz * e]); }
  };
  const rect = (out: Seg[], cx: number, cz: number, w: number, d: number) => {
    const a = cx - w / 2, b = cx + w / 2, c = cz - d / 2, e = cz + d / 2;
    out.push([a, c, b, c], [b, c, b, e], [b, e, a, e], [a, e, a, c]);
  };
  const circle = (out: Seg[], cx: number, cz: number, r: number, n = 18) => {
    for (let i = 0; i < n; i++) { const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2; out.push([cx + r * Math.cos(a0), cz + r * Math.sin(a0), cx + r * Math.cos(a1), cz + r * Math.sin(a1)]); }
  };
  for (let p = 0; p < 3; p++) {
    const g = grid[p], ln = lines[p];
    // setting-out grid (chain lines) and bubbles
    for (let i = 0; i <= BX; i++) { dashed(g, i * SX, -2.2, i * SX, D + 2.2, 1.2, 0.35); circle(g, i * SX, -2.9, 0.55, 14); }
    for (let k = 0; k <= BZ; k++) { dashed(g, -2.2, k * SZ, W + 2.2, k * SZ, 1.2, 0.35); circle(g, -2.9, k * SZ, 0.55, 14); }
    // dimension line along the top with ticks
    ln.push([0, -1.5, W, -1.5]); for (let i = 0; i <= BX; i++) ln.push([i * SX - 0.2, -1.3, i * SX + 0.2, -1.7]);
    // sheet frame and title block
    rect(ln, W / 2 + 0.3, D / 2 - 0.8, W + 8, D + 6.4);
    const tbx = W + 0.9, tbz = D - 2.2; rect(ln, tbx + 1.35, tbz + 1.1, 2.7, 2.2);
    for (let r = 0; r < 3; r++) ln.push([tbx + 0.3, tbz + 0.45 + r * 0.6, tbx + (r ? 2.2 : 2.9), tbz + 0.45 + r * 0.6]);
    // slab edge
    rect(ln, W / 2, D / 2, W + 0.4, D + 0.4);
  }
  for (const e of els) {
    const ln = lines[e.plan], f = e.fp;
    if (e.cls === 0) { rect(ln, f.x, f.z, f.w, f.d); ln.push([f.x - f.w / 2, f.z - f.d / 2, f.x + f.w / 2, f.z + f.d / 2], [f.x - f.w / 2, f.z + f.d / 2, f.x + f.w / 2, f.z - f.d / 2]); }
    else if (e.cls === 1) { circle(ln, f.x, f.z, f.w / 2); ln.push([f.x - f.w / 2.8, f.z - f.w / 2.8, f.x + f.w / 2.8, f.z + f.w / 2.8]); }
    else if (e.cls === 5) { circle(ln, f.x, f.z, f.w / 2, 16); circle(ln, f.x, f.z, f.w / 2 + 0.35, 20); }
    else if (e.cls === 2) {
      const hx = f.w > f.d; // hidden (dashed) downstand beam edges
      if (hx) { dashed(ln, f.x - f.w / 2, f.z - f.d / 2, f.x + f.w / 2, f.z - f.d / 2); dashed(ln, f.x - f.w / 2, f.z + f.d / 2, f.x + f.w / 2, f.z + f.d / 2); }
      else { dashed(ln, f.x - f.w / 2, f.z - f.d / 2, f.x - f.w / 2, f.z + f.d / 2); dashed(ln, f.x + f.w / 2, f.z - f.d / 2, f.x + f.w / 2, f.z + f.d / 2); }
    } else if (e.cls === 3) {
      rect(ln, f.x, f.z, f.w, f.d);
      const along = f.w >= f.d, len = along ? f.w : f.d; // 45° hatch
      for (let t = 0.25; t < len; t += 0.35) {
        if (along) ln.push([f.x - f.w / 2 + t, f.z - f.d / 2, f.x - f.w / 2 + t - f.d, f.z + f.d / 2]);
        else ln.push([f.x - f.w / 2, f.z - f.d / 2 + t, f.x + f.w / 2, f.z - f.d / 2 + t - f.w]);
      }
    } else if (e.cls === 4) {
      if (f.w > 2) { ln.push([f.x - f.w / 2, f.z, f.x + f.w / 2, f.z]); ln.push([f.x - f.w / 2, f.z - 0.08, f.x + f.w / 2, f.z - 0.08]); } // window
      else { // door leaf + swing
        const hx = f.x - f.w / 2, hz = f.z; ln.push([hx, hz, hx, hz + f.w]);
        for (let i = 0; i < 10; i++) { const a0 = (i / 10) * Math.PI / 2, a1 = ((i + 1) / 10) * Math.PI / 2; ln.push([hx + f.w * Math.sin(a0), hz + f.w * Math.cos(a0), hx + f.w * Math.sin(a1), hz + f.w * Math.cos(a1)]); }
      }
    }
  }
  const counts: Record<number, number> = {};
  for (const e of els) counts[e.cls] = (counts[e.cls] ?? 0) + 1;
  return { W, D, H, YC, S, SH, planY, toS, els, slabs, lines, grid, counts };
}
export type CadData = ReturnType<typeof buildCad>;
