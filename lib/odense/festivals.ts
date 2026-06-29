import odenseFestivals from "@/data/odense/festivals.json";
import koldingFestivals from "@/data/kolding/festivals.json";
import horsensFestivals from "@/data/horsens/festivals.json";
import type { CityId } from "@/lib/cities/config";
import type { FestivalRecord, SpecialEvent, Zone } from "./types";

const FESTIVALS_BY_CITY: Record<CityId, typeof odenseFestivals> = {
  odense: odenseFestivals,
  kolding: koldingFestivals,
  horsens: horsensFestivals,
};

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function daysBetween(from: string, to: string): number {
  const start = new Date(`${from}T12:00:00`);
  const end = new Date(`${to}T12:00:00`);
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function nearestZoneId(festival: FestivalRecord, zones: Zone[]): string {
  if (festival.zoneId) return festival.zoneId;

  let nearest = zones[0];
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const zone of zones) {
    const km = distanceKm(festival, zone);
    if (km < nearestDistance) {
      nearestDistance = km;
      nearest = zone;
    }
  }

  return nearest.id;
}

function buildFestivalTaxiReason(festival: FestivalRecord, zoneName: string): string {
  const guestPart = festival.visitors
    ? `Ca. ${festival.visitors.toLocaleString("da-DK")} gæster forventes. `
    : "";
  return `${guestPart}Mange tager taxi til og fra ${zoneName} ved ankomst og når koncerter slutter.`;
}

function isFestivalVisible(
  festival: FestivalRecord,
  now: Date,
  center: { lat: number; lng: number },
  maxDistanceKm: number,
  upcomingWithinDays: number,
): boolean {
  const today = toDateKey(now);
  const distance = distanceKm(center, festival);

  if (distance > maxDistanceKm) return false;
  if (today > festival.endDate) return false;

  if (today >= festival.startDate && today <= festival.endDate) return true;

  const daysUntilStart = daysBetween(today, festival.startDate);
  return daysUntilStart >= 0 && daysUntilStart <= upcomingWithinDays;
}

export function getNearbyFestivalEvents(
  cityId: CityId,
  zones: Zone[],
  center: { lat: number; lng: number },
  now: Date = new Date(),
): SpecialEvent[] {
  const festivalsData = FESTIVALS_BY_CITY[cityId];
  const maxDistanceKm = festivalsData.maxDistanceKm ?? 50;
  const upcomingWithinDays = festivalsData.upcomingWithinDays ?? 90;
  const festivals = festivalsData.festivals as FestivalRecord[];

  return festivals
    .filter((festival) =>
      isFestivalVisible(festival, now, center, maxDistanceKm, upcomingWithinDays),
    )
    .map((festival) => {
      const distance = distanceKm(center, festival);
      const zoneId = nearestZoneId(festival, zones);
      const zone = zones.find((z) => z.id === zoneId);
      const zoneDistanceKm = zone
        ? Math.round(distanceKm(festival, zone) * 10) / 10
        : Math.round(distance * 10) / 10;

      return {
        id: festival.id,
        title: festival.name,
        type: "festival",
        zoneId,
        date: festival.startDate,
        endDate: festival.endDate,
        time: "Hele dagen",
        place: festival.city,
        description: buildFestivalTaxiReason(festival, zone?.name ?? festival.city),
        address: festival.address,
        lat: festival.lat,
        lng: festival.lng,
        googleMapsUrl: festival.googleMapsUrl,
        distanceKm: Math.round(distance * 10) / 10,
        zoneDistanceKm,
        visitors: festival.visitors,
        major: festival.major,
        source: "festival" as const,
      };
    })
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
    });
}
