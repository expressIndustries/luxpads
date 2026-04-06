import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ChangePasswordForm } from "@/components/dashboard/change-password-form";

export const metadata: Metadata = {
  title: "Account",
};

export const dynamic = "force-dynamic";

export default async function DashboardAccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard/account");

  const impersonating = Boolean(session.user.isImpersonating);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-stone-900">Account</h1>
        <p className="mt-2 text-sm text-stone-600">
          Update the password for <span className="font-medium text-stone-800">{session.user.email}</span>.
        </p>
      </div>
      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-xl text-stone-900">Change password</h2>
        <p className="mt-2 text-sm text-stone-600">
          For security, enter your current password, then choose a new one.
        </p>
        <div className="mt-6">
          <ChangePasswordForm
            disabledReason={
              impersonating
                ? "Password cannot be changed while an admin is viewing your account. Sign in as yourself to update your password."
                : null
            }
          />
        </div>
      </section>
    </div>
  );
}
