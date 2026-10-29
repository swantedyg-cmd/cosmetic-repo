"use client";

import { useRef } from "react";

/** Leans its contents towards the pointer in 3D. The motion itself lives in CSS (.tilt). */
export default function Tilt({ children, className = "", max = 7 }: { children: React.ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--ry", `${(x - 0.5) * max * 2}deg`);
    el.style.setProperty("--rx", `${(0.5 - y) * max * 2}deg`);
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
    el.classList.add("is-tilting");
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.classList.remove("is-tilting");
  };

  return (
    <div ref={ref} className={`tilt relative ${className}`} onPointerMove={onMove} onPointerLeave={onLeave}>
      {children}
      <span aria-hidden className="tilt-sheen pointer-events-none absolute inset-0 rounded-[10px]" />
    </div>
  );
}
