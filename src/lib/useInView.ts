"use client";

import { useEffect, useRef, useState } from "react";

/**
 * True while the element overlaps the viewport (plus a small margin, so a 3D scene is
 * already running when its first pixels scroll in). Used to pause 3D scenes off screen.
 */
export function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "120px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return [ref, inView] as const;
}
