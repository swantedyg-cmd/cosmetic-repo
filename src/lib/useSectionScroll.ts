"use client";

import { useEffect, useRef } from "react";

// Scroll progress through a tall pinned section, without layout reads on scroll.
// The section's position is measured once (and again when anything resizes); each
// scroll frame then works from window.scrollY alone. Reading getBoundingClientRect
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
    let frame = 0;

    const emit = () => {
      frame = 0;
      const travel = geo.height - geo.viewport;
      const p = travel > 0 ? Math.min(1, Math.max(0, (window.scrollY - geo.top) / travel)) : 0;
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
    // One update per frame however many scroll events arrive.
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(emit);
    };

    measure();
    // Content above the section can change height (images, fonts, reveals), which moves it.
    const ro = new ResizeObserver(() => measure());
    ro.observe(document.body);
    ro.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return ref;
}
