export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface BusyHourRange {
  start: number;
  end: number;
  peakScore?: number;
}

export interface Zone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  googleMapsUrl?: string;
  demandType: string;
  busyDays: DayOfWeek[] | "daily";
  busyHours: BusyHourRange[];
  reason: string;
  priority: number;
  baselineScore?: number;
  weekendBoost?: number;
  /** Kun høj score når der er et event i zonen samme dag */
  eventDriven?: boolean;
}

export interface ScoredZone extends Zone {
  score: number;
  isHot: boolean;
  activeReason: string;
}

export type EventDemandLevel = "high" | "medium" | "low";

export type EventCategory =
  | "festival"
  | "koncert"
  | "sport"
  | "messe"
  | "konference"
  | "andet";

export interface EventRecommendation {
  demandLevel: EventDemandLevel;
  demandLabel: string;
  demandEmoji: string;
  aiAdvice: string;
  bestTime: string;
  recommendedPlacement: string;
  expectedActivity: string;
}

export interface SpecialEvent {
  id: string;
  title: string;
  type: string;
  zoneId: string;
  date: string;
  endDate?: string;
  time: string;
  place: string;
  description: string;
  address?: string;
  lat?: number;
  lng?: number;
  googleMapsUrl?: string;
  distanceKm?: number;
  zoneDistanceKm?: number;
  visitors?: number;
  major?: boolean;
  source?: "manual" | "festival";
}

export interface FestivalRecord {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  address?: string;
  googleMapsUrl?: string;
  startDate: string;
  endDate: string;
  visitors?: number;
  major?: boolean;
  zoneId?: string;
}

export interface DriverOpenLog {
  driverId: string;
  driverName: string;
  openedAt: string;
  city?: string;
  zone?: string;
}
