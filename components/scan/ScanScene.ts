/**
 * Real Scan-to-BIM sequence: 120,000 points sampled from the 250.5 M-point Kladno station laser
 * scan (public benchmark), coloured by the element of MY final IFC model they support, then that
 * IFC model (cloud2bim_FINAL_REVIEW_v4_COMPLETE_PITCHED_ROOF.ifc) revealed storey by storey.
 * The IFC and the scan share one coordinate system; nothing here is procedural.
 */
import * as THREE from "three";

export type Meta = {
  points: number; fullScan: number; sampled: number; unassignedShare: number; counts: Record<string, number>;
  elements: { c: number; s: number; st: string; p: number; t0: number; tn: number; b: number[] }[];
};
const CLS = ["IfcWall", "IfcSlab", "IfcRoof", "IfcWindow", "IfcOpeningElement"];
const NICE = ["Wall", "Slab", "Roof", "Window", "Opening"];
const COL = ["#C5B3FF", "#5FD3CD", "#F0A35E", "#6CC0EC", "#8EA6F5", "#56657a"];
export const SCAN = {
  STAGES: [
    { k: "01", t: "Scan", sh: "Scan", start: 0, msg: "Real laser scan of Kladno railway station: 250.5 M points (120,000 shown)." },
    { k: "02", t: "Segment", sh: "Segment", start: 1.2, msg: "Density analysis splits the cloud into walls, slabs, roof and openings." },
    { k: "03", t: "Extract", sh: "Extract", start: 2.4, msg: "Each element is extracted with its own geometry; clutter and ground are left out." },
    { k: "04", t: "IFC model", sh: "IFC", start: 3.4, msg: "My pipeline writes the elements to IFC, storey by storey." },
  ],
  END: 5.6,
};

export function startScan(root: HTMLElement, meta: Meta, pts: Uint8Array, mesh: Int16Array, opts: { reduced: boolean; small: boolean; onReady?: () => void }): () => void {
  const q = <T extends Element>(k: string) => root.querySelector(`[data-h="${k}"]`) as T;
  const RM = opts.reduced;
  const cleanups: (() => void)[] = [];
  const on = <Ev extends keyof HTMLElementEventMap>(el: HTMLElement, ev: Ev, fn: (e: HTMLElementEventMap[Ev]) => void) => {
    el.addEventListener(ev, fn as EventListener); cleanups.push(() => el.removeEventListener(ev, fn as EventListener));
  };
  const renderer = new THREE.WebGLRenderer({ canvas: q<HTMLCanvasElement>("gl"), antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.small ? 1.5 : 1.75));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 80);
  const S = 0.072, YC = 6.5; // metres -> scene; vertical centre
  const tgt = new THREE.Vector3(0.18, -0.12, 0.05);

  /* ---- points ---- */
  const N = Math.floor(pts.byteLength / 8);
  const dv = new DataView(pts.buffer, pts.byteOffset, pts.byteLength);
  const P = new Float32Array(N * 3), I = new Float32Array(N), Cc = new Float32Array(N), AZ = new Float32Array(N), R = new Float32Array(N);
  let xmin = 1e9, xmax = -1e9;
  for (let i = 0; i < N; i++) {
    const x = dv.getInt16(i * 8, true) / 100, y = dv.getInt16(i * 8 + 2, true) / 100, z = dv.getInt16(i * 8 + 4, true) / 100;
    P[i * 3] = x * S; P[i * 3 + 1] = (y - YC) * S; P[i * 3 + 2] = z * S;
    I[i] = dv.getUint8(i * 8 + 6) / 255; Cc[i] = dv.getUint8(i * 8 + 7);
    AZ[i] = Math.atan2(x, 30 - z); R[i] = ((i * 2654435761) % 1000) / 1000;
    if (x < xmin) xmin = x; if (x > xmax) xmax = x;
  }
  let amin = 1e9, amax = -1e9; for (let i = 0; i < N; i++) { if (AZ[i] < amin) amin = AZ[i]; if (AZ[i] > amax) amax = AZ[i]; }
  for (let i = 0; i < N; i++) AZ[i] = (AZ[i] - amin) / (amax - amin);
  const pg = new THREE.BufferGeometry();
  pg.setAttribute("position", new THREE.BufferAttribute(P, 3)); pg.setAttribute("aInt", new THREE.BufferAttribute(I, 1));
  pg.setAttribute("aCls", new THREE.BufferAttribute(Cc, 1)); pg.setAttribute("aAz", new THREE.BufferAttribute(AZ, 1)); pg.setAttribute("aRnd", new THREE.BufferAttribute(R, 1));
  const U = {
    uT: { value: 0 }, uScan: { value: 1.05 }, uSegStart: { value: SCAN.STAGES[1].start }, uSegDur: { value: 1.0 }, uXmin: { value: xmin * S }, uXmax: { value: xmax * S },
    uModel: { value: 0 }, uSize: { value: opts.small ? 2.4 : 2.1 }, uPR: { value: renderer.getPixelRatio() }, uCol: { value: COL.map((c) => new THREE.Color(c)) },
  };
  const pm = new THREE.ShaderMaterial({
    uniforms: U, transparent: true, depthWrite: false,
    vertexShader: `attribute float aCls,aInt,aAz,aRnd;uniform float uT,uScan,uSegStart,uSegDur,uXmin,uXmax,uModel,uSize,uPR;uniform vec3 uCol[6];varying vec3 vC;varying float vA;
void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;
float s=uT/uScan;float hit=clamp((s-aAz)*9.,0.,1.);float fl=exp(-pow((s-aAz)*14.,2.))*step(uT,uScan+.3);
vec3 raw=mix(vec3(.16,.21,.27),vec3(.93,.95,.97),aInt);vec3 c=raw*(.35+.65*hit)+vec3(.55,1.,.95)*fl*.8;
float segT=uSegStart+(position.x-uXmin)/(uXmax-uXmin)*uSegDur;float seg=smoothstep(segT,segT+.15,uT);
int ci=int(aCls+.5);vec3 cc=uCol[ci]*(.5+.5*aInt);c=mix(c,cc,seg);float a=hit*.95+.05;
if(ci==5){a*=mix(1.,.28,seg);}a*=mix(1.,ci==5?.5:.22,uModel);vC=c;vA=a;
gl_PointSize=uSize*uPR*(.75+.5*aRnd)*(3.2/-mv.z);}`,
    fragmentShader: `varying vec3 vC;varying float vA;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(vC,vA*smoothstep(.5,.25,d));}`,
  });
  const points = new THREE.Points(pg, pm); points.renderOrder = 1; scene.add(points);

  /* ---- real IFC mesh ---- */
  const els = meta.elements;
  const nT = mesh.length / 9;
  const mp = new Float32Array(nT * 9), mc = new Float32Array(nT * 9), me = new Float32Array(nT * 3);
  const triEl = new Int32Array(nT);
  els.forEach((e, ei) => {
    const col = new THREE.Color(COL[e.c]);
    for (let t = e.t0; t < e.t0 + e.tn; t++) {
      triEl[t] = ei;
      for (let v = 0; v < 3; v++) {
        const o = t * 9 + v * 3;
        mp[o] = (mesh[o] / 100) * S; mp[o + 1] = (mesh[o + 1] / 100 - YC) * S; mp[o + 2] = (mesh[o + 2] / 100) * S;
        mc[o] = col.r; mc[o + 1] = col.g; mc[o + 2] = col.b; me[t * 3 + v] = ei;
      }
    }
  });
  const mg = new THREE.BufferGeometry();
  mg.setAttribute("position", new THREE.BufferAttribute(mp, 3)); mg.setAttribute("color", new THREE.BufferAttribute(mc, 3)); mg.setAttribute("aEl", new THREE.BufferAttribute(me, 1));
  mg.computeVertexNormals();
  const uReveal = { value: -10 }, uHover = { value: -1 };
  const meshMat = new THREE.ShaderMaterial({
    transparent: true, side: THREE.DoubleSide, uniforms: { uReveal, uHover, uL: { value: new THREE.Vector3(-0.4, 0.8, 0.45).normalize() } },
    vertexShader: `attribute vec3 color;attribute float aEl;varying vec3 vC;varying float vY,vH;varying vec3 vN;uniform float uHover;
void main(){vC=color;vY=position.y;vN=normalize(normalMatrix*normal);vH=abs(aEl-uHover)<.5?1.:0.;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform float uReveal;uniform vec3 uL;varying vec3 vC,vN;varying float vY,vH;void main(){if(vY>uReveal)discard;
float l=.55+.45*abs(dot(normalize(vN),uL));vec3 c=mix(vec3(.78,.83,.88),vC,.55)*l;float edge=smoothstep(uReveal-.05,uReveal,vY);
c=mix(c,vec3(.6,1.,.95),edge*.8);c=mix(c,vec3(1.),vH*.45);gl_FragColor=vec4(c,.93);}`,
  });
  const model = new THREE.Mesh(mg, meshMat); model.renderOrder = 3; scene.add(model);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(mg, 25), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, uniforms: { uReveal },
    vertexShader: `varying float vY;void main(){vY=position.y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform float uReveal;varying float vY;void main(){if(vY>uReveal)discard;gl_FragColor=vec4(.75,.95,1.,.35);}`,
  }));
  edges.renderOrder = 4; scene.add(edges);
  const ymin = -YC * S, ymax = (14.3 - YC) * S;

  /* ---- element brackets (extract stage) ---- */
  const corner: number[] = [];
  { const a = 0.28; for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) { const p = [sx * 0.5, sy * 0.5, sz * 0.5];
    corner.push(...p, sx * (0.5 - a), sy * 0.5, sz * 0.5, ...p, sx * 0.5, sy * (0.5 - a), sz * 0.5, ...p, sx * 0.5, sy * 0.5, sz * (0.5 - a)); } }
  const box = els.map((e) => ({ e, c: new THREE.Vector3(((e.b[0] + e.b[3]) / 2) * S, ((e.b[1] + e.b[4]) / 2 - YC) * S, ((e.b[2] + e.b[5]) / 2) * S), s: new THREE.Vector3(Math.max(e.b[3] - e.b[0], 0.3) * S, Math.max(e.b[4] - e.b[1], 0.3) * S, Math.max(e.b[5] - e.b[2], 0.3) * S) }));
  const DS = SCAN.STAGES[2].start;
  const bgeo = new THREE.InstancedBufferGeometry(); bgeo.setAttribute("position", new THREE.Float32BufferAttribute(corner, 3));
  const n = box.length, iC = new Float32Array(n * 3), iS = new Float32Array(n * 3), iK = new Float32Array(n * 3), iT = new Float32Array(n);
  const tDet = box.map((b) => DS + ((b.c.x / S - xmin) / (xmax - xmin)) * 0.85);
  box.forEach((b, i) => { const col = new THREE.Color(COL[b.e.c]); iC.set([b.c.x, b.c.y, b.c.z], i * 3); iS.set([b.s.x + 0.012, b.s.y + 0.012, b.s.z + 0.012], i * 3); iK.set([col.r, col.g, col.b], i * 3); iT[i] = tDet[i]; });
  bgeo.setAttribute("iC", new THREE.InstancedBufferAttribute(iC, 3)); bgeo.setAttribute("iS", new THREE.InstancedBufferAttribute(iS, 3));
  bgeo.setAttribute("iK", new THREE.InstancedBufferAttribute(iK, 3)); bgeo.setAttribute("iT", new THREE.InstancedBufferAttribute(iT, 1)); bgeo.instanceCount = n;
  const bm = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false, uniforms: { uT: U.uT, uModel: U.uModel },
    vertexShader: `attribute vec3 iC,iS,iK;attribute float iT;uniform float uT,uModel;varying vec3 vC;varying float vA;
void main(){float k=smoothstep(iT,iT+.2,uT);vec3 p=iC+position*iS*(1.+.4*(1.-k));vC=iK;vA=k*.8*(1.-uModel);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
    fragmentShader: `varying vec3 vC;varying float vA;void main(){if(vA<.01)discard;gl_FragColor=vec4(vC,vA);}`,
  });
  const brackets = new THREE.LineSegments(bgeo, bm); brackets.frustumCulled = false; brackets.renderOrder = 5; scene.add(brackets);

  /* ---- labels ---- */
  const labelsEl = q<HTMLDivElement>("labels");
  const pick = (c: number, pred: (b: (typeof box)[number]) => boolean = () => true) => box.filter((b) => b.e.c === c && pred(b)).sort((a, b) => b.e.p - a.e.p)[0];
  const narrow = root.getBoundingClientRect().width < 520;
  const picks = (narrow ? [pick(1, (b) => b.e.s === 1), pick(0, (b) => b.c.z > 0 && b.e.s === 0)] : [pick(2), pick(0, (b) => b.c.z > 0 && b.e.s === 0), pick(3), pick(1, (b) => b.e.s === 1)]).filter(Boolean);
  const labelDefs = picks.map((b) => {
    const el = document.createElement("div"); el.className = "hv-lbl"; el.style.background = COL[b.e.c];
    el.innerHTML = `<span class="hv-tag">Extracted · ${b.e.p.toLocaleString("en-GB")} pts</span>${CLS[b.e.c]}${b.e.st ? `<small>${b.e.st}</small>` : ""}`;
    labelsEl.appendChild(el);
    return { b, el, at: new THREE.Vector3(b.c.x, b.c.y + b.s.y / 2, b.c.z), t: tDet[box.indexOf(b)] };
  });

  /* ---- HUD ---- */
  const hudEl = q<HTMLDivElement>("hud"), hudStage = q<HTMLElement>("stage"), hudMsg = q<HTMLElement>("msg"), hudPts = q<HTMLElement>("pts");
  q<HTMLElement>("in").textContent = (meta.fullScan / 1e6).toFixed(1) + " M";
  const list = q<HTMLUListElement>("list"); list.innerHTML = "";
  const rows = [0, 1, 3, 4, 2].map((c) => {
    const li = document.createElement("li"); li.innerHTML = `<span class="hv-sw" style="background:${COL[c]}"></span>${NICE[c]}s<b>0</b>`.replace("Roofs", "Roof"); list.appendChild(li);
    return { li, b: li.querySelector("b") as HTMLElement, times: box.filter((b) => b.e.c === c).map((b) => tDet[box.indexOf(b)]).sort((a, b) => a - b) };
  });
  let T = RM ? SCAN.END + 0.5 : 0, playing = !RM, lastNow = performance.now();
  const chipsEl = q<HTMLDivElement>("chips"); chipsEl.innerHTML = "";
  const chips = SCAN.STAGES.map((s) => {
    const b = document.createElement("button"); b.type = "button"; b.className = "hv-chip";
    b.innerHTML = `<span class="hv-dot"></span><span class="hv-n">${s.k}</span> <span class="hv-lg">${s.t}</span><span class="hv-sh">${s.sh}</span>`;
    b.addEventListener("click", () => { T = s.start + 0.001; playing = true; lastNow = performance.now(); }); chipsEl.appendChild(b); return b;
  });
  on(q<HTMLButtonElement>("replay"), "click", () => { T = 0; playing = true; lastNow = performance.now(); });
  if (window.matchMedia("(hover: none)").matches) q<HTMLElement>("hint").textContent = "Swipe sideways to rotate";
  let hudKey = "";
  const updateHud = (t: number) => {
    const si = SCAN.STAGES.reduce((a, s, i) => (t >= s.start ? i : a), 0), done = t >= SCAN.END;
    chips.forEach((c, i) => { c.classList.toggle("done", i < si || done); c.classList.toggle("now", i === si && !done); c.setAttribute("aria-pressed", String(i === si)); });
    const key = si + "|" + done;
    if (key !== hudKey) {
      hudKey = key; hudStage.textContent = SCAN.STAGES[si].k + " " + SCAN.STAGES[si].t;
      hudMsg.textContent = done ? "Final IFC model on the real scan. Hover an element to see the points that support it." : SCAN.STAGES[si].msg;
      hudEl.classList.toggle("ai-on", si >= 1); hudEl.classList.toggle("ai-run", si >= 1 && si <= 2 && !done && !RM);
    }
    const shown = Math.round(Math.min(1, t / U.uScan.value) * N);
    hudPts.textContent = shown.toLocaleString("en-GB") + " pts";
    for (const r of rows) { let v = 0; for (const x of r.times) if (t >= x) v++; r.b.textContent = String(v); r.li.classList.toggle("on", v > 0); }
  };

  /* ---- camera + interaction ---- */
  let W0 = 1, H0 = 1;
  const resize = () => {
    const r = root.getBoundingClientRect(); W0 = Math.max(1, r.width); H0 = Math.max(1, r.height);
    renderer.setSize(W0, H0, false); camera.aspect = W0 / H0; camera.setViewOffset(W0, H0, 0, -0.08 * H0, W0, H0); camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize); ro.observe(root); resize(); cleanups.push(() => ro.disconnect());
  let dYaw = 0, dPitch = 0, tYaw = 0, tPitch = 0, drag: { x: number; y: number; yaw: number; pitch: number } | null = null;
  const mouse = new THREE.Vector2(); let mouseXY: [number, number] | null = null, hoverDirty = false;
  on(root, "pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY, yaw: tYaw, pitch: tPitch }; if (e.pointerType === "mouse") root.setPointerCapture(e.pointerId); });
  on(root, "pointermove", (e) => {
    if (drag) { tYaw = drag.yaw - (e.clientX - drag.x) * 0.006; tPitch = Math.max(-0.25, Math.min(0.4, drag.pitch + (e.clientY - drag.y) * 0.004)); }
    const r = root.getBoundingClientRect(); mouse.set(((e.clientX - r.left) / W0) * 2 - 1, -((e.clientY - r.top) / H0) * 2 + 1); mouseXY = [e.clientX - r.left, e.clientY - r.top]; hoverDirty = true;
  });
  const endDrag = () => { drag = null; }; on(root, "pointerup", endDrag); on(root, "pointercancel", endDrag);
  on(root, "pointerleave", () => { mouseXY = null; hoverDirty = true; });
  const placeCamera = (t: number) => {
    const sway = RM ? 0 : 0.16 * Math.sin(t * 0.22) * Math.min(1, t / 2);
    dYaw += (tYaw - dYaw) * 0.12; dPitch += (tPitch - dPitch) * 0.12;
    const yaw = 0.5 + sway + dYaw, pitch = 0.46 + dPitch, dist = 9.6 * (W0 / H0 < 1.05 ? 1.12 : 1);
    camera.position.set(tgt.x + dist * Math.sin(yaw) * Math.cos(pitch), tgt.y + dist * Math.sin(pitch), tgt.z + dist * Math.cos(yaw) * Math.cos(pitch)); camera.lookAt(tgt);
  };
  const ray = new THREE.Raycaster(), tip = q<HTMLDivElement>("tip");
  let hov = -1;
  const updateHover = (t: number) => {
    if (!hoverDirty) return; hoverDirty = false;
    let h = -1;
    if (mouseXY && t >= SCAN.END - 0.3 && !drag) { ray.setFromCamera(mouse, camera); const hit = ray.intersectObject(model, false)[0]; if (hit && hit.faceIndex !== undefined && hit.faceIndex !== null) h = triEl[hit.faceIndex]; }
    if (h !== hov) {
      hov = h; uHover.value = h;
      if (h >= 0) { const e = els[h]; const sz = [e.b[3] - e.b[0], e.b[5] - e.b[2], e.b[4] - e.b[1]].map((v) => v.toFixed(1));
        tip.innerHTML = `<b>${CLS[e.c]}</b>${e.st ? ` · storey ${e.st}` : ""}<br>${sz[0]} × ${sz[1]} × ${sz[2]} m<br><span class="hv-ai">Supported by ${e.p.toLocaleString("en-GB")} of the sampled scan points</span>`; }
      tip.classList.toggle("on", h >= 0);
    }
    if (h >= 0 && mouseXY) { const x = Math.min(mouseXY[0], W0 - 280); tip.style.transform = `translate(${x + 14}px,${mouseXY[1] + 14}px)`; }
  };

  /* ---- loop ---- */
  let visible = false, first = true, raf = 0;
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; lastNow = performance.now(); }, { threshold: 0.2 });
  io.observe(root); cleanups.push(() => io.disconnect());
  const onVis = () => { lastNow = performance.now(); }; document.addEventListener("visibilitychange", onVis); cleanups.push(() => document.removeEventListener("visibilitychange", onVis));
  (window as unknown as { __scanSeek?: (t: number) => void }).__scanSeek = (t: number) => { T = t; playing = false; visible = true; };
  const V = new THREE.Vector3();
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    if (!visible || document.hidden) { lastNow = now; return; }
    const dt = Math.min(0.05, (now - lastNow) / 1000); lastNow = now; if (playing) T += dt;
    const t = T; U.uT.value = t;
    const MS = SCAN.STAGES[3].start;
    U.uModel.value = Math.min(1, Math.max(0, (t - MS) / 0.8));
    const r = Math.min(1, Math.max(0, (t - MS) / 1.9)); uReveal.value = r <= 0 ? -10 : ymin + (ymax - ymin + 0.05) * (r < 1 ? r * (2 - r) : 1);
    placeCamera(t); updateHud(t); updateHover(t);
    for (const L of labelDefs) {
      const show = t >= L.t + 0.15 && (t < MS || uReveal.value >= L.at.y - 0.02);
      L.el.classList.toggle("on", show); if (!show) continue;
      V.copy(L.at).project(camera); L.el.style.left = (V.x * 0.5 + 0.5) * W0 + "px"; L.el.style.top = (-V.y * 0.5 + 0.5) * H0 + "px";
    }
    renderer.render(scene, camera);
    if (first) { first = false; opts.onReady?.(); }
  };
  raf = requestAnimationFrame(frame);
  return () => {
    cancelAnimationFrame(raf); cleanups.forEach((f) => f()); labelsEl.innerHTML = ""; chipsEl.innerHTML = ""; list.innerHTML = "";
    scene.traverse((o) => { const m = o as THREE.Mesh; if (m.geometry) m.geometry.dispose(); const mat = m.material as THREE.Material | THREE.Material[] | undefined; if (Array.isArray(mat)) mat.forEach((x) => x.dispose()); else mat?.dispose(); });
    renderer.dispose();
  };
}
