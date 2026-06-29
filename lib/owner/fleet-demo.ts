import type { FleetVehicle } from "./types";

/** Horsens centrum — flåde-demo */
export const HORSENS_CENTER: [number, number] = [55.8614, 9.8495];

function minutesAgo(min: number): string {
  return new Date(Date.now() - min * 60_000).toISOString();
}

export const DEMO_FLEET: FleetVehicle[] = [
  {
    id: "vogn-1",
    vehicleNumber: 1,
    driverName: "Mohamed",
    status: "ledig",
    lat: 55.8607,
    lng: 9.8498,
    locationLabel: "Horsens Station",
    lastActivityAt: minutesAgo(2),
  },
  {
    id: "vogn-2",
    vehicleNumber: 2,
    driverName: "Ali",
    status: "paa_vej",
    lat: 55.8616,
    lng: 9.85,
    locationLabel: "Bytorv Horsens",
    lastActivityAt: minutesAgo(5),
  },
  {
    id: "vogn-3",
    vehicleNumber: 3,
    driverName: "Hassan",
    status: "optaget",
    lat: 55.8628,
    lng: 9.8475,
    locationLabel: "Forum Horsens",
    lastActivityAt: minutesAgo(1),
  },
  {
    id: "vogn-4",
    vehicleNumber: 4,
    driverName: "Yusuf",
    status: "ledig",
    lat: 55.872,
    lng: 9.828,
    locationLabel: "Horsens Sygehus",
    lastActivityAt: minutesAgo(8),
  },
  {
    id: "vogn-5",
    vehicleNumber: 5,
    driverName: "Karim",
    status: "paa_vej",
    lat: 55.8612,
    lng: 9.8518,
    locationLabel: "Gågaden",
    lastActivityAt: minutesAgo(3),
  },
];

export function getDemoFleet(): FleetVehicle[] {
  return DEMO_FLEET.map((v) => ({ ...v, lastActivityAt: minutesAgo(
    v.vehicleNumber === 1 ? 2 : v.vehicleNumber === 2 ? 5 : v.vehicleNumber === 3 ? 1 : v.vehicleNumber === 4 ? 8 : 3,
  ) }));
}
