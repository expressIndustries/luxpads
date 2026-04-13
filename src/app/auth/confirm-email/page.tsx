import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";

type Props = { searchParams: Promise<{ token?: string; next?: string }> };

export const metadata: Metadata = {
  title: "Confirm email",
  robots: { index: false, follow: false },
};

export default async function ConfirmEmailPage({ searchParams }: Props) {
  const sp = await searchParams;
  const token = sp.token?.trim();
  if (!token) {
    redirect("/login?verify=missing");
  }
  const next = sp.next?.trim() ?? "";

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <h1 className="font-serif text-2xl text-stone-900">Confirm your email</h1>
      <p className="mt-2 text-sm leading-relaxed text-stone-600">
        Some email providers open links automatically, which can use up a confirmation link before you see it. Use the
        button below once to confirm your address and sign in.
      </p>
      <form method="POST" action="/api/verify-email" className="mt-8 space-y-4">
        <input type="hidden" name="token" value={token} />
        {next ? <input type="hidden" name="next" value={next} /> : null}
        <Button type="submit" className="h-12 w-full text-base">
          Confirm email and continue
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-stone-600">
        <Link href="/login" className="font-medium underline decoration-stone-300 underline-offset-4">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
