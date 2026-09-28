/**
 * WebGL CAD-to-BIM sequence: 3 stacked structural plans → AI detection on each plan →
 * level-by-level 3D build on top of the plans. Imperative: drives its own overlay DOM.
 */
import * as THREE from "three";
import { CAD, type CadData, type CadElem } from "./cadData";

type E = CadElem & { mesh: THREE.InstancedMesh; inst: number; base: THREE.Color; g0: number; td: number; cS: THREE.Vector3; sS: THREE.Vector3 };

export function startCad(root: HTMLElement, C: CadData, opts: { reduced: boolean; small: boolean; onReady?: () => void }): () => void {
  const q = <T extends Element>(k: string) => root.querySelector(`[data-h="${k}"]`) as T;
  const RM = opts.reduced;
  const cleanups: (() => void)[] = [];
  const on = <K extends keyof HTMLElementEventMap>(el: HTMLElement, ev: K, fn: (e: HTMLElementEventMap[K]) => void) => {
    el.addEventListener(ev, fn as EventListener); cleanups.push(() => el.removeEventListener(ev, fn as EventListener));
  };
  const renderer = new THREE.WebGLRenderer({ canvas: q<HTMLCanvasElement>("gl"), antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.small ? 1.5 : 1.75));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(CAD.CAM.fov, 1, 0.05, 60);
  const tgt = new THREE.Vector3(...CAD.CAM.target);
  const S = C.S;
  const toV = (x: number, y: number, z: number) => new THREE.Vector3(...C.toS(x, y, z));
  const uT = { value: 0 };
  const buildK = [0, 1, 2].map(() => ({ value: 0 }));

  /* ---- plan sheets + CAD linework ---- */
  const groups: THREE.Group[] = [];
  const lift = [0, 1, 2].map(() => ({ value: 0 }));
  const sheets: THREE.Mesh[] = [], lineMats: THREE.LineBasicMaterial[] = [], gridMats: THREE.LineBasicMaterial[] = [];
  for (let p = 0; p < 3; p++) {
    const y = C.planY[p];
    const sheet = new THREE.Mesh(new THREE.PlaneGeometry((C.W + 8) * S, (C.D + 6.4) * S), new THREE.MeshBasicMaterial({ color: 0x0c1a2c, transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide }));
    sheet.rotation.x = -Math.PI / 2; sheet.position.copy(toV(C.W / 2 + 0.3, y + 0.005, C.D / 2 - 0.8)); sheet.renderOrder = 0;
    const grp = new THREE.Group(); groups.push(grp); scene.add(grp); grp.add(sheet); sheets.push(sheet);
    const mk = (segs: [number, number, number, number][], color: number, opacity: number, arr: THREE.LineBasicMaterial[]) => {
      const pos = new Float32Array(segs.length * 6);
      segs.forEach(([x0, z0, x1, z1], i) => { const a = C.toS(x0, y + 0.02, z0), b = C.toS(x1, y + 0.02, z1); pos.set([...a, ...b], i * 6); });
      const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const m = new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false }); arr.push(m);
      const l = new THREE.LineSegments(g, m); l.renderOrder = 1; groups[p].add(l);
    };
    mk(C.lines[p], 0xa9bfd4, 0.9, lineMats);
    mk(C.grid[p], 0x55718e, 0.8, gridMats);
  }

  /* ---- detection timing ---- */
  const xmin = -2, xmax = C.W + 2;
  const els = C.els as E[];
  for (const e of els) e.td = CAD.DET[e.plan] + ((e.fp.x - xmin) / (xmax - xmin)) * CAD.SWEEP;

  /* ---- plan masks (instanced flat quads) ---- */
  const mg = new THREE.InstancedBufferGeometry();
  mg.setAttribute("position", new THREE.Float32BufferAttribute([-0.5, 0, -0.5, 0.5, 0, -0.5, 0.5, 0, 0.5, -0.5, 0, -0.5, 0.5, 0, 0.5, -0.5, 0, 0.5], 3));
  const n = els.length, mC = new Float32Array(n * 3), mS = new Float32Array(n * 2), mK = new Float32Array(n * 3), mT = new Float32Array(n * 2);
  els.forEach((e, i) => {
    const c = C.toS(e.fp.x, C.planY[e.plan] + 0.03, e.fp.z); const col = new THREE.Color(CAD.COL[e.cls]);
    mC.set(c, i * 3); mS.set([Math.max(e.fp.w, 0.3) * S, Math.max(e.fp.d, 0.3) * S], i * 2); mK.set([col.r, col.g, col.b], i * 3); mT.set([e.td, e.plan], i * 2);
  });
  mg.setAttribute("iC", new THREE.InstancedBufferAttribute(mC, 3)); mg.setAttribute("iS", new THREE.InstancedBufferAttribute(mS, 2));
  mg.setAttribute("iK", new THREE.InstancedBufferAttribute(mK, 3)); mg.setAttribute("iT", new THREE.InstancedBufferAttribute(mT, 2)); mg.instanceCount = n;
  const maskMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
    uniforms: { uT, uB0: buildK[0], uB1: buildK[1], uB2: buildK[2], uL1: lift[1], uL2: lift[2] },
    vertexShader: `attribute vec3 iC,iK;attribute vec2 iS,iT;uniform float uT,uB0,uB1,uB2,uL1,uL2;varying vec3 vC;varying float vA;
void main(){float k=smoothstep(iT.x,iT.x+.14,uT);float b=iT.y<.5?uB0:(iT.y<1.5?uB1:uB2);float lf=iT.y<.5?0.:(iT.y<1.5?uL1:uL2);vec3 p=iC+vec3(0.,lf,0.)+vec3(position.x*iS.x,0.,position.z*iS.y)*(1.+.6*(1.-k));
vC=iK;vA=k*mix(.62,.16,b);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
    fragmentShader: `varying vec3 vC;varying float vA;void main(){if(vA<.01)discard;gl_FragColor=vec4(vC,vA);}`,
  });
  const masks = new THREE.Mesh(mg, maskMat); masks.frustumCulled = false; masks.renderOrder = 2; scene.add(masks);

  /* ---- 2D detection brackets on the plans ---- */
  const corner: number[] = [];
  { const a = 0.3; for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const p = [sx * 0.5, 0, sz * 0.5]; corner.push(...p, sx * (0.5 - a), 0, sz * 0.5, ...p, sx * 0.5, 0, sz * (0.5 - a)); } }
  const bg = new THREE.InstancedBufferGeometry(); bg.setAttribute("position", new THREE.Float32BufferAttribute(corner, 3));
  const bS = new Float32Array(n * 2); els.forEach((e, i) => bS.set([(Math.max(e.fp.w, 0.3) + 0.35) * S, (Math.max(e.fp.d, 0.3) + 0.35) * S], i * 2));
  bg.setAttribute("iC", mg.getAttribute("iC")); bg.setAttribute("iS", new THREE.InstancedBufferAttribute(bS, 2));
  bg.setAttribute("iK", mg.getAttribute("iK")); bg.setAttribute("iT", mg.getAttribute("iT")); bg.instanceCount = n;
  const bm = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false, uniforms: { uT, uB0: buildK[0], uB1: buildK[1], uB2: buildK[2], uL1: lift[1], uL2: lift[2] },
    vertexShader: `attribute vec3 iC,iK;attribute vec2 iS,iT;uniform float uT,uB0,uB1,uB2,uL1,uL2;varying vec3 vC;varying float vA;
void main(){float k=smoothstep(iT.x,iT.x+.16,uT);float b=iT.y<.5?uB0:(iT.y<1.5?uB1:uB2);float lf=iT.y<.5?0.:(iT.y<1.5?uL1:uL2);vec3 p=iC+vec3(0.,lf,0.)+vec3(position.x*iS.x,.004,position.z*iS.y)*(1.+.8*(1.-k));
vC=iK;vA=k*(1.-b)*.95;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
    fragmentShader: `varying vec3 vC;varying float vA;void main(){if(vA<.01)discard;gl_FragColor=vec4(vC,vA);}`,
  });
  const brackets = new THREE.LineSegments(bg, bm); brackets.frustumCulled = false; brackets.renderOrder = 6; scene.add(brackets);

  /* ---- AI sweep bars ---- */
  const sweepMat = (p: number) => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, uniforms: { uA: { value: 0 } },
    vertexShader: `varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform float uA;varying vec2 vU;void main(){float g=pow(vU.x,3.);float e=smoothstep(0.,.08,vU.y)*smoothstep(1.,.92,vU.y);gl_FragColor=vec4(.45,.95,.9,uA*(.12+.88*g)*e*.55);}`,
  });
  const sweeps = [0, 1, 2].map((p) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.4 * S, (C.D + 5) * S), sweepMat(p));
    m.rotation.x = -Math.PI / 2; m.position.copy(toV(0, C.planY[p] + 0.06, C.D / 2)); m.renderOrder = 7; m.visible = false; groups[p].add(m); return m;
  });

  /* ---- 3D solids ---- */
  const boxEls = els.filter((e) => !e.cyl && e.cls !== 4), cylEls = els.filter((e) => e.cyl), openEls = els.filter((e) => e.cls === 4), slabEls = C.slabs as E[];
  const lam = (opts2: THREE.MeshLambertMaterialParameters = {}) => new THREE.MeshLambertMaterial({ color: 0xffffff, ...opts2 });
  const boxes = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), lam(), boxEls.length);
  const cyls = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.5, 0.5, 1, 20), lam(), cylEls.length);
  const opens = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), lam({ transparent: true, opacity: 0.35, depthWrite: false }), openEls.length);
  const slabs = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), lam({ transparent: true, opacity: 0.2, depthWrite: false }), slabEls.length);
  opens.renderOrder = 3; slabs.renderOrder = 3;
  const concrete = new THREE.Color("#C9D3DC");
  const assign = (list: E[], mesh: THREE.InstancedMesh, tint: number) => list.forEach((e, i) => {
    e.mesh = mesh; e.inst = i; e.base = e.cls === 6 || e.cls === 4 ? new THREE.Color(CAD.COL[e.cls]) : concrete.clone().lerp(new THREE.Color(CAD.COL[e.cls]), tint);
    mesh.setColorAt(i, e.base); e.cS = toV(...e.c); e.sS = new THREE.Vector3(e.s[0] * S, e.s[1] * S, e.s[2] * S);
  });
  assign(boxEls, boxes, 0.4); assign(cylEls, cyls, 0.45); assign(openEls, opens, 1); assign(slabEls, slabs, 1);
  scene.add(boxes, cyls, opens, slabs);
  const order: Record<number, number[]> = { 0: [5, 2, 0, 1, 3, 4, 6], 1: [2, 6, 0, 1, 3, 4], 2: [2, 6] };
  let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (const e of [...els, ...slabEls] as E[]) {
    const idx = order[e.plan].indexOf(e.cls);
    e.g0 = CAD.BUILD[e.plan] + Math.max(0, idx) * 0.1 + rnd() * 0.07;
  }
  const edgeOf = (mesh: THREE.InstancedMesh, geo: THREE.BufferGeometry, opacity: number) => {
    const g = new THREE.InstancedBufferGeometry(); g.setAttribute("position", new THREE.EdgesGeometry(geo, 30).getAttribute("position"));
    g.setAttribute("aM", mesh.instanceMatrix); g.setAttribute("aC", mesh.instanceColor as THREE.InstancedBufferAttribute); g.instanceCount = mesh.count;
    const m = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uO: { value: opacity } },
      vertexShader: `attribute mat4 aM;attribute vec3 aC;varying vec3 vC;void main(){vC=aC;gl_Position=projectionMatrix*modelViewMatrix*aM*vec4(position,1.);}`,
      fragmentShader: `uniform float uO;varying vec3 vC;void main(){gl_FragColor=vec4(min(vC*1.25,vec3(1.)),uO);}` });
    const l = new THREE.LineSegments(g, m); l.frustumCulled = false; l.renderOrder = 4; scene.add(l);
  };
  edgeOf(boxes, boxes.geometry, 0.5); edgeOf(cyls, cyls.geometry, 0.5); edgeOf(slabs, slabs.geometry, 0.55); edgeOf(opens, opens.geometry, 0.8);
  const M = new THREE.Matrix4(), Qn = new THREE.Quaternion(), Pv = new THREE.Vector3(), Sv = new THREE.Vector3();
  const all = [...boxEls, ...cylEls, ...openEls, ...slabEls];
  const place = (t: number) => {
    for (const e of all) {
      let g = Math.min(1, Math.max(0, (t - e.g0) / 0.42)); g = 1 - Math.pow(1 - g, 3);
      Pv.copy(e.cS); Sv.copy(e.sS);
      if (g <= 0) Sv.set(1e-5, 1e-5, 1e-5);
      else if (e.grow === "up") { Sv.y *= g; Pv.y = e.cS.y - e.sS.y / 2 + Sv.y / 2; }
      else if (e.grow === "down") { Sv.y *= g; Pv.y = e.cS.y + e.sS.y / 2 - Sv.y / 2; }
      else if (e.grow === "x") Sv.x *= g;
      else if (e.grow === "z") Sv.z *= g;
      else { Sv.x *= g; Sv.z *= g; }
      M.compose(Pv, Qn, Sv); e.mesh.setMatrixAt(e.inst, M);
    }
    for (const m of [boxes, cyls, opens, slabs]) m.instanceMatrix.needsUpdate = true;
  };
  scene.add(new THREE.HemisphereLight(0xdcefff, 0x0a1220, 1.15));
  const dl = new THREE.DirectionalLight(0xffffff, 1.2); dl.position.set(-3, 6, 4); scene.add(dl);

  /* ---- labels ---- */
  const labelsEl = q<HTMLDivElement>("labels");
  const planLabels = CAD.PLANS.map((name, p) => {
    const el = document.createElement("div"); el.className = "hv-plan"; el.textContent = name; labelsEl.appendChild(el);
    return { el, at: toV(-3.4, C.planY[p] + 0.05, C.D + 2.2), p };
  });
  const HI = ["P-C1|0", "D-Core|0", "C-C3|1", "W-Core-E|1", "B-C/4–5|2"];
  const labelDefs = els.filter((e) => HI.includes(e.id + "|" + e.plan)).map((e) => {
    const el = document.createElement("div"); el.className = "hv-lbl"; el.style.background = CAD.COL[e.cls];
    el.innerHTML = `<span class="hv-tag">AI detected</span>${CAD.NAME[e.cls]}<small>${e.id}</small>`; labelsEl.appendChild(el);
    const down = e.grow === "down";
    const at3 = toV(e.c[0], e.c[1] + (down ? -e.s[1] / 2 : e.s[1] / 2), e.c[2]);
    return { e, el, at: toV(e.fp.x, C.planY[e.plan] + 0.05, e.fp.z), p: e.plan, at3, down, built: false };
  });

  /* ---- HUD + chips ---- */
  const hudEl = q<HTMLDivElement>("hud"), hudStage = q<HTMLElement>("stage"), hudMsg = q<HTMLElement>("msg"), hudPts = q<HTMLElement>("pts");
  const list = q<HTMLUListElement>("list"); list.innerHTML = "";
  const rows = ([[0, "Columns"], [1, "Circular"], [2, "Beams"], [3, "Walls"], [4, "Openings"], [5, "Piles"]] as [number, string][]).map(([c, name]) => {
    const li = document.createElement("li"); li.innerHTML = `<span class="hv-sw" style="background:${CAD.COL[c]}"></span>${name}<b>0</b>`; list.appendChild(li);
    return { c, li, b: li.querySelector("b") as HTMLElement, times: els.filter((e) => e.cls === c).map((e) => e.td).sort((a, b) => a - b) };
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
      hudMsg.textContent = done ? "3D model built from the plans. Hover an element to see what the AI detected." : CAD.STAGES[si].msg;
      hudEl.classList.toggle("ai-on", si >= 1); hudEl.classList.toggle("ai-run", si === 1 && !RM);
    }
    let det = 0;
    for (const r of rows) { let v = 0; for (const x of r.times) if (t >= x) v++; det += v; r.b.textContent = String(v); r.li.classList.toggle("on", v > 0); }
    hudPts.textContent = t < CAD.DET[0] ? "" : `${det} / ${total} elements`;
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
  let hovered: E | null = null;
  const setHover = (e: E | null) => {
    if (hovered === e) return;
    if (hovered) { hovered.mesh.setColorAt(hovered.inst, hovered.base); hovered.mesh.instanceColor!.needsUpdate = true; }
    hovered = e;
    if (e) {
      e.mesh.setColorAt(e.inst, e.base.clone().lerp(hl, 0.55)); e.mesh.instanceColor!.needsUpdate = true;
      const dims = e.cyl ? `Ø${(e.s[0] * 1000).toFixed(0)} mm` : `${(e.s[0] * 1000).toFixed(0)} × ${(e.s[2] * 1000).toFixed(0)} mm`;
      tip.innerHTML = `<b>${CAD.IFC[e.cls]}</b> · ${e.id}<br>${e.lvl} · ${dims}<br><span class="hv-ai">${e.cls === 6 ? "Generated from the plan outline" : `AI: detected on the ${CAD.PLANS[e.plan].split(" ·")[0].toLowerCase()}`}</span>`;
    }
    tip.classList.toggle("on", !!e);
  };
  const lists: [THREE.InstancedMesh, E[]][] = [[boxes, boxEls], [cyls, cylEls], [opens, openEls], [slabs, slabEls]];
  const updateHover = (t: number) => {
    if (!hoverDirty) return; hoverDirty = false;
    if (!mouseXY || t < CAD.END - 0.3 || drag) { setHover(null); return; }
    ray.setFromCamera(mouse, camera);
    const hit = ray.intersectObjects([boxes, cyls, opens, slabs], false)[0];
    const found = hit && hit.instanceId !== undefined ? lists.find(([m]) => m === hit.object)![1][hit.instanceId] : null;
    setHover(found);
    if (hovered) { const x = Math.min(mouseXY[0], W0 - 240); tip.style.transform = `translate(${x + 14}px,${mouseXY[1] + 14}px)`; }
  };

  /* ---- loop ---- */
  let visible = false, first = true, raf = 0;
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; lastNow = performance.now(); }, { threshold: 0.25 });
  io.observe(root); cleanups.push(() => io.disconnect());
  const onVis = () => { lastNow = performance.now(); }; document.addEventListener("visibilitychange", onVis); cleanups.push(() => document.removeEventListener("visibilitychange", onVis));
  (window as unknown as { __cadSeek?: (t: number) => void }).__cadSeek = (t: number) => { T = t; playing = false; visible = true; };
  const V = new THREE.Vector3(), V2 = new THREE.Vector3();
  const proj = (el: HTMLElement, at: THREE.Vector3) => { V.copy(at).project(camera); el.style.left = (V.x * 0.5 + 0.5) * W0 + "px"; el.style.top = (-V.y * 0.5 + 0.5) * H0 + "px"; };
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    if (!visible || document.hidden) { lastNow = now; return; }
    const dt = Math.min(0.05, (now - lastNow) / 1000); lastNow = now; if (playing) T += dt;
    const t = T; uT.value = t;
    const st = Math.min(1, Math.max(0, (t - CAD.SETTLE[0]) / (CAD.SETTLE[1] - CAD.SETTLE[0]))), ex = CAD.EXPLODE * (1 - st * st * (3 - 2 * st));
    for (let p = 0; p < 3; p++) { lift[p].value = p * ex * C.SH * S; groups[p].position.y = lift[p].value; }
    tgt.y = CAD.CAM.target[1] + ex * C.SH * S * 0.9;
    for (let p = 0; p < 3; p++) {
      const b = Math.min(1, Math.max(0, (t - CAD.BUILD[p]) / 0.6)); buildK[p].value = b;
      lineMats[p].opacity = 0.9 - 0.5 * b; gridMats[p].opacity = 0.8 - 0.45 * b;
      (sheets[p].material as THREE.MeshBasicMaterial).opacity = 0.55 - 0.35 * b;
      const s = (t - CAD.DET[p]) / CAD.SWEEP; const sw = sweeps[p];
      sw.visible = s > -0.05 && s < 1.1;
      if (sw.visible) { sw.position.x = (xmin + (xmax - xmin) * Math.min(1, Math.max(0, s)) - C.W / 2) * S; (sw.material as THREE.ShaderMaterial).uniforms.uA.value = Math.min(1, (1.1 - s) * 5); }
    }
    place(t); placeCamera(t); updateHud(t); updateHover(t);
    for (const pl of planLabels) { V2.copy(pl.at); V2.y += lift[pl.p].value; proj(pl.el, V2); }
    for (const L of labelDefs) {
      const built = t >= (L.e as E).g0 + 0.45;
      if (built !== L.built) {
        L.built = built;
        L.el.innerHTML = built ? `<span class="hv-tag">AI → BIM</span>${CAD.IFC[L.e.cls]}<small>${L.e.id}</small>` : `<span class="hv-tag">AI detected</span>${CAD.NAME[L.e.cls]}<small>${L.e.id}</small>`;
        L.el.style.transform = built && L.down ? "translate(-50%,35%)" : "";
      }
      const show = t >= L.e.td + 0.1 && !(built && L.e.cls === 4);
      L.el.classList.toggle("on", show); if (!show) continue;
      if (built) proj(L.el, L.at3); else { V2.copy(L.at); V2.y += lift[L.p].value; proj(L.el, V2); }
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
