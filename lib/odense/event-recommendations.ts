import type { EventCategory, EventDemandLevel, EventRecommendation, SpecialEvent } from "./types";

const DEMAND_META: Record<
  EventDemandLevel,
  { label: string; emoji: string; activity: string }
> = {
  high: {
    label: "Høj",
    emoji: "🟢",
    activity: "Høj sandsynlighed for mange taxiture.",
  },
  medium: {
    label: "Mellem",
    emoji: "🟡",
    activity: "Moderat efterspørgsel — gode enkeltture, især omkring peak.",
  },
  low: {
    label: "Lav",
    emoji: "🔴",
    activity: "Begrænset ekstra efterspørgsel — brug som supplement til faste zoner.",
  },
};

function normalizeCategory(type: string): EventCategory {
  const t = type.toLowerCase();
  if (t.includes("festival")) return "festival";
  if (t.includes("koncert") || t.includes("concert")) return "koncert";
  if (t.includes("sport") || t.includes("fodbold") || t.includes("kamp")) return "sport";
  if (t.includes("messe") || t.includes("fair")) return "messe";
  if (t.includes("konference") || t.includes("hotel")) return "konference";
  return "andet";
}

function inferDemand(event: SpecialEvent): EventDemandLevel {
  if (event.major) return "high";

  const visitors = event.visitors;
  if (visitors !== undefined) {
    if (visitors >= 20_000) return "high";
    if (visitors >= 8_000) return "medium";
    return "low";
  }

  const category = normalizeCategory(event.type);
  switch (category) {
    case "festival":
    case "koncert":
      return "high";
    case "sport":
    case "messe":
      return "medium";
    case "konference":
      return "medium";
    default:
      return "low";
  }
}

function peakTimeForCategory(category: EventCategory, demand: EventDemandLevel): string {
  switch (category) {
    case "festival":
    case "koncert":
      return demand === "high" ? "22:00–00:30" : "21:00–23:30";
    case "sport":
      return "21:00–23:00";
    case "messe":
      return "16:00–18:30";
    case "konference":
      return "07:30–09:00 og 16:30–18:00";
    default:
      return demand === "high" ? "20:00–23:00" : "17:00–20:00";
  }
}

function aiAdviceForCategory(
  category: EventCategory,
  zoneName: string,
  demand: EventDemandLevel,
  event: SpecialEvent,
): string {
  const destinationHint =
    event.place === "Odense"
      ? "banegården, hoteller og boligområder"
      : "Odense centrum, banegården og overnatningssteder";

  switch (category) {
    case "festival":
    case "koncert":
      return demand === "high"
        ? `Placér dig i ${zoneName} 30–45 minutter før hovedkoncerter slutter. Mange gæster bestiller taxi til ${destinationHint}.`
        : `Kør mod ${zoneName} en time før sidste nummer. Forvent spredte ture mod station og centrum.`;
    case "sport":
      return `Vær ved ${zoneName} 20–30 min før kampen slutter. Fans tager taxi videre mod centrum og p-huse.`;
    case "messe":
      return `Hold dig tæt på ${zoneName} fra midt på eftermiddagen. Deltagere tager taxi til hotel og station når messen lukker.`;
    case "konference":
      return `Morgen og sen eftermiddag giver flest ture ved ${zoneName}. Firmakunder kører til hotel, station og centrum.`;
    default:
      return `Positionér dig i ${zoneName} omkring arrangementets sluttid. Forvent ture mod ${destinationHint}.`;
  }
}

export function buildEventRecommendation(
  event: SpecialEvent,
  zoneName: string,
): EventRecommendation {
  const category = normalizeCategory(event.type);
  const demandLevel = inferDemand(event);
  const meta = DEMAND_META[demandLevel];

  return {
    demandLevel,
    demandLabel: meta.label,
    demandEmoji: meta.emoji,
    aiAdvice: aiAdviceForCategory(category, zoneName, demandLevel, event),
    bestTime: peakTimeForCategory(category, demandLevel),
    recommendedPlacement: zoneName,
    expectedActivity: meta.activity,
  };
}

export function formatVisitors(count?: number): string | null {
  if (count === undefined) return null;
  return `ca. ${count.toLocaleString("da-DK")} gæster`;
}
