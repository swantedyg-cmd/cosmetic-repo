import type { BottleShape } from "@/data/products";

// Flat 2D stand-ins for product photography on the shop grid.
export default function BottleSilhouette({ shape, color }: { shape: BottleShape; color: string }) {
  return (
    <svg viewBox="0 0 120 160" className="h-full w-auto" aria-hidden>
      {shape === "dropper" && (
        <>
          <rect x="52" y="14" width="16" height="22" rx="8" fill="#0d1717" />
          <rect x="47" y="34" width="26" height="12" rx="2" fill="#d8d2cb" />
          <path d="M50 46h20v6l14 8c4 2 6 6 6 10v70a6 6 0 0 1-6 6H36a6 6 0 0 1-6-6V70c0-4 2-8 6-10l14-8z" fill="#fff" fillOpacity=".55" stroke="#0d1717" strokeOpacity=".15" />
          <path d="M34 100h52v40a4 4 0 0 1-4 4H38a4 4 0 0 1-4-4z" fill={color} />
        </>
      )}
      {shape === "pump" && (
        <>
          <rect x="56" y="10" width="26" height="8" rx="2" fill="#0d1717" />
          <rect x="56" y="16" width="8" height="12" fill="#0d1717" />
          <rect x="49" y="26" width="22" height="10" rx="2" fill="#d8d2cb" />
          <path d="M51 36h18v4l8 4c3 1.5 5 4 5 7v89a6 6 0 0 1-6 6H44a6 6 0 0 1-6-6V51c0-3 2-5.5 5-7l8-4z" fill="#fff" fillOpacity=".55" stroke="#0d1717" strokeOpacity=".15" />
          <path d="M42 80h36v60a4 4 0 0 1-4 4H46a4 4 0 0 1-4-4z" fill={color} />
        </>
      )}
      {shape === "jar" && (
        <>
          <rect x="18" y="66" width="84" height="22" rx="4" fill="#d8d2cb" />
          <path d="M22 88h76v52a6 6 0 0 1-6 6H28a6 6 0 0 1-6-6z" fill="#fff" fillOpacity=".55" stroke="#0d1717" strokeOpacity=".15" />
          <path d="M26 104h68v36a3 3 0 0 1-3 3H29a3 3 0 0 1-3-3z" fill={color} />
        </>
      )}
      {shape === "stick" && (
        <>
          <path d="M48 52c0-14 6-24 12-26 6 2 12 12 12 26v14H48z" fill={color} />
          <rect x="46" y="64" width="28" height="6" fill="#d8d2cb" />
          <rect x="44" y="70" width="32" height="76" rx="3" fill="#0d1717" />
        </>
      )}
    </svg>
  );
}
