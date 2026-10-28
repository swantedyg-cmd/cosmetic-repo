"use client";

import { useState } from "react";
import Link from "next/link";
import LayerStack from "./LayerStack";
import { formatPrice, getProduct, type Product } from "@/data/products";
import { useCart } from "@/lib/cart";

// Three questions, one routine. Scores are simple on purpose so the client can tune them.

type Option = { id: string; label: string; hint: string; score: Record<string, number> };
type Question = { id: string; ask: string; options: Option[] };

const QUESTIONS: Question[] = [
  {
    id: "feel",
    ask: "How does your skin feel by midday?",
    options: [
      { id: "dry", label: "Tight or flaky", hint: "Dry", score: { "ember-facial-oil": 3, "veil-barrier-cream": 2 } },
      { id: "oily", label: "Shiny all over", hint: "Oily", score: { "dew-serum": 3 } },
      { id: "combo", label: "Shiny in the middle, tight on the cheeks", hint: "Combination", score: { "dew-serum": 2, "veil-barrier-cream": 1 } },
      { id: "sensitive", label: "Fine, but it reacts easily", hint: "Sensitive", score: { "veil-barrier-cream": 3 } },
    ],
  },
  {
    id: "goal",
    ask: "What would you change first?",
    options: [
      { id: "glow", label: "Looks dull", hint: "Glow", score: { "ember-facial-oil": 3, "dew-serum": 1 } },
      { id: "pores", label: "Visible pores and shine", hint: "Refine", score: { "dew-serum": 3 } },
      { id: "calm", label: "Redness and tightness", hint: "Calm", score: { "veil-barrier-cream": 3 } },
      { id: "colour", label: "I'd like a bit of colour", hint: "Colour", score: { "tint-balm": 5 } },
    ],
  },
  {
    id: "steps",
    ask: "How many steps will you actually do?",
    options: [
      { id: "2", label: "Two, and I'm out the door", hint: "2 steps", score: {} },
      { id: "3", label: "Three is fine", hint: "3 steps", score: {} },
      { id: "4", label: "The full ritual", hint: "4 steps", score: {} },
    ],
  },
];

// Thinnest first, richest last; colour goes on top.
const ORDER = ["dew-serum", "ember-facial-oil", "veil-barrier-cream", "tint-balm"];

function buildRoutine(answers: Record<string, string>): Product[] {
  const scores: Record<string, number> = Object.fromEntries(ORDER.map((s) => [s, 0]));
  // Every routine ends in moisturiser, so it always gets a head start.
  scores["veil-barrier-cream"] += 2;
  for (const q of QUESTIONS) {
    const opt = q.options.find((o) => o.id === answers[q.id]);
    for (const [slug, n] of Object.entries(opt?.score ?? {})) scores[slug] += n;
  }
  const count = Number(answers.steps ?? 3);
  const picked = [...ORDER].sort((a, b) => scores[b] - scores[a]).slice(0, count);
  return ORDER.filter((s) => picked.includes(s)).map((s) => getProduct(s)!);
}

export default function RoutineFinder() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [added, setAdded] = useState(false);
  const { add } = useCart();
  const done = step >= QUESTIONS.length;
  const routine = done ? buildRoutine(answers) : [];
  const total = routine.reduce((n, p) => n + p.variants[0].price, 0);

  const choose = (q: Question, o: Option) => {
    setAnswers((a) => ({ ...a, [q.id]: o.id }));
    setStep((s) => s + 1);
  };

  const restart = () => {
    setAnswers({});
    setStep(0);
    setAdded(false);
  };

  return (
    <div className="grid gap-12 md:grid-cols-[1fr_1fr] md:gap-16">
      <div>
        {/* Progress: one hairline per question, filling in ember as you answer. */}
        <ol className="flex gap-2" aria-label="Progress">
          {QUESTIONS.map((q, i) => (
            <li key={q.id} className="flex-1">
              <span className={`block h-[2px] transition-colors duration-500 ${i < step ? "bg-ember" : i === step ? "bg-ink" : "bg-mist"}`} />
              <span className="mt-2 block text-xs text-smoke">
                {answers[q.id] ? q.options.find((o) => o.id === answers[q.id])!.hint : `Question ${i + 1}`}
              </span>
            </li>
          ))}
        </ol>

        {!done ? (
          <fieldset key={step} className="routine-question mt-12">
            <legend className="display text-[clamp(2rem,3.6vw,2.9rem)] text-balance">{QUESTIONS[step].ask}</legend>
            <div className="mt-8 grid gap-[10px]">
              {QUESTIONS[step].options.map((o, i) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => choose(QUESTIONS[step], o)}
                  style={{ animationDelay: `${120 + i * 70}ms` }}
                  className="routine-option group flex items-center justify-between rounded-[10px] border-[1.5px] border-mist px-5 py-4 text-left transition-colors hover:border-ember"
                >
                  <span className="text-[17px] font-light tracking-[-0.02em]">{o.label}</span>
                  <span className="text-xs text-smoke transition-colors group-hover:text-ember">{o.hint}</span>
                </button>
              ))}
            </div>
            {step > 0 && (
              <button type="button" onClick={() => setStep((s) => s - 1)} className="mt-6 text-sm text-smoke hover:text-ink">
                ← Back
              </button>
            )}
          </fieldset>
        ) : (
          <div className="routine-question mt-12" aria-live="polite">
            <p className="text-sm text-smoke">Your routine</p>
            <h2 className="display mt-3 text-[clamp(2rem,3.6vw,2.9rem)]">
              {routine.length} steps, thinnest first
            </h2>
            <ol className="mt-8 border-t border-mist">
              {routine.map((p, i) => (
                <li key={p.slug} className="routine-option grid grid-cols-[3.5rem_1fr_auto] items-baseline gap-4 border-b border-mist py-5" style={{ animationDelay: `${i * 90}ms` }}>
                  <span className="text-xs text-smoke">Step {i + 1}</span>
                  <span>
                    <Link href={`/shop/${p.slug}`} className="text-[21px] font-light tracking-[-0.03em] hover:text-ember">{p.name}</Link>
                    <span className="mt-1 block text-sm text-smoke">{p.howToUse}</span>
                  </span>
                  <span className="text-sm tabular-nums">{formatPrice(p.variants[0].price)}</span>
                </li>
              ))}
            </ol>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <button
                type="button"
                className="btn"
                onClick={() => {
                  routine.forEach((p) => add(p.slug, p.variants[0].id));
                  setAdded(true);
                }}
              >
                Add routine to bag · {formatPrice(total)}
              </button>
              {added ? (
                <Link href="/cart" role="status" className="text-sm underline underline-offset-4">Added. View bag</Link>
              ) : (
                <button type="button" onClick={restart} className="text-sm text-smoke hover:text-ink">Start again</button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="relative min-h-[360px] overflow-hidden rounded-[15px] bg-[#fbe9dc] md:min-h-[520px]">
        <LayerStack key={routine.map((p) => p.slug).join()} steps={done ? routine : []} className="absolute inset-0" />
        {!done && (
          <p className="absolute inset-x-0 bottom-6 text-center text-sm text-ink/60">Your layers stack up here</p>
        )}
      </div>
    </div>
  );
}
