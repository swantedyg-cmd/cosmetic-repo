"use client";

import { createContext, useContext, useState } from "react";
import { Canvas, type CanvasProps } from "@react-three/fiber";
import { PerformanceMonitor, Preload } from "@react-three/drei";

// One canvas setup for every 3D scene, so they all stay smooth the same way:
// - Shaders compile at mount (behind the intro curtain), not on the first frame a
//   scene scrolls into view, which used to hitch the scroll at every section.
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
  const ceiling = quality === "high" ? 1.5 : 1.25;
  const [maxDpr, setMaxDpr] = useState(ceiling);
  const [tier, setTier] = useState<Tier>("full");

  return (
    <Canvas
      {...props}
      frameloop={active ? "always" : "demand"}
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
      <Preload all />
    </Canvas>
  );
}
