import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { siteCopy } from "@/lib/constants";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Log in",
  description: `Sign in to your ${siteCopy.legalName} account to manage listings, messages, and owner inquiries.`,
  alternates: { canonical: "/login" },
  openGraph: { url: absoluteUrl("/login"), title: `Log in | ${siteCopy.legalName}` },
};

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="font-serif text-3xl text-stone-900">Welcome back</h1>
      <p className="mt-2 text-sm text-stone-600">Use the email and password you signed up with.</p>
      <div className="mt-8 rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <Suspense fallback={<p className="text-sm text-stone-500">Loading…</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
