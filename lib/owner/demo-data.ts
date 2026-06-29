import type { TaxameterAnalysis, TaxameterTrip } from "./types";

const DEMO_TRIPS: TaxameterTrip[] = [
  { date: "2026-06-24", time: "07:15", amount: 185, driver: "Ahmed", from: "Horsens Station", to: "Sygehus", city: "Horsens", zone: "Banegården" },
  { date: "2026-06-24", time: "08:30", amount: 95, driver: "Ahmed", from: "Centrum", to: "VIA Campus", city: "Horsens", zone: "Centrum" },
  { date: "2026-06-24", time: "17:45", amount: 220, driver: "Peter", from: "CASA Arena", to: "Hotel Scandic", city: "Horsens", zone: "Events" },
  { date: "2026-06-24", time: "22:10", amount: 165, driver: "Peter", from: "Torvet", to: "Rosenvænget", city: "Horsens", zone: "Natteliv" },
  { date: "2026-06-25", time: "06:50", amount: 210, driver: "Ahmed", from: "Horsens Station", to: "Danfoss", city: "Horsens", zone: "Banegården" },
  { date: "2026-06-25", time: "12:20", amount: 78, driver: "Maria", from: "Centrum", to: "Brædstrup", city: "Horsens", zone: "Centrum" },
  { date: "2026-06-25", time: "18:00", amount: 195, driver: "Maria", from: "Sygehus", to: "Horsens Station", city: "Horsens", zone: "Sygehus" },
  { date: "2026-06-25", time: "23:30", amount: 240, driver: "Peter", from: "Torvet", to: "FÆNGSLET", city: "Horsens", zone: "Natteliv" },
  { date: "2026-06-26", time: "07:00", amount: 190, driver: "Ahmed", from: "Horsens Station", to: "Sygehus", city: "Horsens", zone: "Banegården" },
  { date: "2026-06-26", time: "14:15", amount: 320, driver: "Maria", from: "Centrum", to: "Billund Lufthavn", city: "Horsens", zone: "Centrum" },
  { date: "2026-06-26", time: "19:30", amount: 155, driver: "Peter", from: "CASA Arena", to: "Centrum", city: "Horsens", zone: "Events" },
  { date: "2026-06-27", time: "08:00", amount: 88, driver: "Ahmed", from: "Centrum", to: "VIA Campus", city: "Horsens", zone: "Centrum" },
  { date: "2026-06-27", time: "11:45", amount: 175, driver: "Maria", from: "Sygehus", to: "Rosenvænget", city: "Horsens", zone: "Sygehus" },
  { date: "2026-06-27", time: "21:00", amount: 205, driver: "Peter", from: "Torvet", to: "Hotel Scandic", city: "Horsens", zone: "Natteliv" },
  { date: "2026-06-28", time: "07:30", amount: 198, driver: "Ahmed", from: "Horsens Station", to: "Danfoss", city: "Horsens", zone: "Banegården" },
  { date: "2026-06-28", time: "16:20", amount: 142, driver: "Maria", from: "Centrum", to: "Sygehus", city: "Horsens", zone: "Centrum" },
  { date: "2026-06-28", time: "22:45", amount: 178, driver: "Peter", from: "Torvet", to: "Centrum", city: "Horsens", zone: "Natteliv" },
  { date: "2026-06-29", time: "06:40", amount: 215, driver: "Ahmed", from: "Horsens Station", to: "Sygehus", city: "Horsens", zone: "Banegården" },
  { date: "2026-06-29", time: "13:00", amount: 265, driver: "Maria", from: "Centrum", to: "Aarhus H", city: "Horsens", zone: "Centrum" },
  { date: "2026-06-29", time: "20:15", amount: 168, driver: "Peter", from: "CASA Arena", to: "Rosenvænget", city: "Horsens", zone: "Events" },
];

export const DEMO_COMPANY_NAME = "Zyflex ApS · Horsens";

export function getDemoTrips(): TaxameterTrip[] {
  return DEMO_TRIPS.map((t) => ({ ...t }));
}
