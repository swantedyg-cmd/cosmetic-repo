"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ContactShadows, PerspectiveCamera, View } from "@react-three/drei";
import * as THREE from "three";
import Bottle, { baseOffset } from "./Bottle";
import Studio from "./Studio";
import type { Product } from "@/data/products";

type Props = {
  product: Product;
  color?: string;
  /** Spins the bottle while the card is hovered. */
  hovered?: boolean;
  className?: string;
};

// A small live 3D stage, drawn by the shared ViewCanvas into this element's box.
export default function CardStage({ product, color, hovered = false, className = "absolute inset-0" }: Props) {
  return (
    <View className={className}>
      <PerspectiveCamera makeDefault position={[0, 0.25, 5.6]} fov={30} />
      <Studio />
      <Turntable hovered={hovered} seed={product.slug.length * 1.7}>
        <Bottle product={product} color={color} glass="simple" />
      </Turntable>
      <ContactShadows
        position={[0, -baseOffset(product.shape) - 0.02, 0]}
        opacity={0.35}
        scale={4}
        blur={2.2}
        far={1.5}
        color="#7a2e0c"
        frames={1}
      />
    </View>
  );
}

function Turntable({ hovered, seed, children }: { hovered: boolean; seed: number; children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const spin = useRef(0);

  useFrame((state, dt) => {
    if (!group.current) return;
    if (hovered) spin.current += dt * 2.4;
    else spin.current = THREE.MathUtils.lerp(spin.current, Math.round(spin.current / (Math.PI * 2)) * Math.PI * 2, dt * 2);
    const sway = Math.sin(state.clock.elapsedTime * 0.5 + seed) * 0.35;
    group.current.rotation.y = spin.current + sway;
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, hovered ? 0.08 : 0, dt * 6);
  });

  return <group ref={group}>{children}</group>;
}
