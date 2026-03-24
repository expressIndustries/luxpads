import { siteCopy } from "@/lib/constants";

export function MarketplaceDisclaimer({ className = "" }: { className?: string }) {
  return (
    <aside
      className={`rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4 text-sm leading-relaxed text-amber-950/90 ${className}`}
      role="note"
    >
      <p className="font-medium text-amber-950">Important</p>
      <p className="mt-1">{siteCopy.marketplaceDisclaimer}</p>
      <p className="mt-2">
        The homeowner is solely responsible for rental agreements, payment collection, refunds, screening, and stay
        management. {siteCopy.legalName} does not guarantee availability, pricing accuracy, or the outcome of any
        inquiry.
      </p>
    </aside>
  );
}
