import type { Metadata } from "next";
import { Suspense } from "react";
import { SignupForm } from "./signup-form";
import { siteCopy } from "@/lib/constants";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Create account",
  description: `Create a free ${siteCopy.legalName} guest account to browse luxury homes and message homeowners. Listing uses a separate owner signup.`,
  alternates: { canonical: "/signup" },
  openGraph: {
    url: absoluteUrl("/signup"),
    title: `Create account | ${siteCopy.legalName}`,
  },
};

type Props = { searchParams: Promise<{ contact?: string; callbackUrl?: string; checkEmail?: string }> };

export default async function SignupPage({ searchParams }: Props) {
  const sp = await searchParams;
  const fromContact = sp.contact === "1";
  const checkEmail = sp.checkEmail === "1";

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="font-serif text-3xl text-stone-900">{checkEmail ? "Check your email" : "Join LuxPads"}</h1>
      <p className="mt-2 text-sm text-stone-600">
        {checkEmail
          ? "You are one step away—use the link in the email we sent to finish confirming your account."
          : fromContact
            ? "Create an account to contact this homeowner. You will confirm your email before your message is sent."
            : "One free guest account. After you confirm your email, finish welcome to start exploring. To list a home, use a separate email via For owners."}
      </p>
      <div className="mt-8 rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <Suspense fallback={<p className="text-sm text-stone-500">Loading…</p>}>
          <SignupForm fromContact={fromContact} />
        </Suspense>
      </div>
    </div>
  );
}
