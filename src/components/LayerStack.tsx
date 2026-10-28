import type { Product } from "@/data/products";

// A routine drawn as stacked glass slabs in CSS 3D: one per step, in the order
// they go on, each as thick as its texture. Slabs drop in one after another.

const THICKNESS: Record<Product["shape"], number> = { pump: 10, dropper: 16, jar: 30, stick: 8 };

export default function LayerStack({ steps, className = "" }: { steps: Product[]; className?: string }) {
  // Each slab sits on top of the ones before it, with a small gap between layers.
  const bases = steps.map((_, i) => steps.slice(0, i).reduce((z, p) => z + THICKNESS[p.shape] + 6, 0));
  return (
    <div className={`layer-stack ${className}`} aria-hidden>
      <div className="layer-stack-plane">
        <span className="layer-stack-skin">skin</span>
        {steps.map((p, i) => {
          const depth = THICKNESS[p.shape];
          const bottom = bases[i];
          return (
            <span
              key={p.slug}
              className="layer-stack-slab"
              style={
                {
                  "--z": `${bottom}px`,
                  "--depth": `${depth}px`,
                  "--tint": p.color,
                  "--i": i,
                } as React.CSSProperties
              }
            >
              <span className="layer-stack-name">{p.name}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
