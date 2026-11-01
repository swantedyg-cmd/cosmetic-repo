// Where the naturally derived actives come from, for the origins globe.
// PLACEHOLDER SOURCING: plausible regions for each raw material, not the client's
// real supply chain. Replace with their supplier list before launch.

export type Origin = {
  ingredient: string;
  source: string;
  place: string;
  lat: number;
  lng: number;
  story: string;
};

export const ORIGINS: Origin[] = [
  {
    ingredient: "Squalane",
    source: "Sugarcane",
    place: "São Paulo, Brazil",
    lat: -22.9,
    lng: -47.1,
    story: "Pressed from sugarcane rather than olive or shark liver, then hydrogenated so it never goes rancid.",
  },
  {
    ingredient: "Sea buckthorn oil",
    source: "Wild berries",
    place: "Altai, Mongolia",
    lat: 48.0,
    lng: 91.6,
    story: "Hand-picked after the first frost, when the berries are richest in the carotenoids that turn the oil amber.",
  },
  {
    ingredient: "Shea butter",
    source: "Shea nuts",
    place: "Tamale, northern Ghana",
    lat: 9.4,
    lng: -0.85,
    story: "Bought from a women’s cooperative that cracks, roasts and kneads the nuts by hand.",
  },
  {
    ingredient: "Jojoba oil",
    source: "Jojoba seeds",
    place: "Sonoran Desert, Mexico",
    lat: 29.1,
    lng: -110.9,
    story: "A desert shrub that needs almost no water. The seed holds a liquid wax close to skin’s own sebum.",
  },
  {
    ingredient: "French green clay",
    source: "Sedimentary clay",
    place: "Massif Central, France",
    lat: 45.5,
    lng: 2.9,
    story: "Quarried from old seabed deposits and dried in the sun, which gives it its sage-green colour.",
  },
  {
    ingredient: "Kaolin",
    source: "China clay",
    place: "Cornwall, United Kingdom",
    lat: 50.4,
    lng: -4.8,
    story: "The softest white clay, washed out of weathered granite. It lifts oil without stripping.",
  },
  {
    ingredient: "Bakuchiol",
    source: "Babchi seeds",
    place: "Rajasthan, India",
    lat: 26.9,
    lng: 75.8,
    story: "Extracted from the seeds of Psoralea corylifolia, used in Ayurvedic practice for centuries.",
  },
  {
    ingredient: "Ferulic acid",
    source: "Rice bran",
    place: "Niigata, Japan",
    lat: 37.9,
    lng: 139.0,
    story: "Drawn from the bran left over from milling rice, so nothing from the harvest goes to waste.",
  },
  {
    ingredient: "Caffeine",
    source: "Green coffee beans",
    place: "Huila, Colombia",
    lat: 2.5,
    lng: -75.5,
    story: "Taken from unroasted beans grown on the slopes of the Andes.",
  },
  {
    ingredient: "Vitamin E",
    source: "Sunflower seeds",
    place: "Andalusia, Spain",
    lat: 37.4,
    lng: -5.9,
    story: "Natural tocopherols from sunflower oil, which also keep the oils in each formula fresh.",
  },
];

/** Actives we make in the lab on purpose: purer, steadier and kinder to wild plants. */
export const LAB_MADE = [
  "Niacinamide",
  "Hyaluronic acid",
  "Ceramides",
  "Peptides",
  "Retinal",
  "Ascorbic acid",
  "Panthenol",
  "Glycolic acid",
  "Lactic acid",
];
