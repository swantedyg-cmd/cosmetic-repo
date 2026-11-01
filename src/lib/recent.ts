"use client";

import { useSyncExternalStore } from "react";

// Recently viewed products, newest first, kept in this browser only.
const KEY = "solenne-recent";
const MAX = 6;
const EMPTY: string[] = [];
const listeners = new Set<() => void>();
let cache: string[] | null = null;

function load(): string[] {
  if (cache) return cache;
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    cache = Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string") : [];
  } catch {
    cache = [];
  }
  return cache ?? EMPTY;
}

export function recordView(slug: string) {
  const next = [slug, ...load().filter((s) => s !== slug)].slice(0, MAX);
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((l) => l());
}

export function useRecent(): string[] {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    load,
    () => EMPTY,
  );
}
