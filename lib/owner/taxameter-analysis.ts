import { DEMO_COMPANY_NAME, getDemoTrips } from "./demo-data";
import type {
  DriverPerformance,
  RankedMetric,
  RepeatAddress,
  TaxameterAnalysis,
  TaxameterTrip,
} from "./types";

const DAY_NAMES = ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"];

function rankByRevenue(map: Map<string, { revenue: number; trips: number }>, limit = 5): RankedMetric[] {
  return [...map.entries()]
    .map(([label, v]) => ({ label, revenue: v.revenue, trips: v.trips }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

function buildEarningsTips(analysis: Omit<TaxameterAnalysis, "earningsTips">): string[] {
  const tips: string[] = [];
  const topDay = analysis.bestDays[0];
  const topTime = analysis.bestTimes[0];
  const topZone = analysis.topZones[0];
  const topDriver = analysis.driverPerformance[0];

  if (topDay) {
    tips.push(`Prioritér flere vogne om ${topDay.label} — ${topDay.revenue.toLocaleString("da-DK")} kr i omsætning.`);
  }
  if (topTime) {
    tips.push(`Peak-tidspunkt kl. ${topTime.label} giver højeste afkast — planlæg vagter derefter.`);
  }
  if (topZone) {
    tips.push(`${topZone.label} er mest aktiv — overvej standby ved station/sygehus i Horsens.`);
  }
  if (analysis.repeatAddresses.length > 0) {
    tips.push(
      `${analysis.repeatAddresses.length} gentagne adresser fundet — kontakt virksomheder for faste aftaler.`,
    );
  }
  if (topDriver && analysis.driverPerformance.length > 1) {
    tips.push(`Lær af ${topDriver.name}s mønster (${topDriver.trips} ture) — del best practice med teamet.`);
  }
  tips.push("Kobl taxameter-data med Zyflex Zone for at ramme hotspots før konkurrenterne.");
  return tips.slice(0, 6);
}

export function analyzeTrips(
  trips: TaxameterTrip[],
  options: { source: "upload" | "demo"; fileName?: string; companyName?: string },
): TaxameterAnalysis {
  const totalRevenue = trips.reduce((s, t) => s + t.amount, 0);
  const tripCount = trips.length;
  const avgTripPrice = tripCount > 0 ? Math.round((totalRevenue / tripCount) * 100) / 100 : 0;

  const dayMap = new Map<string, { revenue: number; trips: number }>();
  const hourMap = new Map<string, { revenue: number; trips: number }>();
  const zoneMap = new Map<string, { revenue: number; trips: number }>();
  const driverMap = new Map<string, { revenue: number; trips: number }>();
  const addressMap = new Map<string, { count: number; totalRevenue: number }>();

  for (const trip of trips) {
    const dayIdx = new Date(`${trip.date}T12:00:00`).getDay();
    const dayLabel = DAY_NAMES[dayIdx];
    const dayEntry = dayMap.get(dayLabel) ?? { revenue: 0, trips: 0 };
    dayEntry.revenue += trip.amount;
    dayEntry.trips += 1;
    dayMap.set(dayLabel, dayEntry);

    if (trip.time) {
      const hour = trip.time.slice(0, 2);
      const hourLabel = `${hour}:00`;
      const hourEntry = hourMap.get(hourLabel) ?? { revenue: 0, trips: 0 };
      hourEntry.revenue += trip.amount;
      hourEntry.trips += 1;
      hourMap.set(hourLabel, hourEntry);
    }

    const zoneLabel = trip.zone || trip.city || "Ukendt zone";
    const zoneEntry = zoneMap.get(zoneLabel) ?? { revenue: 0, trips: 0 };
    zoneEntry.revenue += trip.amount;
    zoneEntry.trips += 1;
    zoneMap.set(zoneLabel, zoneEntry);

    if (trip.driver) {
      const driverEntry = driverMap.get(trip.driver) ?? { revenue: 0, trips: 0 };
      driverEntry.revenue += trip.amount;
      driverEntry.trips += 1;
      driverMap.set(trip.driver, driverEntry);
    }

    for (const addr of [trip.from, trip.to].filter(Boolean) as string[]) {
      const key = addr.trim();
      if (key.length < 4) continue;
      const addrEntry = addressMap.get(key) ?? { count: 0, totalRevenue: 0 };
      addrEntry.count += 1;
      addrEntry.totalRevenue += trip.amount;
      addressMap.set(key, addrEntry);
    }
  }

  const driverPerformance: DriverPerformance[] = [...driverMap.entries()]
    .map(([name, v]) => ({
      name,
      trips: v.trips,
      revenue: v.revenue,
      avgPrice: Math.round((v.revenue / v.trips) * 100) / 100,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const repeatAddresses: RepeatAddress[] = [...addressMap.entries()]
    .filter(([, v]) => v.count >= 2)
    .map(([address, v]) => ({ address, count: v.count, totalRevenue: v.totalRevenue }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const base: Omit<TaxameterAnalysis, "earningsTips"> = {
    source: options.source,
    fileName: options.fileName,
    companyName: options.companyName || DEMO_COMPANY_NAME,
    totalRevenue,
    tripCount,
    avgTripPrice,
    bestDays: rankByRevenue(dayMap),
    bestTimes: rankByRevenue(hourMap),
    topZones: rankByRevenue(zoneMap),
    driverPerformance,
    repeatAddresses,
    parsedAt: new Date().toISOString(),
    trips,
  };

  return { ...base, earningsTips: buildEarningsTips(base) };
}

export function getDemoAnalysis(companyName?: string): TaxameterAnalysis {
  return analyzeTrips(getDemoTrips(), { source: "demo", companyName: companyName || DEMO_COMPANY_NAME });
}

export function formatKr(amount: number): string {
  return `${amount.toLocaleString("da-DK")} kr`;
}
