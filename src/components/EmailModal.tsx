"use client";

import { useEffect, useRef, useState } from "react";
import { CloseIcon, HeartIcon } from "./icons";

const SEEN_KEY = "solenne-email-modal-seen";

// Newsletter offer: appears once per browser, 12s after the first visit.
export default function EmailModal() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(SEEN_KEY)) return;
    } catch {}
    const t = setTimeout(() => {
      dialog.current?.showModal();
      try {
        localStorage.setItem(SEEN_KEY, "1");
      } catch {}
    }, 12000);
    return () => clearTimeout(t);
  }, []);

  return (
    <dialog
      ref={dialog}
      onClick={(e) => e.target === dialog.current && dialog.current?.close()}
      className="m-auto w-[min(480px,calc(100vw-32px))] rounded-[10px] bg-tangerine p-0 text-canvas backdrop:bg-black/60"
    >
      <div className="relative px-8 pb-10 pt-12 text-center">
        <button
          type="button"
          aria-label="Close"
          onClick={() => dialog.current?.close()}
          className="absolute right-4 top-4"
        >
          <CloseIcon className="h-5 w-5 [stroke-width:2]" />
        </button>
        <HeartIcon className="mx-auto h-6 w-6" />
        <h2 className="mt-3 text-[32px] font-light italic leading-tight tracking-[-0.04em] text-canvas">
          skincare community
        </h2>
        {joined ? (
          <p className="mt-4" role="status">You’re in. Your code is on its way to your inbox.</p>
        ) : (
          <>
            <p className="mx-auto mt-3 max-w-xs">Join for 10% off your first order and first access to new formulas.</p>
            <form
              className="mt-7 flex flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                setJoined(true);
              }}
            >
              <label htmlFor="modal-email" className="sr-only">Email address</label>
              <input
                id="modal-email"
                type="email"
                required
                placeholder="Your email"
                className="rounded-[30px] border-2 border-canvas bg-transparent px-5 py-[13px] text-canvas outline-none placeholder:text-canvas/75"
              />
              <button className="rounded-[600px] bg-canvas px-12 py-[15px] font-medium text-ember transition-colors hover:bg-ink hover:text-canvas">
                Get 10% off
              </button>
            </form>
          </>
        )}
      </div>
    </dialog>
  );
}
