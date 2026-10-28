"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import Bottle, { mouthY, type GlassMode } from "./Bottle";
import { damp, ease, span, speed } from "./motion";
import type { Product } from "@/data/products";

// "Open the formula": the closure lifts off and each active rises out of the
// bottle as a droplet whose volume matches its real percentage.

type Props = {
  product: Product;
  color?: string;
  glass?: GlassMode;
  lowQuality?: boolean;
  /** 0 → 1, read every frame. */
  open: { current: number };
  press?: { current: number };
  bubbles?: boolean;
  /** Show the percentage labels beside the droplets. */
  labels?: boolean;
  /** Which side the droplets settle on. */
  side?: 1 | -1;
  reducedMotion?: boolean;
};

export default function Formula({ product, open, labels = true, side = 1, reducedMotion, ...bottle }: Props) {
  return (
    <group>
      <Bottle product={product} open={open} {...bottle} />
      <Droplets product={product} open={open} labels={labels} side={side} reducedMotion={reducedMotion} />
    </group>
  );
}

function Droplets({
  product,
  open,
  labels,
  side,
  reducedMotion,
}: {
  product: Product;
  open: { current: number };
  labels: boolean;
  side: 1 | -1;
  reducedMotion?: boolean;
}) {
  const max = Math.max(...product.actives.map((a) => a.percent));
  const mouth = mouthY(product.shape);
  const count = product.actives.length;

  const drops = useMemo(
    () =>
      product.actives.map((a, i) => {
        // Radius from volume, so a 40% drop holds eight times a 5% one, not eight times the width.
        const radius = Math.max(0.09, 0.36 * Math.cbrt(a.percent / max));
        // Settle in a loose column beside the bottle, biggest at the top.
        const y = 0.85 - i * (1.7 / Math.max(1, count - 1));
        const x = side * (1.35 + radius * 0.6 + (i % 2) * 0.18);
        const color = new THREE.Color(product.color).lerp(new THREE.Color("#ffffff"), i * 0.28);
        return { ...a, radius, target: new THREE.Vector3(x, count === 1 ? 0.4 : y, 0.25 - i * 0.12), color };
      }),
    [product, max, count, side],
  );

  return (
    <>
      {drops.map((d, i) => (
        <Droplet key={d.name} index={i} drop={d} mouth={mouth} open={open} label={labels} reducedMotion={reducedMotion} />
      ))}
    </>
  );
}

function Droplet({
  index,
  drop,
  mouth,
  open,
  label,
  reducedMotion,
}: {
  index: number;
  drop: { name: string; percent: number; radius: number; target: THREE.Vector3; color: THREE.Color };
  mouth: number;
  open: { current: number };
  label: boolean;
  reducedMotion?: boolean;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const tag = useRef<HTMLDivElement>(null);
  const smooth = useRef(0);

  useFrame((state, dt) => {
    if (!mesh.current) return;
    smooth.current = damp(smooth.current, open.current, speed.base, dt);
    // Each drop leaves a beat after the one before it.
    const t = ease.outBack(span(smooth.current, 0.1 + index * 0.18, 0.62 + index * 0.18));
    const shown = t > 0.002;
    mesh.current.visible = shown;
    if (!shown) {
      if (tag.current) tag.current.style.opacity = "0";
      return;
    }

    // Rise straight out of the mouth first, then arc across to its resting place.
    const rise = Math.min(1, t * 1.8);
    const across = ease.inOutCubic(Math.max(0, Math.min(1, (t - 0.25) / 0.75)));
    const bob = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 1.1 + index * 2) * 0.04 * across;
    mesh.current.position.set(
      drop.target.x * across,
      mouth + 0.25 * rise + (drop.target.y - mouth - 0.25) * across + bob,
      drop.target.z * across,
    );

    const s = drop.radius * Math.min(1, t * 1.4);
    // Slight squash while travelling, like liquid holding together.
    const stretch = 1 + (1 - across) * across * 0.5;
    mesh.current.scale.set(s / Math.sqrt(stretch), s * stretch, s / Math.sqrt(stretch));

    if (tag.current) tag.current.style.opacity = String(span(t, 0.75, 1));
  });

  return (
    <mesh ref={mesh} visible={false}>
      <sphereGeometry args={[1, 48, 32]} />
      <meshPhysicalMaterial
        color={drop.color}
        emissive={drop.color}
        emissiveIntensity={0.18}
        roughness={0.05}
        clearcoat={1}
        clearcoatRoughness={0.04}
        envMapIntensity={1.2}
      />
      {label && (
        <Html position={[1.35, 0, 0]} center={false} zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
          <div ref={tag} className="formula-tag" style={{ opacity: 0 }}>
            <span className="formula-tag-value">{drop.percent}%</span>
            <span className="formula-tag-name">{drop.name}</span>
          </div>
        </Html>
      )}
    </mesh>
  );
}
