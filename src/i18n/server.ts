import { notFound } from "next/navigation";
import { isLocale } from "./config";
import { getDictionary } from "./index";
import { makeI18n } from "./make";

/** For server components: resolve the [lang] param, or 404 an unknown language. */
export async function getI18n(params: Promise<{ lang: string }>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return makeI18n(lang, getDictionary(lang));
}
