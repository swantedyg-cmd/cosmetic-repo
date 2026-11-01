"use client";

import { useEffect } from "react";

// Looping CSS animations (the ingredient wave, the layer stack, the refill jar) keep
// ticking even when they're far off screen, and each one costs style and compositing
// work every frame. Anything marked data-loop is paused until it's actually in view.
export default function PauseOffscreen() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) (e.target as HTMLElement).dataset.visible = "";
          else delete (e.target as HTMLElement).dataset.visible;
        }
      },
      { rootMargin: "100px 0px" },
    );
    const seen = new WeakSet<Element>();
    const scan = () =>
      document.querySelectorAll("[data-loop]").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        io.observe(el);
      });
    scan();
    // Client-side navigation brings in new sections.
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
  return null;
}
