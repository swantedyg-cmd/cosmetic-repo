"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, OrbitControls, RoundedBox, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import SceneCanvas from "./SceneCanvas";
import Studio from "./Studio";
import { baseOffset } from "./Bottle";
import { OpenableFormula } from "./ProductViewer";
import { ease, introDelay, span } from "./motion";
import type { Product } from "@/data/products";

// What a scan opens on: the code that was just scanned appears on screen, a scan line
// reads it, then every module peels off and spirals into the glass as the bottle forms.

/** Shared clock for the reveal. `start` is null until the first frame (or after a replay). */
export type Timeline = { start: number | null; skip: boolean };

/** Seconds into the reveal. */
const T = {
  scanFrom: 0.15,
  scanTo: 0.95,
  peel: 0.95,
  /** Centre tiles leave first; the outer edge leaves this much later. */
  ripple: 0.6,
  flight: 1.15,
  bottleFrom: 1.45,
  bottleTo: 2.6,
  formed: 2.5,
};

const GRID = 2.3;
const GRID_Z = 0.95;
const INK = new THREE.Color("#0d1717");

type Props = {
  product: Product;
  color: string;
  modules: string[];
  quality: "high" | "low";
  reducedMotion: boolean;
  opened: boolean;
  timeline: { current: Timeline };
  formed: boolean;
  onFormed: () => void;
  background: string;
};

/** Seconds since the reveal started; a skipped or reduced-motion reveal is already over. */
function elapsed(tl: Timeline, now: number, reducedMotion: boolean) {
  // Test hook: screenshots set window.__scanT to freeze the reveal at a given second.
  const frozen = (globalThis as { __scanT?: number }).__scanT;
  if (typeof frozen === "number") return frozen;
  if (reducedMotion || tl.skip) return 99;
  if (tl.start === null) tl.start = now + introDelay();
  return Math.max(0, now - tl.start);
}

export default function ScanScene({ product, color, modules, quality, reducedMotion, opened, timeline, formed, onFormed, background }: Props) {
  return (
    <SceneCanvas
      quality={quality}
      camera={{ position: [0, 0.3, 5.6], fov: 30 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
    >
      <color attach="background" args={[background]} />
      <Studio />
      <pointLight position={[0, 1, -3]} color="#f7651a" intensity={20} distance={10} />
      <Fit width={2.9}>
        <Assemble timeline={timeline} reducedMotion={reducedMotion} onFormed={onFormed}>
          <OpenableFormula product={product} color={color} quality={quality} reducedMotion={reducedMotion} opened={opened} />
        </Assemble>
      </Fit>
      {/* The code sits nearer the camera, so it needs more room than the bottle. */}
      <Fit width={3.5}>
        <Code modules={modules} color={color} shape={product.shape} timeline={timeline} reducedMotion={reducedMotion} />
      </Fit>
      <Sparkles count={quality === "high" ? 40 : 16} scale={[4, 3.5, 3]} size={2} speed={reducedMotion ? 0 : 0.2} opacity={0.5} color="#ffb48f" />
      <ContactShadows position={[0, -baseOffset(product.shape) - 0.02, 0]} opacity={0.4} scale={6} blur={2.4} far={2} color="#7a2e0c" />
      <OrbitControls
        enabled={formed}
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.8}
        autoRotate={formed && !reducedMotion && !opened}
        autoRotateSpeed={0.7}
      />
    </SceneCanvas>
  );
}

/** Shrinks the set on narrow phones so the whole code fits before it breaks apart. */
function Fit({ children, width }: { children: React.ReactNode; width: number }) {
  const { viewport } = useThree();
  const s = Math.min(1, viewport.width / width, viewport.height / 3.3);
  return <group scale={s}>{children}</group>;
}

/** The bottle grows out of the converging modules with a little overshoot and a turn. */
function Assemble({
  children,
  timeline,
  reducedMotion,
  onFormed,
}: {
  children: React.ReactNode;
  timeline: { current: Timeline };
  reducedMotion: boolean;
  onFormed: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const told = useRef<Timeline["start"] | "done" | undefined>(undefined);

  useFrame((state) => {
    const t = elapsed(timeline.current, state.clock.elapsedTime, reducedMotion);
    const g = group.current;
    if (!g) return;
    const k = span(t, T.bottleFrom, T.bottleTo);
    const s = ease.outBack(k);
    g.scale.setScalar(Math.max(0.0001, s));
    g.visible = k > 0;
    g.rotation.y = -(1 - ease.outQuart(k)) * Math.PI * 1.2;
    g.position.y = (1 - ease.outQuart(k)) * -0.35;
    // Report once per run, when the glass has (almost) settled.
    const run = timeline.current.skip ? "done" : timeline.current.start;
    if (t >= T.formed && told.current !== run) {
      told.current = run;
      onFormed();
    }
  });
  return <group ref={group}>{children}</group>;
}

type Tile = {
  start: THREE.Vector3;
  angle: number;
  radius: number;
  y: number;
  delay: number;
  axis: THREE.Vector3;
};

function Code({
  modules,
  color,
  shape,
  timeline,
  reducedMotion,
}: {
  modules: string[];
  color: string;
  shape: Product["shape"];
  timeline: { current: Timeline };
  reducedMotion: boolean;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const card = useRef<THREE.Mesh>(null);
  const line = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.Mesh>(null);
  const size = modules.length;
  const cell = GRID / size;
  const half = baseOffset(shape);
  const tint = useMemo(() => new THREE.Color(color), [color]);

  const tiles = useMemo(() => {
    // Seeded, so every visit plays the same choreography.
    let seed = 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    const list: Tile[] = [];
    const mid = (size - 1) / 2;
    const far = Math.hypot(mid, mid);
    modules.forEach((row, y) => {
      for (let x = 0; x < size; x++) {
        if (row[x] !== "1") continue;
        const dist = Math.hypot(x - mid, y - mid) / far;
        list.push({
          start: new THREE.Vector3((x - mid) * cell, (mid - y) * cell + 0.1, GRID_Z),
          // Each lands somewhere on the glass, so the bottle looks built from them.
          angle: rand() * Math.PI * 2,
          radius: 0.35 + rand() * 0.25,
          y: -half * 0.85 + rand() * half * 1.6,
          delay: T.peel + dist * T.ripple + rand() * 0.12,
          axis: new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize(),
        });
      }
    });
    return list;
  }, [modules, size, cell, half]);

  const last = useMemo(() => Math.max(...tiles.map((t) => t.delay)) + T.flight, [tiles]);
  const scratch = useMemo(
    () => ({ m: new THREE.Matrix4(), q: new THREE.Quaternion(), p: new THREE.Vector3(), s: new THREE.Vector3(), c: new THREE.Color() }),
    [],
  );

  // Colours exist before the first compile, so the instanced-colour shader is built up front.
  useLayoutEffect(() => {
    const m = mesh.current;
    if (!m) return;
    tiles.forEach((tile, n) => {
      scratch.m.makeScale(cell * 0.86, cell * 0.86, cell * 0.3).setPosition(tile.start);
      m.setMatrixAt(n, scratch.m);
      m.setColorAt(n, INK);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [tiles, cell, scratch]);

  useFrame((state) => {
    const t = elapsed(timeline.current, state.clock.elapsedTime, reducedMotion);
    const m = mesh.current;
    if (!m) return;
    const over = t > last;
    m.visible = !over;
    if (card.current) {
      const k = ease.inOutCubic(span(t, T.peel - 0.1, T.peel + 0.5));
      card.current.visible = k < 1;
      card.current.scale.setScalar(1 - k * 0.4);
      (card.current.material as THREE.MeshBasicMaterial).opacity = 1 - k;
    }

    // The scan line sweeps the code top to bottom; modules light up as it crosses them.
    const scan = span(t, T.scanFrom, T.scanTo);
    const top = GRID / 2 + 0.1;
    const lineY = top - scan * GRID;
    const lineOn = scan > 0 && scan < 1 ? Math.sin(scan * Math.PI) : 0;
    for (const bar of [line.current, glow.current]) {
      if (!bar) continue;
      bar.visible = lineOn > 0.01;
      bar.position.y = lineY;
    }
    if (line.current) (line.current.material as THREE.MeshBasicMaterial).opacity = lineOn;
    if (glow.current) (glow.current.material as THREE.MeshBasicMaterial).opacity = lineOn * 0.35;
    if (over) return;

    const { m: mat, q, p, s, c } = scratch;
    tiles.forEach((tile, n) => {
      const f = span(t, tile.delay, tile.delay + T.flight);
      const e = ease.inOutCubic(f);
      // Spiral in: the landing point swings round the bottle as the tile approaches.
      const a = tile.angle + (1 - e) * 2.4;
      p.set(Math.sin(a) * tile.radius, tile.y, Math.cos(a) * tile.radius);
      p.lerpVectors(tile.start, p, e);
      // Lift towards the viewer mid-flight, so the burst reads in depth.
      p.z += Math.sin(Math.PI * e) * 0.8;
      q.setFromAxisAngle(tile.axis, e * Math.PI * 2.5);
      const k = cell * 0.86 * Math.pow(1 - e, 0.7);
      s.set(k, k, k * (0.35 + e * 0.65));
      mat.compose(p, q, s);
      m.setMatrixAt(n, mat);

      const lit = Math.exp(-(((tile.start.y - lineY) / (cell * 2.5)) ** 2)) * lineOn;
      c.copy(INK).lerp(tint, Math.min(1, Math.max(lit, e * 1.4)));
      m.setColorAt(n, c);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });

  return (
    <group>
      {/* The printed label the code sits on. */}
      <RoundedBox ref={card} args={[GRID + cell * 4, GRID + cell * 4, 0.02]} radius={0.1} position={[0, 0.1, GRID_Z - 0.06]}>
        <meshBasicMaterial color="#ffffff" transparent toneMapped={false} />
      </RoundedBox>
      <instancedMesh ref={mesh} args={[undefined, undefined, tiles.length]} frustumCulled={false}>
        <boxGeometry />
        <meshStandardMaterial roughness={0.35} metalness={0.1} />
      </instancedMesh>
      <mesh ref={line} position={[0, 0, GRID_Z + 0.08]} visible={false}>
        <planeGeometry args={[GRID + cell * 3, 0.025]} />
        <meshBasicMaterial color={color} transparent toneMapped={false} />
      </mesh>
      <mesh ref={glow} position={[0, 0, GRID_Z + 0.07]} visible={false}>
        <planeGeometry args={[GRID + cell * 3, 0.32]} />
        <meshBasicMaterial color={color} transparent toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  );
}
