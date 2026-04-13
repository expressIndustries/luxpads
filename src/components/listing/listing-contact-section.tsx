import Link from "next/link";
import { auth } from "@/auth";
import { cn } from "@/lib/utils";
import { InquiryForm } from "@/components/listing/inquiry-form";
import { VerifyEmailPrompt } from "@/components/listing/verify-email-prompt";

export async function ListingContactSection({ listingSlug }: { listingSlug: string }) {
  const session = await auth();
  const user = session?.user;
  const listingPath = `/listing/${listingSlug}`;
  const signupHref = `/signup?callbackUrl=${encodeURIComponent(listingPath)}&contact=1`;
  const loginHref = `/login?callbackUrl=${encodeURIComponent(listingPath)}`;

  if (!user?.email) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-stone-600">
          Create a free account and confirm your email before you can message the homeowner. This helps keep spam off
          the platform.
        </p>
        <Link
          href={signupHref}
          className={cn(
            "inline-flex w-full items-center justify-center rounded-full border border-stone-900/10 bg-stone-900 px-5 py-2.5 text-sm font-medium text-stone-50 shadow-sm transition hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900",
          )}
        >
          Contact owner — sign up
        </Link>
        <p className="text-center text-sm text-stone-600">
          Already have an account?{" "}
          <Link href={loginHref} className="font-medium text-stone-900 underline decoration-stone-300 underline-offset-4">
            Log in
          </Link>
        </p>
      </div>
    );
  }

  if (!user.hasVerifiedEmail) {
    return <VerifyEmailPrompt email={user.email} redirectPath={listingPath} />;
  }

  return (
    <InquiryForm
      listingSlug={listingSlug}
      messagingAs={{
        name: user.name?.trim() || "Guest",
        email: user.email,
      }}
    />
  );
}
