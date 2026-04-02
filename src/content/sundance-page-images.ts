import type { StaticImageData } from "next/image";
import flatirons from "@/assets/sundance/flatirons-sundance-film-festival-boulder-colorado-01.jpg";
import pearlStreet from "@/assets/sundance/pearl-street-sundance-film-festival-boulder-colorado-01.jpg";
import boulderGeneral from "@/assets/sundance/sundance-film-festival-boulder-colorado-01.jpg";
import theater from "@/assets/sundance/sundance-film-festival-boulder-theater.jpg";

type Moment = { src: StaticImageData; alt: string; caption: string };

/**
 * Sundance landing art — imported so Next bundles files into `/_next/static/media/…`
 * (reliable in Docker/standalone; avoids depending on `public/` sync alone).
 * Page uses `unoptimized` on `<Image>` so prod skips `/_next/image` (Sharp is flaky on Alpine).
 */
export const sundancePageImages = {
  hero: flatirons,
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
  ] satisfies Moment[],
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
  ] satisfies Moment[],
};
