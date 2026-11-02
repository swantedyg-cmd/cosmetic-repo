"use client";

import { useEffect, useRef, useState } from "react";
import { afterFirstScene, mountInTurn } from "./warm";

/**
 * [ref, inView, near]
 * - inView: the element overlaps the viewport (plus a small margin, so a 3D scene is
 *   already running when its first pixels scroll in). Used to pause 3D scenes off screen.
 * - near: latches true once the 3D scene should be built — when the visitor comes
 *   within about a screen and a half, or earlier in idle time when its turn comes
 *   (see lib/warm.ts). The page load no longer builds every scene at once.
 */
export function useInView<T extends Element>({ lazy = false }: { lazy?: boolean } = {}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(true);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let built = false;
    let live = true;
    const build = () => {
      if (built || !live) return false;
      built = true;
      setNear(true);
      return true;
    };
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "120px 0px" });
    io.observe(el);
    const nearIo = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        build();
        nearIo.disconnect();
      },
      { rootMargin: "150% 0px" },
    );
    if (lazy) {
      // Even a scene right below the fold waits for the hero to be ready first.
      afterFirstScene().then(() => live && nearIo.observe(el));
      mountInTurn(build);
    } else {
      nearIo.observe(el);
    }
    return () => {
      live = false;
      io.disconnect();
      nearIo.disconnect();
    };
  }, [lazy]);

  return [ref, inView, near] as const;
}
