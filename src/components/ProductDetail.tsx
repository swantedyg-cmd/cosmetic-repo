"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { formatPrice, type Product } from "@/data/products";
import { useCart } from "@/lib/cart";
import { useDevice } from "@/lib/useDevice";

const ProductViewer = dynamic(() => import("./three/ProductViewer"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-mist/60" />,
});

export default function ProductDetail({ product }: { product: Product }) {
  const [variant, setVariant] = useState(product.variants[0]);
  const [added, setAdded] = useState(false);
  const { add } = useCart();
  const { quality, reducedMotion } = useDevice();
  const maxPercent = Math.max(...product.actives.map((a) => a.percent));

  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-5 pb-24 pt-32 md:grid-cols-[1.2fr_1fr] md:gap-16 md:px-12">
      <div className="relative h-[60svh] overflow-hidden rounded-[15px] md:sticky md:top-28 md:h-[calc(100svh-8rem)]">
        <ProductViewer
          shape={product.shape}
          color={variant.color ?? product.color}
          quality={quality}
          reducedMotion={reducedMotion}
        />
        <p className="label pointer-events-none absolute bottom-4 left-5 text-smoke">Drag to turn · scroll to zoom</p>
      </div>

      <div className="md:pt-10">
        <Link href="/shop" className="label text-smoke hover:text-ink">← All formulas</Link>
        <p className="label mt-8 text-smoke">{product.kind}</p>
        <h1 className="mt-3 font-display text-[clamp(2rem,4vw,3.2rem)] font-light leading-none tracking-tight">
          {product.name}
        </h1>
        <p className="mt-4 text-lg text-smoke">{product.tagline}</p>

        <fieldset className="mt-8">
          <legend className="label text-smoke">
            {product.variantLabel}: <span className="text-ink">{variant.label}</span>
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                aria-pressed={v.id === variant.id}
                onClick={() => setVariant(v)}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
                  v.id === variant.id ? "border-ink bg-ink text-canvas" : "border-ink/20 hover:border-ink"
                }`}
              >
                {v.color && <span className="h-3 w-3 rounded-full" style={{ background: v.color }} />}
                {v.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-8 flex items-center gap-6">
          <button
            type="button"
            onClick={() => {
              add(product.slug, variant.id);
              setAdded(true);
            }}
            className="btn"
          >
            Add to bag · {formatPrice(variant.price)}
          </button>
          {added && (
            <Link href="/cart" role="status" className="text-sm underline underline-offset-4">
              Added to bag. View bag
            </Link>
          )}
        </div>

        <section className="mt-14 border-t border-mist pt-8">
          <h2 className="label text-smoke">Actives</h2>
          <ul className="mt-4 space-y-3">
            {product.actives.map((a) => (
              <li key={a.name}>
                <div className="flex justify-between text-sm">
                  <span>{a.name}</span>
                  <span className="label">{a.percent}%</span>
                </div>
                <span className="mt-1.5 block h-1.5 rounded-full bg-mist">
                  <span
                    className="block h-full rounded-full"
                    style={{ width: `${(a.percent / maxPercent) * 100}%`, background: variant.color ?? product.color }}
                  />
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12 space-y-8 border-t border-mist pt-8">
          <div>
            <h2 className="label text-smoke">What it does</h2>
            <p className="mt-3 leading-relaxed">{product.description}</p>
          </div>
          <div>
            <h2 className="label text-smoke">How to use</h2>
            <p className="mt-3 leading-relaxed">{product.howToUse}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
