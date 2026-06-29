import type { DriverOpenLog } from "@/lib/odense/types";
import type { DriverSummary, OwnerActivitySnapshot } from "./types";

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function formatLoginDa(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("da-DK", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function emptyActivity(): OwnerActivitySnapshot {
  return {
    totalDrivers: 0,
    drivers: [],
    openedTodayCount: 0,
    openedTodayNames: [],
  };
}

export function aggregateDriverActivity(opens: DriverOpenLog[]): OwnerActivitySnapshot {
  const byDriver = new Map<string, DriverOpenLog[]>();

  for (const entry of opens) {
    const list = byDriver.get(entry.driverId) ?? [];
    list.push(entry);
    byDriver.set(entry.driverId, list);
  }

  const drivers: DriverSummary[] = [...byDriver.entries()].map(([driverId, entries]) => {
    const sorted = [...entries].sort(
      (a, b) => new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime(),
    );
    const latest = sorted[0];
    const openedToday = sorted.some((e) => isToday(e.openedAt));

    return {
      driverId,
      driverName: latest.driverName,
      lastLogin: latest.openedAt,
      city: latest.city || "—",
      zone: latest.zone || "—",
      openedToday,
    };
  });

  drivers.sort((a, b) => new Date(b.lastLogin).getTime() - new Date(a.lastLogin).getTime());

  const openedTodayNames = drivers.filter((d) => d.openedToday).map((d) => d.driverName);

  return {
    totalDrivers: drivers.length,
    drivers,
    openedTodayCount: openedTodayNames.length,
    openedTodayNames,
  };
}

export { formatLoginDa, isToday };
