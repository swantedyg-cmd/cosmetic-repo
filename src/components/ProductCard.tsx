"use client";

import { useState } from "react";
import Link from "next/link";
import CardStage from "./three/CardStage";
import { formatPrice, type Product } from "@/data/products";

export default function ProductCard({ product: p }: { product: Product }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/shop/${p.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className="group flex h-full flex-col rounded-[10px] border-[1.5px] border-apricot bg-canvas p-5 transition-colors hover:border-ember"
    >
      <div className="relative aspect-square overflow-hidden rounded-[15px] bg-[radial-gradient(120%_90%_at_50%_30%,#fffaf6_0%,#f8e4d6_70%,#f4d3bf_100%)]">
        <CardStage product={p} hovered={hovered} />
        <span className="absolute left-4 top-4 text-xs text-ink/60">{p.kind}</span>
      </div>
      <div className="mt-5 flex items-baseline justify-between gap-3">
        <h3 className="font-medium text-ink">{p.name}</h3>
        <span className="shrink-0 text-sm">from {formatPrice(p.variants[0].price)}</span>
      </div>
      <p className="mt-1 text-sm text-smoke">
        {p.actives[0].percent}% {p.actives[0].name}
      </p>
    </Link>
  );
}
