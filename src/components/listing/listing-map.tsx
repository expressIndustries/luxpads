import { ListingInteractiveMap } from "@/components/listing/listing-interactive-map";
import { MapPlaceholder } from "@/components/listing/map-placeholder";

type Props = {
  label?: string;
  lat?: number | null;
  lng?: number | null;
  locationQuery?: string | null;
  mapSalt?: string | null;
};

function mapKey() {
  return (
    process.env.GOOGLE_MAPS_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ||
    ""
  );
}

function mapProvider() {
  return (
    process.env.MAP_PROVIDER?.trim() ||
    process.env.NEXT_PUBLIC_MAP_PROVIDER?.trim() ||
    ""
  ).toLowerCase();
}

/**
 * Google + coordinates + API key: interactive JS map (offset center + privacy disk when mapSalt).
 * Otherwise same behavior as MapPlaceholder (static / Mapbox / fallback).
 */
export function ListingMap(props: Props) {
  const key = mapKey();
  const provider = mapProvider();
  const coordsOk = props.lat != null && props.lng != null;

  if (provider === "google" && key && coordsOk) {
    return (
      <ListingInteractiveMap
        lat={props.lat!}
        lng={props.lng!}
        mapSalt={props.mapSalt}
        apiKey={key}
        label={props.label}
      />
    );
  }

  return <MapPlaceholder {...props} />;
}
