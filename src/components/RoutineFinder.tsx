"use client";

import { useState } from "react";
import Link from "@/i18n/Link";
import LayerStack from "./LayerStack";
import { getProduct, type Product } from "@/data/products";
import { useI18n } from "@/i18n/client";
import { useCart } from "@/lib/cart";

// Three questions, one routine. Scores are simple on purpose so the client can tune them.
// The wording of each question and answer lives in the dictionaries, under routine.questions.

type Option = { id: string; score: Record<string, number> };
type Question = { id: string; options: Option[] };

const QUESTIONS: Question[] = [
  {
    id: "feel",
    options: [
      { id: "dry", score: { "ember-facial-oil": 3, "veil-barrier-cream": 2, "halo-gel-cleanser": 1 } },
      { id: "oily", score: { "dew-serum": 3, "green-clay-mask": 2, "lucent-tonic": 1 } },
      { id: "combo", score: { "dew-serum": 2, "lucent-tonic": 2, "veil-barrier-cream": 1 } },
      { id: "sensitive", score: { "veil-barrier-cream": 3, "halo-gel-cleanser": 2 } },
    ],
  },
  {
    id: "goal",
    options: [
      { id: "glow", score: { "lumen-c-serum": 3, "lucent-tonic": 2, "ember-facial-oil": 1 } },
      { id: "pores", score: { "dew-serum": 3, "green-clay-mask": 2, "lucent-tonic": 1 } },
      { id: "calm", score: { "veil-barrier-cream": 3, "halo-gel-cleanser": 1 } },
      { id: "lines", score: { "nocturne-retinal-serum": 3, "cloud-eye-cream": 2 } },
      { id: "colour", score: { "tint-balm": 5 } },
    ],
  },
  {
    id: "steps",
    options: [
      { id: "2", score: {} },
      { id: "3", score: {} },
      { id: "4", score: {} },
    ],
  },
];

// Cleanse first, then thinnest to richest; colour goes on top.
const ORDER = [
  "halo-gel-cleanser",
  "green-clay-mask",
  "lucent-tonic",
  "lumen-c-serum",
  "dew-serum",
  "nocturne-retinal-serum",
  "ember-facial-oil",
  "cloud-eye-cream",
  "veil-barrier-cream",
  "tint-balm",
];

function buildRoutine(answers: Record<string, string>): Product[] {
  const scores: Record<string, number> = Object.fromEntries(ORDER.map((s) => [s, 0]));
  // Every routine starts with cleanser and ends in moisturiser, so both get a head start.
  scores["halo-gel-cleanser"] += 2;
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
  const i = useI18n();
  const { t } = i;
  const copy = (q: Question) => t.routine.questions[q.id];
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [added, setAdded] = useState(false);
  const { add } = useCart();
  const done = step >= QUESTIONS.length;
  const routine = done ? i.products(buildRoutine(answers)) : [];
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
        <ol className="flex gap-2" aria-label={t.routine.progress}>
          {QUESTIONS.map((q, n) => (
            <li key={q.id} className="flex-1">
              <span className={`block h-[2px] transition-colors duration-500 ${n < step ? "bg-ember" : n === step ? "bg-ink" : "bg-mist"}`} />
              <span className="mt-2 block text-xs text-smoke">
                {answers[q.id] ? copy(q).options[answers[q.id]].hint : i.fmt(t.routine.question, { n: n + 1 })}
              </span>
            </li>
          ))}
        </ol>

        {!done ? (
          <fieldset key={step} className="routine-question mt-12">
            <legend className="display text-[clamp(2rem,3.6vw,2.9rem)] text-balance">{copy(QUESTIONS[step]).ask}</legend>
            <div className="mt-8 grid gap-[10px]">
              {QUESTIONS[step].options.map((o, n) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => choose(QUESTIONS[step], o)}
                  style={{ animationDelay: `${120 + n * 70}ms` }}
                  className="routine-option group flex items-center justify-between gap-4 rounded-[10px] border-[1.5px] border-mist px-5 py-4 text-start transition-colors hover:border-ember"
                >
                  <span className="text-[17px] font-light tracking-[-0.02em]">{copy(QUESTIONS[step]).options[o.id].label}</span>
                  <span className="shrink-0 text-xs text-smoke transition-colors group-hover:text-ember">{copy(QUESTIONS[step]).options[o.id].hint}</span>
                </button>
              ))}
            </div>
            {step > 0 && (
              <button type="button" onClick={() => setStep((s) => s - 1)} className="mt-6 text-sm text-smoke hover:text-ink">
                {t.common.back}
              </button>
            )}
          </fieldset>
        ) : (
          <div className="routine-question mt-12" aria-live="polite">
            <p className="text-sm text-smoke">{t.routine.yours}</p>
            <h2 className="display mt-3 text-[clamp(2rem,3.6vw,2.9rem)]">
              {i.plural(t.routine.steps, routine.length)}
            </h2>
            <ol className="mt-8 border-t border-mist">
              {routine.map((p, n) => (
                <li key={p.slug} className="routine-option grid grid-cols-[4.5rem_1fr_auto] items-baseline gap-4 border-b border-mist py-5" style={{ animationDelay: `${n * 90}ms` }}>
                  <span className="text-xs text-smoke">{i.fmt(t.common.step, { n: n + 1 })}</span>
                  <span>
                    <Link href={`/shop/${p.slug}`} className="text-[21px] font-light tracking-[-0.03em] hover:text-ember">{p.name}</Link>
                    <span className="mt-1 block text-sm text-smoke">{p.howToUse}</span>
                  </span>
                  <span className="text-sm tabular-nums">{i.price(p.variants[0].price)}</span>
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
                {i.fmt(t.routine.addAll, { price: i.price(total) })}
              </button>
              {added ? (
                <Link href="/cart" role="status" className="text-sm underline underline-offset-4">{t.routine.addedView}</Link>
              ) : (
                <button type="button" onClick={restart} className="text-sm text-smoke hover:text-ink">{t.routine.restart}</button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="relative min-h-[360px] overflow-hidden rounded-[15px] bg-blush md:min-h-[520px]">
        <LayerStack key={routine.map((p) => p.slug).join()} steps={done ? routine : []} className="absolute inset-0" />
        {!done && (
          <p className="absolute inset-x-0 bottom-6 text-center text-sm text-ink/60">{t.routine.placeholder}</p>
        )}
      </div>
    </div>
  );
}
