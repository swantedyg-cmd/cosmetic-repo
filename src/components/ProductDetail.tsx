"use client";

import { useEffect, useId, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "@/i18n/Link";
import { useI18n } from "@/i18n/client";
import { productPhotos } from "@/data/photos";
import {
  ENGRAVING_MAX,
  ENGRAVING_PRICE,
  ENGRAVING_STYLES,
  cleanEngraving,
  ritualOf,
  type EngravingStyle,
  type Product,
} from "@/data/products";
import { useCart } from "@/lib/cart";
import { recordView } from "@/lib/recent";
import { sceneColors, useTheme } from "@/lib/theme";
import { useDevice } from "@/lib/useDevice";

const ProductViewer = dynamic(() => import("./three/ProductViewer"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-blush-2" />,
});

export default function ProductDetail({ product: base }: { product: Product }) {
  const i = useI18n();
  const { t } = i;
  const product = i.product(base);
  const [variantId, setVariantId] = useState(product.variants[0].id);
  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const [added, setAdded] = useState(false);
  const [view, setView] = useState<"3d" | number>("3d");
  const [opened, setOpened] = useState(false);
  const [engraveOpen, setEngraveOpen] = useState(false);
  const [engraveText, setEngraveText] = useState("");
  const [engraveStyle, setEngraveStyle] = useState<EngravingStyle>("foil");
  const theme = useTheme();
  const inputId = useId();
  const engraving = engraveOpen && engraveText.trim() ? { text: engraveText.trim(), style: engraveStyle } : undefined;
  const price = variant.price + (engraving ? ENGRAVING_PRICE : 0);
  const rituals = ritualOf(product.slug);

  useEffect(() => recordView(product.slug), [product.slug]);
  const photos = productPhotos[product.slug];
  const { add } = useCart();
  const { quality, reducedMotion } = useDevice();
  const maxPercent = Math.max(...product.actives.map((a) => a.percent));

  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-5 pb-24 pt-32 md:grid-cols-[1.2fr_1fr] md:gap-16 md:px-12">
      <div className="md:sticky md:top-28 md:h-[calc(100svh-8rem)]">
        <div className="relative h-[60svh] overflow-hidden rounded-[15px] bg-blush-2 md:h-[calc(100%-5.5rem)]">
          <div className={`absolute inset-0 transition-opacity duration-700 ${view === "3d" ? "opacity-100" : "pointer-events-none opacity-0"}`}>
            <ProductViewer
              product={product}
              color={variant.color ?? product.color}
              quality={quality}
              reducedMotion={reducedMotion}
              opened={opened}
              engraving={engraving}
              showBack={!!engraving}
              background={sceneColors[theme].viewer}
            />
            <p className="label pointer-events-none absolute bottom-4 start-5 text-smoke">
              {engraving ? t.product.engravingOnBack : ""}
              {t.product.dragToTurn}
              {product.shape === "pump" || product.shape === "dropper" ? t.product.clickForDrop : ""}
            </p>
            <button
              type="button"
              aria-pressed={opened}
              onClick={() => {
                setOpened((o) => !o);
                setEngraveOpen(false);
              }}
              className="btn btn-white absolute end-4 top-4 !px-5 !py-2.5"
            >
              {opened ? t.product.close : t.product.open}
            </button>
          </div>
          {photos.map((ph, n) => (
            <Image
              key={ph.src}
              src={ph.src}
              alt={i.alt(ph)}
              fill
              priority={n === 0}
              sizes="(min-width: 768px) 55vw, 100vw"
              className={`object-cover transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                view === n ? "scale-100 opacity-100" : "pointer-events-none scale-105 opacity-0"
              }`}
            />
          ))}
        </div>
        {/* Media switcher: the live 3D bottle first, then the photographs. */}
        <div className="mt-3 flex gap-2" role="tablist" aria-label={t.product.media}>
          <button
            type="button"
            role="tab"
            aria-selected={view === "3d"}
            onClick={() => setView("3d")}
            className={`flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[10px] border-[1.5px] bg-blush-2 text-xs font-medium transition-colors ${
              view === "3d" ? "border-ember text-ember" : "border-transparent text-ink hover:border-apricot"
            }`}
          >
            3D
          </button>
          {photos.map((ph, n) => (
            <button
              key={ph.src}
              type="button"
              role="tab"
              aria-selected={view === n}
              aria-label={i.alt(ph)}
              onClick={() => setView(n)}
              className={`relative h-[4.5rem] w-[4.5rem] overflow-hidden rounded-[10px] border-[1.5px] transition-colors ${
                view === n ? "border-ember" : "border-transparent hover:border-apricot"
              }`}
            >
              <Image src={ph.src} alt="" fill sizes="72px" className="object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div className="md:pt-10">
        <Link href="/shop" className="label text-smoke hover:text-ink">{t.product.allFormulas}</Link>
        <p className="label mt-8 flex items-center gap-3 text-smoke">
          {product.kind}
          <span className="rounded-full border border-ink/15 px-2.5 py-0.5 text-[11px]">
            {rituals.length === 2 ? t.common.morningEvening : rituals[0] === "AM" ? t.common.morning : t.common.evening}
          </span>
        </p>
        <h1 className="mt-3 font-display text-[clamp(2rem,4vw,3.2rem)] font-light leading-none tracking-tight">
          {product.name}
        </h1>
        <p className="mt-4 text-lg text-smoke">{product.tagline}</p>

        <fieldset className="mt-8">
          <legend className="label text-smoke">
            {product.variantLabel}: <span className="text-ink">{variant.label}</span>
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                aria-pressed={v.id === variant.id}
                onClick={() => setVariantId(v.id)}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
                  v.id === variant.id ? "border-ink bg-ink text-canvas" : "border-ink/20 hover:border-ink"
                }`}
              >
                {v.color && <span className="h-3 w-3 rounded-full" style={{ background: v.color }} />}
                {v.label}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Engraving atelier: type a name, pick foil or etched, and it appears on the back of the 3D glass. */}
        <section className={`mt-8 rounded-[12px] border transition-colors ${engraveOpen ? "border-gold" : "border-ink/15"}`}>
          <button
            type="button"
            aria-expanded={engraveOpen}
            aria-controls={`${inputId}-panel`}
            onClick={() => {
              const next = !engraveOpen;
              setEngraveOpen(next);
              if (next) {
                setView("3d");
                setOpened(false);
              }
            }}
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start"
          >
            <span>
              <span className="block text-[15px] text-ink">{t.product.engraveTitle}</span>
              <span className="block text-sm text-smoke">
                {i.fmt(t.product.engraveSub, { price: i.price(ENGRAVING_PRICE) })}
              </span>
            </span>
            <span aria-hidden className={`atelier-plus ${engraveOpen ? "is-open" : ""}`} />
          </button>
          <div id={`${inputId}-panel`} hidden={!engraveOpen} className="border-t border-mist px-5 pb-5 pt-4">
            <label htmlFor={inputId} className="label flex justify-between text-smoke">
              <span>{t.product.yourWords}</span>
              <span className="tabular-nums" dir="ltr">
                {engraveText.length}/{ENGRAVING_MAX}
              </span>
            </label>
            <input
              id={inputId}
              name="engraving"
              type="text"
              autoComplete="off"
              spellCheck={false}
              maxLength={ENGRAVING_MAX}
              value={engraveText}
              onChange={(e) => setEngraveText(cleanEngraving(e.target.value))}
              placeholder={t.product.engravePlaceholder}
              className="mt-2 w-full rounded-full border border-ink/20 bg-transparent px-5 py-3 text-lg font-light tracking-[0.04em] text-ink outline-none placeholder:text-smoke focus:border-ink"
            />
            <fieldset className="mt-4">
              <legend className="label text-smoke">{t.product.finish}</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {ENGRAVING_STYLES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={engraveStyle === s.id}
                    onClick={() => setEngraveStyle(s.id)}
                    className={`rounded-[10px] border px-4 py-3 text-start transition-colors ${
                      engraveStyle === s.id ? "border-ink" : "border-ink/15 hover:border-ink/50"
                    }`}
                  >
                    <span className={`block text-sm ${s.id === "foil" ? "foil font-medium" : "text-ink"}`}>{t.product.styles[s.id].label}</span>
                    <span className="block text-xs text-smoke">{t.product.styles[s.id].note}</span>
                  </button>
                ))}
              </div>
            </fieldset>
            <p className="mt-4 text-xs text-smoke">
              {t.product.engraveNote}
            </p>
          </div>
        </section>

        <div className="mt-6 flex flex-wrap items-center gap-6">
          <button
            type="button"
            onClick={() => {
              add(product.slug, variant.id, engraving);
              setAdded(true);
            }}
            className="btn"
          >
            {i.fmt(t.product.addPrice, { price: i.price(price) })}
          </button>
          {added && (
            <Link href="/cart" role="status" className="text-sm underline underline-offset-4">
              {t.product.addedView}
            </Link>
          )}
        </div>

        <section className="mt-14 border-t border-mist pt-8">
          <h2 className="label text-smoke">{t.product.actives}</h2>
          <ul className="mt-4 space-y-3">
            {product.actives.map((a) => (
              <li key={a.name}>
                <div className="flex justify-between text-sm">
                  <span>{a.name}</span>
                  <span className="label tabular-nums">{i.num(a.percent)}%</span>
                </div>
                <span className="mt-1.5 block h-1.5 rounded-full bg-mist">
                  <span
                    className="block h-full rounded-full"
                    style={{ width: `${(a.percent / maxPercent) * 100}%`, background: variant.color ?? product.color }}
                  />
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12 space-y-8 border-t border-mist pt-8">
          <div>
            <h2 className="label text-smoke">{t.product.does}</h2>
            <p className="mt-3 leading-relaxed">{product.description}</p>
          </div>
          <div>
            <h2 className="label text-smoke">{t.product.howTo}</h2>
            <p className="mt-3 leading-relaxed">{product.howToUse}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
