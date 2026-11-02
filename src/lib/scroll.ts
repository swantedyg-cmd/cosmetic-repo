"use client";

// One source for the page's scroll position. Reading window.scrollY inside scroll
// handlers and animation frames forces the browser to finish layout first whenever
// anything has changed styles that frame — and with several readers per frame that was
// the biggest single cost while scrolling. Lenis already knows where the page is, so
// it publishes the value here; without Lenis (touch, reduced motion) one native scroll
// listener reads it once per event.

type Listener = (y: number) => void;

export const scroll = { y: 0, vh: 0 };
const listeners = new Set<Listener>();
let started = false;
let driven = false;

function publish(y: number) {
  scroll.y = y;
  listeners.forEach((l) => l(y));
}

function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  scroll.y = window.scrollY;
  scroll.vh = window.innerHeight;
  window.addEventListener("resize", () => (scroll.vh = window.innerHeight), { passive: true });
  window.addEventListener(
    "scroll",
    () => {
      if (!driven) publish(window.scrollY);
    },
    { passive: true },
  );
}

/** Called by the smooth scroller each frame it moves the page. */
export function driveScroll(y: number | null) {
  start();
  driven = y !== null;
  if (y !== null) publish(y);
}

/** Subscribe to scroll position changes. Returns an unsubscribe function. */
export function onScroll(listener: Listener) {
  start();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Current position (starts the store if needed). */
export function scrollY() {
  start();
  return scroll.y;
}
