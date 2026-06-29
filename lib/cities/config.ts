export type CityId = "odense" | "kolding";

export interface CityConfig {
  id: CityId;
  name: string;
  center: { lat: number; lng: number };
}

export const CITIES: CityConfig[] = [
  {
    id: "odense",
    name: "Odense",
    center: { lat: 55.3955, lng: 10.3885 },
  },
  {
    id: "kolding",
    name: "Kolding",
    center: { lat: 55.4901, lng: 9.476 },
  },
];

export const CITY_BY_ID: Record<CityId, CityConfig> = Object.fromEntries(
  CITIES.map((c) => [c.id, c]),
) as Record<CityId, CityConfig>;

export const DEFAULT_CITY: CityId = "odense";
