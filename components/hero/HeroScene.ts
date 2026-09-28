/**
 * WebGL hero: scan → AI classify → AI detect → BIM model.
 * Imperative on purpose: it drives its own overlay DOM (HUD, labels, chips) every frame,
 * inside the container rendered by HeroVisual. Returns a dispose function.
 */
import * as THREE from "three";
import { CAM, COL, END, IFC, STAGES, type Elem, type SceneData } from "./scan";

type Det = { c: THREE.Vector3; s: THREE.Vector3; col: THREE.Color; hi: 0 | 1 | 2; e?: SElem; t: number };
type SElem = Elem & { inst: number; mesh: THREE.InstancedMesh; base: THREE.Color; g0: number; cS: THREE.Vector3; sS: THREE.Vector3 };

export function startHero(root: HTMLElement, Sc: SceneData, opts: { reduced: boolean; onReady?: () => void }): () => void {
  const q = <T extends Element>(k: string) => root.querySelector(`[data-h="${k}"]`) as T;
  const glc = q<HTMLCanvasElement>("gl");
  const RM = opts.reduced;
  const cleanups: (() => void)[] = [];
  const on = <K extends keyof HTMLElementEventMap>(el: HTMLElement, ev: K, fn: (e: HTMLElementEventMap[K]) => void) => {
    el.addEventListener(ev, fn as EventListener); cleanups.push(() => el.removeEventListener(ev, fn as EventListener));
  };

  const renderer = new THREE.WebGLRenderer({ canvas: glc, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, Sc.small ? 1.5 : 1.75));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(CAM.fov, 1, 0.05, 60);
  const tgt = new THREE.Vector3(...CAM.target);
  const toV = (x: number, y: number, z: number) => new THREE.Vector3(...Sc.toS(x, y, z));

  /* ---- points ---- */
  const pg = new THREE.BufferGeometry();
  pg.setAttribute("position", new THREE.BufferAttribute(Sc.pos, 3));
  pg.setAttribute("aCls", new THREE.BufferAttribute(Sc.cls, 1));
  pg.setAttribute("aInt", new THREE.BufferAttribute(Sc.inten, 1));
  pg.setAttribute("aAz", new THREE.BufferAttribute(Sc.az, 1));
  pg.setAttribute("aRnd", new THREE.BufferAttribute(Sc.rnd, 1));
  const U = {
    uT: { value: 0 }, uScan: { value: 1.25 }, uSegStart: { value: STAGES[1].start }, uSegDur: { value: 1.1 },
    uXmin: { value: Sc.xmin }, uXmax: { value: Sc.xmax }, uModel: { value: 0 }, uSize: { value: Sc.small ? 2.6 : 2.3 },
    uPR: { value: renderer.getPixelRatio() }, uCol: { value: [0, 1, 2, 3, 4, 5].map((i) => new THREE.Color(COL[i])) },
  };
  const pm = new THREE.ShaderMaterial({
    uniforms: U, transparent: true, depthWrite: false,
    vertexShader: `attribute float aCls,aInt,aAz,aRnd;uniform float uT,uScan,uSegStart,uSegDur,uXmin,uXmax,uModel,uSize,uPR;uniform vec3 uCol[6];varying vec3 vC;varying float vA;
void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;
float s=uT/uScan;float hit=clamp((s-aAz)*10.,0.,1.);float fl=exp(-pow((s-aAz)*16.,2.))*step(uT,uScan+.3);
vec3 raw=mix(vec3(.17,.23,.29),vec3(.91,.94,.96),aInt);vec3 c=raw*(.62+.38*hit)+vec3(.55,1.,.95)*fl*.85;
float segT=uSegStart+(position.x-uXmin)/(uXmax-uXmin)*uSegDur;float seg=smoothstep(segT,segT+.16,uT);
int ci=int(aCls+.5);vec3 cc=uCol[ci]*(.55+.45*aInt);c=mix(c,cc,seg);float a=1.;
if(ci==4){a=mix(1.,.1,smoothstep(segT+.45,segT+1.2,uT));}
float dim=(ci>=4)?.55:.3;a*=mix(1.,dim,uModel);vC=c;vA=a;
gl_PointSize=uSize*uPR*(.75+.5*aRnd)*(3.4/-mv.z);}`,
    fragmentShader: `varying vec3 vC;varying float vA;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(vC,vA*smoothstep(.5,.28,d));}`,
  });
  const points = new THREE.Points(pg, pm); points.renderOrder = 1; scene.add(points);

  /* ---- elements: instanced solids + edges ---- */
  const unit = new THREE.BoxGeometry(1, 1, 1);
  const els = Sc.elems as SElem[];
  const solidEls = els.filter((e) => e.cls !== 2), slabEls = els.filter((e) => e.cls === 2);
  const solids = new THREE.InstancedMesh(unit, new THREE.MeshLambertMaterial({ color: 0xffffff }), solidEls.length);
  const slabs = new THREE.InstancedMesh(unit, new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.2, depthWrite: false }), slabEls.length);
  slabs.renderOrder = 2;
  const concrete = new THREE.Color("#C9D3DC");
  solidEls.forEach((e, i) => { e.inst = i; e.mesh = solids; e.base = concrete.clone().lerp(new THREE.Color(COL[e.cls]), 0.38); solids.setColorAt(i, e.base); });
  slabEls.forEach((e, i) => { e.inst = i; e.mesh = slabs; e.base = new THREE.Color(COL[2]); slabs.setColorAt(i, e.base); });
  scene.add(solids, slabs);
  const MS = STAGES[3].start;
  const clsDelay: Record<number, number> = { 0: 0, 3: 0.05, 1: 0.14, 2: 0.2 };
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (const e of els) {
    const lv = e.storey ?? (e.id === "S-Ground" ? -1 : (parseInt(e.lvl.replace(/\D/g, ""), 10) || 3) - 1);
    e.g0 = MS + (lv + 1) * 0.28 + clsDelay[e.cls] + rnd() * 0.08;
    e.cS = toV(...e.c); e.sS = new THREE.Vector3(e.s[0] * Sc.S, e.s[1] * Sc.S, e.s[2] * Sc.S);
  }
  const M = new THREE.Matrix4(), Qn = new THREE.Quaternion(), Pv = new THREE.Vector3(), Sv = new THREE.Vector3();
  const placeAll = (t: number) => {
    for (const e of els) {
      let g = Math.min(1, Math.max(0, (t - e.g0) / 0.5)); g = 1 - Math.pow(1 - g, 3);
      Pv.copy(e.cS); Sv.copy(e.sS);
      if (g <= 0) Sv.set(1e-5, 1e-5, 1e-5);
      else if (e.cls === 0 || e.cls === 3) { Sv.y *= g; Pv.y = e.cS.y - e.sS.y / 2 + Sv.y / 2; }
      else if (e.cls === 1) { if (e.dir === "x") Sv.x *= g; else Sv.z *= g; }
      else { Sv.x *= g; Sv.z *= g; }
      M.compose(Pv, Qn, Sv); e.mesh.setMatrixAt(e.inst, M);
    }
    solids.instanceMatrix.needsUpdate = true; slabs.instanceMatrix.needsUpdate = true;
  };
  const edgeUnit = new THREE.EdgesGeometry(unit);
  const makeEdges = (mesh: THREE.InstancedMesh, opacity: number) => {
    const g = new THREE.InstancedBufferGeometry();
    g.setAttribute("position", edgeUnit.getAttribute("position"));
    g.setAttribute("aM", mesh.instanceMatrix); g.setAttribute("aC", mesh.instanceColor as THREE.InstancedBufferAttribute);
    g.instanceCount = mesh.count;
    const m = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, uniforms: { uO: { value: opacity } },
      vertexShader: `attribute mat4 aM;attribute vec3 aC;varying vec3 vC;void main(){vC=aC;gl_Position=projectionMatrix*modelViewMatrix*aM*vec4(position,1.);}`,
      fragmentShader: `uniform float uO;varying vec3 vC;void main(){gl_FragColor=vec4(min(vC*1.25,vec3(1.)),uO);}`,
    });
    const l = new THREE.LineSegments(g, m); l.frustumCulled = false; l.renderOrder = 3; return l;
  };
  scene.add(makeEdges(solids, 0.55), makeEdges(slabs, 0.5));

  /* ---- detection brackets ---- */
  const HI = new Set(["C-D1|Ground → Level 1", "B-5/C–D|Level 2", "S-Roof|Roof", "W-Core-E|Level 1"]);
  const DS = STAGES[2].start;
  const det: Det[] = els.map((e) => ({ c: e.cS, s: e.sS, col: new THREE.Color(COL[e.cls]), hi: HI.has(e.id + "|" + e.lvl) ? 1 : 0, e, t: 0 }));
  const shoreBox: Det = { c: toV(15, 1.6, 12.5), s: new THREE.Vector3(5.6 * Sc.S, 3.3 * Sc.S, 4.3 * Sc.S), col: new THREE.Color(COL[4]), hi: 2, t: 0 };
  det.push(shoreBox);
  for (const d of det) d.t = d.hi === 2 ? STAGES[1].start + 0.85 : DS + (d.hi ? 0.1 + rnd() * 0.15 : rnd() * 0.85);
  const corner: number[] = [];
  { const a = 0.28; for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
      const p = [sx * 0.5, sy * 0.5, sz * 0.5];
      corner.push(...p, sx * (0.5 - a), sy * 0.5, sz * 0.5, ...p, sx * 0.5, sy * (0.5 - a), sz * 0.5, ...p, sx * 0.5, sy * 0.5, sz * (0.5 - a));
    } }
  const bg = new THREE.InstancedBufferGeometry(); bg.setAttribute("position", new THREE.Float32BufferAttribute(corner, 3));
  const iC = new Float32Array(det.length * 3), iS = new Float32Array(det.length * 3), iK = new Float32Array(det.length * 3), iT = new Float32Array(det.length * 2);
  det.forEach((d, i) => { const pad = 0.12 * Sc.S; iC.set([d.c.x, d.c.y, d.c.z], i * 3); iS.set([d.s.x + pad, d.s.y + pad, d.s.z + pad], i * 3); iK.set([d.col.r, d.col.g, d.col.b], i * 3); iT.set([d.t, d.hi], i * 2); });
  bg.setAttribute("iC", new THREE.InstancedBufferAttribute(iC, 3)); bg.setAttribute("iS", new THREE.InstancedBufferAttribute(iS, 3));
  bg.setAttribute("iK", new THREE.InstancedBufferAttribute(iK, 3)); bg.setAttribute("iT", new THREE.InstancedBufferAttribute(iT, 2)); bg.instanceCount = det.length;
  const bm = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false, uniforms: { uT: U.uT, uModel: U.uModel },
    vertexShader: `attribute vec3 iC,iS,iK;attribute vec2 iT;uniform float uT,uModel;varying vec3 vC;varying float vA;
void main(){float k=smoothstep(iT.x,iT.x+.22,uT);vec3 p=iC+position*iS*(1.+.45*(1.-k));vC=iK;
float base=iT.y>.5?1.:.5;float fade=iT.y>.5?1.:mix(1.,0.,uModel);vA=k*base*fade;
gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
    fragmentShader: `varying vec3 vC;varying float vA;void main(){if(vA<.01)discard;gl_FragColor=vec4(vC,vA);}`,
  });
  const brackets = new THREE.LineSegments(bg, bm); brackets.frustumCulled = false; brackets.renderOrder = 4; scene.add(brackets);

  /* ---- inference plane (AI classification sweep) ---- */
  const planeH = (Sc.H + 2) * Sc.S, planeD = (Sc.D + 6) * Sc.S;
  const planeMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, uniforms: { uA: { value: 0 } },
    vertexShader: `varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform float uA;varying vec2 vU;void main(){float e=smoothstep(0.,.5,vU.y)*smoothstep(1.,.5,vU.y);float g=smoothstep(0.,.12,vU.x)*smoothstep(1.,.88,vU.x);gl_FragColor=vec4(.37,.83,.8,uA*.2*e*g);}`,
  });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(planeD, planeH), planeMat);
  plane.rotation.y = Math.PI / 2; plane.renderOrder = 5; scene.add(plane);
  const edgeLine = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(planeD, planeH)), new THREE.LineBasicMaterial({ color: 0x9ff3ee, transparent: true, opacity: 0 }));
  edgeLine.rotation.y = Math.PI / 2; scene.add(edgeLine);

  /* ---- scanner + sweep ---- */
  const SRv = toV(Sc.W / 2, 1.6, Sc.D + 9);
  const scanner = new THREE.Group(); scanner.position.copy(SRv);
  const tri = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(-0.09, -0.26, 0.05), new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.09, -0.26, 0.05), new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -0.26, -0.1)]);
  scanner.add(new THREE.LineSegments(tri, new THREE.LineBasicMaterial({ color: 0x7f9fb3, transparent: true, opacity: 0.8 })));
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.07, 0.05), new THREE.MeshBasicMaterial({ color: 0x5fd3cd })); head.position.y = 0.03; scanner.add(head);
  scene.add(scanner);
  const sweepG = new THREE.BufferGeometry(); sweepG.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(12), 3));
  const sweepMat = new THREE.LineBasicMaterial({ color: 0x9ff3ee, transparent: true, opacity: 0, blending: THREE.AdditiveBlending });
  scene.add(new THREE.LineSegments(sweepG, sweepMat));
  let zmin = 1e9, zmax = -1e9;
  for (let i = 0; i < Sc.N; i++) { const x = Sc.pos[i * 3] / Sc.S + Sc.W / 2, z = Sc.pos[i * 3 + 2] / Sc.S + Sc.D / 2; const a = Math.atan2(x - Sc.W / 2, Sc.D + 9 - z); if (a < zmin) zmin = a; if (a > zmax) zmax = a; }
  const updateSweep = (t: number) => {
    const s = t / U.uScan.value, active = t < U.uScan.value + 0.15;
    sweepMat.opacity = active ? 0.55 * (1 - Math.max(0, s - 1) * 6) : 0; if (!active) return;
    const a = zmin + (zmax - zmin) * Math.min(1, s), Lr = 26, fx = Sc.W / 2 + Math.sin(a) * Lr, fz = Sc.D + 9 - Math.cos(a) * Lr;
    const p0 = SRv.clone().add(new THREE.Vector3(0, 0.03, 0)), top = toV(fx, Sc.H + 1.5, fz), bot = toV(fx, -0.2, fz);
    (sweepG.attributes.position.array as Float32Array).set([p0.x, p0.y, p0.z, top.x, top.y, top.z, p0.x, p0.y, p0.z, bot.x, bot.y, bot.z]);
    sweepG.attributes.position.needsUpdate = true;
  };
  scene.add(new THREE.HemisphereLight(0xdcefff, 0x0a1220, 1.15));
  const dl = new THREE.DirectionalLight(0xffffff, 1.25); dl.position.set(-3, 6, 4); scene.add(dl);

  /* ---- labels ---- */
  const labelsEl = q<HTMLDivElement>("labels");
  const labelDefs = det.filter((d) => d.hi).map((d) => {
    const el = document.createElement("div"); el.className = "hv-lbl";
    el.style.background = d.hi === 2 ? COL[4] : "#" + d.col.getHexString();
    el.innerHTML = d.hi === 2
      ? '<span class="hv-tag">AI rejected · not structure</span>Temporary shoring'
      : `<span class="hv-tag">AI recognised</span>${IFC[d.e!.cls]}<small>${d.e!.id}</small>`;
    labelsEl.appendChild(el);
    let top = d.c.clone();
    if (d.hi === 2) { top.y -= d.s.y / 2; el.style.transform = "translate(-50%,45%)"; }
    else if (d.e && d.e.cls === 2) top = toV(Sc.W * 0.78, Sc.H + 0.05, Sc.D * 0.3);
    else top.y += d.s.y / 2;
    return { d, el, top };
  });

  /* ---- HUD + chips ---- */
  const hudEl = q<HTMLDivElement>("hud"), hudStage = q<HTMLElement>("stage"), hudMsg = q<HTMLElement>("msg"), hudPts = q<HTMLElement>("pts");
  q<HTMLElement>("in").textContent = Sc.N.toLocaleString("en-GB");
  const counts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 }; els.forEach((e) => counts[e.cls]++);
  const list = q<HTMLUListElement>("list"); list.innerHTML = "";
  const rows = ([[0, "Columns"], [1, "Beams"], [3, "Walls"], [2, "Slabs"], [4, "Rejected"]] as [number, string][]).map(([c, n]) => {
    const li = document.createElement("li");
    li.innerHTML = `<span class="hv-sw" style="background:${COL[c]}"></span>${n}<b>0</b>`; list.appendChild(li);
    return { c, li, b: li.querySelector("b") as HTMLElement, n: c === 4 ? 1 : counts[c] };
  });
  let T = RM ? END + 0.5 : 0, playing = !RM, lastNow = performance.now();
  const chipsEl = q<HTMLDivElement>("chips"); chipsEl.innerHTML = "";
  const chips = STAGES.map((s) => {
    const b = document.createElement("button"); b.type = "button"; b.className = "hv-chip";
    b.innerHTML = `<span class="hv-dot"></span><span class="hv-n">${s.k}</span> <span class="hv-lg">${s.t}</span><span class="hv-sh">${s.sh}</span>`;
    b.addEventListener("click", () => { T = s.start + 0.001; playing = true; lastNow = performance.now(); });
    chipsEl.appendChild(b); return b;
  });
  const replay = q<HTMLButtonElement>("replay");
  on(replay, "click", () => { T = 0; playing = true; lastNow = performance.now(); });
  if (window.matchMedia("(hover: none)").matches) q<HTMLElement>("hint").textContent = "Swipe sideways to rotate";
  let hudKey = "";
  const updateHud = (t: number) => {
    const si = STAGES.reduce((a, s, i) => (t >= s.start ? i : a), 0);
    chips.forEach((c, i) => { c.classList.toggle("done", i < si || t >= END); c.classList.toggle("now", i === si && t < END); c.setAttribute("aria-pressed", String(i === si)); });
    const key = si + "|" + (t >= END);
    if (key !== hudKey) {
      hudKey = key; hudStage.textContent = STAGES[si].k + " " + STAGES[si].t;
      hudMsg.textContent = t >= END ? "Model ready. Hover an element to see what the AI recognised." : STAGES[si].msg;
      hudEl.classList.toggle("ai-on", si >= 1); hudEl.classList.toggle("ai-run", si >= 1 && si <= 2 && t < END && !RM);
    }
    const segDone = Math.min(1, Math.max(0, (t - STAGES[1].start) / 1.1));
    hudPts.textContent = t < STAGES[1].start ? "" : Math.round(segDone * Sc.N).toLocaleString("en-GB") + " pts";
    const dk = Math.min(1, Math.max(0, (t - DS) / 0.95));
    for (const r of rows) { const v = r.c === 4 ? (t >= shoreBox.t ? 1 : 0) : Math.round(r.n * dk); r.b.textContent = String(v); r.li.classList.toggle("on", v > 0); }
  };

  /* ---- camera + interaction ---- */
  let W0 = 1, H0 = 1;
  const narrowNow = () => W0 < 520;
  const resize = () => {
    const r = root.getBoundingClientRect(); W0 = Math.max(1, r.width); H0 = Math.max(1, r.height);
    renderer.setSize(W0, H0, false); camera.aspect = W0 / H0;
    camera.setViewOffset(W0, H0, -CAM.offX * W0, -(narrowNow() ? CAM.offYNarrow : CAM.offY) * H0, W0, H0);
    camera.updateProjectionMatrix(); U.uPR.value = renderer.getPixelRatio();
  };
  const ro = new ResizeObserver(resize); ro.observe(root); resize(); cleanups.push(() => ro.disconnect());
  let dragYaw = 0, dragPitch = 0, tYaw = 0, tPitch = 0;
  let drag: { x: number; y: number; yaw: number; pitch: number } | null = null;
  const mouse = new THREE.Vector2(); let mouseXY: [number, number] | null = null, hoverDirty = false;
  on(root, "pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY, yaw: tYaw, pitch: tPitch }; if (e.pointerType === "mouse") root.setPointerCapture(e.pointerId); });
  on(root, "pointermove", (e) => {
    if (drag) { tYaw = drag.yaw - (e.clientX - drag.x) * 0.006; tPitch = Math.max(-0.25, Math.min(0.45, drag.pitch + (e.clientY - drag.y) * 0.004)); }
    const r = root.getBoundingClientRect();
    mouse.set(((e.clientX - r.left) / W0) * 2 - 1, -((e.clientY - r.top) / H0) * 2 + 1); mouseXY = [e.clientX - r.left, e.clientY - r.top]; hoverDirty = true;
  });
  const endDrag = () => { drag = null; };
  on(root, "pointerup", endDrag); on(root, "pointercancel", endDrag);
  on(root, "pointerleave", () => { mouseXY = null; hoverDirty = true; });
  const placeCamera = (t: number) => {
    const sway = RM ? 0 : 0.16 * Math.sin(t * 0.22) * Math.min(1, t / 2);
    dragYaw += (tYaw - dragYaw) * 0.12; dragPitch += (tPitch - dragPitch) * 0.12;
    const yaw = CAM.yaw + sway + dragYaw, pitch = CAM.pitch + dragPitch, dist = CAM.dist * (W0 / H0 < 1.05 ? CAM.narrowDist : 1);
    camera.position.set(tgt.x + dist * Math.sin(yaw) * Math.cos(pitch), tgt.y + dist * Math.sin(pitch), tgt.z + dist * Math.cos(yaw) * Math.cos(pitch));
    camera.lookAt(tgt);
  };
  const ray = new THREE.Raycaster(); const tip = q<HTMLDivElement>("tip"), hl = new THREE.Color("#FFFFFF");
  let hovered: SElem | null = null;
  const setHover = (e: SElem | null) => {
    if (hovered === e) return;
    if (hovered) { hovered.mesh.setColorAt(hovered.inst, hovered.base); hovered.mesh.instanceColor!.needsUpdate = true; }
    hovered = e;
    if (e) {
      e.mesh.setColorAt(e.inst, e.base.clone().lerp(hl, 0.55)); e.mesh.instanceColor!.needsUpdate = true;
      tip.innerHTML = `<b>${IFC[e.cls]}</b> · ${e.id}<br>${e.lvl} · ${(e.s[0] * 1000).toFixed(0)} × ${(e.s[2] * 1000).toFixed(0)} × ${(e.s[1] * 1000).toFixed(0)} mm<br><span class="hv-ai">AI: recognised from ${e.pts.toLocaleString("en-GB")} scan points</span>`;
    }
    tip.classList.toggle("on", !!e);
  };
  const updateHover = (t: number) => {
    if (!hoverDirty) return; hoverDirty = false;
    if (!mouseXY || t < STAGES[3].start + 0.8 || drag) { setHover(null); return; }
    ray.setFromCamera(mouse, camera);
    const hit = ray.intersectObjects([solids, slabs], false)[0];
    setHover(hit && hit.instanceId !== undefined ? (hit.object === solids ? solidEls : slabEls)[hit.instanceId] : null);
    if (hovered) { const x = Math.min(mouseXY[0], W0 - 230); tip.style.transform = `translate(${x + 14}px,${mouseXY[1] + 14}px)`; }
  };

  /* ---- loop ---- */
  let visible = true, first = true, raf = 0;
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; lastNow = performance.now(); }); io.observe(root); cleanups.push(() => io.disconnect());
  const onVis = () => { lastNow = performance.now(); }; document.addEventListener("visibilitychange", onVis); cleanups.push(() => document.removeEventListener("visibilitychange", onVis));
  (window as unknown as { __heroSeek?: (t: number) => void }).__heroSeek = (t: number) => { T = t; playing = false; };
  const V = new THREE.Vector3();
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    if (!visible || document.hidden) { lastNow = now; return; }
    const dt = Math.min(0.05, (now - lastNow) / 1000); lastNow = now; if (playing) T += dt;
    const t = T; U.uT.value = t;
    U.uModel.value = Math.min(1, Math.max(0, (t - STAGES[3].start) / 0.9));
    const segK = (t - STAGES[1].start) / 1.1, act = segK > -0.05 && segK < 1.15;
    planeMat.uniforms.uA.value = act ? Math.min(1, Math.min(segK + 0.05, 1.15 - segK) * 6) : 0;
    (edgeLine.material as THREE.LineBasicMaterial).opacity = planeMat.uniforms.uA.value * 0.5;
    const px = Sc.xmin + (Sc.xmax - Sc.xmin) * Math.min(1, Math.max(0, segK)); plane.position.x = px; edgeLine.position.x = px;
    updateSweep(t); scanner.visible = t < STAGES[2].start + 0.5;
    placeAll(t); placeCamera(t); updateHud(t); updateHover(t);
    for (const Lb of labelDefs) {
      const show = t >= Lb.d.t + 0.12; Lb.el.classList.toggle("on", show); if (!show) continue;
      V.copy(Lb.top).project(camera); Lb.el.style.left = (V.x * 0.5 + 0.5) * W0 + "px"; Lb.el.style.top = (-V.y * 0.5 + 0.5) * H0 + "px";
    }
    renderer.render(scene, camera);
    if (first) { first = false; opts.onReady?.(); }
  };
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf); cleanups.forEach((f) => f());
    labelsEl.innerHTML = ""; chipsEl.innerHTML = ""; list.innerHTML = "";
    scene.traverse((o) => {
      const m = o as THREE.Mesh; if (m.geometry) m.geometry.dispose();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose()); else mat?.dispose();
    });
    renderer.dispose();
  };
}
