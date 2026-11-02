"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { driveScroll } from "@/lib/scroll";

/** Weighted, eased page scrolling. Off for reduced motion and touch, where native scroll feels better. */
export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches) return;
    // A touch quicker to settle than before, so the page follows the wheel more closely.
    const lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 0.9 });
    lenis.on("scroll", (l: Lenis) => driveScroll(l.animatedScroll));
    driveScroll(lenis.animatedScroll);
    let id = requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      id = requestAnimationFrame(raf);
    });
    return () => {
      cancelAnimationFrame(id);
      lenis.destroy();
      driveScroll(null);
    };
  }, []);

  // New pages start at the top, not wherever the smoothed scroll left off.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
