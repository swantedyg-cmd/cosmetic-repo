import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import ProductExtras from "@/components/ProductExtras";
import { getProduct, products, type Product as ProductData } from "@/data/products";
import { productPhotos } from "@/data/photos";
import { BRAND, SITE_URL } from "@/lib/site";

type Params = PageProps<"/shop/[slug]">["params"];

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/shop/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const product = getProduct(slug);
  if (!product) return {};
  const description = `${product.tagline} ${product.actives.map((a) => `${a.name} ${a.percent}%`).join(", ")}.`;
  return {
    title: product.name,
    description,
    alternates: { canonical: `/shop/${product.slug}` },
    openGraph: { type: "website", title: `${product.name} · ${BRAND}`, description, url: `/shop/${product.slug}` },
  };
}

export default function ProductPage(props: PageProps<"/shop/[slug]">) {
  return (
    <Suspense fallback={<div className="h-svh" />}>
      <Product params={props.params} />
    </Suspense>
  );
}

async function Product({ params }: { params: Params }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)) }} />
      <ProductDetail product={product} />
      <ProductExtras product={product} />
    </>
  );
}

/** Product rich result. No ratings: the reviews on the site are samples until real ones arrive. */
function productJsonLd(p: ProductData) {
  const url = `${SITE_URL}/shop/${p.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    category: p.kind,
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
