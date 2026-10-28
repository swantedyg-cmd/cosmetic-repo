import * as THREE from "three";

// One choreography vocabulary for every 3D scene, so the hero, the formula tour
// and the product viewer move with the same timing and the same curves.

export const ease = {
  outQuart: (t: number) => 1 - Math.pow(1 - t, 4),
  inOutCubic: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outBack: (t: number) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2),
};

/** Shared timings, in seconds. */
export const timing = {
  /** Wait for the intro curtain to lift on the first view of a tab. */
  curtain: 1.2,
  /** Plinth/bottle rise in the hero. */
  rise: 1.3,
  /** Gap between consecutive pieces of a staggered entrance. */
  stagger: 0.14,
  /** Camera dolly in the hero. */
  dolly: 2.4,
};

/** Damping speeds for frame-rate independent smoothing (higher = snappier). */
export const speed = { slow: 2, base: 5, quick: 9 };

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/** Maps t into 0 → 1 across [start, end], clamped. */
export const span = (t: number, start: number, end: number) => clamp01((t - start) / (end - start));

/** Eased 0 → 1 for an entrance that begins `delay` seconds after `t` = 0. */
export const enter = (t: number, delay: number, duration = timing.rise) =>
  ease.outQuart(span(t, delay, delay + duration));

/** Frame-rate independent exponential smoothing towards a target. */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  THREE.MathUtils.damp(current, target, lambda, Math.min(dt, 0.1));

/** Seconds until a scene's entrance should start, accounting for the intro curtain. */
export const introDelay = () =>
  document.documentElement.classList.contains("intro-seen") ? 0 : timing.curtain;

/**
 * How open a formula is while scrolling through one stage of the tour:
 * closed on arrival, opens through the middle, closes again before the next bottle.
 * The last stage stays open so the section ends on the full formula.
 */
export const stageOpen = (local: number, last: boolean) => {
  const opening = ease.inOutCubic(span(local, 0.12, 0.42));
  const closing = last ? 0 : ease.inOutCubic(span(local, 0.78, 0.95));
  return opening * (1 - closing);
};
