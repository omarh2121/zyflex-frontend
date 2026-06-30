// Hjælpefunktioner til dashboard: dashboard/byens-taxi (ingen mock-data)

export interface Recommendation {
  id: string;
  zone: string;
  score: number;
  reason: string;
  earnDkkPerHour: number;
  priority: "high" | "medium" | "low";
  goNow: boolean;
}

export interface Hotspot {
  rank: number;
  zone: string;
  score: number;
  reason: string;
  earnDkkPerHour: number;
  lat: number;
  lon: number;
}

export interface B2BLead {
  id: string;
  company: string;
  type: string;
  contact: string;
  phone: string;
  score: number;
  monthlyPotentialDkk: number;
  status: "new" | "contacted" | "negotiating";
  note: string;
}

export function scoreColor(score: number): string {
  if (score >= 80) return "#ef4444";
  if (score >= 70) return "#f59e0b";
  if (score >= 50) return "#ef4444";
  return "#6b7280";
}

export function scoreBg(score: number): string {
  if (score >= 80) return "rgba(239,68,68,0.12)";
  if (score >= 70) return "rgba(245,158,11,0.12)";
  if (score >= 50) return "rgba(59,130,246,0.12)";
  return "rgba(107,114,128,0.08)";
}

export function leadStatusLabel(status: B2BLead["status"]): string {
  switch (status) {
    case "new":
      return "Ny";
    case "contacted":
      return "Kontaktet";
    case "negotiating":
      return "Forhandling";
  }
}

export function leadStatusColor(status: B2BLead["status"]): string {
  switch (status) {
    case "new":
      return "#f87171";
    case "contacted":
      return "#f59e0b";
    case "negotiating":
      return "#34d399";
  }
}
