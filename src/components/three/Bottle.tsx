"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import type { BottleShape, Product } from "@/data/products";
import { createLabelTexture } from "./label";

// Procedural packaging: each shape is a lathe profile (radius, height) spun around Y.
// When the client sends real .glb models, replace the meshes below with <primitive>.

type Profile = {
  glass: [number, number][];
  fill: [number, number][];
  height: number;
  scale: number;
  /** Paper label wrapped on the straight part of the body. */
  label: { radius: number; y: number; height: number; arc: number };
};

const PROFILES: Record<Exclude<BottleShape, "stick">, Profile> = {
  dropper: {
    height: 2.15,
    scale: 1,
    glass: [[0, 0], [0.5, 0], [0.57, 0.05], [0.6, 0.16], [0.6, 1.28], [0.52, 1.48], [0.26, 1.6], [0.21, 1.66], [0.21, 1.78], [0, 1.78]],
    fill: [[0, 0.07], [0.49, 0.07], [0.53, 0.15], [0.53, 1.02], [0, 1.02]],
    label: { radius: 0.606, y: 0.72, height: 0.82, arc: 2.1 },
  },
  pump: {
    height: 2.35,
    scale: 1,
    glass: [[0, 0], [0.4, 0], [0.46, 0.06], [0.47, 0.2], [0.47, 1.66], [0.42, 1.82], [0.17, 1.9], [0.17, 2.0], [0, 2.0]],
    fill: [[0, 0.07], [0.4, 0.07], [0.41, 0.2], [0.41, 1.35], [0, 1.35]],
    label: { radius: 0.476, y: 0.92, height: 0.9, arc: 2.3 },
  },
  jar: {
    height: 1.2,
    scale: 0.78,
    glass: [[0, 0], [0.86, 0], [0.92, 0.06], [0.93, 0.18], [0.93, 0.72], [0.85, 0.8], [0.85, 0.86], [0, 0.86]],
    fill: [[0, 0.08], [0.82, 0.08], [0.85, 0.18], [0.85, 0.6], [0.6, 0.66], [0, 0.68]],
    label: { radius: 0.936, y: 0.45, height: 0.44, arc: 1.5 },
  },
};

const STICK_LABEL = { radius: 0.323, y: 0.5, height: 0.62, arc: 2.6 };

/**
 * mtm    — drei transmission: best refraction, one extra render per bottle (use once per scene)
 * native — three's built-in transmission: shared pass, good for several bottles
 * simple — transparent glass without refraction: cheapest, for small card views
 */
export type GlassMode = "mtm" | "native" | "simple";

type BottleProps = {
  product: Product;
  /** Overrides the product's liquid colour (shades). */
  color?: string;
  glass?: GlassMode;
  lowQuality?: boolean;
};

const capMaterial = { color: "#0d1717", roughness: 0.5, metalness: 0.05 };
const metalMaterial = { color: "#d6c3a5", roughness: 0.22, metalness: 1 };

export default function Bottle({ product, color, glass = "native", lowQuality }: BottleProps) {
  const fillMat = useRef<THREE.MeshPhysicalMaterial>(null);
  const tint = color ?? product.color;
  const target = useMemo(() => new THREE.Color(tint), [tint]);
  const cream = product.shape === "jar";

  useFrame((_, dt) => {
    const m = fillMat.current;
    if (!m) return;
    m.color.lerp(target, Math.min(1, dt * 4));
    // A little self-light so the liquid glows like it's backlit.
    m.emissive.copy(m.color).multiplyScalar(cream ? 0.04 : 0.22);
  });

  const fill = (
    <meshPhysicalMaterial
      ref={fillMat}
      color={tint}
      roughness={cream ? 0.65 : 0.06}
      clearcoat={cream ? 0 : 1}
      clearcoatRoughness={0.08}
    />
  );

  if (product.shape === "stick") return <Stick product={product} fill={fill} />;

  const profile = PROFILES[product.shape];
  return (
    <group position-y={(-profile.height / 2) * profile.scale} scale={profile.scale}>
      <Glass points={profile.glass} mode={glass} lowQuality={lowQuality} />
      <LatheMesh points={profile.fill}>{fill}</LatheMesh>
      <Label product={product} {...profile.label} />
      {product.shape === "dropper" && <DropperCap />}
      {product.shape === "pump" && <PumpHead />}
      {product.shape === "jar" && <JarLid />}
    </group>
  );
}

function lathe(points: [number, number][]) {
  const geo = new THREE.LatheGeometry(
    points.map(([x, y]) => new THREE.Vector2(x, y)),
    128,
  );
  geo.computeVertexNormals();
  return geo;
}

function useLathe(points: [number, number][]) {
  return useMemo(() => lathe(points), [points]);
}

function LatheMesh({ points, children }: { points: [number, number][]; children: React.ReactNode }) {
  return <mesh geometry={useLathe(points)}>{children}</mesh>;
}

function Glass({ points, mode, lowQuality }: { points: [number, number][]; mode: GlassMode; lowQuality?: boolean }) {
  const geo = useLathe(points);
  return (
    <mesh geometry={geo}>
      {mode === "mtm" && (
        <MeshTransmissionMaterial
          samples={lowQuality ? 3 : 6}
          resolution={lowQuality ? 256 : 512}
          thickness={0.35}
          roughness={0.02}
          ior={1.5}
          chromaticAberration={0.025}
          anisotropicBlur={0.05}
          distortion={0.05}
          distortionScale={0.3}
          temporalDistortion={0}
          color="#ffffff"
        />
      )}
      {mode === "native" && (
        <meshPhysicalMaterial
          transmission={1}
          thickness={0.2}
          roughness={0}
          ior={1.5}
          envMapIntensity={0.45}
          clearcoat={0.6}
          clearcoatRoughness={0.02}
          color="#ffffff"
        />
      )}
      {mode === "simple" && (
        <meshPhysicalMaterial
          transparent
          opacity={0.12}
          roughness={0.04}
          metalness={0}
          clearcoat={1}
          envMapIntensity={1.2}
          color="#ffffff"
          depthWrite={false}
        />
      )}
    </mesh>
  );
}

function Label({
  product,
  radius,
  y,
  height,
  arc,
  dark,
}: {
  product: Product;
  radius: number;
  y: number;
  height: number;
  arc: number;
  dark?: boolean;
}) {
  const aspect = (radius * arc) / height;
  const texture = useMemo(() => createLabelTexture(product, { aspect, dark }), [product, aspect, dark]);
  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <mesh position-y={y}>
      <cylinderGeometry args={[radius, radius, height, 96, 1, true, -arc / 2, arc]} />
      {/* The map doubles as a faint emissive so the paper reads white, not grey, under soft light. */}
      <meshStandardMaterial
        map={texture}
        emissiveMap={texture}
        emissive="#ffffff"
        emissiveIntensity={dark ? 0.15 : 0.35}
        transparent={dark}
        roughness={dark ? 0.4 : 0.85}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}

function DropperCap() {
  return (
    <group position-y={1.78}>
      <mesh position-y={0.11}>
        <cylinderGeometry args={[0.26, 0.26, 0.22, 64]} />
        <meshStandardMaterial {...metalMaterial} />
      </mesh>
      <mesh position-y={0.37}>
        <capsuleGeometry args={[0.15, 0.22, 12, 32]} />
        <meshStandardMaterial {...capMaterial} />
      </mesh>
    </group>
  );
}

function PumpHead() {
  return (
    <group position-y={2.0}>
      <mesh position-y={0.08}>
        <cylinderGeometry args={[0.22, 0.22, 0.16, 64]} />
        <meshStandardMaterial {...metalMaterial} />
      </mesh>
      <mesh position-y={0.2}>
        <cylinderGeometry args={[0.06, 0.06, 0.16, 24]} />
        <meshStandardMaterial {...capMaterial} />
      </mesh>
      <mesh position={[0.08, 0.3, 0]}>
        <boxGeometry args={[0.36, 0.1, 0.16]} />
        <meshStandardMaterial {...capMaterial} />
      </mesh>
    </group>
  );
}

function JarLid() {
  return (
    <mesh position-y={0.86 + 0.16}>
      <cylinderGeometry args={[0.95, 0.95, 0.32, 128]} />
      <meshStandardMaterial {...metalMaterial} />
    </mesh>
  );
}

const STICK_BULLET: [number, number][] = [[0, 0], [0.24, 0], [0.24, 0.42], [0.2, 0.52], [0.1, 0.58], [0, 0.6]];

function Stick({ product, fill }: { product: Product; fill: React.ReactNode }) {
  const bullet = useLathe(STICK_BULLET);
  return (
    <group position-y={-0.9}>
      <mesh position-y={0.55}>
        <cylinderGeometry args={[0.32, 0.32, 1.1, 64]} />
        <meshStandardMaterial {...capMaterial} />
      </mesh>
      <Label product={product} {...STICK_LABEL} dark />
      <mesh position-y={1.14}>
        <cylinderGeometry args={[0.28, 0.28, 0.08, 64]} />
        <meshStandardMaterial {...metalMaterial} />
      </mesh>
      <mesh geometry={bullet} position-y={1.18}>
        {fill}
      </mesh>
    </group>
  );
}

/** Distance from a bottle's centre to its base, for placing shadows and plinths. */
export function baseOffset(shape: BottleShape) {
  if (shape === "stick") return 0.9;
  const p = PROFILES[shape];
  return (p.height / 2) * p.scale;
}
