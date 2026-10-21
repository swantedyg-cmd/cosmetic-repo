"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import Bottle, { baseOffset } from "./Bottle";
import Studio from "./Studio";
import type { Product } from "@/data/products";

type Props = {
  product: Product;
  color: string;
  quality: "high" | "low";
  reducedMotion: boolean;
};

export default function ProductViewer({ product, color, quality, reducedMotion }: Props) {
  return (
    <Canvas
      dpr={[1, quality === "high" ? 1.75 : 1.25]}
      camera={{ position: [0, 0.3, 5.6], fov: 30 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
    >
      <color attach="background" args={["#f9ebe1"]} />
      <Studio />
      <pointLight position={[0, 1, -3]} color="#f7651a" intensity={20} distance={10} />
      <Bottle product={product} color={color} glass="mtm" lowQuality={quality === "low"} />
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
        autoRotate={!reducedMotion}
        autoRotateSpeed={0.7}
      />
    </Canvas>
  );
}
