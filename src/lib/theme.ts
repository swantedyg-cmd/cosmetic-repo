"use client";

import { useSyncExternalStore } from "react";

// Day / Night: the site's two rituals. Day is the white gallery; Night is warm dark
// with the evening (PM) formulas brought forward. Stored per visitor.

export type Theme = "day" | "night";
import { THEME_KEY as KEY } from "./themeScript";

function read(): Theme {
  return document.documentElement.dataset.theme === "night" ? "night" : "day";
}

function subscribe(onChange: () => void) {
  const obs = new MutationObserver(onChange);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => obs.disconnect();
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, read, () => "day");
}

export function setTheme(theme: Theme) {
  const root = document.documentElement;
  const apply = () => {
    if (theme === "night") root.dataset.theme = "night";
    else delete root.dataset.theme;
  };
  try {
    localStorage.setItem(KEY, theme);
  } catch {}
  // Cross-fade the whole page where the browser supports it.
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (doc.startViewTransition && !calm) doc.startViewTransition(apply);
  else apply();
}

/** Scene colours per theme, for the 3D canvases that paint their own backgrounds. */
export const sceneColors = {
  day: { viewer: "#f9ebe1", tour: "#ffffff", backdrop: "#fbeee4", backdropGlow: "#f6d9c6" },
  night: { viewer: "#1f1611", tour: "#140f0c", backdrop: "#2a1d16", backdropGlow: "#3a2418" },
} as const;
