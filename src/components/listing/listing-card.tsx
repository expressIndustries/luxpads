import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "@/lib/utils";

export type ListingCardData = {
  slug: string;
  title: string;
  city: string;
  state: string;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  nightlyRateCents: number;
  heroImage: string | null;
  featured?: boolean;
};

export function ListingCard({ listing }: { listing: ListingCardData }) {
  const img = listing.heroImage ?? "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80";
  return (
    <Link href={`/listing/${listing.slug}`} className="group block">
      <article className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
          <Image
            src={img}
            alt=""
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.02]"
            sizes="(max-width:768px) 100vw, 33vw"
          />
          {listing.featured ? (
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-stone-800 shadow-sm backdrop-blur">
              Featured
            </span>
          ) : null}
        </div>
        <div className="space-y-1 p-4">
          <h3 className="font-serif text-lg text-stone-900 group-hover:underline decoration-stone-300 underline-offset-4">
            {listing.title}
          </h3>
          <p className="text-sm text-stone-500">
            {listing.city}, {listing.state}
          </p>
          <p className="text-sm text-stone-600">
            Sleeps {listing.maxGuests} · {listing.bedrooms} bd · {listing.bathrooms} ba
          </p>
          <p className="pt-1 text-sm font-medium text-stone-900">
            From {formatMoney(listing.nightlyRateCents)}
            <span className="font-normal text-stone-500"> / night</span>
          </p>
        </div>
      </article>
    </Link>
  );
}
