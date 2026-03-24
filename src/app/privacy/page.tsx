import type { Metadata } from "next";
import { siteCopy } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl text-stone-900">Privacy policy (placeholder)</h1>
      <p className="mt-4 text-sm leading-relaxed text-stone-600">
        This is placeholder privacy copy. Your production policy should describe what data {siteCopy.legalName} collects
        (accounts, inquiries, analytics), how it is processed, retention, subprocessors (e.g., email providers),
        and user rights.
      </p>
    </div>
  );
}
