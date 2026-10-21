import type { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";

export const metadata: Metadata = { title: "Shop" };

export default function ShopPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-20 pt-36 md:px-10">
      <h1 className="display text-[clamp(3rem,7vw,6rem)]">All formulas</h1>
      <p className="mt-4 text-smoke">{products.length} products. Open one to turn it in 3D.</p>

      <ul className="mt-12 grid gap-[10px] sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <li key={p.slug}>
            <ProductCard product={p} />
          </li>
        ))}
      </ul>
    </div>
  );
}
