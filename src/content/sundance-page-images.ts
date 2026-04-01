/**
 * Static art for `/rent-home-for-sundance-film-festival-boulder`.
 * Place files under `public/images/sundance/` (served as `/images/sundance/...`)
 * or change these paths to match whatever you put in `public/images/`.
 */
const base = "/images/sundance";

export const sundancePageImages = {
  /** Full-bleed hero behind the headline */
  hero: `${base}/hero.jpg`,
  /** Four-up “Boulder in the frame” row */
  boulderMoments: [
    {
      src: `${base}/boulder-1.jpg`,
      alt: "Boulder-area landscape or festival-town moment",
      caption: "Front Range views",
    },
    {
      src: `${base}/boulder-2.jpg`,
      alt: "Walkable downtown or Pearl Street energy",
      caption: "Walkable downtown energy",
    },
    {
      src: `${base}/boulder-3.jpg`,
      alt: "Rocky Mountain winter in Colorado",
      caption: "Rocky Mountain winter",
    },
    {
      src: `${base}/boulder-4.jpg`,
      alt: "Mountain town character near Boulder",
      caption: "Mountain town character",
    },
  ],
  /** Two-up “Homes that fit the moment” */
  homeInspiration: [
    {
      src: `${base}/home-1.jpg`,
      alt: "Bright interior or living space for festival guests",
      caption: "Homes guests remember",
    },
    {
      src: `${base}/home-2.jpg`,
      alt: "Boulder-area home exterior or curb appeal",
      caption: "Boulder-area curb appeal",
    },
  ],
} as const;
