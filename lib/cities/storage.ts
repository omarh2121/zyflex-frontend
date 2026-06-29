import type { CityId } from "./config";

export const CITY_STORAGE_KEY = "zyflex_selected_city";

export function getStoredCity(): CityId | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(CITY_STORAGE_KEY);
  if (raw === "odense" || raw === "kolding") return raw;
  return null;
}

export function storeCity(cityId: CityId): void {
  localStorage.setItem(CITY_STORAGE_KEY, cityId);
}
