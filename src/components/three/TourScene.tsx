"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import Bottle from "./Bottle";
import Studio from "./Studio";
import type { Product } from "@/data/products";

const FONT = "/fonts/onest-200.woff";

type Props = {
  products: Product[];
  stage: number;
  /** Scroll progress through the pinned section, 0 → 1. */
  progress: React.RefObject<number>;
  quality: "high" | "low";
  reducedMotion: boolean;
  active: boolean;
};

export default function TourScene(props: Props) {
  return (
    <Canvas
      frameloop={props.active ? "always" : "never"}
      dpr={[1, props.quality === "high" ? 1.75 : 1.25]}
      camera={{ position: [0, 0, 6], fov: 32 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
    >
      <color attach="background" args={["#ffffff"]} />
      <Studio />
      <Scene {...props} />
    </Canvas>
  );
}

function Scene({ products, stage, progress, quality, reducedMotion }: Props) {
  const product = products[stage];

  // The bottle shrinks out, swaps shape, then grows back when the formula changes.
  const [shown, setShown] = useState(product);
  const swapping = product.slug !== shown.slug;

  const rig = useRef<THREE.Group>(null);
  const bottle = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const wide = viewport.aspect > 1.1;
  const fit = Math.min(1, viewport.height / 4.6, viewport.width / 2.6);
  // On phones the copy sits at the bottom, so the bottle rises and shrinks above it.
  // Desktop: sit slightly low to clear the fixed header.
  const lift = wide ? -viewport.height * 0.07 : viewport.height * 0.2;
  const size = wide ? fit : fit * 0.7;

  useFrame((state, dt) => {
    if (!rig.current || !bottle.current) return;
    const k = Math.min(1, dt * 5);

    const s = bottle.current.scale.x;
    if (swapping) {
      const next = THREE.MathUtils.lerp(s, 0, k * 1.6);
      bottle.current.scale.setScalar(next);
      if (next < 0.04) setShown(product);
    } else {
      bottle.current.scale.setScalar(THREE.MathUtils.lerp(s, size, k));
    }

    // Scroll turns the bottle a full lap per formula; the pointer tilts it slightly.
    const turn = reducedMotion ? 0 : progress.current * products.length * Math.PI * 2;
    rig.current.rotation.y = turn + Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
    rig.current.rotation.x = THREE.MathUtils.lerp(rig.current.rotation.x, state.pointer.y * -0.12, k);
    rig.current.rotation.z = THREE.MathUtils.lerp(rig.current.rotation.z, state.pointer.x * -0.06, k);

    const x = wide ? viewport.width * 0.08 : 0;
    rig.current.position.x = THREE.MathUtils.lerp(rig.current.position.x, x, k);
    rig.current.position.y = THREE.MathUtils.lerp(rig.current.position.y, lift, k);
    bottle.current.position.y = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
  });

  return (
    <>
      {products.map((p, i) => (
        <Figure
          key={p.slug}
          text={`${p.actives[0].percent}%`}
          active={i === stage}
          x={wide ? viewport.width * 0.08 : 0}
          lift={lift}
        />
      ))}
      <group ref={rig}>
        <group ref={bottle}>
          <Bottle product={shown} glass={quality === "high" ? "mtm" : "native"} lowQuality={quality === "low"} />
        </group>
      </group>
    </>
  );
}

// The lead active's percentage, set huge and thin behind the glass so the bottle bends it.
function Figure({ text, active, x, lift }: { text: string; active: boolean; x: number; lift: number }) {
  const ref = useRef<THREE.Mesh & { fillOpacity: number }>(null);
  const { viewport } = useThree();
  const size = Math.min(viewport.height * 0.62, (viewport.width * 0.9) / (text.length * 0.6));

  useFrame((_, dt) => {
    if (!ref.current) return;
    const k = Math.min(1, dt * 4);
    ref.current.fillOpacity = THREE.MathUtils.lerp(ref.current.fillOpacity, active ? 1 : 0, k);
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, (active ? 0 : -0.5) + lift * 1.3, k);
    ref.current.position.x = x * 1.3;
    ref.current.visible = ref.current.fillOpacity > 0.01;
  });

  return (
    <Text
      ref={ref}
      font={FONT}
      fontSize={size}
      letterSpacing={-0.09}
      color="#0d1717"
      fillOpacity={0}
      anchorX="center"
      anchorY="middle"
      position={[0, -0.5, -2]}
    >
      {text}
    </Text>
  );
}
