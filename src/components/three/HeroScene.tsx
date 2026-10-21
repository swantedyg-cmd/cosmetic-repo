"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Text } from "@react-three/drei";
import * as THREE from "three";
import Bottle, { baseOffset } from "./Bottle";
import Studio from "./Studio";
import type { Product } from "@/data/products";

const FONT = "/fonts/onest-300.woff";

type Props = {
  products: Product[];
  /** 0 = intro, 1..n = products[stage - 1]. */
  stage: number;
  /** Scroll progress through the whole pinned section, 0 → 1. */
  progress: React.RefObject<number>;
  quality: "high" | "low";
  reducedMotion: boolean;
};

export default function HeroScene(props: Props) {
  return (
    <Canvas
      dpr={[1, props.quality === "high" ? 1.75 : 1.25]}
      camera={{ position: [0, 0, 6], fov: 32 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#ffffff"]} />
      <Studio />
      <Scene {...props} />
    </Canvas>
  );
}

function Scene({ products, stage, progress, quality, reducedMotion }: Props) {
  const words = ["SOLENNE", ...products.map((p) => p.word)];
  const product = products[Math.max(0, stage - 1)];

  // The bottle shrinks out, swaps shape, then grows back when the formula changes.
  const [shown, setShown] = useState(product);
  const swapping = product.shape !== shown.shape;

  const rig = useRef<THREE.Group>(null);
  const bottle = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const wide = viewport.aspect > 1.1;
  // Keep the tallest bottle clear of the header and copy on short screens.
  const fit = Math.min(1, viewport.height / 4.2, viewport.width / 2.6);
  // On phones the product card sits at the bottom, so the bottle rises and shrinks above it.
  const lifted = !wide && stage > 0;
  const lift = lifted ? viewport.height * 0.24 : 0;
  const size = lifted ? fit * 0.62 : fit;

  useFrame((state, dt) => {
    if (!rig.current || !bottle.current) return;
    const k = Math.min(1, dt * 5);

    const s = bottle.current.scale.x;
    if (swapping) {
      const next = THREE.MathUtils.lerp(s, 0, k * 1.6);
      bottle.current.scale.setScalar(next);
      if (next < 0.04) setShown(product);
    } else {
      if (product !== shown) setShown(product); // same shape, new colour: no shrink
      bottle.current.scale.setScalar(THREE.MathUtils.lerp(s, size, k));
    }

    // Scroll turns the bottle; the pointer tilts it slightly.
    const spin = reducedMotion ? 0 : progress.current * Math.PI * 4 + state.clock.elapsedTime * 0.15;
    rig.current.rotation.y = spin;
    rig.current.rotation.x = THREE.MathUtils.lerp(rig.current.rotation.x, state.pointer.y * -0.15, k);
    rig.current.rotation.z = THREE.MathUtils.lerp(rig.current.rotation.z, state.pointer.x * -0.08, k);

    // Off-centre on wide screens once the product copy appears on the left.
    const x = wide && stage > 0 ? viewport.width * 0.16 : 0;
    rig.current.position.x = THREE.MathUtils.lerp(rig.current.position.x, x, k);
    rig.current.position.y = THREE.MathUtils.lerp(rig.current.position.y, lift, k);
    bottle.current.position.y = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.8) * 0.06;
  });

  return (
    <>
      {words.map((w, i) => (
        <Word key={w} text={w} active={i === stage} shifted={wide && stage > 0} lift={lift} />
      ))}
      <group ref={rig}>
        <group ref={bottle}>
          <Bottle shape={shown.shape} color={product.color} quality={quality} />
        </group>
      </group>
      {quality === "high" && (
        <ContactShadows position={[0, lift - (baseOffset(shown.shape) + 0.12) * size, 0]} opacity={0.35} scale={6} blur={2.6} far={2} />
      )}
    </>
  );
}

// The big word sits behind the glass, so the bottle bends it as it turns.
function Word({ text, active, shifted, lift }: { text: string; active: boolean; shifted: boolean; lift: number }) {
  const ref = useRef<THREE.Mesh & { fillOpacity: number }>(null);
  const { viewport } = useThree();
  // Product words share the right side with the bottle, leaving the left for copy.
  const room = shifted ? 0.62 : 0.88;
  const size = Math.min(2.6, (viewport.width * room) / (text.length * 0.62 + 0.6));
  const x = shifted ? viewport.width * 0.24 : 0;

  useFrame((_, dt) => {
    if (!ref.current) return;
    const k = Math.min(1, dt * 4);
    ref.current.fillOpacity = THREE.MathUtils.lerp(ref.current.fillOpacity, active ? 1 : 0, k);
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, (active ? 0.3 : -0.1) + lift * 1.35, k);
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, x, k);
    ref.current.visible = ref.current.fillOpacity > 0.01;
  });

  return (
    <Text
      ref={ref}
      font={FONT}
      fontSize={size}
      letterSpacing={-0.08}
      color="#0d1717"
      fillOpacity={0}
      anchorX="center"
      anchorY="middle"
      position={[0, -0.4, -2.2]}
    >
      {text}
    </Text>
  );
}
