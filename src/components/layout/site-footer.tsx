import Link from "next/link";
import { siteCopy } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-stone-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="font-serif text-xl text-stone-900">{siteCopy.legalName}</p>
            <p className="mt-2 text-sm text-stone-600">
              <a href={siteCopy.domainUrl} className="underline decoration-stone-300 underline-offset-4">
                {siteCopy.domainDisplay}
              </a>
              <span className="text-stone-400"> · </span>
              {siteCopy.tagline}
            </p>
          </div>
          <div className="space-y-2 text-sm text-stone-600">
            <p className="font-medium text-stone-900">Discover</p>
            <Link href="/search" className="block hover:text-stone-900">
              Browse homes
            </Link>
            <Link href="/owners" className="block hover:text-stone-900">
              For owners
            </Link>
          </div>
          <div className="space-y-2 text-sm text-stone-600">
            <p className="font-medium text-stone-900">Legal</p>
            <Link href="/terms" className="block hover:text-stone-900">
              Terms
            </Link>
            <Link href="/privacy" className="block hover:text-stone-900">
              Privacy
            </Link>
          </div>
        </div>
        <p className="mt-10 text-xs leading-relaxed text-stone-500">
          {siteCopy.marketplaceDisclaimer}
        </p>
      </div>
    </footer>
  );
}
