"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import Bottle from "./Bottle";
import Studio from "./Studio";
import type { BottleShape } from "@/data/products";

type Props = {
  shape: BottleShape;
  color: string;
  quality: "high" | "low";
  reducedMotion: boolean;
};

export default function ProductViewer({ shape, color, quality, reducedMotion }: Props) {
  return (
    <Canvas dpr={[1, quality === "high" ? 1.75 : 1.25]} camera={{ position: [0, 0.4, 5.2], fov: 32 }}>
      <color attach="background" args={["#f6f6f6"]} />
      <Studio />
      <Bottle shape={shape} color={color} quality={quality} />
      <ContactShadows position={[0, -1.3, 0]} opacity={0.35} scale={6} blur={2.6} far={2} />
      <OrbitControls
        enablePan={false}
        minDistance={3.2}
        maxDistance={7}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.8}
        autoRotate={!reducedMotion}
        autoRotateSpeed={0.8}
      />
    </Canvas>
  );
}
