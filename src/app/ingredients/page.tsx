import type { Metadata } from "next";
import IngredientIndex from "@/components/IngredientIndex";
import { ingredients } from "@/data/ingredients";

export const metadata: Metadata = {
  title: "Ingredient index",
  description: "Every active we use, what it does, and the exact percentage in each formula.",
};

export default function IngredientsPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-24 pt-36 md:px-10">
      <p className="text-sm text-smoke">Ingredient index</p>
      <div className="mt-3 grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-end">
        <h1 className="display text-[clamp(2.6rem,5vw,4.25rem)] text-balance">Every active, and how much of it</h1>
        <p className="max-w-sm text-smoke">
          {ingredients.length} actives across the range. The dot is what we put in; the band is the range it’s usually
          used at in leave-on skincare.
        </p>
      </div>
      <div className="mt-14">
        <IngredientIndex />
      </div>
    </div>
  );
}
