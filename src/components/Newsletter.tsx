"use client";

import { useState } from "react";

export default function Newsletter() {
  const [joined, setJoined] = useState(false);

  return (
    <section className="mx-auto max-w-[1280px] px-5 py-20 md:px-10">
      <div className="grid gap-8 rounded-[10px] bg-tangerine px-6 py-12 text-canvas md:grid-cols-2 md:items-end md:px-12 md:py-16">
        <div>
          <h2 className="display text-[clamp(2.2rem,4.4vw,3.25rem)] !text-canvas">Get new formulas first</h2>
          <p className="mt-4 max-w-sm">One email when something launches. Nothing in between.</p>
        </div>
        {joined ? (
          <p className="text-lg" role="status">You’re on the list.</p>
        ) : (
          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              setJoined(true);
            }}
          >
            <label htmlFor="nl-email" className="sr-only">Email address</label>
            <input
              id="nl-email"
              type="email"
              required
              placeholder="Your email"
              className="flex-1 rounded-[30px] border-2 border-canvas bg-transparent px-5 py-[13px] text-canvas outline-none placeholder:text-canvas/75"
            />
            <button className="rounded-[600px] bg-canvas px-10 py-[15px] text-sm font-medium text-ember transition-colors hover:bg-ink hover:text-canvas">
              Join the list
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
