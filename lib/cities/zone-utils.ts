import { distanceKm } from "@/lib/odense/festivals";
import type { Zone } from "@/lib/odense/types";

export { distanceKm };

export function findNearestZone(
  zones: Zone[],
  lat: number,
  lng: number,
): { zone: Zone; distanceKm: number } | null {
  if (zones.length === 0) return null;

  let nearest = zones[0];
  let nearestKm = distanceKm({ lat, lng }, nearest);

  for (let i = 1; i < zones.length; i++) {
    const km = distanceKm({ lat, lng }, zones[i]);
    if (km < nearestKm) {
      nearestKm = km;
      nearest = zones[i];
    }
  }

  return { zone: nearest, distanceKm: Math.round(nearestKm * 10) / 10 };
}

export function formatDistanceKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}
