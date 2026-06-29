import type { CityId } from "./config";

const ZONE_STORAGE_KEY = "zyflex_selected_zone";

type ZoneSelectionMap = Partial<Record<CityId, string>>;

function readMap(): ZoneSelectionMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(ZONE_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ZoneSelectionMap) : {};
  } catch {
    return {};
  }
}

export function getStoredZone(cityId: CityId): string | null {
  return readMap()[cityId] ?? null;
}

export function storeZone(cityId: CityId, zoneId: string | null): void {
  const map = readMap();
  if (zoneId) {
    map[cityId] = zoneId;
  } else {
    delete map[cityId];
  }
  localStorage.setItem(ZONE_STORAGE_KEY, JSON.stringify(map));
}
