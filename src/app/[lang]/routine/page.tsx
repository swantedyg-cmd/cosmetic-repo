import type { Metadata } from "next";
import RoutineFinder from "@/components/RoutineFinder";
import { getI18n } from "@/i18n/server";
import { alternates } from "@/i18n/seo";

export async function generateMetadata(props: PageProps<"/[lang]/routine">): Promise<Metadata> {
  const { locale, t } = await getI18n(props.params);
  return { title: t.routine.metaTitle, description: t.routine.metaDescription, alternates: alternates(locale, "/routine") };
}

export default async function RoutinePage(props: PageProps<"/[lang]/routine">) {
  const { t } = await getI18n(props.params);
  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-24 pt-36 md:px-10">
      <p className="text-sm text-smoke">{t.routine.eyebrow}</p>
      <h1 className="display mt-3 max-w-3xl text-[clamp(2.6rem,5vw,4.25rem)] text-balance">{t.routine.title}</h1>
      <div className="mt-14">
        <RoutineFinder />
      </div>
    </div>
  );
}
