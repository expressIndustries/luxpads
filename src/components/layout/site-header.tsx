import Link from "next/link";
import { auth } from "@/auth";
import { siteCopy } from "@/lib/constants";
import { SignOutButton } from "@/components/layout/sign-out-button";

const nav = [
  { href: "/search", label: "Explore" },
  { href: "/owners", label: "For owners" },
  { href: "/about", label: "About" },
];

export async function SiteHeader() {
  const session = await auth();
  const role = session?.user?.role;

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-[#faf9f7]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex flex-col leading-tight">
          <span className="font-serif text-lg tracking-tight text-stone-900">{siteCopy.legalName}</span>
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-stone-500">
            {siteCopy.tagline}
          </span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-stone-600 transition hover:text-stone-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {role === "owner" || role === "admin" ? (
            <>
              {role === "owner" && (
                <Link
                  href="/dashboard"
                  className="hidden rounded-full border border-stone-200 px-4 py-2 text-sm text-stone-800 transition hover:border-stone-300 sm:inline-block"
                >
                  Dashboard
                </Link>
              )}
              {role === "admin" && (
                <Link
                  href="/admin"
                  className="hidden rounded-full border border-stone-200 px-4 py-2 text-sm text-stone-800 transition hover:border-stone-300 sm:inline-block"
                >
                  Admin
                </Link>
              )}
            </>
          ) : null}
          {session?.user ? (
            <SignOutButton />
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-sm text-stone-600 hover:text-stone-900 sm:inline"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-stone-800"
              >
                Join
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
