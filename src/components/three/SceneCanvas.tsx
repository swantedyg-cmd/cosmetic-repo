"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Canvas, useThree, type CanvasProps } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { HalfFloatType, WebGLRenderTarget, type Object3D } from "three";
import { announceSceneReady } from "@/lib/warm";

// One canvas setup for every 3D scene, so they all stay smooth the same way:
// - Shaders compile in the background (KHR_parallel_shader_compile via compileAsync)
//   and the scene fades in once they're ready. Compiling them synchronously froze the
//   whole page for seconds on load — the glass shaders are large on Windows GPUs.
// - Off screen, a scene draws once to warm up and then sleeps.
// - Resolution adapts to the frame rate the device actually holds, and a scene can
//   drop its costliest extras (mirror floors) when the device keeps struggling.

/** "full" until the device has shown it can't hold the frame rate, then "reduced". */
export type Tier = "full" | "reduced";
const TierContext = createContext<Tier>("full");
export const useTier = () => useContext(TierContext);

/** Glass refraction samples a blurred copy of the scene; it doesn't need full resolution. */
const TRANSMISSION_SCALE = 0.5;

type Props = Omit<CanvasProps, "dpr" | "frameloop"> & {
  quality: "high" | "low";
  /** False while off screen: the scene stops rendering. */
  active?: boolean;
};

export default function SceneCanvas({ quality, active = true, children, onCreated, ...props }: Props) {
  // 1.25x is the sweet spot on laptop GPUs: sharp on retina, ~30% fewer pixels than 1.5x
  // for the glass shaders to fill on full-screen scenes.
  const ceiling = quality === "high" ? 1.25 : 1.15;
  const [maxDpr, setMaxDpr] = useState(ceiling);
  const [tier, setTier] = useState<Tier>("full");
  const [ready, setReady] = useState(false);

  return (
    <Canvas
      {...props}
      // Nothing draws until the shaders are compiled, so no frame waits on the GPU compiler.
      frameloop={!ready ? "never" : active ? "always" : "demand"}
      style={{ ...props.style, opacity: ready ? 1 : 0, transition: "opacity 600ms ease-out" }}
      // Don't re-measure the canvas on scroll: its offset changing used to wake every
      // scene on the page (even off screen) for a full redraw on each scroll step.
      // Pointer picking uses offsetX/Y, so the canvas position isn't needed.
      resize={{ scroll: false, debounce: { scroll: 0, resize: 120 } }}
      // A range, so 1x screens never render above their native resolution.
      dpr={[1, maxDpr]}
      onCreated={(state) => {
        state.gl.transmissionResolutionScale = TRANSMISSION_SCALE;
        onCreated?.(state);
      }}
    >
      <PerformanceMonitor
        flipflops={3}
        // First slowdown: drop to native resolution. Still slow after that: drop the extras too.
        onDecline={() =>
          setMaxDpr((current) => {
            if (current === 1) setTier("reduced");
            return 1;
          })
        }
        onIncline={() => setMaxDpr(ceiling)}
        onFallback={() => {
          setMaxDpr(1);
          setTier("reduced");
        }}
      >
        <TierContext.Provider value={tier}>{children}</TierContext.Provider>
      </PerformanceMonitor>
      <WarmUp onReady={() => setReady(true)} />
    </Canvas>
  );
}

/** Compiles every material in the scene off the main thread, then lets the scene draw. */
function WarmUp({ onReady }: { onReady: () => void }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    let live = true;
    // Hidden parts (open-state droplets, labels) compile now too, not when first shown.
    const hidden: Object3D[] = [];
    scene.traverse((o) => {
      if (!o.visible) {
        hidden.push(o);
        o.visible = true;
      }
    });
    // Glass refraction, mirror floors and soft shadows draw the scene again into an
    // offscreen buffer, and three.js builds a second version of every shader for that
    // (linear colour, no tone mapping). Compile both versions now, or the offscreen ones
    // compile on the main thread during the first frames.
    const offscreen = new WebGLRenderTarget(1, 1, { type: HalfFloatType });
    const previous = gl.getRenderTarget();
    gl.setRenderTarget(offscreen);
    const offscreenReady = gl.compileAsync(scene, camera);
    gl.setRenderTarget(previous);
    Promise.all([gl.compileAsync(scene, camera), offscreenReady])
      .catch(() => {})
      .finally(() => offscreen.dispose())
      .then(() => {
        for (const o of hidden) o.visible = false;
        if (!live) return;
        onReady();
        invalidate();
        // The first frames finish compiling (some variants only exist once drawn); then
        // the next scene in the queue may start.
        let frames = 4;
        const tick = () => {
          invalidate();
          if (--frames > 0) requestAnimationFrame(tick);
          else announceSceneReady();
        };
        requestAnimationFrame(tick);
      });
    return () => {
      live = false;
    };
    // Once per canvas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
