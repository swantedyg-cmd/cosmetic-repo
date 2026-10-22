// Placeholder photography from Unsplash (free licence), saved in /public/photos.
// Replace the files (or these paths) with the client's own shoot.

export type Photo = { src: string; alt: string };

const u = (id: string) => `/photos/${id}.jpg`;

export const productPhotos: Record<string, Photo[]> = {
  "ember-facial-oil": [
    { src: u("1713768704571-6aeb0d0e5105"), alt: "Amber dropper bottle on an orange backdrop" },
    { src: u("1518842013791-b874be246c34"), alt: "Beads of orange oil on an orange surface" },
    { src: u("1784294331171-6deaf6847268"), alt: "Golden oil held in a glass pipette" },
  ],
  "dew-serum": [
    { src: u("1781346325200-61cef7b29d76"), alt: "Clear glass serum bottle with a gold collar" },
    { src: u("1748543668687-624e058c367c"), alt: "Pools of clear serum overlapping on a peach surface" },
    { src: u("1710410815589-dd83514104d0"), alt: "Clear glass dropper bottle with its pipette beside it" },
  ],
  "veil-barrier-cream": [
    { src: u("1763503839418-2b45c3d7a3c3"), alt: "Open jar of white cream floating above a stone" },
    { src: u("1585945037805-5fd82c2e60b1"), alt: "Swipe of thick white cream on a beige surface" },
    { src: u("1763503836825-97f5450d155a"), alt: "Open cream jar resting on a dark stone" },
  ],
  "tint-balm": [
    { src: u("1773372238316-5f080152bcf1"), alt: "Coral balm in a silver tube" },
    { src: u("1631214499500-2e34edcaccfe"), alt: "Swatches of balm from nude to red on pink" },
    { src: u("1773372238338-f26460145162"), alt: "Three pink balms standing among stones" },
  ],
};

export const editorial = {
  glass: { src: u("1555820585-c5ae44394b79"), alt: "Woman with eyes closed, seen through warm glass" },
  freckles: { src: u("1581182815808-b6eb627a8798"), alt: "Close portrait of a freckled face in soft light" },
  applying: { src: u("1670201203208-055d6d79db4a"), alt: "Woman pressing serum into her cheek" },
  portrait: { src: u("1531746020798-e6953c6e8e04"), alt: "Woman with bare skin against a pink wall" },
  amber: { src: u("1781344116880-029945a42b75"), alt: "Amber dropper bottle with a blank label on a stone plinth" },
  discs: { src: u("1748543668646-e81cda0890f3"), alt: "Serums in clear dishes beside a green leaf" },
} satisfies Record<string, Photo>;
