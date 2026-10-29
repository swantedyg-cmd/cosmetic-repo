"use client";

import { useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import SceneCanvas, { useTier } from "./SceneCanvas";
import { Environment, Lightformer, MeshReflectorMaterial, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import Bottle, { baseOffset } from "./Bottle";
import { damp, speed } from "./motion";
import type { Product } from "@/data/products";

// A jeweller's turntable in a dark room: the range stands on lacquered plinths
// around a black disc with gold rims, over a smoked mirror floor.

const RADIUS = 2.4;
const PLINTH = 0.34;
const INK = "#0d1717";
const GOLD = "#d6b47c";

type Props = {
  products: Product[];
  /** Unbounded step count; the product at turn mod n faces the camera. */
  turn: number;
  /** Extra rotation in radians while the visitor is dragging. Read every frame. */
  drag: { current: number };
  quality: "high" | "low";
  reducedMotion: boolean;
  active: boolean;
  onPick: (index: number) => void;
};

export default function VitrineScene({ quality, active, ...props }: Props) {
  return (
    <SceneCanvas
      quality={quality}
      active={active}
      camera={{ position: [0, 1.1, 7.6], fov: 30 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
    >
      <color attach="background" args={[INK]} />
      <fog attach="fog" args={[INK, 8, 16]} />
      <ambientLight intensity={0.15} />
      <spotLight position={[0, 7, 4]} angle={0.4} penumbra={1} intensity={90} color="#fff1dc" />
      <pointLight position={[0, 1.5, -3.5]} color={GOLD} intensity={4} distance={9} />
      {/* Reflections only: warm gold strips and one cool softbox, so the glass reads as glass on black. */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={2.4} position={[0, 5, 1]} scale={[6, 1, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" color={GOLD} intensity={2.2} position={[-4, 1.5, 1]} scale={[0.6, 5, 1]} rotation-y={Math.PI / 2} />
        <Lightformer form="rect" color={GOLD} intensity={2.2} position={[4, 1.5, 1]} scale={[0.6, 5, 1]} rotation-y={-Math.PI / 2} />
        <Lightformer form="ring" color={GOLD} intensity={0.8} position={[0, 1, -5]} scale={2.5} />
      </Environment>

      <Rig reducedMotion={props.reducedMotion}>
        <Turntable {...props} quality={quality} />
        <Sparkles
          count={quality === "high" ? 70 : 28}
          position={[0, 1.6, 0]}
          scale={[7, 3.2, 5]}
          size={2.4}
          speed={props.reducedMotion ? 0 : 0.18}
          opacity={0.7}
          color={GOLD}
        />
        <Floor quality={quality} />
      </Rig>
    </SceneCanvas>
  );
}

/** Fits the table to the viewport and lets the camera drift a little with the pointer. */
function Rig({ children, reducedMotion }: { children: React.ReactNode; reducedMotion: boolean }) {
  const { viewport } = useThree();
  const wide = viewport.aspect > 1.1;
  // Phones crop the side plinths and keep the front bottle large.
  const scale = wide ? Math.min(0.55, viewport.width / 12.5, viewport.height / 6.8) : Math.min(0.5, viewport.width / 3.8);

  useFrame((state, dt) => {
    const px = reducedMotion ? 0 : state.pointer.x * 0.5;
    const py = reducedMotion ? 0 : state.pointer.y * 0.25;
    const cam = state.camera;
    cam.position.x = damp(cam.position.x, px, speed.slow, dt);
    cam.position.y = damp(cam.position.y, 1.1 + py, speed.slow, dt);
    cam.lookAt(0, 0.15, 0);
  });

  return (
    <group position-y={-1.4 * scale} scale={scale}>
      {children}
    </group>
  );
}

function Turntable({ products, turn, drag, quality, reducedMotion, onPick }: Omit<Props, "active">) {
  const table = useRef<THREE.Group>(null);
  const step = (Math.PI * 2) / products.length;
  const front = ((turn % products.length) + products.length) % products.length;

  useFrame((_, dt) => {
    const t = table.current;
    if (!t) return;
    const target = -turn * step + drag.current;
    // Dragging follows the finger closely; letting go settles slowly, like a weighted platter.
    t.rotation.y = reducedMotion ? target : damp(t.rotation.y, target, drag.current ? speed.quick : speed.slow, dt);
  });

  return (
    <group ref={table}>
      {/* The platter: black lacquer with a gold rim and one inlaid ring. */}
      <mesh position-y={-0.07}>
        <cylinderGeometry args={[3.3, 3.3, 0.14, 96]} />
        <meshPhysicalMaterial color="#121c1c" roughness={0.22} metalness={0.3} clearcoat={1} clearcoatRoughness={0.1} />
      </mesh>
      <GoldRing radius={3.3} y={0} tube={0.018} />
      <GoldRing radius={1.45} y={0.001} tube={0.006} />

      {products.map((p, i) => (
        <Station
          key={p.slug}
          product={p}
          angle={i * step}
          isFront={i === front}
          quality={quality}
          reducedMotion={reducedMotion}
          onPick={() => onPick(i)}
        />
      ))}
    </group>
  );
}

function GoldRing({ radius, y, tube }: { radius: number; y: number; tube: number }) {
  return (
    <mesh position-y={y} rotation-x={Math.PI / 2}>
      <torusGeometry args={[radius, tube, 12, 128]} />
      <meshStandardMaterial color={GOLD} metalness={1} roughness={0.18} />
    </mesh>
  );
}

function Station({
  product,
  angle,
  isFront,
  quality,
  reducedMotion,
  onPick,
}: {
  product: Product;
  angle: number;
  isFront: boolean;
  quality: "high" | "low";
  reducedMotion: boolean;
  onPick: () => void;
}) {
  const bottle = useRef<THREE.Group>(null);
  const open = useRef(0);
  const [hovered, setHovered] = useState(false);
  const rest = PLINTH + baseOffset(product.shape);

  useFrame((state, dt) => {
    const b = bottle.current;
    if (!b) return;
    // The bottle at the front rises off its plinth, sways, and lifts its cap to show what's inside.
    const lift = isFront ? 0.22 : hovered ? 0.08 : 0;
    b.position.y = damp(b.position.y, rest + lift, speed.base, dt);
    open.current = damp(open.current, isFront ? 0.5 : 0, isFront ? speed.slow : speed.base, dt);
    const sway = reducedMotion || !isFront ? 0 : Math.sin(state.clock.elapsedTime * 0.6) * 0.35;
    b.rotation.y = damp(b.rotation.y, sway, speed.slow, dt);
  });

  return (
    <group position={[Math.sin(angle) * RADIUS, 0, Math.cos(angle) * RADIUS]} rotation-y={angle}>
      <mesh position-y={PLINTH / 2}>
        <cylinderGeometry args={[0.62, 0.66, PLINTH, 64]} />
        <meshPhysicalMaterial color="#182222" roughness={0.3} metalness={0.2} clearcoat={0.8} />
      </mesh>
      <GoldRing radius={0.62} y={PLINTH} tube={0.012} />
      <group
        ref={bottle}
        position-y={rest}
        onClick={(e) => {
          e.stopPropagation();
          onPick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "";
        }}
      >
        <Bottle product={product} glass={quality === "high" ? "native" : "simple"} lowQuality={quality === "low"} open={open} />
      </group>
    </group>
  );
}

/**
 * Smoked mirror on desktop; a plain dark floor on phones and on any device that can't hold
 * the frame rate, since the mirror renders the whole table (glass included) a second time.
 */
function Floor({ quality }: { quality: "high" | "low" }) {
  const tier = useTier();
  return (
    <mesh position-y={-0.15} rotation-x={-Math.PI / 2}>
      <planeGeometry args={[40, 40]} />
      {quality === "high" && tier === "full" ? (
        <MeshReflectorMaterial
          resolution={256}
          blur={[300, 90]}
          mixBlur={1}
          mixStrength={1.6}
          mirror={0.6}
          roughness={0.9}
          depthScale={1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.3}
          color="#0a1212"
          metalness={0.6}
        />
      ) : (
        <meshStandardMaterial color="#0a1212" roughness={0.7} />
      )}
    </mesh>
  );
}
