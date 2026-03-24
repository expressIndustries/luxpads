import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "admin") redirect("/");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">Admin</p>
          <h1 className="font-serif text-2xl text-stone-900">Moderation</h1>
        </div>
        <Link href="/" className="text-sm text-stone-600 underline">
          View site
        </Link>
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}
