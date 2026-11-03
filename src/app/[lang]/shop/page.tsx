import type { Metadata } from "next";
import ShopGrid from "@/components/ShopGrid";
import RecentlyViewed from "@/components/RecentlyViewed";
import { products } from "@/data/products";
import { getI18n } from "@/i18n/server";
import { alternates } from "@/i18n/seo";

export async function generateMetadata(props: PageProps<"/[lang]/shop">): Promise<Metadata> {
  const { locale, t } = await getI18n(props.params);
  return { title: t.shop.metaTitle, description: t.shop.metaDescription, alternates: alternates(locale, "/shop") };
}

export default async function ShopPage(props: PageProps<"/[lang]/shop">) {
  const i = await getI18n(props.params);
  return (
    <>
      <div className="mx-auto max-w-[1280px] px-5 pb-4 pt-36 md:px-10">
        <h1 className="display text-[clamp(3rem,7vw,6rem)]">{i.t.shop.title}</h1>
        <p className="mt-4 max-w-md text-smoke">{i.plural(i.t.shop.intro, products.length)}</p>
        <ShopGrid />
      </div>
      <RecentlyViewed />
    </>
  );
}
