import type { ListingEditDefaults } from "@/lib/listing-edit-types";

/**
 * Matches `createDraftListing` seed copy — shown as empty fields + placeholders in the editor;
 * empty submit coalesces back to these when the listing still matches the template.
 */
export const DRAFT_LISTING_FIELD_TEMPLATES = {
  title: "Untitled residence",
  summary: "Add a compelling one-paragraph summary for search results.",
  description:
    "Describe your home’s story, layout, and what makes it special for guests.",
  addressLine1: "Address — edit in listing settings",
  city: "City",
  state: "State",
  country: "United States",
  postalCode: "00000",
} as const satisfies Record<string, string>;

export type DraftTemplateField = keyof typeof DRAFT_LISTING_FIELD_TEMPLATES;

/** Remove template strings so inputs appear empty with placeholders instead. */
export function stripDraftTemplatesForDisplay(d: ListingEditDefaults): ListingEditDefaults {
  const v = { ...d };
  (Object.entries(DRAFT_LISTING_FIELD_TEMPLATES) as [DraftTemplateField, string][]).forEach(([k, tmpl]) => {
    const cur = v[k];
    if (typeof cur === "string" && cur === tmpl) (v as Record<string, unknown>)[k] = "";
  });
  return v;
}

/**
 * If the user left a field empty and the server still had the draft template there,
 * submit the template again. If they cleared real content, leave empty (validation may fail).
 */
export function coalesceDraftTemplatesForSubmit(
  values: ListingEditDefaults,
  serverFallback: ListingEditDefaults,
): ListingEditDefaults {
  const out = { ...values };
  (Object.keys(DRAFT_LISTING_FIELD_TEMPLATES) as DraftTemplateField[]).forEach((k) => {
    const cur = String(values[k] ?? "").trim();
    if (cur !== "") return;
    const tmpl = DRAFT_LISTING_FIELD_TEMPLATES[k];
    if (String(serverFallback[k]) === tmpl) (out as Record<string, unknown>)[k] = tmpl;
  });
  return out;
}
