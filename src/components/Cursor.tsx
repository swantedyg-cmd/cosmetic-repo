"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * A small ember dot that trails the pointer and swells into a labelled disc
 * over anything marked data-cursor="Label". Mouse and trackpad only.
 */
export default function Cursor() {
  const enabled = useSyncExternalStore(
    subscribe,
    () => matchMedia("(pointer: fine)").matches,
    () => false,
  );
  const dot = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const target = { x: -100, y: -100 };
    const pos = { x: -100, y: -100 };
    let id = 0;

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      const el = (e.target as Element | null)?.closest?.("[data-cursor]");
      setLabel(el ? el.getAttribute("data-cursor") : null);
    };
    const tick = () => {
      pos.x += (target.x - pos.x) * 0.2;
      pos.y += (target.y - pos.y) * 0.2;
      if (dot.current) dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      id = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    id = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(id);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={dot} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[90]">
      <div
        className={`flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ember text-xs font-medium text-canvas transition-all duration-300 ease-out ${
          label ? "h-20 w-20" : "h-2.5 w-2.5"
        }`}
      >
        <span className={`transition-opacity duration-200 ${label ? "opacity-100" : "opacity-0"}`}>{label}</span>
      </div>
    </div>
  );
}
