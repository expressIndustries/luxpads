import type { Metadata } from "next";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Create account",
};

export default function SignupPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="font-serif text-3xl text-stone-900">Join LuxPads</h1>
      <p className="mt-2 text-sm text-stone-600">Renters browse free. Owners list for free.</p>
      <div className="mt-8 rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <SignupForm />
      </div>
    </div>
  );
}
