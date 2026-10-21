"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import type { BottleShape } from "@/data/products";

// Procedural packaging: each shape is a lathe profile (radius, height) spun around Y.
// When the client sends real .glb models, replace the meshes below with <primitive>.

type Profile = { glass: [number, number][]; fill: [number, number][]; height: number; scale: number };

const PROFILES: Record<Exclude<BottleShape, "stick">, Profile> = {
  dropper: {
    height: 2.15,
    scale: 1,
    glass: [[0, 0], [0.5, 0], [0.57, 0.05], [0.6, 0.16], [0.6, 1.28], [0.52, 1.48], [0.26, 1.6], [0.21, 1.66], [0.21, 1.78], [0, 1.78]],
    fill: [[0, 0.07], [0.49, 0.07], [0.53, 0.15], [0.53, 1.02], [0, 1.02]],
  },
  pump: {
    height: 2.35,
    scale: 1,
    glass: [[0, 0], [0.4, 0], [0.46, 0.06], [0.47, 0.2], [0.47, 1.66], [0.42, 1.82], [0.17, 1.9], [0.17, 2.0], [0, 2.0]],
    fill: [[0, 0.07], [0.4, 0.07], [0.41, 0.2], [0.41, 1.35], [0, 1.35]],
  },
  jar: {
    height: 1.2,
    scale: 0.78,
    glass: [[0, 0], [0.86, 0], [0.92, 0.06], [0.93, 0.18], [0.93, 0.72], [0.85, 0.8], [0.85, 0.86], [0, 0.86]],
    fill: [[0, 0.08], [0.82, 0.08], [0.85, 0.18], [0.85, 0.6], [0.6, 0.66], [0, 0.68]],
  },
};

function lathe(points: [number, number][]) {
  const geo = new THREE.LatheGeometry(
    points.map(([x, y]) => new THREE.Vector2(x, y)),
    96,
  );
  geo.computeVertexNormals();
  return geo;
}

const capMaterial = { color: "#0d1717", roughness: 0.55, metalness: 0.1 };
const metalMaterial = { color: "#d8d2cb", roughness: 0.28, metalness: 1 };

type BottleProps = {
  shape: BottleShape;
  color: string;
  /** Lower on phones: transmission is the most expensive part of the scene. */
  quality?: "high" | "low";
};

export default function Bottle({ shape, color, quality = "high" }: BottleProps) {
  const fillMat = useRef<THREE.MeshPhysicalMaterial>(null);
  const target = useMemo(() => new THREE.Color(color), [color]);

  useFrame((_, dt) => {
    fillMat.current?.color.lerp(target, Math.min(1, dt * 4));
    fillMat.current?.emissive.copy(fillMat.current.color).multiplyScalar(0.12);
  });

  const fill = (
    <meshPhysicalMaterial
      ref={fillMat}
      color={color}
      roughness={shape === "jar" ? 0.6 : 0.12}
      clearcoat={1}
      clearcoatRoughness={0.1}
    />
  );

  if (shape === "stick") return <Stick fill={fill} />;

  const profile = PROFILES[shape];
  return (
    <group position-y={(-profile.height / 2) * profile.scale} scale={profile.scale}>
      <Glass points={profile.glass} quality={quality} />
      <LatheMesh points={profile.fill}>{fill}</LatheMesh>
      {shape === "dropper" && <DropperCap />}
      {shape === "pump" && <PumpHead />}
      {shape === "jar" && <JarLid />}
    </group>
  );
}

function useLathe(points: [number, number][]) {
  return useMemo(() => lathe(points), [points]);
}

function LatheMesh({ points, children }: { points: [number, number][]; children: React.ReactNode }) {
  return <mesh geometry={useLathe(points)}>{children}</mesh>;
}

function Glass({ points, quality }: { points: [number, number][]; quality: "high" | "low" }) {
  const geo = useLathe(points);
  return (
    <mesh geometry={geo}>
      <MeshTransmissionMaterial
        samples={quality === "high" ? 8 : 3}
        resolution={quality === "high" ? 1024 : 384}
        thickness={0.45}
        roughness={0.04}
        ior={1.45}
        chromaticAberration={0.08}
        anisotropy={0.15}
        distortion={0.15}
        distortionScale={0.4}
        temporalDistortion={0}
        color="#ffffff"
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
      <mesh position-y={0.36}>
        <capsuleGeometry args={[0.15, 0.2, 12, 32]} />
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
      <cylinderGeometry args={[0.95, 0.95, 0.32, 96]} />
      <meshStandardMaterial {...metalMaterial} />
    </mesh>
  );
}

const STICK_BULLET: [number, number][] = [[0, 0], [0.24, 0], [0.24, 0.42], [0.2, 0.52], [0.1, 0.58], [0, 0.6]];

function Stick({ fill }: { fill: React.ReactNode }) {
  const bullet = useLathe(STICK_BULLET);
  return (
    <group position-y={-0.9}>
      <mesh position-y={0.55}>
        <cylinderGeometry args={[0.32, 0.32, 1.1, 64]} />
        <meshStandardMaterial {...capMaterial} />
      </mesh>
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

/** Distance from a bottle's centre to its base, for placing shadows. */
export function baseOffset(shape: BottleShape) {
  if (shape === "stick") return 0.9;
  const p = PROFILES[shape];
  return (p.height / 2) * p.scale;
}
