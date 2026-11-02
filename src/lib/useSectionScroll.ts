"use client";

import { useEffect, useRef } from "react";
import { onScroll, scrollY } from "./scroll";

// Scroll progress through a tall pinned section, without layout reads on scroll.
// The section's position is measured once (and again when anything resizes); each
// scroll frame then works from the shared scroll position alone (lib/scroll.ts). Reading getBoundingClientRect
// on every scroll forced the browser to redo layout each frame, which was most of
// the scroll jank in the pinned sections.

type Geometry = { top: number; height: number; viewport: number };

export function useSectionScroll<T extends HTMLElement>(
  onProgress: (progress: number, geometry: Geometry) => void,
  onMeasure?: (geometry: Geometry) => void,
) {
  const ref = useRef<T>(null);
  const cb = useRef(onProgress);
  const measureCb = useRef(onMeasure);
  useEffect(() => {
    cb.current = onProgress;
    measureCb.current = onMeasure;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const geo: Geometry = { top: 0, height: 0, viewport: 0 };
    const emit = (y = scrollY()) => {
      const travel = geo.height - geo.viewport;
      const p = travel > 0 ? Math.min(1, Math.max(0, (y - geo.top) / travel)) : 0;
      cb.current(p, geo);
    };
    const measure = () => {
      const r = el.getBoundingClientRect();
      geo.top = r.top + window.scrollY;
      geo.height = r.height;
      geo.viewport = window.innerHeight;
      measureCb.current?.(geo);
      emit();
    };

    measure();
    // Content above the section can change height (images, fonts, reveals), which moves it.
    const ro = new ResizeObserver(() => measure());
    ro.observe(document.body);
    ro.observe(el);
    // Lenis publishes once per frame, inside its own animation frame, so the section
    // moves in the same frame as the page (no extra frame of delay).
    const unsubscribe = onScroll(emit);
    window.addEventListener("resize", measure);
    return () => {
      unsubscribe();
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return ref;
}
