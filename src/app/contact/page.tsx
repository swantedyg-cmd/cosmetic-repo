"use client";

import { useState } from "react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const field = "w-full rounded-[30px] border border-graphite/30 bg-transparent px-5 py-3 outline-none focus:border-ink";

  return (
    <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-24 pt-32 md:grid-cols-2 md:px-12">
      <div>
        <h1 className="display text-[clamp(2rem,4vw,3.2rem)] ">Contact</h1>
        <p className="mt-4 max-w-sm text-smoke">
          Questions about a formula, an order or your skin. We reply within one working day.
        </p>
        <p className="label mt-10 text-smoke">Email</p>
        <a href="mailto:hello@example.com" className="mt-1 inline-block hover:text-ember">hello@example.com</a>
      </div>

      {sent ? (
        <p role="status" className="self-center text-lg">Message sent. We’ll reply within one working day.</p>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <div>
            <label htmlFor="c-name" className="label text-smoke">Name</label>
            <input id="c-name" required className={`mt-2 ${field}`} />
          </div>
          <div>
            <label htmlFor="c-email" className="label text-smoke">Email</label>
            <input id="c-email" type="email" required className={`mt-2 ${field}`} />
          </div>
          <div>
            <label htmlFor="c-msg" className="label text-smoke">Message</label>
            <textarea id="c-msg" rows={5} required className={`mt-2 ${field}`} />
          </div>
          <button className="btn self-start">
            Send message
          </button>
        </form>
      )}
    </div>
  );
}
