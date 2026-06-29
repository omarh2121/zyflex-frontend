// Mock-data til Byens Taxi Horsens demo-dashboard

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

export interface EventItem {
  name: string;
  venue: string;
  time: string;
  taxiNote: string;
}

export interface DashboardKpis {
  activeCars: number;
  topScore: number;
  avgEarnPerHour: number;
  eventsToday: number;
  weatherSummary: string;
  tempC: number;
}

export const MOCK_KPIS: DashboardKpis = {
  activeCars: 12,
  topScore: 82,
  avgEarnPerHour: 485,
  eventsToday: 3,
  weatherSummary: "Let regn – øget efterspørgsel efter kl. 17",
  tempC: 14,
};

export const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: "rec-1",
    zone: "CASA Arena",
    score: 82,
    reason: "Koncert slutter kl. 22:30 · 1.800 forventede gæster · parkeringsplads fyldes hurtigt",
    earnDkkPerHour: 620,
    priority: "high",
    goNow: false,
  },
  {
    id: "rec-2",
    zone: "Horsens Station",
    score: 74,
    reason: "Regionaltog ankommer 18:14 og 18:42 · regn øger ventetid på perronerne",
    earnDkkPerHour: 510,
    priority: "high",
    goNow: false,
  },
  {
    id: "rec-3",
    zone: "Horsens Centrum",
    score: 68,
    reason: "Fredagsaften + restauranter · stabil efterspørgsel 19:00–23:00",
    earnDkkPerHour: 460,
    priority: "medium",
    goNow: false,
  },
];

export const MOCK_HOTSPOTS: Hotspot[] = [
  {
    rank: 1,
    zone: "CASA Arena",
    score: 82,
    reason: "Event i aften",
    earnDkkPerHour: 620,
    lat: 55.8556,
    lon: 9.8421,
  },
  {
    rank: 2,
    zone: "Horsens Station",
    score: 74,
    reason: "Togankomster + regn",
    earnDkkPerHour: 510,
    lat: 55.8601,
    lon: 9.8478,
  },
  {
    rank: 3,
    zone: "Horsens Centrum",
    score: 68,
    reason: "Fredagsaften",
    earnDkkPerHour: 460,
    lat: 55.8615,
    lon: 9.8506,
  },
  {
    rank: 4,
    zone: "Scandic Hotel Horsens",
    score: 61,
    reason: "Hotelcheck-out kl. 10–11",
    earnDkkPerHour: 390,
    lat: 55.8589,
    lon: 9.8532,
  },
  {
    rank: 5,
    zone: "Regionshospitalet Horsens",
    score: 55,
    reason: "Skiftehold slutter 15:00 og 19:00",
    earnDkkPerHour: 340,
    lat: 55.8702,
    lon: 9.8611,
  },
];

export const MOCK_B2B_LEADS: B2BLead[] = [
  {
    id: "lead-1",
    company: "Scandic Hotel Horsens",
    type: "Hotel",
    contact: "Reception / Duty Manager",
    phone: "75 82 00 00",
    score: 88,
    monthlyPotentialDkk: 18500,
    status: "new",
    note: "Ingen fast aftale – mange gæsteture til station og centrum",
  },
  {
    id: "lead-2",
    company: "Regionshospitalet Horsens",
    type: "Hospital",
    contact: "Transportkoordinator",
    phone: "78 41 00 00",
    score: 85,
    monthlyPotentialDkk: 32000,
    status: "contacted",
    note: "Potentiale for patienttransport og skiftehold – konkurrent har delvis aftale",
  },
  {
    id: "lead-3",
    company: "Horsens Gymnasium & HF",
    type: "Skole",
    contact: "Skolesekretær",
    phone: "75 62 33 00",
    score: 72,
    monthlyPotentialDkk: 8500,
    status: "new",
    note: "Behov for fast afhentning ved events og eksamen",
  },
  {
    id: "lead-4",
    company: "Danfoss (Horsens)",
    type: "Erhverv",
    contact: "Facility Management",
    phone: "75 62 22 22",
    score: 79,
    monthlyPotentialDkk: 22000,
    status: "negotiating",
    note: "Nattevagter og gæstetransport – dialog i gang",
  },
  {
    id: "lead-5",
    company: "Bytorv Horsens",
    type: "Butikscenter",
    contact: "Centerleder",
    phone: "75 60 12 34",
    score: 65,
    monthlyPotentialDkk: 6000,
    status: "new",
    note: "Weekend-shopping og ældre kunder uden bil",
  },
];

export const MOCK_EVENTS: EventItem[] = [
  {
    name: "Koncert: Dansk rock-aften",
    venue: "CASA Arena",
    time: "20:00 – 22:30",
    taxiNote: "Positionér 2 biler ved hovedindgang fra kl. 22:15",
  },
  {
    name: "FC Horsens hjemmekamp",
    venue: "CASA Arena",
    time: "19:00 – 21:15",
    taxiNote: "Høj efterspørgsel mod station og centrum efter kamp",
  },
  {
    name: "Firmaarrangement",
    venue: "Scandic Hotel",
    time: "17:30 – 23:00",
    taxiNote: "Forvent 40–60 gæster – koordinér med reception",
  },
];

export function scoreColor(score: number): string {
  if (score >= 80) return "#ef4444";
  if (score >= 70) return "#f59e0b";
  if (score >= 50) return "#3b82f6";
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
      return "#60a5fa";
    case "contacted":
      return "#f59e0b";
    case "negotiating":
      return "#34d399";
  }
}
