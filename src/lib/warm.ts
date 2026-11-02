"use client";

// The 3D scenes take about a second each to get ready on a laptop GPU (their shaders
// compile on the first frames, and some of that can't be moved off the main thread).
// So they take turns: the hero first, then each scene further down is built in idle
// time, one at a time, while the visitor isn't scrolling — never all at once.

import { onScroll } from "./scroll";

const READY = "solenne:scene-ready";
/** Building a scene blocks the page for a few hundred ms, so wait for the visitor to pause. */
const QUIET_MS = 700;

/** Called by a scene once it has drawn its first frames. */
export function announceSceneReady() {
  window.dispatchEvent(new Event(READY));
}

function nextSceneReady(timeout: number) {
  return new Promise<void>((resolve) => {
    const done = () => {
      clearTimeout(timer);
      window.removeEventListener(READY, done);
      resolve();
    };
    const timer = setTimeout(done, timeout);
    window.addEventListener(READY, done);
  });
}

function idle(timeout: number) {
  return new Promise<void>((resolve) => {
    if ("requestIdleCallback" in window) requestIdleCallback(() => resolve(), { timeout });
    else setTimeout(resolve, 300);
  });
}

let lastScroll = 0;
let tracking = false;

/** Resolves once the page hasn't scrolled for QUIET_MS (checked in idle time). */
async function whenQuiet() {
  if (!tracking) {
    tracking = true;
    onScroll(() => (lastScroll = performance.now()));
  }
  for (;;) {
    await idle(2500);
    const wait = lastScroll + QUIET_MS - performance.now();
    if (wait <= 0) return;
    await new Promise((r) => setTimeout(r, wait));
  }
}

let firstScene: Promise<void> | null = null;

/**
 * Resolves once the first scene on the page (the hero, or a product viewer) is ready.
 * Nothing else builds before then: two scenes compiling at once on load made each wait
 * on the other in the GPU queue (a 3 s freeze instead of 1 s).
 */
export function afterFirstScene() {
  firstScene ??= nextSceneReady(6000);
  return firstScene;
}

let tail: Promise<void> | null = null;

/**
 * Queue a scene to be built in idle time. `mount` is skipped if the scene was already
 * built because the visitor scrolled to it first.
 */
export function mountInTurn(mount: () => boolean) {
  // The first scene on the page (the hero, or a product viewer) goes before the queue starts.
  tail ??= afterFirstScene();
  tail = tail.then(async () => {
    await whenQuiet();
    if (mount()) await nextSceneReady(8000);
  });
}

/** Runs `cb` once, the next time any scene announces it's ready. Returns a cancel function. */
export function onNextSceneReady(cb: () => void) {
  window.addEventListener(READY, cb, { once: true });
  return () => window.removeEventListener(READY, cb);
}
