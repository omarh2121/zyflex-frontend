import type { CityId } from "@/lib/cities/config";
import {
  getCityCenter,
  getCityEvents,
  getCityName,
  getVisibleEvents,
  getZones,
} from "@/lib/cities/data";

/** @deprecated Brug getZones("odense") fra lib/cities/data */
export function getOdenseZones() {
  return getZones("odense");
}

/** @deprecated Brug getCityEvents("odense") fra lib/cities/data */
export function getOdenseEvents() {
  return getCityEvents("odense");
}

export { getVisibleEvents, getZones, getCityEvents, getCityCenter, getCityName };
export type { CityId };
