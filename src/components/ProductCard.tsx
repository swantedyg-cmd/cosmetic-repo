import Image from "next/image";
import Link from "next/link";
import { productPhotos } from "@/data/photos";
import { formatPrice, type Product } from "@/data/products";

// Packshot by default; hovering crossfades to the texture shot with a slow push-in.
export default function ProductCard({ product: p, priority = false }: { product: Product; priority?: boolean }) {
  const [pack, texture] = productPhotos[p.slug];

  return (
    <Link
      href={`/shop/${p.slug}`}
      data-cursor="View"
      className="group flex h-full flex-col rounded-[10px] border-[1.5px] border-apricot bg-canvas p-5 transition-colors duration-500 hover:border-ember"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[15px] bg-[#f8e4d6]">
        <Image
          src={pack.src}
          alt={pack.alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-[1.6s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
        />
        <Image
          src={texture.src}
          alt=""
          fill
          sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
          className="scale-110 object-cover opacity-0 transition-[opacity,transform] duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-100 group-hover:opacity-100"
        />
        <span className="absolute left-3 top-3 rounded-full bg-canvas/85 px-3 py-1 text-xs text-ink backdrop-blur-sm">
          {p.kind}
        </span>
        {/* The lead active slides up over the texture shot. */}
        <span className="absolute inset-x-3 bottom-3 flex translate-y-3 items-baseline justify-between rounded-full bg-canvas/90 px-4 py-2 text-xs opacity-0 backdrop-blur-sm transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="text-smoke">{p.actives[0].name}</span>
          <span className="tabular-nums text-ink">{p.actives[0].percent}%</span>
        </span>
      </div>
      <div className="mt-5 flex items-baseline justify-between gap-3">
        <h3 className="text-[19px] font-light tracking-[-0.03em] text-ink">{p.name}</h3>
        <span className="shrink-0 text-sm">from {formatPrice(p.variants[0].price)}</span>
      </div>
      <p className="mt-1 text-sm text-smoke">{p.tagline}</p>
    </Link>
  );
}
