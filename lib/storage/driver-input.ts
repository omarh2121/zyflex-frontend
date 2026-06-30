export type DriverInputType = "observation" | "demand" | "problem";

export interface DriverInputEntry {
  id: string;
  name: string;
  zone: string;
  message: string;
  type: DriverInputType;
  createdAt: string;
}

const STORAGE_KEY = "byens_taxi_input";

export function getDriverInputs(): DriverInputEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DriverInputEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveDriverInput(
  entry: Omit<DriverInputEntry, "id" | "createdAt">
): DriverInputEntry {
  const newEntry: DriverInputEntry = {
    ...entry,
    id: `input-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  const existing = getDriverInputs();
  const updated = [newEntry, ...existing].slice(0, 50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newEntry;
}

export function inputTypeLabel(type: DriverInputType): string {
  switch (type) {
    case "observation":
      return "Observation";
    case "demand":
      return "Efterspørgsel";
    case "problem":
      return "Problem";
  }
}

export function inputTypeColor(type: DriverInputType): string {
  switch (type) {
    case "observation":
      return "#f87171";
    case "demand":
      return "#34d399";
    case "problem":
      return "#f87171";
  }
}
