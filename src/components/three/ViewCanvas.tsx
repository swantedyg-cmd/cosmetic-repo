"use client";

import { Canvas } from "@react-three/fiber";
import { View } from "@react-three/drei";
import * as THREE from "three";

// One fixed, transparent WebGL canvas that every <View> on the page draws into.
// Sits under the header (z-50) so cards scrolling beneath it stay hidden.
export default function ViewCanvas() {
  return (
    <Canvas
      eventSource={document.body}
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 40 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
    >
      <View.Port />
    </Canvas>
  );
}
