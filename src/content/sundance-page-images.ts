import type { StaticImageData } from "next/image";
import flatirons from "@/assets/sundance/flatirons-sundance-film-festival-boulder-colorado-01.jpg";
import pearlStreet from "@/assets/sundance/pearl-street-sundance-film-festival-boulder-colorado-01.jpg";
import boulderGeneral from "@/assets/sundance/sundance-film-festival-boulder-colorado-01.jpg";
import theater from "@/assets/sundance/sundance-film-festival-boulder-theater.jpg";

type Moment = { src: StaticImageData; alt: string; caption: string };
type RemoteMoment = { src: string; alt: string; caption: string };

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
      alt: "Outdoor playground — Boulder-area landscape",
      caption: "Outdoor Playground",
    },
    {
      src: pearlStreet,
      alt: "Walkable town — Pearl Street and downtown energy",
      caption: "Walkable Town",
    },
    {
      src: boulderGeneral,
      alt: "Film screenings and festival energy in Colorado",
      caption: "Film Screenings",
    },
    {
      src: theater,
      alt: "Boulder Theater and live venue character",
      caption: "Boulder Theater",
    },
  ] satisfies Moment[],
  homeInspiration: [
    {
      src: "https://luxpads.s3.us-east-1.amazonaws.com/listing-images/48c1d0be-c067-4b23-9592-92bad51088f2.jpg",
      alt: "Interior space guests remember from a Boulder-area stay",
      caption: "Homes guests remember",
    },
    {
      src: "https://luxpads.s3.us-east-1.amazonaws.com/listing-images/27bf29ad-256d-4779-99c4-ce771b418a9e.webp",
      alt: "Comfortable Boulder-area stay during the Sundance Film Festival",
      caption: "Enjoy the Sundance Festival in Comfort",
    },
  ] satisfies RemoteMoment[],
};
