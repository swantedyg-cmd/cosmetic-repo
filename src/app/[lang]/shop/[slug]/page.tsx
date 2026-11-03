import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import ProductExtras from "@/components/ProductExtras";
import { getProduct, products, type Product as ProductData } from "@/data/products";
import { productPhotos } from "@/data/photos";
import { BRAND, SITE_URL } from "@/lib/site";
import { getI18n } from "@/i18n/server";
import { alternates, ogLocale } from "@/i18n/seo";
import type { I18n } from "@/i18n/make";

type Props = PageProps<"/[lang]/shop/[slug]">;

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const i = await getI18n(props.params);
  const { slug } = await props.params;
  const base = getProduct(slug);
  if (!base) return {};
  const product = i.product(base);
  const description = i.fmt(i.t.product.metaDescription, {
    tagline: product.tagline,
    actives: product.actives.map((a) => `${a.name} ${i.num(a.percent)}%`).join(", "),
  });
  const path = `/shop/${product.slug}`;
  return {
    title: product.name,
    description,
    alternates: alternates(i.locale, path),
    openGraph: {
      type: "website",
      title: `${product.name} · ${BRAND}`,
      description,
      url: i.href(path),
      ...ogLocale(i.locale),
    },
  };
}

export default function ProductPage(props: Props) {
  return (
    <Suspense fallback={<div className="h-svh" />}>
      <Product params={props.params} />
    </Suspense>
  );
}

async function Product({ params }: { params: Props["params"] }) {
  const i = await getI18n(params);
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product, i)) }} />
      <ProductDetail product={product} />
      <ProductExtras product={product} />
    </>
  );
}

/** Product rich result. No ratings: the reviews on the site are samples until real ones arrive. */
function productJsonLd(base: ProductData, i: I18n) {
  const p = i.product(base);
  const url = `${SITE_URL}${i.href(`/shop/${p.slug}`)}`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    category: p.kind,
    inLanguage: i.locale,
    brand: { "@type": "Brand", name: BRAND },
    image: productPhotos[p.slug].map((ph) => `${SITE_URL}${ph.src}`),
    url,
    offers: p.variants.map((v) => ({
      "@type": "Offer",
      name: v.label,
      price: v.price.toFixed(2),
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url,
    })),
  };
}
