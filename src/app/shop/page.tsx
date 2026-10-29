import type { Metadata } from "next";
import ShopGrid from "@/components/ShopGrid";
import { products } from "@/data/products";

export const metadata: Metadata = { title: "Shop" };

export default function ShopPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-20 pt-36 md:px-10">
      <h1 className="display text-[clamp(3rem,7vw,6rem)]">All formulas</h1>
      <p className="mt-4 max-w-md text-smoke">
        {products.length} products, from cleanser to colour. Open one to turn it in 3D and see what’s inside.
      </p>
      <ShopGrid />
    </div>
  );
}
