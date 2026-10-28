import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import ProductExtras from "@/components/ProductExtras";
import { getProduct, products } from "@/data/products";

type Params = PageProps<"/shop/[slug]">["params"];

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/shop/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const product = getProduct(slug);
  return product ? { title: product.name, description: product.tagline } : {};
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
      <ProductDetail product={product} />
      <ProductExtras product={product} />
    </>
  );
}
