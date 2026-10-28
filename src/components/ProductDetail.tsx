"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { productPhotos } from "@/data/photos";
import { formatPrice, type Product } from "@/data/products";
import { useCart } from "@/lib/cart";
import { useDevice } from "@/lib/useDevice";

const ProductViewer = dynamic(() => import("./three/ProductViewer"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-[#f9ebe1]" />,
});

export default function ProductDetail({ product }: { product: Product }) {
  const [variant, setVariant] = useState(product.variants[0]);
  const [added, setAdded] = useState(false);
  const [view, setView] = useState<"3d" | number>("3d");
  const [opened, setOpened] = useState(false);
  const photos = productPhotos[product.slug];
  const { add } = useCart();
  const { quality, reducedMotion } = useDevice();
  const maxPercent = Math.max(...product.actives.map((a) => a.percent));

  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-5 pb-24 pt-32 md:grid-cols-[1.2fr_1fr] md:gap-16 md:px-12">
      <div className="md:sticky md:top-28 md:h-[calc(100svh-8rem)]">
        <div className="relative h-[60svh] overflow-hidden rounded-[15px] bg-[#f9ebe1] md:h-[calc(100%-5.5rem)]">
          <div className={`absolute inset-0 transition-opacity duration-700 ${view === "3d" ? "opacity-100" : "pointer-events-none opacity-0"}`}>
            <ProductViewer
              product={product}
              color={variant.color ?? product.color}
              quality={quality}
              reducedMotion={reducedMotion}
              opened={opened}
            />
            <p className="label pointer-events-none absolute bottom-4 left-5 text-smoke">Drag to turn · click the bottle to pump</p>
            <button
              type="button"
              aria-pressed={opened}
              onClick={() => setOpened((o) => !o)}
              className="btn btn-white absolute right-4 top-4 !px-5 !py-2.5"
            >
              {opened ? "Close the formula" : "Open the formula"}
            </button>
          </div>
          {photos.map((ph, i) => (
            <Image
              key={ph.src}
              src={ph.src}
              alt={ph.alt}
              fill
              priority={i === 0}
              sizes="(min-width: 768px) 55vw, 100vw"
              className={`object-cover transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                view === i ? "scale-100 opacity-100" : "pointer-events-none scale-105 opacity-0"
              }`}
            />
          ))}
        </div>
        {/* Media switcher: the live 3D bottle first, then the photographs. */}
        <div className="mt-3 flex gap-2" role="tablist" aria-label="Product media">
          <button
            type="button"
            role="tab"
            aria-selected={view === "3d"}
            onClick={() => setView("3d")}
            className={`flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[10px] border-[1.5px] bg-[#f9ebe1] text-xs font-medium transition-colors ${
              view === "3d" ? "border-ember text-ember" : "border-transparent text-ink hover:border-apricot"
            }`}
          >
            3D
          </button>
          {photos.map((ph, i) => (
            <button
              key={ph.src}
              type="button"
              role="tab"
              aria-selected={view === i}
              aria-label={ph.alt}
              onClick={() => setView(i)}
              className={`relative h-[4.5rem] w-[4.5rem] overflow-hidden rounded-[10px] border-[1.5px] transition-colors ${
                view === i ? "border-ember" : "border-transparent hover:border-apricot"
              }`}
            >
              <Image src={ph.src} alt="" fill sizes="72px" className="object-cover" />
            </button>
          ))}
        </div>
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
