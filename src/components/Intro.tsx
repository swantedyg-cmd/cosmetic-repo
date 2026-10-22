// Opening curtain on the first page view per tab: the wordmark rises,
// a hairline draws across, then the whole sheet lifts away.
export default function Intro() {
  return (
    <div
      aria-hidden
      className="intro pointer-events-none fixed inset-0 z-[100] flex flex-col items-center justify-center bg-tangerine text-canvas"
    >
      <p className="intro-word overflow-hidden text-[clamp(3.5rem,13vw,10rem)] font-extralight leading-[0.95] tracking-[-0.08em]">
        {"Solenne".split("").map((c, i) => (
          <span key={i} style={{ animationDelay: `${120 + i * 45}ms` }}>
            {c}
          </span>
        ))}
      </p>
      <span className="intro-bar mt-6 block h-px w-40 bg-canvas/70" />
    </div>
  );
}

/** Runs before paint so returning visitors never see the curtain flash. */
export const introScript =
  "try{if(sessionStorage.getItem('solenne-intro'))document.documentElement.classList.add('intro-seen');sessionStorage.setItem('solenne-intro','1')}catch(e){}";
