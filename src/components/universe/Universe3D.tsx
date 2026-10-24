"use client";

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { categoryById } from "@/data/categories";
import type { ScrollProgress } from "@/lib/scrollProgress";
import type { CategoryId } from "@/data/types";
import { clusterAnchors, universeEdges, universeNodes } from "./layout";

export interface Universe3DProps {
  focus: number | null;
  selected: number | null;
  cluster: CategoryId | null;
  lumos: boolean;
  active: boolean;
  scrollProgress: ScrollProgress;
  labelRefs: React.RefObject<(HTMLElement | null)[]>;
  focusLabelRef: React.RefObject<HTMLElement | null>;
  onHover: (index: number | null) => void;
  onSelect: (index: number) => void;
  onReady: () => void;
}

const ICE = new THREE.Color("#7cd6ff");

/** Small deterministic PRNG so scene decoration is stable between renders. */
function prng(seed: number) {
  let x = seed;
  return () => {
    x = (x * 1664525 + 1013904223) % 4294967296;
    return x / 4294967296;
  };
}
const tmp = new THREE.Vector3();

function relatedSet(index: number | null) {
  const set = new Set<number>();
  if (index === null) return set;
  set.add(index);
  for (const e of universeEdges) {
    if (e.a === index) set.add(e.b);
    if (e.b === index) set.add(e.a);
  }
  return set;
}

function makeGlowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,0.9)");
  grad.addColorStop(0.25, "rgba(255,255,255,0.35)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function Scene(props: Universe3DProps) {
  const { focus, selected, cluster, lumos, scrollProgress, labelRefs, focusLabelRef, onHover, onSelect } = props;
  const group = useRef<THREE.Group>(null);
  const { gl } = useThree();
  const drag = useRef({ active: false, x: 0, y: 0, moved: 0 });
  const rot = useRef({ y: 0, x: 0.18, targetY: 0, targetX: 0.18, idle: true });
  const glow = useMemo(() => makeGlowTexture(), []);
  const related = useMemo(() => relatedSet(focus), [focus]);

  // Rotate so the selected node (or chosen cluster) turns toward the camera.
  useEffect(() => {
    let target: [number, number, number] | null = null;
    if (selected !== null) target = universeNodes[selected].p3;
    else if (cluster) target = clusterAnchors.find((a) => a.id === cluster)!.p3;
    if (!target) {
      rot.current.idle = true;
      return;
    }
    const angle = Math.atan2(target[0], target[2]);
    let next = -angle;
    const cur = rot.current.y;
    while (next - cur > Math.PI) next -= Math.PI * 2;
    while (next - cur < -Math.PI) next += Math.PI * 2;
    rot.current.targetY = next;
    rot.current.idle = false;
  }, [selected, cluster]);

  // Drag-to-orbit on the canvas element.
  useEffect(() => {
    const el = gl.domElement;
    const down = (e: PointerEvent) => {
      drag.current = { active: true, x: e.clientX, y: e.clientY, moved: 0 };
      rot.current.idle = false;
    };
    const move = (e: PointerEvent) => {
      if (!drag.current.active) return;
      const dx = e.clientX - drag.current.x;
      const dy = e.clientY - drag.current.y;
      drag.current.x = e.clientX;
      drag.current.y = e.clientY;
      drag.current.moved += Math.abs(dx) + Math.abs(dy);
      rot.current.targetY += dx * 0.006;
      rot.current.targetX = THREE.MathUtils.clamp(rot.current.targetX + dy * 0.004, -0.4, 0.8);
    };
    const up = () => {
      drag.current.active = false;
    };
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [gl]);

  // Edge geometry with per-vertex colours we can re-tint on focus.
  const edgeGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(universeEdges.length * 6);
    universeEdges.forEach((e, i) => {
      pos.set(universeNodes[e.a].p3, i * 6);
      pos.set(universeNodes[e.b].p3, i * 6 + 3);
    });
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(new Float32Array(universeEdges.length * 6), 3));
    return geo;
  }, []);

  const spokeGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(universeNodes.length * 6);
    universeNodes.forEach((n, i) => {
      const anchor = clusterAnchors.find((a) => a.id === n.project.category)!;
      pos.set(anchor.p3, i * 6);
      pos.set(n.p3, i * 6 + 3);
    });
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return geo;
  }, []);

  useEffect(() => {
    const colors = edgeGeo.getAttribute("color") as THREE.BufferAttribute;
    const c = new THREE.Color();
    universeEdges.forEach((e, i) => {
      const A = universeNodes[e.a].project;
      const B = universeNodes[e.b].project;
      const touches = focus !== null && (e.a === focus || e.b === focus);
      const inCluster = cluster && (A.category === cluster || B.category === cluster);
      if (touches) c.copy(ICE).multiplyScalar(0.95);
      else if (lumos) c.set(categoryById[A.category].color).multiplyScalar(0.55);
      else if (inCluster) c.set(categoryById[cluster].color).multiplyScalar(0.35);
      else c.set("#d6e0ec").multiplyScalar(focus !== null || cluster ? 0.03 : A.tier === 1 && B.tier === 1 ? 0.2 : 0.07);
      colors.setXYZ(i * 2, c.r, c.g, c.b);
      colors.setXYZ(i * 2 + 1, c.r, c.g, c.b);
    });
    colors.needsUpdate = true;
  }, [edgeGeo, focus, cluster, lumos]);

  const stars = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const n = 700;
    const rand = prng(7);
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const r = 18 + rand() * 30;
      const t = rand() * Math.PI * 2;
      const p = Math.acos(2 * rand() - 1);
      pos.set([r * Math.sin(p) * Math.cos(t), r * Math.cos(p), r * Math.sin(p) * Math.sin(t)], i * 3);
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return geo;
  }, []);

  const fireflies = useMemo(() => {
    const n = 46;
    const rand = prng(11);
    const base = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) base.set([(rand() - 0.5) * 18, (rand() - 0.5) * 6, (rand() - 0.5) * 18], i * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(base.slice(), 3));
    return { geo, base, n };
  }, []);
  const fireflyMat = useRef<THREE.PointsMaterial>(null);

  const nodeRefs = useRef<(THREE.Mesh | null)[]>([]);
  const haloRefs = useRef<(THREE.Sprite | null)[]>([]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const r = rot.current;
    if (r.idle && !drag.current.active && focus === null) r.targetY += delta * 0.045;
    r.y += (r.targetY - r.y) * Math.min(1, delta * 3);
    r.x += (r.targetX - r.x) * Math.min(1, delta * 3);
    g.rotation.set(r.x, r.y, 0);

    // Scroll-linked dolly: the camera travels into the system as the section scrolls.
    // Mutate the camera from frame state (R3F's sanctioned path), not a hook return value.
    const { camera, size } = state;
    const p = scrollProgress.get();
    const z = THREE.MathUtils.lerp(24, 14.5, THREE.MathUtils.smoothstep(p, 0, 0.55));
    camera.position.z += (z - camera.position.z) * Math.min(1, delta * 4);
    camera.position.y = THREE.MathUtils.lerp(8, 5, THREE.MathUtils.smoothstep(p, 0, 0.55));
    camera.lookAt(0, 0, 0);

    const t = state.clock.elapsedTime;
    universeNodes.forEach((n, i) => {
      const mesh = nodeRefs.current[i];
      if (!mesh) return;
      const dimmed = (focus !== null && !related.has(i)) || (cluster !== null && n.project.category !== cluster);
      const base = n.project.tier === 1 ? 0.2 : n.project.tier === 2 ? 0.12 : 0.085;
      const boost = i === focus ? 1.8 : i === selected ? 1.5 : 1;
      const s = base * boost * (1 + Math.sin(t * 1.4 + i) * 0.04);
      mesh.scale.setScalar(THREE.MathUtils.lerp(mesh.scale.x, s, Math.min(1, delta * 8)));
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, dimmed ? 0.18 : 1, Math.min(1, delta * 6));
      const halo = haloRefs.current[i];
      if (halo) {
        const hm = halo.material as THREE.SpriteMaterial;
        hm.opacity = THREE.MathUtils.lerp(hm.opacity, dimmed ? 0.05 : lumos ? 0.9 : i === focus ? 0.8 : 0.4, Math.min(1, delta * 5));
      }
    });

    const ff = fireflies.geo.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < fireflies.n; i++) {
      ff.setXYZ(
        i,
        fireflies.base[i * 3] + Math.sin(t * 0.3 + i) * 0.6,
        fireflies.base[i * 3 + 1] + Math.sin(t * 0.5 + i * 1.7) * 0.4,
        fireflies.base[i * 3 + 2] + Math.cos(t * 0.27 + i) * 0.6,
      );
    }
    ff.needsUpdate = true;
    if (fireflyMat.current) {
      const target = lumos ? 0.95 : 0.35 + Math.sin(t * 0.9) * 0.1;
      fireflyMat.current.opacity += (target - fireflyMat.current.opacity) * Math.min(1, delta * 2);
    }

    // Project anchor + focus labels into the DOM overlay.
    g.updateMatrixWorld();
    const labels = labelRefs.current ?? [];
    clusterAnchors.forEach((a, i) => {
      const el = labels[i];
      if (!el) return;
      tmp.set(...a.p3).applyMatrix4(g.matrixWorld).project(camera);
      const behind = tmp.z > 1;
      el.style.transform = `translate(${((tmp.x + 1) / 2) * size.width}px, ${((1 - tmp.y) / 2) * size.height}px)`;
      el.style.opacity = behind ? "0" : String(THREE.MathUtils.clamp(1.2 - tmp.z * 0.3, 0.35, 1));
    });
    const fl = focusLabelRef.current;
    if (fl) {
      if (focus === null) fl.style.opacity = "0";
      else {
        tmp.set(...universeNodes[focus].p3).applyMatrix4(g.matrixWorld).project(camera);
        fl.style.transform = `translate(${((tmp.x + 1) / 2) * size.width}px, ${((1 - tmp.y) / 2) * size.height}px)`;
        fl.style.opacity = "1";
      }
    }
  });

  const over = (i: number) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = "pointer";
    onHover(i);
  };
  const out = () => {
    document.body.style.cursor = "";
    onHover(null);
  };
  const click = (i: number) => (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (drag.current.moved < 6) onSelect(i);
  };

  return (
    <>
      <points geometry={stars}>
        <pointsMaterial color="#ece6d8" size={0.07} sizeAttenuation transparent opacity={0.45} depthWrite={false} />
      </points>
      <group ref={group}>
        <lineSegments geometry={spokeGeo}>
          <lineBasicMaterial color="#d6e0ec" transparent opacity={0.05} depthWrite={false} />
        </lineSegments>
        <lineSegments geometry={edgeGeo}>
          <lineBasicMaterial vertexColors transparent blending={THREE.AdditiveBlending} depthWrite={false} />
        </lineSegments>
        <points geometry={fireflies.geo}>
          <pointsMaterial
            ref={fireflyMat}
            color="#d8a657"
            size={0.09}
            sizeAttenuation
            transparent
            opacity={0.35}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
        {clusterAnchors.map((a) => (
          <mesh key={a.id} position={a.p3}>
            <octahedronGeometry args={[0.09, 0]} />
            <meshBasicMaterial color={a.color} wireframe transparent opacity={cluster && cluster !== a.id ? 0.2 : 0.8} />
          </mesh>
        ))}
        {universeNodes.map((n, i) => {
          const color = categoryById[n.project.category].color;
          return (
            <group key={n.project.slug} position={n.p3}>
              <mesh
                ref={(m) => {
                  nodeRefs.current[i] = m;
                }}
                scale={0.1}
                onPointerOver={over(i)}
                onPointerOut={out}
                onClick={click(i)}
              >
                <sphereGeometry args={[1, 20, 20]} />
                <meshBasicMaterial color={color} transparent opacity={1} />
              </mesh>
              {n.project.tier === 1 ? (
                <sprite
                  ref={(s) => {
                    haloRefs.current[i] = s;
                  }}
                  scale={1.6}
                  raycast={() => null}
                >
                  <spriteMaterial map={glow} color={color} transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
                </sprite>
              ) : null}
            </group>
          );
        })}
      </group>
    </>
  );
}

export default function Universe3D(props: Universe3DProps) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 9, 24], fov: 42, near: 0.1, far: 120 }}
      frameloop={props.active ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={() => props.onReady()}
      onPointerMissed={() => props.onHover(null)}
      style={{ touchAction: "pan-y" }}
      aria-hidden="true"
    >
      <Scene {...props} />
    </Canvas>
  );
}
