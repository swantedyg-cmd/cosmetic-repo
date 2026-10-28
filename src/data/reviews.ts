// SAMPLE REVIEWS for layout only — replace with real, verified customer reviews
// (e.g. from Shopify Product Reviews, Judge.me or Yotpo) before launch.

export type SkinType = "Dry" | "Oily" | "Combination" | "Sensitive";

export type Review = {
  id: string;
  product: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  body: string;
  author: string;
  skin: SkinType;
  weeks: number;
};

export const SKIN_TYPES: SkinType[] = ["Dry", "Oily", "Combination", "Sensitive"];

export const reviews: Review[] = [
  { id: "r1", product: "dew-serum", rating: 5, title: "Shine gone by lunch", body: "Two pumps in the morning and my T-zone stays matte until late afternoon. Sits well under sunscreen.", author: "M.", skin: "Oily", weeks: 6 },
  { id: "r2", product: "veil-barrier-cream", rating: 5, title: "Fixed my over-exfoliated skin", body: "After a week of too many acids my cheeks stung. This calmed them in a few days.", author: "A.", skin: "Sensitive", weeks: 4 },
  { id: "r3", product: "ember-facial-oil", rating: 4, title: "Three drops is plenty", body: "Sinks in faster than I expected. I use it only at night because of the glow.", author: "L.", skin: "Dry", weeks: 8 },
  { id: "r4", product: "tint-balm", rating: 5, title: "Coral on cheeks, every day", body: "Blends with fingers in seconds and doesn't settle into dry patches.", author: "S.", skin: "Combination", weeks: 3 },
  { id: "r5", product: "dew-serum", rating: 4, title: "Pores look smaller", body: "Not a miracle, but after a month my nose looks smoother in photos.", author: "J.", skin: "Combination", weeks: 5 },
  { id: "r6", product: "veil-barrier-cream", rating: 5, title: "Finally a cream that isn't heavy", body: "Rich in the jar, soft on skin. My face doesn't feel tight in the morning anymore.", author: "R.", skin: "Dry", weeks: 10 },
  { id: "r7", product: "ember-facial-oil", rating: 5, title: "No breakouts", body: "I was nervous using an oil on oily skin. No new spots, and it layers fine over the serum.", author: "K.", skin: "Oily", weeks: 6 },
  { id: "r8", product: "tint-balm", rating: 4, title: "Cocoa is my shade", body: "Sheer enough for the office. I'd love a slightly bigger stick.", author: "N.", skin: "Sensitive", weeks: 2 },
];
