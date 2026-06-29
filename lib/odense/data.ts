import zonesData from "@/data/odense/zones.json";
import eventsData from "@/data/odense/events.json";
import { getNearbyFestivalEvents } from "./festivals";
import type { SpecialEvent, Zone } from "./types";

export function getOdenseZones(): Zone[] {
  return zonesData.zones as Zone[];
}

export function getOdenseEvents(): SpecialEvent[] {
  return eventsData.events as SpecialEvent[];
}

export function getVisibleEvents(now: Date = new Date()): SpecialEvent[] {
  const zones = getOdenseZones();
  const manual = getOdenseEvents().map((event) => ({
    ...event,
    source: event.source ?? ("manual" as const),
    zoneDistanceKm: event.zoneDistanceKm ?? 0,
  }));
  const festivals = getNearbyFestivalEvents(zones, now);

  return [...manual, ...festivals].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
  });
}
