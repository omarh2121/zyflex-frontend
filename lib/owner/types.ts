export interface TaxameterTrip {
  date: string;
  time?: string;
  amount: number;
  driver?: string;
  from?: string;
  to?: string;
  city?: string;
  zone?: string;
}

export interface RankedMetric {
  label: string;
  revenue: number;
  trips: number;
}

export interface DriverPerformance {
  name: string;
  trips: number;
  revenue: number;
  avgPrice: number;
}

export interface RepeatAddress {
  address: string;
  count: number;
  totalRevenue: number;
}

export interface TaxameterAnalysis {
  source: "upload" | "demo";
  fileName?: string;
  companyName: string;
  totalRevenue: number;
  tripCount: number;
  avgTripPrice: number;
  bestDays: RankedMetric[];
  bestTimes: RankedMetric[];
  topZones: RankedMetric[];
  driverPerformance: DriverPerformance[];
  repeatAddresses: RepeatAddress[];
  earningsTips: string[];
  parsedAt: string;
  trips: TaxameterTrip[];
}

export interface DriverSummary {
  driverId: string;
  driverName: string;
  lastLogin: string;
  city: string;
  zone: string;
  openedToday: boolean;
}

export interface OwnerActivitySnapshot {
  totalDrivers: number;
  drivers: DriverSummary[];
  openedTodayCount: number;
  openedTodayNames: string[];
}

export const ANALYSIS_STORAGE_KEY = "owner_taxameter_analysis";
export const AI_REPORT_STORAGE_KEY = "owner_ai_report";

export type FleetStatus = "ledig" | "paa_vej" | "optaget";

export interface FleetVehicle {
  id: string;
  vehicleNumber: number;
  driverName: string;
  status: FleetStatus;
  lat: number;
  lng: number;
  locationLabel: string;
  lastActivityAt: string;
}
