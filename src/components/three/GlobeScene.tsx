"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import SceneCanvas from "./SceneCanvas";
import { damp, speed } from "./motion";
import { LAND_DOTS } from "@/data/landDots";
import type { Origin } from "@/data/origins";

// A dotted globe: land as a field of tiny discs, each origin a glowing pin with a
// thread of light rising from it. Picking an origin turns the globe to face it.

const R = 1.5;

function toVec(lat: number, lng: number, r = R) {
  const phi = (lat * Math.PI) / 180;
  const lam = (lng * Math.PI) / 180;
  return new THREE.Vector3(Math.cos(phi) * Math.sin(lam) * r, Math.sin(phi) * r, Math.cos(phi) * Math.cos(lam) * r);
}

type Props = {
  origins: Origin[];
  active: number;
  onPick: (i: number) => void;
  quality: "high" | "low";
  reducedMotion: boolean;
  inView: boolean;
  night: boolean;
};

export default function GlobeScene(props: Props) {
  return (
    <SceneCanvas quality={props.quality} active={props.inView} camera={{ position: [0, 0, 6.4], fov: 32 }} gl={{ antialias: true, alpha: true }} style={{ touchAction: "pan-y", cursor: "grab" }}>
      <ambientLight intensity={1} />
      <Globe {...props} />
    </SceneCanvas>
  );
}

function Globe({ origins, active, onPick, reducedMotion, night }: Props) {
  const group = useRef<THREE.Group>(null);
  const dots = useRef<THREE.InstancedMesh>(null);
  const view = useRef({ yaw: 0, pitch: 0.3, dragging: false, lastX: 0, lastY: 0, idleSince: 0, follow: true });
  const { gl } = useThree();

  const target = useMemo(() => {
    const o = origins[active];
    return { yaw: (-o.lng * Math.PI) / 180, pitch: (o.lat * Math.PI) / 180 };
  }, [origins, active]);

  // A new pick takes the globe back from the visitor's hand.
  useEffect(() => {
    view.current.follow = true;
  }, [active]);

  // Place each land dot flat against the sphere, facing outwards.
  useEffect(() => {
    const m = dots.current;
    if (!m) return;
    const o = new THREE.Object3D();
    for (let i = 0; i < LAND_DOTS.length / 2; i++) {
      const p = toVec(LAND_DOTS[i * 2], LAND_DOTS[i * 2 + 1]);
      o.position.copy(p);
      o.lookAt(p.clone().multiplyScalar(2));
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, []);

  // Drag to spin; let go and it eases back to the chosen origin after a moment.
  useEffect(() => {
    const el = gl.domElement;
    const v = view.current;
    const down = (e: PointerEvent) => {
      v.dragging = true;
      v.follow = false;
      v.lastX = e.clientX;
      v.lastY = e.clientY;
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!v.dragging) return;
      v.yaw += (e.clientX - v.lastX) * 0.008;
      v.pitch = THREE.MathUtils.clamp(v.pitch + (e.clientY - v.lastY) * 0.006, -1.1, 1.1);
      v.lastX = e.clientX;
      v.lastY = e.clientY;
    };
    const up = () => {
      v.dragging = false;
      v.idleSince = performance.now();
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, [gl]);

  useFrame((_, dt) => {
    const g = group.current;
    const v = view.current;
    if (!g) return;
    if (!v.dragging && !v.follow && performance.now() - v.idleSince > 4000) v.follow = true;
    if (v.follow && !v.dragging) {
      // Shortest way round to the target longitude.
      const diff = Math.atan2(Math.sin(target.yaw - v.yaw), Math.cos(target.yaw - v.yaw));
      v.yaw = reducedMotion ? v.yaw + diff : damp(v.yaw, v.yaw + diff, speed.slow, dt);
      v.pitch = reducedMotion ? target.pitch : damp(v.pitch, target.pitch, speed.slow, dt);
    }
    g.rotation.set(v.pitch, v.yaw, 0, "XYZ");
  });

  const ink = night ? "#f6efe7" : "#0d1717";
  return (
    <group ref={group}>
      {/* The sphere itself: a soft disc that hides the dots on the far side. */}
      <mesh>
        <sphereGeometry args={[R * 0.995, 64, 48]} />
        <meshBasicMaterial color={night ? "#1c1410" : "#fdf6f0"} toneMapped={false} />
      </mesh>
      <mesh scale={1.06}>
        <sphereGeometry args={[R, 48, 32]} />
        <meshBasicMaterial color="#f7651a" transparent opacity={night ? 0.08 : 0.05} side={THREE.BackSide} toneMapped={false} />
      </mesh>
      <instancedMesh ref={dots} args={[undefined, undefined, LAND_DOTS.length / 2]}>
        <circleGeometry args={[0.0105, 8]} />
        <meshBasicMaterial color={ink} transparent opacity={night ? 0.55 : 0.42} toneMapped={false} />
      </instancedMesh>
      {origins.map((o, i) => (
        <Pin key={o.ingredient} origin={o} selected={i === active} onPick={() => onPick(i)} reducedMotion={reducedMotion} />
      ))}
    </group>
  );
}

function Pin({ origin, selected, onPick, reducedMotion }: { origin: Origin; selected: boolean; onPick: () => void; reducedMotion: boolean }) {
  const pos = useMemo(() => toVec(origin.lat, origin.lng), [origin]);
  const quat = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize()), [pos]);
  const beam = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);

  useFrame((state, dt) => {
    const h = selected ? 0.42 : 0.12;
    if (beam.current) {
      beam.current.scale.y = damp(beam.current.scale.y, h, speed.base, dt);
      beam.current.position.y = beam.current.scale.y / 2;
    }
    if (ring.current) {
      // A ripple spreading out from the selected origin.
      const t = reducedMotion ? 0.5 : (state.clock.elapsedTime * 0.6) % 1;
      ring.current.visible = selected;
      ring.current.scale.setScalar(0.03 + t * 0.16);
      (ring.current.material as THREE.MeshBasicMaterial).opacity = (1 - t) * 0.8;
    }
  });

  return (
    <group position={pos} quaternion={quat}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onPick();
        }}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "")}
      >
        <sphereGeometry args={[selected ? 0.045 : 0.032, 16, 12]} />
        <meshBasicMaterial color={selected ? "#f15730" : "#f7651a"} toneMapped={false} />
      </mesh>
      <mesh ref={beam} scale={[1, 0.12, 1]}>
        <cylinderGeometry args={[0.006, 0.006, 1, 8]} />
        <meshBasicMaterial color="#f15730" transparent opacity={0.85} />
      </mesh>
      <mesh ref={ring} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.8, 1, 40]} />
        <meshBasicMaterial color="#f15730" transparent side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
