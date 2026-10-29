"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import Bottle, { baseOffset } from "./Bottle";
import { FAMILY, loadFonts } from "./label";
import { damp, ease, span, speed } from "./motion";
import type { Product } from "@/data/products";

// A lacquered gift box tied in gold satin. Scrolling unties the ribbon, lifts the lid
// back to show its velvet lining, and raises the three bottles out of their bed.

const GOLD = "#d6b47c";
/** Box body, in scene units. The lid overhangs it by LID_T on every side. */
const W = 3.6;
const D = 1.5;
const H = 1.5;
const WALL = 0.07;
const LID_T = 0.04;
const LID_SKIRT = 0.38;
const LID_TOP = 0.06;
/** Where the lid sits when closed: its skirt overlaps the top of the walls. */
const LID_REST = H - 0.3;
const LID_HEIGHT = LID_SKIRT + LID_TOP;
const RIBBON_W = 0.28;
const RIBBON_T = 0.012;
const BOTTLE_SCALE = 0.6;
/** Bottle slots across the box, left to right. */
const SLOTS = [-1.1, 0, 1.1];

type Props = {
  products: Product[];
  /** Scroll progress through the section, 0 → 1. Read every frame. */
  progress: { current: number };
  quality: "high" | "low";
  reducedMotion: boolean;
  active: boolean;
};

export default function CoffretScene({ quality, active, ...props }: Props) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, quality === "high" ? 1.6 : 1.25]}
      camera={{ position: [0, 3.8, 10], fov: 30 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
    >
      <ambientLight intensity={0.2} />
      <spotLight position={[1, 7, 5]} angle={0.45} penumbra={1} intensity={110} color="#fff1dc" />
      <pointLight position={[0, 2, -3]} color={GOLD} intensity={5} distance={10} />
      {/* Long gold strips give the lacquer and the trims a highlight to catch on black. */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={2.6} position={[0, 5, 2]} scale={[8, 1.2, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" color={GOLD} intensity={2.4} position={[-5, 1.5, 1]} scale={[0.5, 6, 1]} rotation-y={Math.PI / 2} />
        <Lightformer form="rect" color={GOLD} intensity={2.4} position={[5, 1.5, 1]} scale={[0.5, 6, 1]} rotation-y={-Math.PI / 2} />
        <Lightformer form="rect" intensity={1.6} position={[0, 2, 6]} scale={[5, 2, 1]} />
        {/* A warm softbox up front and to the left, so the lacquer faces carry a long gold gradient. */}
        <Lightformer form="rect" color={GOLD} intensity={1.8} position={[-4, 3, 5]} scale={[3, 4, 1]} rotation-y={-0.7} />
      </Environment>

      <Rig {...props} quality={quality} />
    </Canvas>
  );
}

/** Fits the box to the viewport, follows scroll with a smoothed value, and dollies the camera. */
function Rig({ products, progress, quality, reducedMotion }: Omit<Props, "active">) {
  const { viewport } = useThree();
  const wide = viewport.aspect > 1.1;
  // Desktop keeps the left of the frame for the copy; phones centre the box above it.
  const scale = wide ? Math.min(0.62, viewport.width / 14) : Math.min(0.55, viewport.width / 7);
  const x = wide ? viewport.width * 0.16 : 0;
  const y = wide ? -0.6 : 0.5;
  const t = useRef(0);
  const box = useRef<THREE.Group>(null);

  useFrame((state, dt) => {
    t.current = reducedMotion ? progress.current : damp(t.current, progress.current, speed.base, dt);
    const p = t.current;
    const b = box.current;
    if (b) {
      // A three-quarter view while wrapped, turning almost square-on as it opens.
      const idle = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.4) * 0.05;
      b.rotation.y = THREE.MathUtils.lerp(0.62, -0.1, ease.inOutCubic(p)) + idle;
    }
    const px = reducedMotion ? 0 : state.pointer.x * 0.4;
    const py = reducedMotion ? 0 : state.pointer.y * 0.2;
    const cam = state.camera;
    cam.position.x = damp(cam.position.x, px, speed.slow, dt);
    cam.position.y = damp(cam.position.y, THREE.MathUtils.lerp(3.8, 2.9, p) + py, speed.slow, dt);
    cam.position.z = THREE.MathUtils.lerp(10, 9, ease.inOutCubic(p));
    cam.lookAt(wide ? x * 0.35 : 0, 0.4, 0);
  });

  return (
    <group position={[x, y, 0]} scale={scale}>
      <group ref={box}>
        <Body />
        <Lid t={t} reducedMotion={reducedMotion} />
        <Ribbon t={t} />
        {products.map((product, i) => (
          <Riser key={product.slug} product={product} index={i} t={t} quality={quality} reducedMotion={reducedMotion} />
        ))}
      </group>
      <Glow />
      <Sparkles
        count={quality === "high" ? 60 : 24}
        position={[0, 2, 0]}
        scale={[7, 4, 4]}
        size={2.2}
        speed={reducedMotion ? 0 : 0.2}
        opacity={0.75}
        color={GOLD}
      />
    </group>
  );
}

function useMaterials() {
  return useMemo(
    () => ({
      lacquer: new THREE.MeshPhysicalMaterial({ color: "#182422", roughness: 0.32, metalness: 0.35, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.6 }),
      gold: new THREE.MeshStandardMaterial({ color: GOLD, metalness: 1, roughness: 0.2 }),
      // Deep ember velvet: a soft sheen that brightens at grazing angles.
      velvet: new THREE.MeshPhysicalMaterial({
        color: "#3d1209",
        roughness: 1,
        sheen: 1,
        sheenColor: new THREE.Color("#f15730"),
        sheenRoughness: 0.45,
        side: THREE.BackSide,
      }),
    }),
    [],
  );
}

/** The open-top box: lacquer walls, a velvet-lined interior and gold trim along the rim and base. */
function Body() {
  const m = useMaterials();
  const half = { w: W / 2, d: D / 2 };

  return (
    <group>
      <mesh material={m.lacquer} position-y={WALL / 2}>
        <boxGeometry args={[W, WALL, D]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={`x${s}`} material={m.lacquer} position={[s * (half.w - WALL / 2), H / 2, 0]}>
          <boxGeometry args={[WALL, H, D]} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={`z${s}`} material={m.lacquer} position={[0, H / 2, s * (half.d - WALL / 2)]}>
          <boxGeometry args={[W - WALL * 2, H, WALL]} />
        </mesh>
      ))}
      {/* Back faces of an inset box read as the lining: floor and inner walls in one mesh. */}
      <mesh material={m.velvet} position-y={WALL + (H - WALL) / 2 - 0.001}>
        <boxGeometry args={[W - WALL * 2 - 0.004, H - WALL, D - WALL * 2 - 0.004]} />
      </mesh>
      <Trim y={H} w={W} d={D} />
      <Trim y={0.02} w={W + 0.01} d={D + 0.01} />
    </group>
  );
}

/** A thin gold rectangle of rods tracing the box outline at height y. */
function Trim({ y, w, d, r = 0.022 }: { y: number; w: number; d: number; r?: number }) {
  const m = useMaterials();
  return (
    <group position-y={y}>
      {[-1, 1].map((s) => (
        <mesh key={`a${s}`} material={m.gold} position={[0, 0, (s * d) / 2]}>
          <boxGeometry args={[w + r * 2, r * 2, r * 2]} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={`b${s}`} material={m.gold} position={[(s * w) / 2, 0, 0]}>
          <boxGeometry args={[r * 2, r * 2, d]} />
        </mesh>
      ))}
    </group>
  );
}

function Lid({ t, reducedMotion }: { t: { current: number }; reducedMotion: boolean }) {
  const m = useMaterials();
  const lid = useRef<THREE.Group>(null);
  const lw = W + LID_T * 2;
  const ld = D + LID_T * 2;
  const monogram = useMemo(() => createMonogramTexture(), []);
  const underside = useMemo(() => {
    const v = m.velvet.clone();
    v.side = THREE.FrontSide;
    return v;
  }, [m]);

  useFrame((state) => {
    const g = lid.current;
    if (!g) return;
    const lift = ease.inOutCubic(span(t.current, 0.2, 0.46));
    const float = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.8) * 0.05 * lift;
    g.position.set(0, LID_REST + lift * 2.1 + float, -lift * 1.25);
    // Front edge up, so the velvet underside turns towards the camera.
    g.rotation.x = -lift * 0.95;
  });

  return (
    <group ref={lid} position-y={LID_REST}>
      <mesh material={m.lacquer} position-y={LID_SKIRT + LID_TOP / 2}>
        <boxGeometry args={[lw, LID_TOP, ld]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={`x${s}`} material={m.lacquer} position={[(s * (lw - WALL)) / 2, LID_SKIRT / 2, 0]}>
          <boxGeometry args={[WALL, LID_SKIRT, ld]} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={`z${s}`} material={m.lacquer} position={[0, LID_SKIRT / 2, (s * (ld - WALL)) / 2]}>
          <boxGeometry args={[lw - WALL * 2, LID_SKIRT, WALL]} />
        </mesh>
      ))}
      <mesh material={underside} position-y={LID_SKIRT - 0.002} rotation-x={Math.PI / 2}>
        <planeGeometry args={[lw - WALL * 2, ld - WALL * 2]} />
      </mesh>
      {/* Gold-foil monogram, stamped on the lid. */}
      <mesh position-y={LID_HEIGHT + 0.002} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[lw * 0.92, ld * 0.86]} />
        <meshStandardMaterial map={monogram} emissiveMap={monogram} emissive={GOLD} emissiveIntensity={0.35} transparent color={GOLD} metalness={0.7} roughness={0.3} />
      </mesh>
      <Trim y={LID_HEIGHT} w={lw} d={ld} r={0.016} />
      <Trim y={0.01} w={lw} d={ld} r={0.016} />
    </group>
  );
}

/** Wordmark and a hairline frame in white on transparent; the material tints it gold. */
function createMonogramTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = Math.round(2048 * (D / W));
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  const draw = () => {
    const ctx = canvas.getContext("2d")!;
    const { width: cw, height: ch } = canvas;
    ctx.clearRect(0, 0, cw, ch);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 40, cw - 80, ch - 80);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(58, 58, cw - 116, ch - 116);
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `200 ${ch * 0.3}px ${FAMILY}, sans-serif`;
    ctx.letterSpacing = `${ch * 0.06}px`;
    ctx.fillText("SOLENNE", cw / 2 + ch * 0.03, ch * 0.47);
    ctx.font = `500 ${ch * 0.055}px ${FAMILY}, sans-serif`;
    ctx.letterSpacing = `${ch * 0.03}px`;
    ctx.fillText("THE EVENING COFFRET", cw / 2, ch * 0.74);
    texture.needsUpdate = true;
  };
  // Draw now with the fallback face, again once the brand font is in.
  draw();
  loadFonts().then(draw);
  return texture;
}

function createSatin() {
  return new THREE.MeshPhysicalMaterial({
    color: "#c9a46a",
    metalness: 0.35,
    roughness: 0.35,
    sheen: 1,
    sheenColor: new THREE.Color("#fff1dc"),
    transparent: true,
  });
}

/** Gold satin tied round lid and box. It slides down and fades as the box is untied. */
function Ribbon({ t }: { t: { current: number } }) {
  const group = useRef<THREE.Group>(null);
  const bow = useRef<THREE.Group>(null);
  /** Every ribbon piece shares one material; reached through this band to fade it. */
  const band = useRef<THREE.Mesh>(null);
  const satin = useMemo(() => createSatin(), []);
  const top = LID_REST + LID_HEIGHT;
  const ox = W / 2 + LID_T + RIBBON_T;
  const oz = D / 2 + LID_T + RIBBON_T;

  useFrame(() => {
    const u = ease.inOutCubic(span(t.current, 0.03, 0.22));
    const opacity = 1 - span(u, 0.45, 1);
    const mat = band.current?.material as THREE.MeshPhysicalMaterial | undefined;
    if (mat) mat.opacity = opacity;
    const g = group.current;
    if (g) {
      g.position.y = -u * 0.5;
      g.visible = opacity > 0.01;
    }
    const b = bow.current;
    if (b) {
      const s = 1 - ease.outQuart(span(u, 0, 0.6));
      b.scale.setScalar(Math.max(s, 0.001));
      b.rotation.y = u * 1.4;
      b.position.y = top + u * 0.6;
    }
  });

  return (
    <group ref={group}>
      {/* Two bands crossing over the lid and running down every side. */}
      <mesh ref={band} material={satin} position-y={top + RIBBON_T / 2}>
        <boxGeometry args={[ox * 2, RIBBON_T, RIBBON_W]} />
      </mesh>
      <mesh material={satin} position-y={top + RIBBON_T}>
        <boxGeometry args={[RIBBON_W, RIBBON_T, oz * 2]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={`x${s}`} material={satin} position={[s * ox, top / 2, 0]}>
          <boxGeometry args={[RIBBON_T, top, RIBBON_W]} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={`z${s}`} material={satin} position={[0, top / 2, s * oz]}>
          <boxGeometry args={[RIBBON_W, top, RIBBON_T]} />
        </mesh>
      ))}
      <group ref={bow} position-y={top}>
        {[-1, 1].map((s) => (
          <mesh key={s} material={satin} position={[s * 0.26, 0.1, 0]} rotation={[Math.PI / 2, s * 0.35, 0]} scale={[1, 0.38, 1]}>
            <torusGeometry args={[0.24, 0.05, 12, 40]} />
          </mesh>
        ))}
        <mesh material={satin} position-y={0.08} scale={[1, 0.6, 1]}>
          <sphereGeometry args={[0.09, 20, 14]} />
        </mesh>
      </group>
    </group>
  );
}

/** One bottle, resting in the velvet bed until its turn to rise out of the box. */
function Riser({
  product,
  index,
  t,
  quality,
  reducedMotion,
}: {
  product: Product;
  index: number;
  t: { current: number };
  quality: "high" | "low";
  reducedMotion: boolean;
}) {
  const g = useRef<THREE.Group>(null);
  const open = useRef(0);
  const rest = WALL + baseOffset(product.shape) * BOTTLE_SCALE;
  const slot = SLOTS[index];
  const centre = index === 1;

  useFrame((state) => {
    const b = g.current;
    if (!b) return;
    const start = 0.42 + index * 0.07;
    const rise = ease.outQuart(span(t.current, start, start + 0.26));
    // Rise clear of the rim, step forward, and fan out a little to face the camera.
    const bob = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.9 + index * 1.7) * 0.03 * rise;
    b.position.set(slot * (1 + rise * 0.28), rest + rise * (centre ? 1.45 : 1.15) + bob, rise * (centre ? 1.1 : 0.85));
    b.rotation.y = -slot * 0.22 * rise;
    // The centre formula opens last, so the section ends on what's inside.
    open.current = centre ? ease.inOutCubic(span(t.current, 0.84, 0.96)) * 0.6 : 0;
  });

  return (
    <group ref={g} position={[slot, rest, 0]} scale={BOTTLE_SCALE}>
      <Bottle product={product} glass={quality === "high" ? "native" : "simple"} lowQuality={quality === "low"} open={open} />
    </group>
  );
}

/** A pool of warm light on the floor under the box. Additive, so it only ever brightens. */
function Glow() {
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "rgba(214,180,124,0.55)");
    g.addColorStop(0.45, "rgba(214,180,124,0.16)");
    g.addColorStop(1, "rgba(214,180,124,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  return (
    <mesh rotation-x={-Math.PI / 2} position-y={-0.01} scale={[9, 5, 1]}>
      <planeGeometry />
      <meshBasicMaterial map={texture} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </mesh>
  );
}
