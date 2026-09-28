"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { boxEdges, detections, frameEdges, pointCloud, setOutGrid, slabs } from "./geometry";

type Props = {
  onReady: () => void;
  onStage: (i: number) => void;
  reduced: boolean;
  replayKey: number;
  lite: boolean;
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ramp = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const SETTLE_T = 10.5;

const VERT = /* glsl */ `
  attribute vec3 aStart; attribute float aCls; attribute float aRnd;
  uniform float uT, uSeg, uClutter, uAlpha, uSize, uPR, uTime;
  varying vec3 vColor; varying float vA;
  void main() {
    float p = clamp((uT - aRnd * 0.4) / 0.6, 0.0, 1.0);
    p = p < 0.5 ? 4.0 * p * p * p : 1.0 - pow(-2.0 * p + 2.0, 3.0) / 2.0;
    vec3 pos = mix(aStart, position, p);
    pos += (1.0 - p) * 0.03 * vec3(sin(uTime * 0.9 + aRnd * 40.0), cos(uTime * 0.7 + aRnd * 30.0), sin(uTime * 0.8 + aRnd * 20.0));
    vec3 scan = vec3(0.80, 0.85, 0.90);
    vec3 cls = aCls < 0.5 ? vec3(0.37, 0.83, 0.80) : aCls < 1.5 ? vec3(0.47, 0.60, 0.97) : aCls < 2.5 ? vec3(0.58, 0.64, 0.72) : vec3(0.93, 0.56, 0.36);
    vColor = mix(scan, cls, uSeg);
    float keep = aCls > 2.5 ? (1.0 - uClutter) : 1.0;
    vA = uAlpha * keep * (0.35 + 0.65 * p) * (aCls > 1.5 && aCls < 2.5 ? 0.75 : 1.0);
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = uSize * uPR / -mv.z;
    gl_Position = projectionMatrix * mv;
  }`;

const FRAG = /* glsl */ `
  varying vec3 vColor; varying float vA;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = dot(c, c);
    if (d > 0.25) discard;
    gl_FragColor = vec4(vColor, vA * smoothstep(0.25, 0.08, d));
  }`;

function segGeometry(segs: ReturnType<typeof frameEdges>) {
  const arr = new Float32Array(segs.length * 6);
  segs.forEach(([a, b], i) => arr.set([...a, ...b], i * 6));
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
  return g;
}

export default function HeroCanvas({ onReady, onStage, reduced, replayKey, lite }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const labels = useRef<(HTMLSpanElement | null)[]>([]);
  const bubbles = useRef<(HTMLSpanElement | null)[]>([]);
  const startRef = useRef(0);
  const kickRef = useRef<() => void>(() => {});

  useEffect(() => {
    startRef.current = performance.now();
    kickRef.current();
  }, [replayKey]);


  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: !lite, alpha: true, powerPreference: "low-power" });
    } catch {
      return; // stay on the SVG fallback
    }
    const pr = Math.min(window.devicePixelRatio || 1, lite ? 1.25 : 1.75);
    renderer.setPixelRatio(pr);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);
    renderer.domElement.setAttribute("aria-hidden", "true");
    renderer.domElement.style.display = "block";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
    const pitch = 0.44, dist = 8.3;
    camera.position.set(0, dist * Math.sin(pitch), dist * Math.cos(pitch));
    camera.lookAt(0, -0.3, 0);

    const group = new THREE.Group();
    scene.add(group);

    // point cloud
    const cloud = pointCloud(lite ? 0.55 : 1);
    const pg = new THREE.BufferGeometry();
    pg.setAttribute("position", new THREE.BufferAttribute(cloud.target, 3));
    pg.setAttribute("aStart", new THREE.BufferAttribute(cloud.start, 3));
    pg.setAttribute("aCls", new THREE.BufferAttribute(cloud.cls, 1));
    pg.setAttribute("aRnd", new THREE.BufferAttribute(cloud.rnd, 1));
    const uniforms = {
      uT: { value: 0 }, uSeg: { value: 0 }, uClutter: { value: 0 }, uAlpha: { value: 1 },
      uSize: { value: lite ? 13 : 11 }, uPR: { value: pr }, uTime: { value: 0 },
    };
    const pm = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, transparent: true, depthWrite: false });
    group.add(new THREE.Points(pg, pm));

    // BIM edges, built bottom-up
    const edges = frameEdges();
    const eg = segGeometry(edges);
    const em = new THREE.LineBasicMaterial({ color: 0x5fd3cd, transparent: true, opacity: 0.62 });
    const edgeLines = new THREE.LineSegments(eg, em);
    eg.setDrawRange(0, 0);
    group.add(edgeLines);

    // setting-out grid (always visible, like the first drawing on any job)
    const grid = setOutGrid();
    const gg = segGeometry(grid.segs);
    const gm = new THREE.LineDashedMaterial({ color: 0x9fb3c8, transparent: true, opacity: 0.28, dashSize: 0.12, gapSize: 0.08 });
    const gridLines = new THREE.LineSegments(gg, gm);
    gridLines.computeLineDistances();
    group.add(gridLines);

    // faint slab surfaces for the model stage
    const sg = new THREE.BufferGeometry();
    const sv: number[] = [];
    slabs().forEach(([a, b, c, d]) => sv.push(...a, ...b, ...c, ...a, ...c, ...d));
    sg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(sv), 3));
    const sm = new THREE.MeshBasicMaterial({ color: 0x5fd3cd, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
    group.add(new THREE.Mesh(sg, sm));

    // detections
    const dets = detections();
    const bg = segGeometry(dets.flatMap(boxEdges));
    const bm = new THREE.LineBasicMaterial({ color: 0xf0a35e, transparent: true, opacity: 0 });
    group.add(new THREE.LineSegments(bg, bm));
    const anchors = dets.map((d) => new THREE.Vector3(d.min[0], d.max[1], d.max[2]));
    const bubbleAnchors = grid.bubbles.map((b) => new THREE.Vector3(...b.at));

    let W = 1, H = 1;
    const resize = () => {
      W = el.clientWidth || 1;
      H = el.clientHeight || 1;
      renderer.setSize(W, H, false);
      renderer.domElement.style.width = W + "px";
      renderer.domElement.style.height = H + "px";
      camera.aspect = W / H;
      // keep the frame in view on narrow screens
      camera.position.setLength(W / H < 1.05 ? 9.8 : dist);
      camera.lookAt(0, -0.3, 0);
      camera.updateProjectionMatrix();
      frame(true);
    };

    let yawOffset = 0, pitchOffset = 0, targetYaw = 0, targetPitch = 0;
    let lastStage = -1, visible = true, raf = 0, readySent = false;
    const baseYaw = 0.72;
    const tmp = new THREE.Vector3();

    function frame(force = false) {
      const t = reduced ? 100 : (performance.now() - startRef.current) / 1000;
      uniforms.uTime.value = t;
      uniforms.uT.value = ease(ramp(t, 0.2, 2.8));
      uniforms.uSeg.value = ease(ramp(t, 2.6, 3.6));
      uniforms.uClutter.value = ease(ramp(t, 2.8, 3.8));
      bm.opacity = 0.95 * ease(ramp(t, 3.9, 4.7));
      eg.setDrawRange(0, Math.floor(edges.length * 2 * ease(ramp(t, 4.8, 6.8))));
      uniforms.uAlpha.value = 1 - 0.35 * ease(ramp(t, 5.2, 6.8));
      sm.opacity = 0.05 * ease(ramp(t, 5.6, 7.2));
      const stage = t < 2.6 ? 0 : t < 3.8 ? 1 : t < 4.8 ? 2 : 3;
      if (stage !== lastStage) { lastStage = stage; onStage(stage); }

      // slow orbit that eases to a stop once the sequence completes
      // angular velocity decays linearly to zero at SETTLE_T, so the turntable glides to rest
      const tc = Math.min(t, SETTLE_T);
      const spin = reduced ? 0 : 0.09 * (tc - (tc * tc) / (2 * SETTLE_T));
      yawOffset += (targetYaw - yawOffset) * 0.06;
      pitchOffset += (targetPitch - pitchOffset) * 0.06;
      group.rotation.y = -(baseYaw - spin) + yawOffset;
      group.rotation.x = pitchOffset;
      renderer.render(scene, camera);

      const la = ease(ramp(t, 4.2, 4.9));
      anchors.forEach((a, i) => {
        const node = labels.current[i];
        if (!node) return;
        tmp.copy(a).applyMatrix4(group.matrixWorld).project(camera);
        node.style.transform = `translate(${((tmp.x + 1) / 2) * W}px, ${((1 - tmp.y) / 2) * H - 18}px)`;
        node.style.opacity = String(la);
      });
      grid.bubbles.forEach((_, i) => {
        const node = bubbles.current[i];
        if (!node) return;
        tmp.copy(bubbleAnchors[i]).applyMatrix4(group.matrixWorld).project(camera);
        node.style.transform = `translate(${((tmp.x + 1) / 2) * W - 9}px, ${((1 - tmp.y) / 2) * H - 9}px)`;
      });
      if (!readySent) { readySent = true; onReady(); }
      const settling = t < SETTLE_T || Math.abs(targetYaw - yawOffset) > 0.0005 || Math.abs(targetPitch - pitchOffset) > 0.0005;
      if (!force && visible && settling && !reduced) raf = requestAnimationFrame(() => frame());
      else raf = 0;
    }

    const kick = () => { if (!raf && visible && !reduced) raf = requestAnimationFrame(() => frame()); };
    kickRef.current = kick;
    const onMove = (e: PointerEvent) => {
      if (reduced || e.pointerType === "touch") return;
      const r = el.getBoundingClientRect();
      targetYaw = ((e.clientX - r.left) / r.width - 0.5) * 0.28;
      targetPitch = ((e.clientY - r.top) / r.height - 0.5) * 0.08;
      kick();
    };
    const onLeave = () => { targetYaw = 0; targetPitch = 0; kick(); };
    const section = el.closest("section") ?? el;
    section.addEventListener("pointermove", onMove as EventListener);
    section.addEventListener("pointerleave", onLeave);

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); });
    io.observe(el);
    const onVis = () => { visible = document.visibilityState === "visible"; if (visible) kick(); };
    document.addEventListener("visibilitychange", onVis);
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();
    kick();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      section.removeEventListener("pointermove", onMove as EventListener);
      section.removeEventListener("pointerleave", onLeave);
      pg.dispose(); pm.dispose(); eg.dispose(); em.dispose(); bg.dispose(); bm.dispose(); gg.dispose(); gm.dispose(); sg.dispose(); sm.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, lite]);

  return (
    <div ref={host} className="absolute inset-0">
      {setOutGrid().bubbles.map((b, i) => (
        <span
          key={b.label}
          ref={(n) => { bubbles.current[i] = n; }}
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 grid h-[18px] w-[18px] place-items-center rounded-full border border-white/35 font-mono text-[9.5px] text-white/60"
        >
          {b.label}
        </span>
      ))}
      {detections().map((d, i) => (
        <span
          key={d.label}
          ref={(n) => { labels.current[i] = n; }}
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 whitespace-nowrap rounded-[3px] bg-[#F0A35E] px-1.5 py-[1px] font-mono text-[10px] font-medium text-[#0A1220] opacity-0"
        >
          {d.label}
        </span>
      ))}
    </div>
  );
}
