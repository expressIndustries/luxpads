import { NextRequest, NextResponse } from "next/server";
import { circlePathLatLngPipe, offsetViewportCenter } from "@/lib/maps/approximate-area";

function mapKey() {
  return (
    process.env.GOOGLE_MAPS_API_KEY?.trim() || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() || ""
  );
}

/**
 * Proxies Google Static Maps so the browser loads a same-origin URL (no API key in HTML).
 * With `lat`, `lng`, and `salt`, draws a ~0.15 mi red circle at true coords and centers the
 * viewport on an offset point (privacy — not centered on the exact pin).
 */
export async function GET(req: NextRequest) {
  const key = mapKey();
  if (!key) {
    return NextResponse.json({ error: "Maps API key not configured" }, { status: 503 });
  }

  const { searchParams } = req.nextUrl;
  const latStr = searchParams.get("lat");
  const lngStr = searchParams.get("lng");
  const address = searchParams.get("address")?.trim();
  const salt = searchParams.get("salt")?.trim() ?? "";

  let center: string;
  let markers: string | undefined;
  let path: string | undefined;
  let zoom = searchParams.get("zoom") || "14";

  if (latStr != null && lngStr != null) {
    const lat = Number(latStr);
    const lng = Number(lngStr);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
    }

    if (salt) {
      const { lat: cLat, lng: cLng } = offsetViewportCenter(lat, lng, salt);
      center = `${cLat},${cLng}`;
      zoom = searchParams.get("zoom") || "15";
      // Semi-transparent red fill + red outline (~0.15 mi radius at true location)
      path = `fillcolor:0x55FF0000|color:0xFFFF0000|weight:2|${circlePathLatLngPipe(lat, lng)}`;
    } else {
      center = `${lat},${lng}`;
      markers = `color:0x57534e|${lat},${lng}`;
    }
  } else if (address && address.length <= 500) {
    center = address;
  } else {
    return NextResponse.json({ error: "Provide lat+lng or address" }, { status: 400 });
  }

  const params = new URLSearchParams({
    center,
    zoom,
    size: "640x360",
    scale: "2",
    key,
  });
  if (markers) params.set("markers", markers);
  if (path) params.set("path", path);

  const googleUrl = `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;

  const upstream = await fetch(googleUrl, {
    next: { revalidate: 86_400 },
    headers: { Accept: "image/*" },
  });

  const buf = await upstream.arrayBuffer();
  const contentType = upstream.headers.get("content-type") || "image/png";

  if (!upstream.ok) {
    return new NextResponse(buf, {
      status: 502,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
      },
    });
  }

  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
