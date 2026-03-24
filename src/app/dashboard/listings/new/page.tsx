import { redirect } from "next/navigation";
import { createDraftListing } from "@/lib/actions/listing-actions";

export default async function NewListingPage() {
  const res = await createDraftListing();
  if ("error" in res) {
    redirect("/dashboard/listings");
  }
  redirect(`/dashboard/listings/${res.id}/edit`);
}
