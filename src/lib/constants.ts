export const PROPERTY_TYPES = [
  "Estate",
  "Villa",
  "Mountain Lodge",
  "Beach House",
  "Wine Country Retreat",
  "Desert Oasis",
  "Penthouse",
  "Ski-in Ski-out",
] as const;

export const siteCopy = {
  legalName: "LuxPads",
  /** Public site domain label (no protocol) */
  domainDisplay: "LuxPads.co",
  domainUrl: "https://luxpads.co",
  tagline: "Directly Book Homes with Owner",
  marketplaceDisclaimer:
    "LuxPads is a listing marketplace. We do not process rental payments, hold security deposits, or finalize booking contracts. All agreements, payments, and stay logistics are between you and the homeowner.",
} as const;
