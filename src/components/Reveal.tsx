"use client";

import { useEffect, useRef } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** "up" fades in from below; "clip" opens images like a shutter. */
  variant?: "up" | "clip";
  delay?: number;
};

// Every Reveal on the page shares one observer and one scroll listener, so scrolling
// costs the same however many there are.
const pending = new Set<Element>();
let observer: IntersectionObserver | null = null;
let lastY = 0;
let raf = 0;

function show(el: Element) {
  el.classList.add("is-in");
  unwatch(el);
}

// Safety net for jumps (End key, anchor links, restored scroll), where the observer can
// miss elements that skip straight past the viewport: reveal anything on or above screen.
// Ordinary scrolling never moves this far in one event, so it costs nothing then.
function onScroll() {
  const y = window.scrollY;
  const jumped = Math.abs(y - lastY) > window.innerHeight;
  lastY = y;
  if (!jumped || raf) return;
  raf = requestAnimationFrame(() => {
    raf = 0;
    pending.forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) show(el);
    });
  });
}

function watch(el: Element) {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && show(e.target)),
      { rootMargin: "0px 0px -10% 0px" },
    );
    // From 0, so a restored scroll position on reload counts as a jump.
    lastY = 0;
    window.addEventListener("scroll", onScroll, { passive: true });
  }
  pending.add(el);
  observer.observe(el);
}

function unwatch(el: Element) {
  pending.delete(el);
  observer?.unobserve(el);
  if (!pending.size && observer) {
    observer.disconnect();
    observer = null;
    window.removeEventListener("scroll", onScroll);
  }
}

/** Plays its entrance once, the first time it scrolls into view. */
export default function Reveal({ children, className, variant = "up", delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    watch(el);
    return () => unwatch(el);
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
