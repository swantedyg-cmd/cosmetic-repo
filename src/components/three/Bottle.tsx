"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import type { BottleShape, Product } from "@/data/products";
import { createLabelTexture } from "./label";
import { damp, speed } from "./motion";

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
  /** 0 → 1: how far the closure has lifted off to show what's inside. Read every frame. */
  open?: { current: number };
  /** 1 on a press, decays to 0: squeezes the pump or dropper bulb. Read every frame. */
  press?: { current: number };
  /** Rising bubbles inside clear liquids. Off for small or distant bottles. */
  bubbles?: boolean;
};

const capMaterial = { color: "#0d1717", roughness: 0.5, metalness: 0.05 };
const metalMaterial = { color: "#d6c3a5", roughness: 0.22, metalness: 1 };

export default function Bottle({ product, color, glass = "native", lowQuality, open, press, bubbles }: BottleProps) {
  const fillMat = useRef<THREE.MeshPhysicalMaterial>(null);
  const closure = useRef<THREE.Group>(null);
  const squeeze = useRef<THREE.Group>(null);
  const tint = color ?? product.color;
  const target = useMemo(() => new THREE.Color(tint), [tint]);
  const cream = product.shape === "jar";
  const neck = product.shape === "stick" ? 0 : PROFILES[product.shape].glass.at(-1)![1];

  useFrame((_, dt) => {
    const m = fillMat.current;
    const o = open?.current ?? 0;
    if (m) {
      m.color.lerp(target, Math.min(1, dt * 4));
      // A little self-light so the liquid glows like it's backlit, brighter once it's opened.
      m.emissive.copy(m.color).multiplyScalar((cream ? 0.04 : 0.22) + o * 0.18);
    }
    // The closure lifts straight up, then tips back on its rim as if set aside.
    const c = closure.current;
    if (c) {
      c.position.y = damp(c.position.y, neck + o * (cream ? 0.9 : 0.75), speed.quick, dt);
      c.position.x = damp(c.position.x, o * (cream ? 0.35 : 0.22), speed.quick, dt);
      c.rotation.z = damp(c.rotation.z, -o * (cream ? 0.5 : 0.38), speed.quick, dt);
    }
    // A press squashes the closure down towards the neck, then it springs back.
    if (squeeze.current) squeeze.current.scale.y = 1 - (press?.current ?? 0) * 0.22;
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

  if (product.shape === "stick") return <Stick product={product} fill={fill} open={open} />;

  const profile = PROFILES[product.shape];
  return (
    <group position-y={(-profile.height / 2) * profile.scale} scale={profile.scale}>
      <Glass points={profile.glass} mode={glass} lowQuality={lowQuality} />
      <Slosh points={profile.fill}>
        <LatheMesh points={profile.fill}>{fill}</LatheMesh>
        {bubbles && !cream && <Bubbles points={profile.fill} color={tint} />}
      </Slosh>
      <Label product={product} {...profile.label} />
      {/* Closure pivots at the neck so it can lift and tip off. */}
      <group ref={closure} position-y={neck}>
        <group ref={squeeze}>
        <group position-y={-neck}>
          {product.shape === "dropper" && <DropperCap />}
          {product.shape === "pump" && <PumpHead />}
          {product.shape === "jar" && <JarLid />}
        </group>
        </group>
      </group>
    </group>
  );
}

/**
 * Liquid inertia: when the bottle is moved or tipped, the fill lags behind and
 * rocks back to level on a soft spring, the way a half-full serum does in the hand.
 */
function Slosh({ points, children }: { points: [number, number][]; children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const top = points.reduce((m, [, y]) => Math.max(m, y), 0);
  const bottom = points.reduce((m, [, y]) => Math.min(m, y), top);
  const pivot = (top + bottom) / 2;
  const state = useRef({ init: false, px: 0, py: 0, vx: 0, vy: 0, ax: 0, az: 0, wx: 0, wz: 0 });
  const world = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(delta, 1 / 30);
    const st = state.current;
    g.getWorldPosition(world);
    if (!st.init) {
      st.px = world.x;
      st.py = world.y;
      st.init = true;
    }
    const vx = (world.x - st.px) / dt;
    const vy = (world.y - st.py) / dt;
    st.px = world.x;
    st.py = world.y;
    // Acceleration kicks the surface the other way; a damped spring brings it home.
    const kick = THREE.MathUtils.clamp((vx - st.vx) * 0.6, -6, 6);
    const lift = THREE.MathUtils.clamp((vy - st.vy) * 0.25, -6, 6);
    st.vx = vx;
    st.vy = vy;
    st.wz += (kick - st.az * 60 - st.wz * 5) * dt;
    st.wx += (lift * 0.4 - st.ax * 60 - st.wx * 5) * dt;
    st.az = THREE.MathUtils.clamp(st.az + st.wz * dt, -0.14, 0.14);
    st.ax = THREE.MathUtils.clamp(st.ax + st.wx * dt, -0.1, 0.1);
    g.rotation.set(st.ax, 0, st.az);
  });

  return (
    <group ref={group} position-y={pivot}>
      <group position-y={-pivot}>{children}</group>
    </group>
  );
}

const BUBBLES = 14;

/** A few slow bubbles drifting up through the liquid, so it reads as fluid rather than solid. */
function Bubbles({ points, color }: { points: [number, number][]; color: string }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const radius = points.reduce((m, [x]) => Math.max(m, x), 0) * 0.75;
  const top = points.reduce((m, [, y]) => Math.max(m, y), 0) - 0.04;
  const bottom = points.reduce((m, [, y]) => Math.min(m, y), top) + 0.06;
  const seeds = useMemo(
    () =>
      Array.from({ length: BUBBLES }, (_, i) => {
        // Deterministic scatter so server and client agree and nothing reshuffles on re-render.
        const r = (n: number) => (Math.sin(i * 127.1 + n * 311.7) * 43758.5453) % 1;
        const a = Math.abs(r(1)) * Math.PI * 2;
        const d = Math.sqrt(Math.abs(r(2))) * radius;
        return { x: Math.cos(a) * d, z: Math.sin(a) * d, phase: Math.abs(r(3)), speed: 0.05 + Math.abs(r(4)) * 0.08, size: 0.012 + Math.abs(r(5)) * 0.022 };
      }),
    [radius],
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tint = useMemo(() => new THREE.Color(color).lerp(new THREE.Color("#ffffff"), 0.7), [color]);

  useFrame((state) => {
    const m = mesh.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    seeds.forEach((b, i) => {
      const k = (b.phase + t * b.speed) % 1;
      dummy.position.set(b.x + Math.sin(t * 2 + i) * 0.015, bottom + k * (top - bottom), b.z);
      // Bubbles swell slightly as they rise and vanish at the surface.
      dummy.scale.setScalar(b.size * (0.6 + k * 0.6) * (k > 0.94 ? (1 - k) / 0.06 : 1));
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, BUBBLES]} frustumCulled={false}>
      <sphereGeometry args={[1, 10, 8]} />
      <meshStandardMaterial color={tint} emissive={tint} emissiveIntensity={0.5} roughness={0.1} transparent opacity={0.75} />
    </instancedMesh>
  );
}

/** Metal collar with fine vertical ridges, like a crimped dropper or pump ring. */
function knurled(radius: number, height: number, ridges = 64) {
  const geo = new THREE.CylinderGeometry(radius, radius, height, ridges * 4, 1);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const r = Math.hypot(v.x, v.z);
    if (r < radius * 0.5) continue; // cap centres
    const a = Math.atan2(v.z, v.x);
    const k = 1 + 0.035 * Math.max(0, Math.cos(a * ridges));
    pos.setXYZ(i, (v.x / r) * radius * k, v.y, (v.z / r) * radius * k);
  }
  geo.computeVertexNormals();
  return geo;
}

function Knurled({ radius, height, y }: { radius: number; height: number; y: number }) {
  const geo = useMemo(() => knurled(radius, height), [radius, height]);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <mesh geometry={geo} position-y={y}>
      <meshStandardMaterial {...metalMaterial} />
    </mesh>
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
      <Knurled radius={0.26} height={0.22} y={0.11} />
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
      <Knurled radius={0.22} height={0.16} y={0.08} />
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

function Stick({ product, fill, open }: { product: Product; fill: React.ReactNode; open?: { current: number } }) {
  const bullet = useLathe(STICK_BULLET);
  const ref = useRef<THREE.Mesh>(null);

  // Opening a balm twists the bullet up out of its case.
  useFrame((_, dt) => {
    const o = open?.current ?? 0;
    if (!ref.current) return;
    ref.current.position.y = damp(ref.current.position.y, 1.18 + o * 0.28, speed.quick, dt);
    ref.current.rotation.y = damp(ref.current.rotation.y, o * Math.PI, speed.base, dt);
  });
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
      <mesh ref={ref} geometry={bullet} position-y={1.18}>
        {fill}
      </mesh>
    </group>
  );
}

/** Height of the opening above a bottle's centre: where the formula rises out from. */
export function mouthY(shape: BottleShape) {
  if (shape === "stick") return 0.88;
  const p = PROFILES[shape];
  return (p.glass.at(-1)![1] - p.height / 2) * p.scale;
}

/** Distance from a bottle's centre to its base, for placing shadows and plinths. */
export function baseOffset(shape: BottleShape) {
  if (shape === "stick") return 0.9;
  const p = PROFILES[shape];
  return (p.height / 2) * p.scale;
}
