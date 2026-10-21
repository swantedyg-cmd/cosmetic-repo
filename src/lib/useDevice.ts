"use client";

import { useSyncExternalStore } from "react";

function subscribe(cb: () => void) {
  const queries = [
    window.matchMedia("(max-width: 767px)"),
    window.matchMedia("(prefers-reduced-motion: reduce)"),
  ];
  queries.forEach((q) => q.addEventListener("change", cb));
  return () => queries.forEach((q) => q.removeEventListener("change", cb));
}

function snapshot() {
  const small = window.matchMedia("(max-width: 767px)").matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return `${small ? "low" : "high"}|${reduced}`;
}

/** 3D quality tier and motion preference, read from media queries. */
export function useDevice() {
  const value = useSyncExternalStore(subscribe, snapshot, () => "high|false");
  const [quality, reduced] = value.split("|");
  return { quality: quality as "high" | "low", reducedMotion: reduced === "true" };
}
