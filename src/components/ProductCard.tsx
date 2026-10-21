import Link from "next/link";
import BottleSilhouette from "./BottleSilhouette";
import { formatPrice, type Product } from "@/data/products";

export default function ProductCard({ product: p }: { product: Product }) {
  return (
    <Link
      href={`/shop/${p.slug}`}
      className="group flex h-full flex-col rounded-[10px] border-[1.5px] border-apricot bg-canvas p-5 transition-colors hover:border-ember"
    >
      <div className="flex aspect-square items-end justify-center overflow-hidden rounded-[15px] bg-[#f6f6f6] pb-[8%] pt-[12%]">
        <div className="h-3/4 transition-transform duration-700 ease-out group-hover:-translate-y-2 group-hover:rotate-3">
          <BottleSilhouette shape={p.shape} color={p.color} />
        </div>
      </div>
      <div className="mt-5 flex items-baseline justify-between gap-3">
        <h3 className="font-medium text-ink">{p.name}</h3>
        <span className="shrink-0 text-sm">from {formatPrice(p.variants[0].price)}</span>
      </div>
      <p className="mt-1 text-sm text-smoke">
        {p.kind} · {p.actives[0].percent}% {p.actives[0].name}
      </p>
    </Link>
  );
}
