"use client";

import { useEffect, useRef } from "react";

// Background atmosphere: a few warm motes drifting behind the page, like dust in a
// light beam. Three depth layers — far ones small, sharp-ish and slow; near ones large,
// blurred and quicker — and each layer slides at its own rate on scroll for parallax.
// Kept sparse on purpose: it should be felt, not looked at.

type Layer = { share: number; size: [number, number]; speed: [number, number]; alpha: [number, number]; soft: number; parallax: number };

const LAYERS: Layer[] = [
  { share: 0.5, size: [1.5, 3], speed: [3, 7], alpha: [0.35, 0.6], soft: 0.35, parallax: 0.04 },
  { share: 0.35, size: [3.5, 7], speed: [7, 13], alpha: [0.22, 0.4], soft: 0.6, parallax: 0.1 },
  { share: 0.15, size: [12, 26], speed: [12, 20], alpha: [0.08, 0.16], soft: 1, parallax: 0.22 },
];
const COLORS = ["#ff8562", "#f7651a", "#d6b47c", "#ffb48f"];
/** One mote per this many square pixels of viewport, within the caps below. */
const AREA_PER_MOTE = 38000;

type Mote = {
  x: number;
  y: number;
  r: number;
  heading: number;
  turn: number;
  speed: number;
  alpha: number;
  pulse: number;
  phase: number;
  born: number;
  sprite: HTMLCanvasElement;
  parallax: number;
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);

/** A soft glowing dot: bright core fading into a wide halo. Softer sprites read as out of focus. */
function makeSprite(color: string, soft: number) {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, color);
  grad.addColorStop(0.25 + (1 - soft) * 0.25, `${color}aa`);
  grad.addColorStop(0.6, `${color}22`);
  grad.addColorStop(1, `${color}00`);
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

export default function Atmosphere() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sprites = LAYERS.map((l) => COLORS.map((c) => makeSprite(c, l.soft)));
    let w = 0;
    let h = 0;
    let motes: Mote[] = [];

    const spawn = (layer: number, now: number): Mote => {
      const l = LAYERS[layer];
      return {
        x: rand(0, w),
        y: rand(0, h),
        r: rand(...l.size),
        heading: rand(0, Math.PI * 2),
        turn: 0,
        speed: rand(...l.speed),
        alpha: rand(...l.alpha),
        pulse: rand(0.15, 0.45),
        phase: rand(0, Math.PI * 2),
        born: now - rand(0, 4000),
        sprite: sprites[layer][Math.floor(Math.random() * COLORS.length)],
        parallax: l.parallax,
      };
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(42, Math.max(14, (w * h) / AREA_PER_MOTE)));
      const now = performance.now();
      motes = [];
      LAYERS.forEach((l, i) => {
        for (let n = 0; n < Math.round(count * l.share); n++) motes.push(spawn(i, now));
      });
    };

    let last = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now / 1000;
      const scroll = window.scrollY;
      ctx.clearRect(0, 0, w, h);
      const pad = 40;

      for (const m of motes) {
        // Wandering heading: the turn rate itself drifts, so paths curve gently and never repeat.
        m.turn += (Math.random() - 0.5) * 0.6 * dt;
        m.turn *= 0.98;
        m.heading += m.turn * dt;
        m.x += Math.cos(m.heading) * m.speed * dt;
        m.y += Math.sin(m.heading) * m.speed * dt;
        if (m.x < -pad) m.x += w + pad * 2;
        if (m.x > w + pad) m.x -= w + pad * 2;
        if (m.y < -pad) m.y += h + pad * 2;
        if (m.y > h + pad) m.y -= h + pad * 2;

        // Scroll parallax, wrapped so motes re-enter from the other edge.
        const span = h + pad * 2;
        const y = ((((m.y - scroll * m.parallax + pad) % span) + span) % span) - pad;
        // Slow breathing opacity, faded in over the first seconds of life.
        const breathe = 0.55 + 0.45 * Math.sin(t * m.pulse + m.phase);
        const fadeIn = Math.min(1, (now - m.born) / 2500);
        ctx.globalAlpha = m.alpha * breathe * fadeIn;
        const d = m.r * 4;
        ctx.drawImage(m.sprite, m.x - d / 2, y - d / 2, d, d);
      }
      ctx.globalAlpha = 1;
      if (!reduced) raf = requestAnimationFrame(frame);
    };

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduced) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    resize();
    // Reduced motion: one still frame with the motes fully faded in.
    if (reduced) frame(performance.now() + 10000);
    else raf = requestAnimationFrame(frame);
    const onResize = () => {
      resize();
      if (reduced) frame(performance.now() + 10000);
    };
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-0 h-full w-full" />;
}
