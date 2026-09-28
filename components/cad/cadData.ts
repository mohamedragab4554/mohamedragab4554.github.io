/**
 * Real CAD-to-BIM data: three structural plans of BLD_09 (the held-out TEST building of
 * the AGECS 8-class model, never seen in training) and the model's own instance-segmentation
 * predictions on them (YOLOv8-seg, 640 px tiles, 192 px overlap, conf 0.40, NMS 0.45).
 * Source: public BLD-ST structural plan dataset. Detections come from
 * outputs/training_runs/beam_wall_seg_v1/weights/best.pt, run for this site on 28 Sep 2026.
 *
 * The 3D build is a simple extrusion of those detections (not the AGECS CAD export):
 * plans are stacked one storey apart, beam depth and pile length are nominal.
 */

export type Det = { c: number; s: number; poly: [number, number][]; rect: [number, number, number, number, number]; circ: [number, number, number] };
export type Plan = { img: string; label: string; sub: string; src: string; dets: Det[] };
export type CadJson = { ppm: number; sheetW: number; sheetH: number; sheetOff: [number, number]; names: Record<string, string>; plans: Plan[] };

/** display classes */
export type K = "beam" | "column" | "circ" | "wall" | "opening" | "pile" | "slab";
export const COL: Record<K, string> = { beam: "#8EA6F5", column: "#F0A35E", circ: "#FFC98F", wall: "#C5B3FF", opening: "#6CC0EC", pile: "#E0C36A", slab: "#5FD3CD" };
export const NAME: Record<K, string> = { beam: "Beam", column: "Column", circ: "Circular column", wall: "Wall", opening: "Opening", pile: "Pile", slab: "Slab" };
export const IFC: Record<K, string> = { beam: "IfcBeam", column: "IfcColumn", circ: "IfcColumn", wall: "IfcWall", opening: "IfcOpeningElement", pile: "IfcPile", slab: "IfcSlab" };
const MAP: Record<number, K> = { 0: "beam", 1: "circ", 2: "column", 3: "opening", 4: "pile", 5: "beam", 6: "column", 7: "wall" };

export const CAD = {
  SH: 3.2, // stacking distance between plans (m)
  S: 0.16, // metres → scene units
  STAGES: [
    { k: "01", t: "Plans", sh: "Plans", start: 0, msg: "Three real structural plans of a test building the model never saw in training." },
    { k: "02", t: "AI detect", sh: "Detect", start: 0.4, msg: "My trained model segments every pile, beam, column, wall and opening on each plan." },
    { k: "03", t: "Build 3D", sh: "Build", start: 1.9, msg: "The detections are extruded level by level into a 3D structural model." },
  ],
  END: 4.6,
  DET: [0.4, 0.75, 1.1],
  SWEEP: 0.65,
  BUILD: [2.15, 2.8, 3.45],
  EXPLODE: 0.75,
  SETTLE: [1.75, 2.15] as [number, number],
  CAM: { yaw: 0.66, pitch: 0.58, dist: 8.3, fov: 34, target: [0, 0.02, 0] as [number, number, number], offX: 0.0, offY: 0.07, narrowDist: 1.28 },
};

export type Elem = {
  k: K; plan: number; score: number; id: string; lvl: string;
  poly: [number, number][]; // plan outline (m, sheet coordinates relative to grid C1)
  fx: number; fz: number; fw: number; fd: number; // footprint AABB centre/size (m)
  // 3D
  use3d: boolean; shape: "box" | "cyl"; c: [number, number, number]; s: [number, number, number]; rot: number; grow: "up" | "down" | "x" | "plate";
  note?: string;
};

export function buildCad(J: CadJson) {
  const SH = CAD.SH;
  const W = 20.15, D = 10.0; // building extents from the plan dimension lines
  const lvlName = ["Foundation", "Typical floor", "Level +28.44"];
  const els: Elem[] = [];
  const perPlan: Record<string, number>[] = [];
  J.plans.forEach((p, pi) => {
    const cnt: Record<string, number> = {};
    const n: Record<string, number> = {};
    for (const d of p.dets) {
      const k = MAP[d.c];
      cnt[k] = (cnt[k] ?? 0) + 1;
      n[k] = (n[k] ?? 0) + 1;
      const xs = d.poly.map((q) => q[0]), zs = d.poly.map((q) => q[1]);
      const x0 = Math.min(...xs), x1 = Math.max(...xs), z0 = Math.min(...zs), z1 = Math.max(...zs);
      const [cx, cz, rw, rh, ang] = d.rect;
      const y = pi * SH;
      const e: Elem = {
        k, plan: pi, score: d.s, id: `${NAME[k]} ${n[k]}`, lvl: lvlName[pi], poly: d.poly,
        fx: (x0 + x1) / 2, fz: (z0 + z1) / 2, fw: Math.max(x1 - x0, 0.2), fd: Math.max(z1 - z0, 0.2),
        use3d: true, shape: "box", c: [cx, y, cz], s: [rw, 1, rh], rot: (-ang * Math.PI) / 180, grow: "up",
      };
      const long = Math.max(rw, rh), short = Math.min(rw, rh);
      if (k === "pile") {
        if (pi !== 0) { e.use3d = false; e.note = "Rejected: a pile can only sit on the foundation plan (a slab-tag circle)"; }
        const r = Math.max(0.18, Math.min(d.circ[2], 0.55));
        Object.assign(e, { shape: "cyl", c: [d.circ[0], -1.25, d.circ[1]], s: [r * 2, 2.5, r * 2], rot: 0, grow: "down" });
      } else if (k === "beam") {
        const depth = pi === 0 ? 0.5 : 0.4;
        const along = rw >= rh ? 0 : Math.PI / 2;
        Object.assign(e, { c: [cx, y - depth / 2, cz], s: [long, depth, Math.min(short, 0.4)], rot: e.rot + along, grow: "x" });
      } else if (k === "column" || k === "circ") {
        if (pi === 2) { e.use3d = false; e.note = "Top plan: nothing above to extrude to"; }
        const h = SH - 0.4;
        Object.assign(e, { shape: k === "circ" ? "cyl" : "box", c: [cx, y + h / 2, cz], s: [Math.max(rw, 0.2), h, Math.max(rh, 0.2)], grow: "up" });
      } else if (k === "wall") {
        if (pi === 2 || long < 0.6) { e.use3d = false; e.note = pi === 2 ? "Top plan: nothing above to extrude to" : "Too short to model"; }
        const h = SH - 0.4, along = rw >= rh ? 0 : Math.PI / 2;
        Object.assign(e, { c: [cx, y + h / 2, cz], s: [long, h, Math.max(Math.min(short, 0.3), 0.15)], rot: e.rot + along, grow: "up" });
      } else if (k === "opening") {
        if (pi === 2) { e.use3d = false; e.note = "Top plan: nothing above to extrude to"; }
        const h = SH - 0.4;
        Object.assign(e, { c: [cx, y + h / 2, cz], s: [Math.max(rw, 0.3), h, Math.max(rh, 0.3)], grow: "plate" });
      }
      els.push(e);
    }
    perPlan.push(cnt);
  });
  // slabs generated from the building outline (not detected)
  const slabs: Elem[] = [1, 2].map((pi) => ({
    k: "slab" as K, plan: pi, score: 1, id: pi === 1 ? "Slab · typical floor" : "Slab · level +28.44", lvl: lvlName[pi],
    poly: [], fx: W / 2, fz: D / 2, fw: W, fd: D, use3d: true, shape: "box" as const,
    c: [W / 2, pi * SH - 0.07, D / 2] as [number, number, number], s: [W + 0.2, 0.14, D + 0.2] as [number, number, number], rot: 0, grow: "plate" as const,
    note: "Generated from the plan outline, not detected",
  }));
  const counts: Record<string, number> = {};
  for (const e of els) counts[e.k] = (counts[e.k] ?? 0) + 1;
  const rejected = els.filter((e) => e.k === "pile" && e.plan !== 0).length;
  return { J, W, D, SH, els, slabs, perPlan, counts, rejected };
}
export type CadData = ReturnType<typeof buildCad>;
