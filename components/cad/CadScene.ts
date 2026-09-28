/**
 * WebGL CAD-to-BIM sequence on REAL data: three structural plans of a held-out test building,
 * my trained model's segmentation masks on each, then a level-by-level 3D build of those detections.
 */
import * as THREE from "three";
import { CAD, COL, IFC, NAME, type CadData, type Elem, type K } from "./cadData";

type E3 = Elem & { mesh: THREE.InstancedMesh; inst: number; base: THREE.Color; g0: number; cS: THREE.Vector3; sS: THREE.Vector3; td: number };

export function startCad(root: HTMLElement, C: CadData, tex: THREE.Texture[], opts: { reduced: boolean; small: boolean; onReady?: () => void }): () => void {
  const q = <T extends Element>(k: string) => root.querySelector(`[data-h="${k}"]`) as T;
  const RM = opts.reduced;
  const cleanups: (() => void)[] = [];
  const on = <Ev extends keyof HTMLElementEventMap>(el: HTMLElement, ev: Ev, fn: (e: HTMLElementEventMap[Ev]) => void) => {
    el.addEventListener(ev, fn as EventListener); cleanups.push(() => el.removeEventListener(ev, fn as EventListener));
  };
  const renderer = new THREE.WebGLRenderer({ canvas: q<HTMLCanvasElement>("gl"), antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.small ? 1.5 : 1.75));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(CAD.CAM.fov, 1, 0.05, 80);
  const tgt = new THREE.Vector3(...CAD.CAM.target);
  const S = CAD.S, SH = CAD.SH, W = C.W, D = C.D, YC = (2 * SH - 2.5) / 2;
  const toV = (x: number, y: number, z: number) => new THREE.Vector3((x - W / 2) * S, (y - YC) * S, (z - D / 2) * S);
  const uT = { value: 0 };
  const buildK = [0, 1, 2].map(() => ({ value: 0 }));
  const lift = [0, 1, 2].map(() => ({ value: 0 }));
  const J = C.J;
  const colOf = (k: K) => new THREE.Color(COL[k]);

  /* ---- real plan sheets ---- */
  const groups: THREE.Group[] = [];
  const sheetMats: THREE.ShaderMaterial[] = [];
  for (let p = 0; p < 3; p++) {
    const grp = new THREE.Group(); groups.push(grp); scene.add(grp);
    tex[p].colorSpace = THREE.SRGBColorSpace; tex[p].anisotropy = 4;
    const m = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
      uniforms: { map: { value: tex[p] }, uPaper: { value: 0.9 }, uInk: { value: 1 } },
      vertexShader: `varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader: `uniform sampler2D map;uniform float uPaper,uInk;varying vec2 vU;void main(){vec3 c=texture2D(map,vU).rgb;float ink=1.-smoothstep(.35,.85,dot(c,vec3(.333)));
vec3 paper=vec3(.925,.945,.96);vec3 line=vec3(.06,.1,.16);vec3 col=mix(paper,line,ink);
float a=mix(uPaper,uInk,ink);vec3 glow=mix(col,vec3(.62,.78,.92),(1.-uPaper)*ink);gl_FragColor=vec4(mix(col,glow,step(uPaper,.5)),a);}`,
    });
    sheetMats.push(m);
    const sheet = new THREE.Mesh(new THREE.PlaneGeometry(J.sheetW * S, J.sheetH * S), m);
    sheet.rotation.x = -Math.PI / 2;
    sheet.position.copy(toV(J.sheetOff[0] + J.sheetW / 2, p * SH, J.sheetOff[1] + J.sheetH / 2));
    sheet.renderOrder = 0; grp.add(sheet);
  }

  /* ---- detections ---- */
  const xmin = -1.5, xmax = W + 1.5;
  const els = C.els as E3[];
  for (const e of els) e.td = CAD.DET[e.plan] + ((e.fx - xmin) / (xmax - xmin)) * CAD.SWEEP;

  // mask polygons: one merged geometry, per-vertex timing + plan
  const pos: number[] = [], colr: number[] = [], at: number[] = [];
  for (const e of els) {
    if (e.poly.length < 3) continue;
    const pts = e.poly.map(([x, z]) => new THREE.Vector2(x, z));
    let tris: number[][] = [];
    try { tris = THREE.ShapeUtils.triangulateShape(pts, []); } catch { tris = []; }
    const c = colOf(e.k), y = e.plan * SH + 0.02;
    for (const t of tris) for (const i of t) {
      const v = toV(pts[i].x, y, pts[i].y); pos.push(v.x, v.y, v.z); colr.push(c.r, c.g, c.b); at.push(e.td, e.plan, e.k === "pile" && e.plan !== 0 ? 1 : 0);
    }
  }
  const mg = new THREE.BufferGeometry();
  mg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  mg.setAttribute("color", new THREE.Float32BufferAttribute(colr, 3));
  mg.setAttribute("aT", new THREE.Float32BufferAttribute(at, 3));
  const liftU = { uT, uB0: buildK[0], uB1: buildK[1], uB2: buildK[2], uL1: lift[1], uL2: lift[2] };
  const maskMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide, uniforms: liftU,
    vertexShader: `attribute vec3 color,aT;uniform float uT,uB0,uB1,uB2,uL1,uL2;varying vec3 vC;varying float vA;
void main(){float k=smoothstep(aT.x,aT.x+.12,uT);float b=aT.y<.5?uB0:(aT.y<1.5?uB1:uB2);float lf=aT.y<.5?0.:(aT.y<1.5?uL1:uL2);
vec3 p=position+vec3(0.,lf,0.);vC=aT.z>.5?vec3(1.,.48,.48):color;float flash=1.+.9*exp(-pow((uT-aT.x-.1)*9.,2.));
vA=k*mix(.72,.22,b)*(aT.z>.5?.8:1.);vC*=flash;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
    fragmentShader: `varying vec3 vC;varying float vA;void main(){if(vA<.01)discard;gl_FragColor=vec4(vC,vA);}`,
  });
  const masks = new THREE.Mesh(mg, maskMat); masks.frustumCulled = false; masks.renderOrder = 2; scene.add(masks);

  // detection brackets on the plans (footprint AABBs)
  const corner: number[] = [];
  { const a = 0.3; for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const p = [sx * 0.5, 0, sz * 0.5]; corner.push(...p, sx * (0.5 - a), 0, sz * 0.5, ...p, sx * 0.5, 0, sz * (0.5 - a)); } }
  const n = els.length;
  const bg = new THREE.InstancedBufferGeometry(); bg.setAttribute("position", new THREE.Float32BufferAttribute(corner, 3));
  const iC = new Float32Array(n * 3), iS = new Float32Array(n * 2), iK = new Float32Array(n * 3), iT = new Float32Array(n * 2);
  els.forEach((e, i) => {
    const c = toV(e.fx, e.plan * SH + 0.03, e.fz); const col = e.k === "pile" && e.plan !== 0 ? new THREE.Color("#FF7A7A") : colOf(e.k);
    iC.set([c.x, c.y, c.z], i * 3); iS.set([(e.fw + 0.3) * S, (e.fd + 0.3) * S], i * 2); iK.set([col.r, col.g, col.b], i * 3); iT.set([e.td, e.plan], i * 2);
  });
  bg.setAttribute("iC", new THREE.InstancedBufferAttribute(iC, 3)); bg.setAttribute("iS", new THREE.InstancedBufferAttribute(iS, 2));
  bg.setAttribute("iK", new THREE.InstancedBufferAttribute(iK, 3)); bg.setAttribute("iT", new THREE.InstancedBufferAttribute(iT, 2)); bg.instanceCount = n;
  const bm = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false, uniforms: liftU,
    vertexShader: `attribute vec3 iC,iK;attribute vec2 iS,iT;uniform float uT,uB0,uB1,uB2,uL1,uL2;varying vec3 vC;varying float vA;
void main(){float k=smoothstep(iT.x,iT.x+.16,uT);float b=iT.y<.5?uB0:(iT.y<1.5?uB1:uB2);float lf=iT.y<.5?0.:(iT.y<1.5?uL1:uL2);
vec3 p=iC+vec3(0.,lf,0.)+vec3(position.x*iS.x,.004,position.z*iS.y)*(1.+.8*(1.-k));vC=iK;vA=k*(1.-b)*.95;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
    fragmentShader: `varying vec3 vC;varying float vA;void main(){if(vA<.01)discard;gl_FragColor=vec4(vC,vA);}`,
  });
  const brackets = new THREE.LineSegments(bg, bm); brackets.frustumCulled = false; brackets.renderOrder = 6; scene.add(brackets);

  // AI sweep bar per plan
  const sweeps = [0, 1, 2].map((p) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.6 * S, (D + 4) * S), new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, uniforms: { uA: { value: 0 } },
      vertexShader: `varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader: `uniform float uA;varying vec2 vU;void main(){float g=pow(vU.x,3.);float e=smoothstep(0.,.08,vU.y)*smoothstep(1.,.92,vU.y);gl_FragColor=vec4(.35,.9,.86,uA*(.1+.9*g)*e*.6);}`,
    }));
    m.rotation.x = -Math.PI / 2; m.position.copy(toV(0, p * SH + 0.06, D / 2)); m.renderOrder = 7; m.visible = false; groups[p].add(m); return m;
  });

  /* ---- 3D solids ---- */
  const solidEls = [...els.filter((e) => e.use3d), ...(C.slabs as E3[])];
  const boxEls = solidEls.filter((e) => e.shape === "box" && e.k !== "opening" && e.k !== "slab");
  const cylEls = solidEls.filter((e) => e.shape === "cyl");
  const glassEls = solidEls.filter((e) => e.k === "opening" || e.k === "slab");
  const lam = (o: THREE.MeshLambertMaterialParameters = {}) => new THREE.MeshLambertMaterial({ color: 0xffffff, ...o });
  const boxes = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), lam(), Math.max(1, boxEls.length));
  const cyls = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.5, 0.5, 1, 18), lam(), Math.max(1, cylEls.length));
  const glass = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), lam({ transparent: true, opacity: 0.22, depthWrite: false }), Math.max(1, glassEls.length));
  glass.renderOrder = 3;
  const concrete = new THREE.Color("#C9D3DC");
  const assign = (list: E3[], mesh: THREE.InstancedMesh, tint: number) => list.forEach((e, i) => {
    e.mesh = mesh; e.inst = i; e.base = e.k === "slab" || e.k === "opening" ? colOf(e.k) : concrete.clone().lerp(colOf(e.k), tint);
    mesh.setColorAt(i, e.base); e.cS = toV(...e.c); e.sS = new THREE.Vector3(e.s[0] * S, e.s[1] * S, e.s[2] * S);
  });
  assign(boxEls, boxes, 0.42); assign(cylEls, cyls, 0.45); assign(glassEls, glass, 1);
  scene.add(boxes, cyls, glass);
  const order: Record<string, number> = { pile: 0, beam: 1, column: 2, circ: 2, wall: 3, opening: 4, slab: 2 };
  let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (const e of solidEls) e.g0 = CAD.BUILD[e.plan] + order[e.k] * 0.1 + rnd() * 0.08;
  const edgeOf = (mesh: THREE.InstancedMesh, opacity: number) => {
    const g = new THREE.InstancedBufferGeometry(); g.setAttribute("position", new THREE.EdgesGeometry(mesh.geometry, 30).getAttribute("position"));
    g.setAttribute("aM", mesh.instanceMatrix); g.setAttribute("aC", mesh.instanceColor as THREE.InstancedBufferAttribute); g.instanceCount = mesh.count;
    const m = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uO: { value: opacity } },
      vertexShader: `attribute mat4 aM;attribute vec3 aC;varying vec3 vC;void main(){vC=aC;gl_Position=projectionMatrix*modelViewMatrix*aM*vec4(position,1.);}`,
      fragmentShader: `uniform float uO;varying vec3 vC;void main(){gl_FragColor=vec4(min(vC*1.2,vec3(1.)),uO);}` });
    const l = new THREE.LineSegments(g, m); l.frustumCulled = false; l.renderOrder = 4; scene.add(l);
  };
  edgeOf(boxes, 0.45); edgeOf(cyls, 0.4); edgeOf(glass, 0.6);
  const M = new THREE.Matrix4(), Qn = new THREE.Quaternion(), Y = new THREE.Vector3(0, 1, 0), Pv = new THREE.Vector3(), Sv = new THREE.Vector3();
  const place = (t: number) => {
    for (const e of solidEls) {
      let g = Math.min(1, Math.max(0, (t - e.g0) / 0.42)); g = 1 - Math.pow(1 - g, 3);
      Pv.copy(e.cS); Sv.copy(e.sS); Qn.setFromAxisAngle(Y, e.rot);
      if (g <= 0) Sv.set(1e-5, 1e-5, 1e-5);
      else if (e.grow === "up") { Sv.y *= g; Pv.y = e.cS.y - e.sS.y / 2 + Sv.y / 2; }
      else if (e.grow === "down") { Sv.y *= g; Pv.y = e.cS.y + e.sS.y / 2 - Sv.y / 2; }
      else if (e.grow === "x") Sv.x *= g;
      else { Sv.x *= g; Sv.z *= g; }
      M.compose(Pv, Qn, Sv); e.mesh.setMatrixAt(e.inst, M);
    }
    boxes.instanceMatrix.needsUpdate = true; cyls.instanceMatrix.needsUpdate = true; glass.instanceMatrix.needsUpdate = true;
  };
  scene.add(new THREE.HemisphereLight(0xdcefff, 0x0a1220, 1.15));
  const dl = new THREE.DirectionalLight(0xffffff, 1.2); dl.position.set(-3, 6, 4); scene.add(dl);

  /* ---- labels ---- */
  const labelsEl = q<HTMLDivElement>("labels");
  const planLabels = J.plans.map((pl, p) => {
    const el = document.createElement("div"); el.className = "hv-plan"; el.innerHTML = `${pl.label}<small> · ${pl.src.replace(".jpg", "")}</small>`; labelsEl.appendChild(el);
    return { el, at: toV(J.sheetOff[0] + 0.4, p * SH + 0.05, J.sheetOff[1] + J.sheetH - 0.2), p };
  });
  const best = (pred: (e: E3) => boolean) => els.filter(pred).sort((a, b) => b.score - a.score)[0];
  const picks = [
    best((e) => e.plan === 0 && e.k === "pile" && e.fx < 6 && e.fz > 5),
    best((e) => e.plan === 1 && e.k === "column" && e.fx > 17),
    best((e) => e.plan === 2 && e.k === "beam" && e.fx > 12 && e.fz < 1),
    best((e) => e.plan === 1 && e.k === "pile"),
  ].filter(Boolean) as E3[];
  const labelDefs = picks.map((e) => {
    const rej = e.k === "pile" && e.plan !== 0;
    const el = document.createElement("div"); el.className = "hv-lbl"; el.style.background = rej ? "#FF7A7A" : COL[e.k];
    el.innerHTML = rej ? `<span class="hv-tag">AI detected · ${e.score.toFixed(2)}</span>Pile → rejected<small>not on foundation plan</small>` : `<span class="hv-tag">AI detected · ${e.score.toFixed(2)}</span>${NAME[e.k]}`;
    labelsEl.appendChild(el);
    const at3 = e.use3d ? toV(e.c[0], e.c[1] + (e.grow === "down" ? -e.s[1] / 2 : e.s[1] / 2), e.c[2]) : null;
    return { e, el, rej, at: toV(e.fx, e.plan * SH + 0.05, e.fz), p: e.plan, at3, built: false };
  });

  /* ---- HUD ---- */
  const hudEl = q<HTMLDivElement>("hud"), hudStage = q<HTMLElement>("stage"), hudMsg = q<HTMLElement>("msg"), hudPts = q<HTMLElement>("pts");
  const list = q<HTMLUListElement>("list"); list.innerHTML = "";
  const rowsDef: [K, string][] = [["pile", "Piles"], ["beam", "Beams"], ["column", "Columns"], ["wall", "Walls"], ["opening", "Openings"]];
  const rows = rowsDef.map(([k, name]) => {
    const li = document.createElement("li"); li.innerHTML = `<span class="hv-sw" style="background:${COL[k]}"></span>${name}<b>0</b>`; list.appendChild(li);
    return { li, b: li.querySelector("b") as HTMLElement, times: els.filter((e) => e.k === k || (k === "column" && e.k === "circ")).map((e) => e.td).sort((a, b) => a - b) };
  });
  const total = els.length;
  let T = RM ? CAD.END + 0.5 : 0, playing = !RM, lastNow = performance.now();
  const chipsEl = q<HTMLDivElement>("chips"); chipsEl.innerHTML = "";
  const chips = CAD.STAGES.map((s) => {
    const b = document.createElement("button"); b.type = "button"; b.className = "hv-chip";
    b.innerHTML = `<span class="hv-dot"></span><span class="hv-n">${s.k}</span> <span class="hv-lg">${s.t}</span><span class="hv-sh">${s.sh}</span>`;
    b.addEventListener("click", () => { T = s.start + 0.001; playing = true; lastNow = performance.now(); }); chipsEl.appendChild(b); return b;
  });
  on(q<HTMLButtonElement>("replay"), "click", () => { T = 0; playing = true; lastNow = performance.now(); });
  if (window.matchMedia("(hover: none)").matches) q<HTMLElement>("hint").textContent = "Swipe sideways to rotate";
  let hudKey = "";
  const updateHud = (t: number) => {
    const si = CAD.STAGES.reduce((a, s, i) => (t >= s.start ? i : a), 0), done = t >= CAD.END;
    chips.forEach((c, i) => { c.classList.toggle("done", i < si || done); c.classList.toggle("now", i === si && !done); c.setAttribute("aria-pressed", String(i === si)); });
    const key = si + "|" + done;
    if (key !== hudKey) {
      hudKey = key; hudStage.textContent = CAD.STAGES[si].k + " " + CAD.STAGES[si].t;
      hudMsg.textContent = done ? "3D model built from the model's own detections. Hover an element to inspect it." : CAD.STAGES[si].msg;
      hudEl.classList.toggle("ai-on", si >= 1); hudEl.classList.toggle("ai-run", si === 1 && !RM);
    }
    let det = 0;
    for (const r of rows) { let v = 0; for (const x of r.times) if (t >= x) v++; det += v; r.b.textContent = String(v); r.li.classList.toggle("on", v > 0); }
    hudPts.textContent = t < CAD.DET[0] ? "" : `${det} / ${total} detections`;
  };

  /* ---- camera + interaction ---- */
  let W0 = 1, H0 = 1;
  const resize = () => {
    const r = root.getBoundingClientRect(); W0 = Math.max(1, r.width); H0 = Math.max(1, r.height);
    renderer.setSize(W0, H0, false); camera.aspect = W0 / H0;
    camera.setViewOffset(W0, H0, -CAD.CAM.offX * W0, -CAD.CAM.offY * H0, W0, H0); camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize); ro.observe(root); resize(); cleanups.push(() => ro.disconnect());
  let dYaw = 0, dPitch = 0, tYaw = 0, tPitch = 0, drag: { x: number; y: number; yaw: number; pitch: number } | null = null;
  const mouse = new THREE.Vector2(); let mouseXY: [number, number] | null = null, hoverDirty = false;
  on(root, "pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY, yaw: tYaw, pitch: tPitch }; if (e.pointerType === "mouse") root.setPointerCapture(e.pointerId); });
  on(root, "pointermove", (e) => {
    if (drag) { tYaw = drag.yaw - (e.clientX - drag.x) * 0.006; tPitch = Math.max(-0.3, Math.min(0.35, drag.pitch + (e.clientY - drag.y) * 0.004)); }
    const r = root.getBoundingClientRect(); mouse.set(((e.clientX - r.left) / W0) * 2 - 1, -((e.clientY - r.top) / H0) * 2 + 1); mouseXY = [e.clientX - r.left, e.clientY - r.top]; hoverDirty = true;
  });
  const endDrag = () => { drag = null; }; on(root, "pointerup", endDrag); on(root, "pointercancel", endDrag);
  on(root, "pointerleave", () => { mouseXY = null; hoverDirty = true; });
  const placeCamera = (t: number) => {
    const sway = RM ? 0 : 0.14 * Math.sin(t * 0.25) * Math.min(1, t / 2);
    dYaw += (tYaw - dYaw) * 0.12; dPitch += (tPitch - dPitch) * 0.12;
    const yaw = CAD.CAM.yaw + sway + dYaw, pitch = CAD.CAM.pitch + dPitch, dist = CAD.CAM.dist * (W0 / H0 < 1.05 ? CAD.CAM.narrowDist : 1);
    camera.position.set(tgt.x + dist * Math.sin(yaw) * Math.cos(pitch), tgt.y + dist * Math.sin(pitch), tgt.z + dist * Math.cos(yaw) * Math.cos(pitch)); camera.lookAt(tgt);
  };
  const ray = new THREE.Raycaster(), tip = q<HTMLDivElement>("tip"), hl = new THREE.Color("#FFFFFF");
  let hovered: E3 | null = null;
  const setHover = (e: E3 | null) => {
    if (hovered === e) return;
    if (hovered) { hovered.mesh.setColorAt(hovered.inst, hovered.base); hovered.mesh.instanceColor!.needsUpdate = true; }
    hovered = e;
    if (e) {
      e.mesh.setColorAt(e.inst, e.base.clone().lerp(hl, 0.5)); e.mesh.instanceColor!.needsUpdate = true;
      const src = e.k === "slab" ? `<span class="hv-ai">${e.note}</span>` : `<span class="hv-ai">AI: segmented on the ${e.lvl.toLowerCase()} plan · confidence ${e.score.toFixed(2)}</span>`;
      tip.innerHTML = `<b>${IFC[e.k]}</b> · ${e.id}<br>${e.lvl}<br>${src}`;
    }
    tip.classList.toggle("on", !!e);
  };
  const lists: [THREE.InstancedMesh, E3[]][] = [[boxes, boxEls], [cyls, cylEls], [glass, glassEls]];
  const updateHover = (t: number) => {
    if (!hoverDirty) return; hoverDirty = false;
    if (!mouseXY || t < CAD.END - 0.3 || drag) { setHover(null); return; }
    ray.setFromCamera(mouse, camera);
    const hit = ray.intersectObjects([boxes, cyls, glass], false)[0];
    const found = hit && hit.instanceId !== undefined ? lists.find(([m]) => m === hit.object)![1][hit.instanceId] ?? null : null;
    setHover(found);
    if (hovered) { const x = Math.min(mouseXY[0], W0 - 280); tip.style.transform = `translate(${x + 14}px,${mouseXY[1] + 14}px)`; }
  };

  /* ---- loop ---- */
  let visible = false, first = true, raf = 0;
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; lastNow = performance.now(); }, { threshold: 0.2 });
  io.observe(root); cleanups.push(() => io.disconnect());
  const onVis = () => { lastNow = performance.now(); }; document.addEventListener("visibilitychange", onVis); cleanups.push(() => document.removeEventListener("visibilitychange", onVis));
  (window as unknown as { __cadSeek?: (t: number) => void }).__cadSeek = (t: number) => { T = t; playing = false; visible = true; };
  const V = new THREE.Vector3(), V2 = new THREE.Vector3();
  const proj = (el: HTMLElement, p: THREE.Vector3) => { V.copy(p).project(camera); el.style.left = (V.x * 0.5 + 0.5) * W0 + "px"; el.style.top = (-V.y * 0.5 + 0.5) * H0 + "px"; };
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    if (!visible || document.hidden) { lastNow = now; return; }
    const dt = Math.min(0.05, (now - lastNow) / 1000); lastNow = now; if (playing) T += dt;
    const t = T; uT.value = t;
    const st = Math.min(1, Math.max(0, (t - CAD.SETTLE[0]) / (CAD.SETTLE[1] - CAD.SETTLE[0]))), ex = CAD.EXPLODE * (1 - st * st * (3 - 2 * st));
    for (let p = 0; p < 3; p++) { lift[p].value = p * ex * SH * S; groups[p].position.y = lift[p].value; }
    tgt.y = CAD.CAM.target[1] + ex * SH * S * 0.9;
    for (let p = 0; p < 3; p++) {
      const b = Math.min(1, Math.max(0, (t - CAD.BUILD[p]) / 0.6)); buildK[p].value = b;
      sheetMats[p].uniforms.uPaper.value = 0.88 - 0.8 * b; sheetMats[p].uniforms.uInk.value = 1 - 0.55 * b;
      const s = (t - CAD.DET[p]) / CAD.SWEEP, sw = sweeps[p];
      sw.visible = s > -0.05 && s < 1.1;
      if (sw.visible) { sw.position.x = (xmin + (xmax - xmin) * Math.min(1, Math.max(0, s)) - W / 2) * S; (sw.material as THREE.ShaderMaterial).uniforms.uA.value = Math.min(1, (1.1 - s) * 5); }
    }
    place(t); placeCamera(t); updateHud(t); updateHover(t);
    const built3 = t >= CAD.BUILD[2] + 0.4;
    for (const pl of planLabels) { pl.el.classList.toggle("off", built3); V2.copy(pl.at); V2.y += lift[pl.p].value; proj(pl.el, V2); }
    for (const L of labelDefs) {
      const built = !!L.at3 && t >= L.e.g0 + 0.45;
      if (built !== L.built) {
        L.built = built;
        if (built) L.el.innerHTML = `<span class="hv-tag">AI → BIM · ${L.e.score.toFixed(2)}</span>${IFC[L.e.k]}`;
        L.el.style.transform = built && L.e.grow === "down" ? "translate(-50%,35%)" : "";
      }
      const show = t >= L.e.td + 0.1 && !(L.rej && t >= CAD.BUILD[1] + 0.3) && !(L.e.k === "opening" && built);
      L.el.classList.toggle("on", show); if (!show) continue;
      if (built && L.at3) proj(L.el, L.at3); else { V2.copy(L.at); V2.y += lift[L.p].value; proj(L.el, V2); }
    }
    renderer.render(scene, camera);
    if (first) { first = false; opts.onReady?.(); }
  };
  raf = requestAnimationFrame(frame);
  return () => {
    cancelAnimationFrame(raf); cleanups.forEach((f) => f()); labelsEl.innerHTML = ""; chipsEl.innerHTML = ""; list.innerHTML = "";
    scene.traverse((o) => { const m = o as THREE.Mesh; if (m.geometry) m.geometry.dispose(); const mat = m.material as THREE.Material | THREE.Material[] | undefined; if (Array.isArray(mat)) mat.forEach((x) => x.dispose()); else mat?.dispose(); });
    tex.forEach((x) => x.dispose()); renderer.dispose();
  };
}
