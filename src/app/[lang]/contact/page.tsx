import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { getI18n } from "@/i18n/server";
import { alternates } from "@/i18n/seo";

export async function generateMetadata(props: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { locale, t } = await getI18n(props.params);
  return { title: t.contact.metaTitle, description: t.contact.metaDescription, alternates: alternates(locale, "/contact") };
}

export default async function ContactPage(props: PageProps<"/[lang]/contact">) {
  const { t } = await getI18n(props.params);
  return (
    <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-24 pt-32 md:grid-cols-2 md:px-12">
      <div>
        <h1 className="display text-[clamp(2rem,4vw,3.2rem)] ">{t.contact.title}</h1>
        <p className="mt-4 max-w-sm text-smoke">{t.contact.body}</p>
        <p className="label mt-10 text-smoke">{t.contact.email}</p>
        <a href="mailto:hello@example.com" dir="ltr" className="mt-1 inline-block hover:text-ember">hello@example.com</a>
      </div>
      <ContactForm />
    </div>
  );
}
