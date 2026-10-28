"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { baseOffset } from "./Bottle";
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
    <Canvas
      dpr={[1, quality === "high" ? 1.75 : 1.25]}
      camera={{ position: [0, 0.3, 5.6], fov: 30 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
    >
      <color attach="background" args={["#f9ebe1"]} />
      <Studio />
      <pointLight position={[0, 1, -3]} color="#f7651a" intensity={20} distance={10} />
      <OpenableFormula product={product} color={color} quality={quality} reducedMotion={reducedMotion} opened={opened} />
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
    </Canvas>
  );
}

/** Eases the open state so the button toggle plays the same choreography as the scroll tour. */
function OpenableFormula({ opened, quality, ...rest }: Props) {
  const open = useRef(0);
  const group = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    open.current = rest.reducedMotion ? Number(opened) : damp(open.current, Number(opened), speed.slow, dt);
    // Step left and back a little when open so the droplets and their labels fit the frame.
    if (group.current) {
      group.current.position.x = -open.current * 0.95;
      group.current.scale.setScalar(1 - open.current * 0.18);
    }
  });
  return (
    <group ref={group}>
      <Formula {...rest} open={open} glass="mtm" lowQuality={quality === "low"} />
    </group>
  );
}
