/**
 * Static art for `/rent-home-for-sundance-film-festival-boulder`.
 * Files live in `public/images/sundance/` (served as `/images/sundance/...`).
 */
const base = "/images/sundance";

const flatirons = `${base}/flatirons-sundance-film-festival-boulder-colorado-01.jpg`;
const pearlStreet = `${base}/pearl-street-sundance-film-festival-boulder-colorado-01.jpg`;
const boulderGeneral = `${base}/sundance-film-festival-boulder-colorado-01.jpg`;
const theater = `${base}/sundance-film-festival-boulder-theater.jpg`;

export const sundancePageImages = {
  /** Full-bleed hero behind the headline */
  hero: flatirons,
  /** Four-up “Boulder in the frame” row */
  boulderMoments: [
    {
      src: flatirons,
      alt: "Boulder-area landscape or festival-town moment",
      caption: "Front Range views",
    },
    {
      src: pearlStreet,
      alt: "Walkable downtown or Pearl Street energy",
      caption: "Walkable downtown energy",
    },
    {
      src: boulderGeneral,
      alt: "Rocky Mountain winter in Colorado",
      caption: "Rocky Mountain winter",
    },
    {
      src: theater,
      alt: "Mountain town character near Boulder",
      caption: "Mountain town character",
    },
  ],
  /** Two-up “Homes that fit the moment” */
  homeInspiration: [
    {
      src: theater,
      alt: "Festival venues and Boulder theater character near where guests stay",
      caption: "Homes guests remember",
    },
    {
      src: pearlStreet,
      alt: "Boulder-area home exterior or curb appeal",
      caption: "Boulder-area curb appeal",
    },
  ],
} as const;
