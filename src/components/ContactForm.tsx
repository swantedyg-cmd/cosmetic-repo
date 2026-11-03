"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/client";

export default function ContactForm() {
  const { t } = useI18n();
  const [sent, setSent] = useState(false);
  const field = "w-full rounded-[30px] border border-graphite/30 bg-transparent px-5 py-3 outline-none focus:border-ink";

  if (sent)
    return (
      <p role="status" className="self-center text-lg">
        {t.contact.sent}
      </p>
    );

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <div>
        <label htmlFor="c-name" className="label text-smoke">{t.contact.name}</label>
        <input id="c-name" name="name" autoComplete="name" required className={`mt-2 ${field}`} />
      </div>
      <div>
        <label htmlFor="c-email" className="label text-smoke">{t.contact.email}</label>
        <input id="c-email" name="email" type="email" autoComplete="email" dir="ltr" required className={`mt-2 text-start ${field}`} />
      </div>
      <div>
        <label htmlFor="c-msg" className="label text-smoke">{t.contact.message}</label>
        <textarea id="c-msg" name="message" rows={5} required className={`mt-2 ${field}`} />
      </div>
      <button className="btn self-start">{t.contact.send}</button>
    </form>
  );
}
