import { useId } from "react";

// Flags drawn as SVG: Windows has no flag emoji, so emoji would show as bare letters there.
// Each fills a 4:3 box; the caller sets the size and rounding.

export default function Flag({ code, className = "" }: { code: "gb" | "fr" | "ma"; className?: string }) {
  const id = useId();
  return (
    <span className={`flag inline-block shrink-0 overflow-hidden ${className}`} aria-hidden>
      {code === "fr" && (
        <svg viewBox="0 0 3 2" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
          <rect width="1" height="2" fill="#002654" />
          <rect x="1" width="1" height="2" fill="#fff" />
          <rect x="2" width="1" height="2" fill="#ce1126" />
        </svg>
      )}
      {code === "gb" && (
        <svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
          <clipPath id={`${id}-t`}>
            <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
          </clipPath>
          <rect width="60" height="30" fill="#012169" />
          <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
          <path d="M0,0 L60,30 M60,0 L0,30" clipPath={`url(#${id}-t)`} stroke="#c8102e" strokeWidth="4" />
          <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
          <path d="M30,0 v30 M0,15 h60" stroke="#c8102e" strokeWidth="6" />
        </svg>
      )}
      {code === "ma" && (
        <svg viewBox="0 0 90 60" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
          <rect width="90" height="60" fill="#c1272d" />
          {/* Interlaced green pentagram, drawn as one stroked path through every second point. */}
          <path
            d="M45,17.5 L52.35,40.11 L33.11,26.14 L56.89,26.14 L37.65,40.11 Z"
            fill="none"
            stroke="#006233"
            strokeWidth="2.6"
            strokeLinejoin="miter"
          />
        </svg>
      )}
    </span>
  );
}
