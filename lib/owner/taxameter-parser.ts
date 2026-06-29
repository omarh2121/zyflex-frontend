import * as XLSX from "xlsx";
import type { TaxameterTrip } from "./types";

const COLUMN_ALIASES: Record<keyof Omit<TaxameterTrip, "amount"> | "amount", string[]> = {
  date: ["dato", "date", "tur dato", "dag"],
  time: ["tid", "time", "kl", "starttid"],
  amount: ["beløb", "belob", "amount", "pris", "price", "total", "omsætning", "omsaetning", "kr"],
  driver: ["chauffør", "chauffor", "driver", "vognmand", "navn"],
  from: ["fra", "pickup", "start", "afhentning", "startadresse"],
  to: ["til", "dropoff", "destination", "slut", "slutadresse"],
  city: ["by", "city", "kommune"],
  zone: ["zone", "område", "omrade", "distrikt"],
};

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, " ");
}

function findColumn(headers: string[], aliases: string[]): number {
  const normalized = headers.map(normalizeHeader);
  for (const alias of aliases) {
    const idx = normalized.findIndex((h) => h === alias || h.includes(alias));
    if (idx >= 0) return idx;
  }
  return -1;
}

function parseAmount(raw: unknown): number | null {
  if (raw == null || raw === "") return null;
  if (typeof raw === "number" && !Number.isNaN(raw)) return Math.round(raw * 100) / 100;
  const str = String(raw).replace(/\s/g, "").replace(",", ".").replace(/[^\d.-]/g, "");
  const num = parseFloat(str);
  return Number.isFinite(num) ? Math.round(num * 100) / 100 : null;
}

function parseDate(raw: unknown): string | null {
  if (raw == null || raw === "") return null;
  if (typeof raw === "number") {
    const parsed = XLSX.SSF.parse_date_code(raw);
    if (parsed) {
      const d = new Date(parsed.y, parsed.m - 1, parsed.d);
      return d.toISOString().slice(0, 10);
    }
  }
  const str = String(raw).trim();
  const iso = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const dk = str.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})/);
  if (dk) {
    const year = dk[3].length === 2 ? `20${dk[3]}` : dk[3];
    const month = dk[2].padStart(2, "0");
    const day = dk[1].padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  const d = new Date(str);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return null;
}

function parseTime(raw: unknown): string | undefined {
  if (raw == null || raw === "") return undefined;
  if (typeof raw === "number" && raw < 1) {
    const totalMin = Math.round(raw * 24 * 60);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }
  const str = String(raw).trim();
  const match = str.match(/^(\d{1,2})[:.](\d{2})/);
  if (match) return `${match[1].padStart(2, "0")}:${match[2]}`;
  return str.slice(0, 5) || undefined;
}

function rowsToTrips(rows: unknown[][]): TaxameterTrip[] {
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => String(h ?? ""));
  const dateCol = findColumn(headers, COLUMN_ALIASES.date);
  const amountCol = findColumn(headers, COLUMN_ALIASES.amount);

  if (dateCol < 0 || amountCol < 0) {
    throw new Error("Kunne ikke finde dato- og beløb-kolonner. Tjek filformatet.");
  }

  const timeCol = findColumn(headers, COLUMN_ALIASES.time);
  const driverCol = findColumn(headers, COLUMN_ALIASES.driver);
  const fromCol = findColumn(headers, COLUMN_ALIASES.from);
  const toCol = findColumn(headers, COLUMN_ALIASES.to);
  const cityCol = findColumn(headers, COLUMN_ALIASES.city);
  const zoneCol = findColumn(headers, COLUMN_ALIASES.zone);

  const trips: TaxameterTrip[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every((c) => c == null || c === "")) continue;

    const date = parseDate(row[dateCol]);
    const amount = parseAmount(row[amountCol]);
    if (!date || amount == null || amount <= 0) continue;

    const trip: TaxameterTrip = { date, amount };
    if (timeCol >= 0) trip.time = parseTime(row[timeCol]);
    if (driverCol >= 0 && row[driverCol]) trip.driver = String(row[driverCol]).trim();
    if (fromCol >= 0 && row[fromCol]) trip.from = String(row[fromCol]).trim();
    if (toCol >= 0 && row[toCol]) trip.to = String(row[toCol]).trim();
    if (cityCol >= 0 && row[cityCol]) trip.city = String(row[cityCol]).trim();
    if (zoneCol >= 0 && row[zoneCol]) trip.zone = String(row[zoneCol]).trim();

    trips.push(trip);
  }

  return trips;
}

export async function parseTaxameterFile(file: File): Promise<TaxameterTrip[]> {
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (ext === "pdf") {
    throw new Error(
      "PDF kan ikke parses automatisk endnu. Eksportér taxameter-data som CSV eller Excel for fuld analyse.",
    );
  }

  if (ext === "csv") {
    const text = await file.text();
    const rows = text
      .split(/\r?\n/)
      .filter((line) => line.trim())
      .map((line) => {
        const sep = line.includes(";") ? ";" : ",";
        return line.split(sep).map((c) => c.replace(/^"|"$/g, "").trim());
      });
    const trips = rowsToTrips(rows);
    if (trips.length === 0) throw new Error("Ingen gyldige ture fundet i CSV-filen.");
    return trips;
  }

  if (ext === "xlsx" || ext === "xls") {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" });
    const trips = rowsToTrips(rows as unknown[][]);
    if (trips.length === 0) throw new Error("Ingen gyldige ture fundet i Excel-filen.");
    return trips;
  }

  throw new Error("Understøttede formater: .csv, .xlsx, .pdf (PDF gemmes, men kræver CSV/Excel til parsing).");
}
