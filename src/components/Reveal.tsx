"use client";

import { useEffect, useRef } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** "up" fades in from below; "clip" opens images like a shutter. */
  variant?: "up" | "clip";
  delay?: number;
};

/** Plays its entrance once, the first time it scrolls into view. */
export default function Reveal({ children, className, variant = "up", delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.classList.add("is-in");
        io.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    // Safety net for jumps (End key, anchor links, restored scroll): reveal anything
    // already on or above screen even if the observer never reported it.
    let raf = 0;
    const check = () => {
      if (el.getBoundingClientRect().top >= window.innerHeight) return;
      el.classList.add("is-in");
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(check);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      ref={ref}
      data-reveal={variant}
      className={className}
      style={{ "--delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
