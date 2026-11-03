import type { Metadata } from "next";
import IngredientIndex from "@/components/IngredientIndex";
import OriginsGlobe from "@/components/OriginsGlobe";
import { ingredients } from "@/data/ingredients";
import { getI18n } from "@/i18n/server";
import { alternates } from "@/i18n/seo";

export async function generateMetadata(props: PageProps<"/[lang]/ingredients">): Promise<Metadata> {
  const { locale, t } = await getI18n(props.params);
  return {
    title: t.ingredients.metaTitle,
    description: t.ingredients.metaDescription,
    alternates: alternates(locale, "/ingredients"),
  };
}

export default async function IngredientsPage(props: PageProps<"/[lang]/ingredients">) {
  const i = await getI18n(props.params);
  const { t } = i;
  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-24 pt-36 md:px-10">
      <p className="text-sm text-smoke">{t.ingredients.eyebrow}</p>
      <div className="mt-3 grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-end">
        <h1 className="display text-[clamp(2.6rem,5vw,4.25rem)] text-balance">{t.ingredients.title}</h1>
        <p className="max-w-sm text-smoke">{i.plural(t.ingredients.intro, ingredients.length)}</p>
      </div>
      <div className="mt-14">
        <IngredientIndex />
      </div>
      <div className="-mx-5 md:-mx-10">
        <OriginsGlobe />
      </div>
    </div>
  );
}
