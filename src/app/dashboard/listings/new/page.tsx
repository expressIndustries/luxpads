import { redirect } from "next/navigation";
import { createDraftListing } from "@/lib/actions/listing-actions";

export default async function NewListingPage() {
  const res = await createDraftListing();
  if ("error" in res) {
    redirect("/dashboard/listings");
  }
  const first = res.is_first_listing ? "1" : "0";
  redirect(`/dashboard/listings/${res.id}/edit?owner_listing_created=1&first=${first}`);
}
