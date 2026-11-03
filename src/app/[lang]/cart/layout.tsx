import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(props: LayoutProps<"/[lang]/cart">): Promise<Metadata> {
  const { t } = await getI18n(props.params);
  return { title: t.cart.metaTitle, robots: { index: false, follow: true } };
}

export default function CartLayout({ children }: LayoutProps<"/[lang]/cart">) {
  return children;
}
