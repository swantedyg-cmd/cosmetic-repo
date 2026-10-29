"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import SceneCanvas from "./SceneCanvas";
import { ContactShadows, OrbitControls, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { baseOffset, mouthY } from "./Bottle";
import Formula from "./Formula";
import { damp, speed } from "./motion";
import Studio from "./Studio";
import type { Product } from "@/data/products";

type Props = {
  product: Product;
  color: string;
  quality: "high" | "low";
  reducedMotion: boolean;
  /** Lift the closure and show the actives as droplets. */
  opened: boolean;
};

export default function ProductViewer({ product, color, quality, reducedMotion, opened }: Props) {
  return (
    <SceneCanvas
      quality={quality}
      camera={{ position: [0, 0.3, 5.6], fov: 30 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
    >
      <color attach="background" args={["#f9ebe1"]} />
      <Studio />
      <pointLight position={[0, 1, -3]} color="#f7651a" intensity={20} distance={10} />
      <OpenableFormula product={product} color={color} quality={quality} reducedMotion={reducedMotion} opened={opened} />
      <Sparkles count={quality === "high" ? 40 : 16} scale={[4, 3.5, 3]} size={2} speed={reducedMotion ? 0 : 0.2} opacity={0.5} color="#ffb48f" />
      <ContactShadows
        position={[0, -baseOffset(product.shape) - 0.02, 0]}
        opacity={0.4}
        scale={6}
        blur={2.4}
        far={2}
        color="#7a2e0c"
      />
      <OrbitControls
        enablePan={false}
        minDistance={3.4}
        maxDistance={7.5}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.8}
        autoRotate={!reducedMotion && !opened}
        autoRotateSpeed={0.7}
      />
    </SceneCanvas>
  );
}

/** Eases the open state so the button toggle plays the same choreography as the scroll tour. */
function OpenableFormula({ opened, quality, ...rest }: Props) {
  const open = useRef(0);
  const press = useRef(0);
  const pressedAt = useRef(-10);
  const pending = useRef(false);
  const spawned = useRef(true);
  const group = useRef<THREE.Group>(null);
  const drop = useRef<THREE.Mesh>(null);
  const puddle = useRef<THREE.Mesh>(null);
  const fall = useRef({ live: false, x: 0, y: 0, vx: 0, vy: 0, landedAt: -10 });
  const floor = -baseOffset(rest.product.shape);
  const pours = rest.product.shape === "pump" || rest.product.shape === "dropper";

  useFrame((state, dt) => {
    const now = state.clock.elapsedTime;
    // Press pulse: down and back up in a third of a second.
    if (pending.current) {
      pending.current = false;
      pressedAt.current = now;
      spawned.current = false;
    }
    const since = now - pressedAt.current;
    press.current = since < 0.35 ? Math.sin((since / 0.35) * Math.PI) : 0;

    // At the bottom of the press, release a drop from the nozzle (pumps throw it sideways).
    const f = fall.current;
    if (!spawned.current && since >= 0.17) {
      spawned.current = true;
      if (pours) {
        const pump = rest.product.shape === "pump";
        f.live = true;
        f.x = pump ? 0.42 : 0.24;
        f.y = mouthY(rest.product.shape) + (pump ? 0.3 : 0.05);
        f.vx = pump ? 1.1 : 0.6;
        f.vy = pump ? 0.6 : 0.9;
      }
    }

    // The drop arcs out, falls, and spreads into a small puddle.
    const step = Math.min(dt, 1 / 30);
    if (f.live) {
      f.vy -= 9 * step;
      f.x += f.vx * step;
      f.y += f.vy * step;
      if (f.y <= floor + 0.04) {
        f.live = false;
        f.landedAt = now;
      }
    }
    if (drop.current) {
      drop.current.visible = f.live;
      drop.current.position.set(f.x, f.y, 0.1);
      // Stretch along the fall like a real drop.
      const stretch = 1 + Math.min(0.6, Math.abs(f.vy) * 0.08);
      drop.current.scale.set(0.06 / Math.sqrt(stretch), 0.06 * stretch, 0.06 / Math.sqrt(stretch));
    }
    if (puddle.current) {
      const age = now - f.landedAt;
      const spread = Math.min(1, age / 0.25);
      puddle.current.visible = age < 2.4;
      puddle.current.position.set(f.x, floor + 0.005, 0.1);
      puddle.current.scale.setScalar(0.02 + (1 - Math.pow(1 - spread, 3)) * 0.2);
      (puddle.current.material as THREE.MeshPhysicalMaterial).opacity = Math.max(0, 1 - Math.max(0, age - 1.2) / 1.2) * 0.9;
    }

    open.current = rest.reducedMotion ? Number(opened) : damp(open.current, Number(opened), speed.slow, dt);
    // Step left and back a little when open so the droplets and their labels fit the frame.
    if (group.current) {
      group.current.position.x = -open.current * 0.95;
      group.current.scale.setScalar(1 - open.current * 0.18);
    }
  });
  return (
    <group ref={group}>
      <group
        onClick={(e) => {
          e.stopPropagation();
          pending.current = true;
        }}
      >
        <Formula {...rest} open={open} press={press} bubbles glass="mtm" lowQuality={quality === "low"} />
      </group>
      <mesh ref={drop} visible={false}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshPhysicalMaterial color={rest.color} emissive={rest.color} emissiveIntensity={0.25} roughness={0.05} clearcoat={1} />
      </mesh>
      <mesh ref={puddle} rotation-x={-Math.PI / 2} visible={false}>
        <circleGeometry args={[1, 48]} />
        <meshPhysicalMaterial color={rest.color} roughness={0.05} clearcoat={1} transparent />
      </mesh>
    </group>
  );
}
