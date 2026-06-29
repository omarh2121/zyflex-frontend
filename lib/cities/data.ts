import odenseZones from "@/data/odense/zones.json";
import odenseEvents from "@/data/odense/events.json";
import koldingZones from "@/data/kolding/zones.json";
import koldingEvents from "@/data/kolding/events.json";
import { CITY_BY_ID, type CityId } from "./config";
import { getNearbyFestivalEvents } from "@/lib/odense/festivals";
import type { SpecialEvent, Zone } from "@/lib/odense/types";

const ZONES: Record<CityId, Zone[]> = {
  odense: odenseZones.zones as Zone[],
  kolding: koldingZones.zones as Zone[],
};

const EVENTS: Record<CityId, SpecialEvent[]> = {
  odense: odenseEvents.events as SpecialEvent[],
  kolding: koldingEvents.events as SpecialEvent[],
};

export function getZones(cityId: CityId): Zone[] {
  return ZONES[cityId];
}

export function getCityEvents(cityId: CityId): SpecialEvent[] {
  return EVENTS[cityId];
}

export function getVisibleEvents(cityId: CityId, now: Date = new Date()): SpecialEvent[] {
  const zones = getZones(cityId);
  const center = CITY_BY_ID[cityId].center;
  const manual = getCityEvents(cityId).map((event) => ({
    ...event,
    source: event.source ?? ("manual" as const),
    zoneDistanceKm: event.zoneDistanceKm ?? 0,
  }));
  const festivals = getNearbyFestivalEvents(cityId, zones, center, now);

  return [...manual, ...festivals].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
  });
}

export function getCityCenter(cityId: CityId): [number, number] {
  const c = CITY_BY_ID[cityId].center;
  return [c.lat, c.lng];
}

export function getCityName(cityId: CityId): string {
  return CITY_BY_ID[cityId].name;
}
