/** ~Miles per degree latitude (WGS84, mid-latitudes). */
const MI_PER_DEG_LAT = 69.1;

function djb2(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h, 33) ^ str.charCodeAt(i);
  }
  return h >>> 0;
}

/**
 * Map viewport center offset from the true point so the exact coordinate is not centered.
 * Stable for the same `salt` (e.g. listing slug).
 */
export function offsetViewportCenter(lat: number, lng: number, salt: string): { lat: number; lng: number } {
  const h = djb2(salt || "luxpads");
  const angle = ((h % 10_000) / 10_000) * 2 * Math.PI;
  // ~0.10–0.12 mi off true location
  const offsetMiles = 0.1 + ((h >> 12) % 2000) / 100_000;
  const latRad = (lat * Math.PI) / 180;
  const dLat = (offsetMiles / MI_PER_DEG_LAT) * Math.cos(angle);
  const dLng = (offsetMiles / (MI_PER_DEG_LAT * Math.cos(latRad))) * Math.sin(angle);
  return { lat: lat + dLat, lng: lng + dLng };
}

const CIRCLE_RADIUS_MILES = 0.15;

/**
 * Closed path `lat,lng|...` for Google Static Maps `path` (filled polygon approximating a circle).
 */
export function circlePathLatLngPipe(lat: number, lng: number, radiusMiles = CIRCLE_RADIUS_MILES, segments = 36): string {
  const latRad = (lat * Math.PI) / 180;
  const cosLat = Math.cos(latRad);
  const coords: string[] = [];
  for (let i = 0; i < segments; i++) {
    const theta = (i / segments) * 2 * Math.PI;
    const plat = lat + (radiusMiles / MI_PER_DEG_LAT) * Math.sin(theta);
    const plng = lng + (radiusMiles / (MI_PER_DEG_LAT * cosLat)) * Math.cos(theta);
    coords.push(`${plat.toFixed(6)},${plng.toFixed(6)}`);
  }
  coords.push(coords[0]!);
  return coords.join("|");
}

export const APPROXIMATE_AREA_RADIUS_MILES = CIRCLE_RADIUS_MILES;
