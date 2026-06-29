import { getDemoFleet } from "./fleet-demo";
import type { FleetStatus, FleetVehicle } from "./types";

export const FLEET_STORAGE_KEY = "owner_fleet_vehicles";

export const FLEET_STATUS: Record<
  FleetStatus,
  { color: string; label: string; colorName: string; bgClass: string; textClass: string }
> = {
  ledig: {
    color: "#22c55e",
    label: "Ledig",
    colorName: "Grøn",
    bgClass: "bg-green-900/40",
    textClass: "text-green-400",
  },
  paa_vej: {
    color: "#eab308",
    label: "På vej til kunde",
    colorName: "Gul",
    bgClass: "bg-yellow-900/40",
    textClass: "text-yellow-400",
  },
  optaget: {
    color: "#ef4444",
    label: "Optaget",
    colorName: "Rød",
    bgClass: "bg-red-900/40",
    textClass: "text-red-400",
  },
};

export function formatFleetActivity(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMin = Math.round((now.getTime() - d.getTime()) / 60_000);

  if (diffMin < 1) return "Lige nu";
  if (diffMin < 60) return `${diffMin} min. siden`;

  return d.toLocaleString("da-DK", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function loadFleetVehicles(): FleetVehicle[] {
  if (typeof window === "undefined") return getDemoFleet();

  try {
    const raw = localStorage.getItem(FLEET_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as FleetVehicle[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // Falder tilbage til demo
  }

  const demo = getDemoFleet();
  localStorage.setItem(FLEET_STORAGE_KEY, JSON.stringify(demo));
  return demo;
}

export function saveFleetVehicles(vehicles: FleetVehicle[]): void {
  localStorage.setItem(FLEET_STORAGE_KEY, JSON.stringify(vehicles));
}

export function fleetListLine(vehicle: FleetVehicle): string {
  const cfg = FLEET_STATUS[vehicle.status];
  return `Vogn ${vehicle.vehicleNumber} · ${vehicle.driverName} · ${cfg.colorName} · ${cfg.label}`;
}

export function countByStatus(vehicles: FleetVehicle[]): Record<FleetStatus, number> {
  return vehicles.reduce(
    (acc, v) => {
      acc[v.status] += 1;
      return acc;
    },
    { ledig: 0, paa_vej: 0, optaget: 0 } as Record<FleetStatus, number>,
  );
}
