"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import Bottle, { baseOffset } from "./Bottle";
import Studio from "./Studio";
import { getProduct, type Product } from "@/data/products";

// The hero is staged like an editorial beauty shot: the whole range on plinths
// in a warm cyclorama, lit by a soft orange strobe that slowly pulses.

const FLOOR = -1.6;

const SET: { slug: string; x: number; z: number; plinth: number; radius: number }[] = [
  { slug: "veil-barrier-cream", x: -1.35, z: 0.35, plinth: 0.45, radius: 0.86 },
  { slug: "dew-serum", x: 0.1, z: -0.7, plinth: 1.25, radius: 0.62 },
  { slug: "ember-facial-oil", x: 1.45, z: 0.55, plinth: 0.75, radius: 0.72 },
  { slug: "tint-balm", x: 2.75, z: 0.05, plinth: 0.3, radius: 0.46 },
];

type Props = { quality: "high" | "low"; reducedMotion: boolean; active: boolean };

export default function HeroStudio({ quality, reducedMotion, active }: Props) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, quality === "high" ? 1.75 : 1.25]}
      camera={{ position: [0, 0.5, 11], fov: 28 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
    >
      <Backdrop reducedMotion={reducedMotion} />
      <Studio />
      <Strobe reducedMotion={reducedMotion} />
      <Rig reducedMotion={reducedMotion}>
        {SET.map((item, i) => (
          <Piece
            key={item.slug}
            product={getProduct(item.slug)!}
            index={i}
            {...item}
            quality={quality}
            reducedMotion={reducedMotion}
          />
        ))}
        <ContactShadows
          position={[0.7, FLOOR + 0.001, 0]}
          opacity={0.45}
          scale={12}
          blur={2.4}
          far={3}
          color="#7a2e0c"
          frames={reducedMotion ? 1 : Infinity}
        />
      </Rig>
    </Canvas>
  );
}

/** Positions the set for the viewport and drifts the camera with the pointer. */
function Rig({ children, reducedMotion }: { children: React.ReactNode; reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const wide = viewport.aspect > 1.1;
  // Fit the ~5 unit wide set into the frame; on desktop it sits right of the headline.
  // Scale against both axes so caps never slide under the header on short screens.
  const scale = wide
    ? Math.min(0.85, viewport.width / 12.5, viewport.height / 5.6)
    : Math.min(0.72, viewport.width / 6.8, viewport.height / 8.5);
  // The set spans roughly x -2.2 → 3.2, so shift it left by its centre (0.5) on phones.
  const offsetX = wide ? viewport.width * 0.06 : -0.5 * scale;
  const offsetY = wide ? -viewport.height * 0.1 : viewport.height * 0.06;
  const start = useRef<number | null>(null);

  useFrame((state) => {
    if (start.current === null) start.current = state.clock.elapsedTime;
    const t = state.clock.elapsedTime - start.current;
    // Intro dolly: the camera eases in from further back.
    const intro = reducedMotion ? 1 : 1 - Math.pow(1 - Math.min(1, t / 2.4), 4);
    const px = reducedMotion ? 0 : state.pointer.x * 0.45;
    const py = reducedMotion ? 0 : state.pointer.y * 0.2;
    const cam = state.camera;
    cam.position.x = THREE.MathUtils.lerp(cam.position.x, px, 0.04);
    cam.position.y = THREE.MathUtils.lerp(cam.position.y, 0.5 + py, 0.04);
    cam.position.z = 11 - intro * 1.6;
    cam.lookAt(0, -0.25, 0);
  });

  return (
    <group ref={group} position={[offsetX, offsetY, 0]} scale={scale}>
      {children}
    </group>
  );
}

function Piece({
  product,
  index,
  x,
  z,
  plinth,
  radius,
  quality,
  reducedMotion,
}: {
  product: Product;
  index: number;
  x: number;
  z: number;
  plinth: number;
  radius: number;
  quality: "high" | "low";
  reducedMotion: boolean;
}) {
  const router = useRouter();
  const plinthRef = useRef<THREE.Mesh>(null);
  const bottle = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const start = useRef<number | null>(null);
  const spin = useRef(0);

  useFrame((state, dt) => {
    if (!plinthRef.current || !bottle.current) return;
    if (start.current === null) start.current = state.clock.elapsedTime;
    const t = state.clock.elapsedTime - start.current;

    // Staggered rise: plinth grows out of the floor, then the bottle settles onto it.
    const rise = (delay: number) =>
      reducedMotion ? 1 : 1 - Math.pow(1 - THREE.MathUtils.clamp((t - delay) / 1.3, 0, 1), 4);
    const p = rise(0.15 + index * 0.14);
    const b = rise(0.55 + index * 0.14);

    const h = Math.max(0.001, plinth * p);
    plinthRef.current.scale.y = h;
    plinthRef.current.position.y = FLOOR + h / 2;

    const top = FLOOR + h + baseOffset(product.shape);
    const lift = hovered ? 0.14 : 0;
    bottle.current.position.y = THREE.MathUtils.lerp(
      bottle.current.position.y,
      top + lift + (1 - b) * 1.2,
      b < 1 ? 1 : Math.min(1, dt * 6),
    );
    bottle.current.scale.setScalar(Math.max(0.001, b));

    // Idle sway keeps the label mostly facing the camera; hover turns it a full lap.
    if (hovered) spin.current += dt * 3.2;
    else spin.current = THREE.MathUtils.lerp(spin.current, Math.round(spin.current / (Math.PI * 2)) * Math.PI * 2, dt * 2);
    const sway = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.45 + index * 1.7) * 0.4;
    bottle.current.rotation.y = sway + spin.current;
  });

  return (
    <group position={[x, 0, z]}>
      <mesh ref={plinthRef} position-y={FLOOR}>
        <cylinderGeometry args={[radius, radius, 1, 96]} />
        <meshStandardMaterial color="#fbeee4" roughness={0.9} emissive="#f6d9c6" emissiveIntensity={0.25} />
      </mesh>
      <group
        ref={bottle}
        position-y={FLOOR}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "";
        }}
        onClick={() => {
          document.body.style.cursor = "";
          router.push(`/shop/${product.slug}`);
        }}
      >
        <Bottle product={product} glass={quality === "high" ? "native" : "simple"} />
      </group>
    </group>
  );
}

/** Warm point light behind the set, pulsing like a slow studio strobe. */
function Strobe({ reducedMotion }: { reducedMotion: boolean }) {
  const light = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    if (!light.current) return;
    const pulse = reducedMotion ? 0.5 : (Math.sin(state.clock.elapsedTime * 1.2) + 1) / 2;
    light.current.intensity = 18 + pulse * 22;
  });
  return <pointLight ref={light} position={[1.2, 1.5, -2.5]} color="#f7651a" distance={14} decay={1.6} />;
}

const backdropVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const backdropFragment = /* glsl */ `
  uniform float uPulse;
  uniform float uAspect;
  varying vec2 vUv;
  void main() {
    vec3 top = vec3(0.996, 0.957, 0.929);
    vec3 bottom = vec3(0.973, 0.82, 0.733);
    vec3 glow = vec3(0.969, 0.396, 0.102);
    vec3 col = mix(bottom, top, smoothstep(0.05, 0.85, vUv.y));
    vec2 p = vec2((vUv.x - 0.6) * uAspect, vUv.y - 0.42);
    float g = exp(-dot(p, p) * 7.0);
    col = mix(col, glow, g * (0.32 + uPulse * 0.22));
    gl_FragColor = vec4(col, 1.0);
  }
`;

/** Full-frame gradient cyclorama with an orange glow that breathes with the strobe. */
function Backdrop({ reducedMotion }: { reducedMotion: boolean }) {
  const { viewport } = useThree();
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uPulse: { value: 0.5 }, uAspect: { value: 1 } }), []);
  const v = viewport.getCurrentViewport(undefined, new THREE.Vector3(0, 0, -6));

  useFrame((state) => {
    const u = material.current?.uniforms;
    if (!u) return;
    u.uPulse.value = reducedMotion ? 0.5 : (Math.sin(state.clock.elapsedTime * 1.2) + 1) / 2;
    u.uAspect.value = v.width / v.height;
  });

  return (
    <mesh position={[0, 0, -6]} scale={[v.width * 1.4, v.height * 1.4, 1]}>
      <planeGeometry />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={backdropVertex}
        fragmentShader={backdropFragment}
        toneMapped={false}
        depthWrite={false}
      />
    </mesh>
  );
}
